/**
 * VDAO MVP — EAS Schema Deployer (Sepolia L1)
 * 
 * Usage:
 *   export DEPLOYER_PRIVATE_KEY=0x...
 *   npx tsx scripts/deploy-schemas-sepolia.ts
 */

import { SchemaRegistry } from '@ethereum-attestation-service/eas-sdk';
import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';

// Sepolia L1 addresses
const SCHEMA_REGISTRY_ADDRESS = '0x0a7E2Ff54e76B8E6659aedc9103FB21c038050D0';
const EAS_ADDRESS = '0xC2679fBD37d54388Ce493F1DB75320D236e1815e';
const CHAIN_ID = 11155111;
const NULL_RESOLVER = '0x0000000000000000000000000000000000000000';
const RPC_URL = 'https://ethereum-sepolia-rpc.publicnode.com';

const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;

const SCHEMAS = [
  {
    name: 'Evaluación Mutua',
    schema: 'address receiver, uint16 rubroId, uint8 interactionType, uint8 scoreService, uint8 scoreTreatment, uint8 role, bytes32 counterpartUID',
    envVar: 'NEXT_PUBLIC_SCHEMA_EVALUATION_UID',
  },
  {
    name: 'Proximidad de Rubros',
    schema: 'uint16 rubroA, uint16 rubroB, uint8 proximityScore, uint8 proposerLevel',
    envVar: 'NEXT_PUBLIC_SCHEMA_PROXIMITY_UID',
  },
  {
    name: 'Validación de Rubro',
    schema: 'uint16 rubroId, bool approved, string reason',
    envVar: 'NEXT_PUBLIC_SCHEMA_VALIDATION_UID',
  },
];

async function main() {
  console.log('🚀 VDAO — Deploying EAS Schemas on Sepolia L1\n');

  if (!DEPLOYER_PRIVATE_KEY) {
    console.error('❌ Set DEPLOYER_PRIVATE_KEY');
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(DEPLOYER_PRIVATE_KEY, provider);
  
  const network = await provider.getNetwork();
  console.log(`Chain: ${network.chainId}`);
  
  const balance = ethers.formatEther(await provider.getBalance(signer.address));
  console.log(`Wallet: ${signer.address}`);
  console.log(`Balance: ${balance} ETH\n`);

  const registry = new SchemaRegistry(SCHEMA_REGISTRY_ADDRESS);
  registry.connect(signer as any);

  const envVars: Record<string, string> = {};

  for (const schema of SCHEMAS) {
    console.log(`Deploying: ${schema.name}...`);
    
    const tx = await registry.register({
      schema: schema.schema,
      resolverAddress: NULL_RESOLVER,
      revocable: true,
    });

    // tx should be the UID string directly from newer EAS SDK
    const uid = typeof tx === 'string' ? tx : (await (tx as any).wait?.())?.uid || String(tx);
    
    console.log(`  ✅ UID: ${uid}`);
    console.log(`  🔍 https://sepolia.easscan.org/schema/view/${uid}\n`);
    
    envVars[schema.envVar] = uid;
    
    // delay between txs
    await new Promise(r => setTimeout(r, 3000));
  }

  console.log('\n=== Add to .env ===');
  for (const [k, v] of Object.entries(envVars)) {
    console.log(`${k}=${v}`);
  }

  // Save
  fs.writeFileSync(
    path.join(__dirname, '../.schema-uids.json'),
    JSON.stringify({ chain: 'sepolia', chainId: CHAIN_ID, schemas: envVars, deployedAt: new Date().toISOString() }, null, 2)
  );
  console.log('\n💾 Saved to .schema-uids.json');
}

main().catch(err => { console.error('❌', err.message); process.exit(1); });
