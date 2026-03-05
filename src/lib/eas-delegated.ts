/**
 * EAS Delegated Attestation constants for Sepolia
 * Uses the Legacy format (no deadline/value in typed data)
 * Contract: 0xC2679fBD37d54388Ce493F1DB75320D236e1815e
 */

import { EAS_CONTRACT_ADDRESS } from './eas';

// Re-export for convenience
export { EAS_CONTRACT_ADDRESS };

// EIP-712 domain for signing delegated attestations
export const EAS_EIP712_DOMAIN = {
  name: 'EAS',
  version: '0.26',
  chainId: 11155111n,
  verifyingContract: EAS_CONTRACT_ADDRESS as `0x${string}`,
} as const;

// Legacy Attest struct for EIP-712 signing (no value/deadline)
export const EAS_ATTEST_TYPES = {
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

// ABI for attestByDelegation (Legacy struct — no deadline)
export const ATTEST_BY_DELEGATION_ABI = [
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

// ABI for getNonce
export const GET_NONCE_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'getNonce',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// Attested event for extracting UID from logs
export const ATTESTED_EVENT_ABI = [
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

// Helper: split a 65-byte hex signature into { v, r, s }
export function splitSignature(sig: `0x${string}`): {
  v: number;
  r: `0x${string}`;
  s: `0x${string}`;
} {
  const raw = sig.slice(2);
  if (raw.length !== 130) {
    throw new Error(`Invalid signature length: expected 130 hex chars, got ${raw.length}`);
  }
  const r = `0x${raw.slice(0, 64)}` as `0x${string}`;
  const s = `0x${raw.slice(64, 128)}` as `0x${string}`;
  let v = parseInt(raw.slice(128, 130), 16);
  if (v < 27) v += 27;
  return { v, r, s };
}
