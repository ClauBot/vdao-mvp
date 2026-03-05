/**
 * Integration test for EAS delegated attestations on Sepolia.
 *
 * Usage:
 *   RELAYER_PRIVATE_KEY=0x... npx tsx scripts/test-delegated.ts
 */

import {
  createPublicClient,
  createWalletClient,
  http,
  encodeAbiParameters,
  decodeEventLog,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';

const EAS_CONTRACT_ADDRESS = '0xC2679fBD37d54388Ce493F1DB75320D236e1815e' as const;

const EAS_EIP712_DOMAIN = {
  name: 'EAS' as const,
  version: '0.26' as const,
  chainId: 11155111,
  verifyingContract: EAS_CONTRACT_ADDRESS,
};

const EAS_ATTEST_TYPES = {
  Attest: [
    { name: 'schema', type: 'bytes32' },
    { name: 'recipient', type: 'address' },
    { name: 'expirationTime', type: 'uint64' },
    { name: 'revocable', type: 'bool' },
    { name: 'refUID', type: 'bytes32' },
    { name: 'data', type: 'bytes' },
    { name: 'nonce', type: 'uint256' },
  ],
} as const;

const ATTEST_BY_DELEGATION_ABI = [
  {
    inputs: [
      {
        components: [
          { name: 'schema', type: 'bytes32' },
          {
            components: [
              { name: 'recipient', type: 'address' },
              { name: 'expirationTime', type: 'uint64' },
              { name: 'revocable', type: 'bool' },
              { name: 'refUID', type: 'bytes32' },
              { name: 'data', type: 'bytes' },
              { name: 'value', type: 'uint256' },
            ],
            name: 'data',
            type: 'tuple',
          },
          {
            components: [
              { name: 'v', type: 'uint8' },
              { name: 'r', type: 'bytes32' },
              { name: 's', type: 'bytes32' },
            ],
            name: 'signature',
            type: 'tuple',
          },
          { name: 'attester', type: 'address' },
        ],
        name: 'delegatedRequest',
        type: 'tuple',
      },
    ],
    name: 'attestByDelegation',
    outputs: [{ name: '', type: 'bytes32' }],
    stateMutability: 'payable',
    type: 'function',
  },
] as const;

const GET_NONCE_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'getNonce',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const ATTESTED_EVENT_ABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'recipient', type: 'address' },
      { indexed: true, name: 'attester', type: 'address' },
      { indexed: false, name: 'uid', type: 'bytes32' },
      { indexed: true, name: 'schema', type: 'bytes32' },
    ],
    name: 'Attested',
    type: 'event',
  },
] as const;

const ZERO_BYTES32 = '0x0000000000000000000000000000000000000000000000000000000000000000' as const;

// Use the evaluation schema from the project, or fall back to "bool gm" test schema
const SCHEMA_UID = (process.env.NEXT_PUBLIC_SCHEMA_EVALUATION_UID ||
  '0x85500e806cf1e74844d51a20a6d893fe1ed6f6b0738b50e43d774827d08eca61') as `0x${string}`;

async function main() {
  const relayerKey = process.env.RELAYER_PRIVATE_KEY;
  if (!relayerKey) {
    console.error('Set RELAYER_PRIVATE_KEY env var');
    process.exit(1);
  }

  const signerAccount = privateKeyToAccount(relayerKey as `0x${string}`);
  const relayerAccount = signerAccount; // same wallet for test

  console.log(`Signer:  ${signerAccount.address}`);
  console.log(`Relayer: ${relayerAccount.address}`);
  console.log(`Schema:  ${SCHEMA_UID.slice(0, 18)}...`);

  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http('https://ethereum-sepolia-rpc.publicnode.com'),
  });

  const relayerWallet = createWalletClient({
    account: relayerAccount,
    chain: sepolia,
    transport: http('https://ethereum-sepolia-rpc.publicnode.com'),
  });

  // 1. Get nonce
  const nonce = await publicClient.readContract({
    address: EAS_CONTRACT_ADDRESS,
    abi: GET_NONCE_ABI,
    functionName: 'getNonce',
    args: [signerAccount.address],
  });
  console.log(`Nonce:   ${nonce}`);

  // 2. Encode schema data — use bool(true) for test schema, or evaluation schema
  let schemaData: `0x${string}`;
  if (SCHEMA_UID === '0x85500e806cf1e74844d51a20a6d893fe1ed6f6b0738b50e43d774827d08eca61') {
    schemaData = encodeAbiParameters([{ type: 'bool' }], [true]);
  } else {
    // Evaluation schema
    schemaData = encodeAbiParameters(
      [
        { name: 'receiver', type: 'address' },
        { name: 'rubroId', type: 'uint16' },
        { name: 'interactionType', type: 'uint8' },
        { name: 'scoreService', type: 'uint8' },
        { name: 'scoreTreatment', type: 'uint8' },
        { name: 'role', type: 'uint8' },
        { name: 'counterpartUID', type: 'bytes32' },
      ],
      [signerAccount.address, 1, 0, 3, 3, 0, ZERO_BYTES32]
    );
  }
  console.log(`Data:    ${schemaData.slice(0, 20)}...`);

  // 3. Sign EIP-712
  const signature = await signerAccount.signTypedData({
    domain: EAS_EIP712_DOMAIN,
    types: EAS_ATTEST_TYPES,
    primaryType: 'Attest',
    message: {
      schema: SCHEMA_UID,
      recipient: signerAccount.address,
      expirationTime: 0n,
      revocable: true,
      refUID: ZERO_BYTES32,
      data: schemaData,
      nonce,
    },
  });
  console.log(`Sig:     ${signature.slice(0, 20)}...`);

  // 4. Split signature
  const raw = signature.slice(2);
  const r = `0x${raw.slice(0, 64)}` as `0x${string}`;
  const s = `0x${raw.slice(64, 128)}` as `0x${string}`;
  let v = parseInt(raw.slice(128, 130), 16);
  if (v < 27) v += 27;

  // 5. Submit
  console.log('\nSubmitting attestByDelegation...');
  const txHash = await relayerWallet.writeContract({
    address: EAS_CONTRACT_ADDRESS,
    abi: ATTEST_BY_DELEGATION_ABI,
    functionName: 'attestByDelegation',
    args: [
      {
        schema: SCHEMA_UID,
        data: {
          recipient: signerAccount.address,
          expirationTime: 0n,
          revocable: true,
          refUID: ZERO_BYTES32,
          data: schemaData,
          value: 0n,
        },
        signature: { v, r, s },
        attester: signerAccount.address,
      },
    ],
    value: 0n,
  });
  console.log(`TX:      ${txHash}`);

  // 6. Wait
  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash, confirmations: 1 });
  console.log(`Status:  ${receipt.status}`);

  // 7. Extract UID
  for (const log of receipt.logs) {
    try {
      const decoded = decodeEventLog({
        abi: ATTESTED_EVENT_ABI,
        data: log.data,
        topics: log.topics,
      });
      if (decoded.eventName === 'Attested') {
        console.log(`\nAttestation UID: ${decoded.args.uid}`);
        console.log(`View: https://sepolia.easscan.org/attestation/view/${decoded.args.uid}`);
        break;
      }
    } catch { /* skip */ }
  }

  console.log('\nDone!');
}

main().catch((err) => { console.error(err); process.exit(1); });
