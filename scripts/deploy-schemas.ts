/**
 * VDAO MVP — EAS Schema Deployer
 * Registers the 3 VDAO schemas in EAS on Arbitrum Sepolia.
 *
 * Usage:
 *   export DEPLOYER_PRIVATE_KEY=0xYourPrivateKey
 *   export ARBITRUM_SEPOLIA_RPC=https://sepolia-rollup.arbitrum.io/rpc
 *   npx tsx scripts/deploy-schemas.ts
 *
 * After running, copy the 3 schema UIDs into your .env file.
 */

import { SchemaRegistry } from '@ethereum-attestation-service/eas-sdk';
import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================
// Configuration
// ============================================================

const SCHEMA_REGISTRY_ADDRESS = '0x0a7E2Ff54e76B8E6659aedc9103FB21c038050D0';
const EAS_ADDRESS = '0xaEF4103A04090071165F78D45D83A0C0782c2B2a';
const ARBITRUM_SEPOLIA_CHAIN_ID = 421614;
const NULL_RESOLVER = '0x0000000000000000000000000000000000000000';

const RPC_URL =
  process.env.ARBITRUM_SEPOLIA_RPC || 'https://sepolia-rollup.arbitrum.io/rpc';
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;

// ============================================================
// Schema Definitions
// ============================================================

const SCHEMAS = [
  {
    name: 'Evaluación Mutua',
    description:
      'Registra evaluaciones bidireccionales entre dos partes después de una interacción comercial, docente o de investigación.',
    schema:
      'address receiver, uint16 rubroId, uint8 interactionType, uint8 scoreService, uint8 scoreTreatment, uint8 role, bytes32 counterpartUID',
    resolverAddress: NULL_RESOLVER,
    revocable: true,
    envVar: 'NEXT_PUBLIC_SCHEMA_EVALUATION_UID',
  },
  {
    name: 'Proximidad de Rubros',
    description:
      'Registra evaluaciones de qué tan cercanos/relacionados están dos rubros. El peso depende del nivel del evaluador.',
    schema: 'uint16 rubroA, uint16 rubroB, uint8 proximityScore, uint8 proposerLevel',
    resolverAddress: NULL_RESOLVER,
    revocable: true,
    envVar: 'NEXT_PUBLIC_SCHEMA_PROXIMITY_UID',
  },
  {
    name: 'Validación de Rubro',
    description:
      'Registra votos de aprobación/rechazo de rubros nuevos propuestos. Solo wallets nivel 4 pueden crear estas atestaciones.',
    schema: 'uint16 rubroId, bool approved, string reason',
    resolverAddress: NULL_RESOLVER,
    revocable: true,
    envVar: 'NEXT_PUBLIC_SCHEMA_VALIDATION_UID',
  },
];

// ============================================================
// Main
// ============================================================

async function main() {
  console.log('🚀 VDAO MVP — EAS Schema Deployer');
  console.log('=====================================');
  console.log(`📡 RPC: ${RPC_URL}`);
  console.log(`📜 Schema Registry: ${SCHEMA_REGISTRY_ADDRESS}`);
  console.log(`🔗 EAS Contract: ${EAS_ADDRESS}`);
  console.log(`🌐 Chain ID: ${ARBITRUM_SEPOLIA_CHAIN_ID} (Arbitrum Sepolia)\n`);

  if (!DEPLOYER_PRIVATE_KEY) {
    console.error('❌ DEPLOYER_PRIVATE_KEY not set');
    console.error('   Export your private key: export DEPLOYER_PRIVATE_KEY=0x...');
    process.exit(1);
  }

  // Setup provider and signer
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(DEPLOYER_PRIVATE_KEY, provider);

  // Verify chain
  const network = await provider.getNetwork();
  console.log(`✅ Connected to chain ID: ${network.chainId}`);

  if (Number(network.chainId) !== ARBITRUM_SEPOLIA_CHAIN_ID) {
    console.error(
      `❌ Wrong chain! Expected ${ARBITRUM_SEPOLIA_CHAIN_ID}, got ${network.chainId}`
    );
    process.exit(1);
  }

  // Check balance
  const balance = await provider.getBalance(signer.address);
  const balanceEth = ethers.formatEther(balance);
  console.log(`💰 Deployer address: ${signer.address}`);
  console.log(`💰 Balance: ${balanceEth} ETH`);

  if (balance < ethers.parseEther('0.001')) {
    console.warn('⚠️  Low balance. Get testnet ETH from: https://faucets.chain.link/arbitrum-sepolia');
  }

  // Connect to Schema Registry
  const registry = new SchemaRegistry(SCHEMA_REGISTRY_ADDRESS);
  registry.connect(signer as any);

  const deployedSchemas: Record<string, string> = {};
  const results: Array<{ name: string; uid: string; txHash: string; gasUsed: string }> = [];

  // Deploy each schema
  for (let i = 0; i < SCHEMAS.length; i++) {
    const schema = SCHEMAS[i];
    console.log(`\n📋 [${i + 1}/${SCHEMAS.length}] Deploying Schema: ${schema.name}`);
    console.log(`   Schema string: ${schema.schema}`);
    console.log(`   Revocable: ${schema.revocable}`);
    console.log(`   Resolver: ${schema.resolverAddress}`);

    try {
      const tx = await registry.register({
        schema: schema.schema,
        resolverAddress: schema.resolverAddress,
        revocable: schema.revocable,
      });

      console.log(`   ⏳ Waiting for confirmation...`);

      // The EAS SDK returns a transaction object
      let uid: string;
      let txHash: string;

      if (typeof tx === 'string') {
        // tx is the UID directly
        uid = tx;
        txHash = 'N/A';
      } else if (tx && typeof tx === 'object') {
        // tx is a transaction receipt or response
        const receipt = 'wait' in tx ? await (tx as any).wait() : tx;
        txHash = receipt?.hash || receipt?.transactionHash || 'N/A';

        // The UID is in the logs — EAS Registry emits Registered(uid, registerer)
        uid = receipt?.uid || extractUidFromReceipt(receipt) || 'Check EAS Explorer';
      } else {
        uid = String(tx);
        txHash = 'N/A';
      }

      console.log(`   ✅ Schema registered!`);
      console.log(`   🔑 UID: ${uid}`);
      console.log(`   📦 Tx: ${txHash}`);
      console.log(`   🔍 Explorer: https://arbitrum-sepolia.easscan.org/schema/view/${uid}`);

      deployedSchemas[schema.envVar] = uid;
      results.push({
        name: schema.name,
        uid,
        txHash,
        gasUsed: 'See explorer',
      });

      // Small delay between deployments
      if (i < SCHEMAS.length - 1) {
        await new Promise((r) => setTimeout(r, 2000));
      }
    } catch (error: any) {
      console.error(`   ❌ Failed to deploy ${schema.name}:`, error.message || error);
      if (error.code === 'INSUFFICIENT_FUNDS') {
        console.error('   💸 Insufficient funds. Get testnet ETH from faucet.');
      }
      throw error;
    }
  }

  // Output results
  console.log('\n\n=====================================');
  console.log('🎉 All schemas deployed successfully!');
  console.log('=====================================');
  console.log('\n📋 Schema UIDs:');
  for (const schema of SCHEMAS) {
    const uid = deployedSchemas[schema.envVar];
    console.log(`\n  ${schema.name}:`);
    console.log(`  ${schema.envVar}=${uid}`);
  }

  console.log('\n\n📝 Add to your .env file:');
  console.log('----------------------------');
  for (const [envVar, uid] of Object.entries(deployedSchemas)) {
    console.log(`${envVar}=${uid}`);
  }

  // Save results to file
  const outputPath = path.join(__dirname, '../.schema-uids.json');
  fs.writeFileSync(
    outputPath,
    JSON.stringify(
      {
        deployedAt: new Date().toISOString(),
        chainId: Number(network.chainId),
        deployer: signer.address,
        schemas: results,
        envVars: deployedSchemas,
      },
      null,
      2
    )
  );
  console.log(`\n💾 Results saved to: .schema-uids.json`);

  console.log('\n📌 Links:');
  console.log('  EAS Explorer: https://arbitrum-sepolia.easscan.org');
  console.log('  Arbiscan: https://sepolia.arbiscan.io');
}

/**
 * Try to extract the schema UID from a transaction receipt.
 * The SchemaRegistry emits: Registered(bytes32 indexed uid, address registerer)
 */
function extractUidFromReceipt(receipt: any): string | null {
  if (!receipt?.logs) return null;

  // Registered event topic
  const REGISTERED_TOPIC = ethers.id('Registered(bytes32,address)');

  for (const log of receipt.logs) {
    if (log.topics && log.topics[0] === REGISTERED_TOPIC) {
      // The UID is in topics[1]
      return log.topics[1];
    }
  }
  return null;
}

main().catch((err) => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
