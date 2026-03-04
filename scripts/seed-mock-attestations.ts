/**
 * VDAO MVP — Seed: Mock Attestations
 * Generates 50 fake attestations with random wallets, rubros, and scores.
 * These are stored in the Supabase cache table (not submitted on-chain).
 *
 * Usage:
 *   export SUPABASE_URL=https://xxx.supabase.co
 *   export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
 *   npx tsx scripts/seed-mock-attestations.ts
 */

import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌  Missing env vars: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ──────────────────────────────────────────
// Mock wallet pool (10 test wallets)
const WALLETS = [
  '0xA1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0',
  '0xB2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1',
  '0xC3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2',
  '0xD4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3',
  '0xE5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4',
  '0xF6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5',
  '0x17a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6',
  '0x28b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7',
  '0x39c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8',
  '0x40d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9',
];

// Rubro IDs that are active (1–152 in the seed, using a subset)
const RUBRO_IDS = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  11, 12, 20, 25, 30, 35, 40, 45, 50, 55,
  60, 65, 70, 75, 80, 85, 90, 95, 100, 105,
];

// ──────────────────────────────────────────
function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomScore(): number {
  return Math.floor(Math.random() * 4) + 1; // 1-4
}

function randomInteractionType(): number {
  return Math.floor(Math.random() * 3); // 0=Comercial, 1=Docente, 2=Investigación
}

function randomRole(): number {
  return Math.random() > 0.5 ? 0 : 1; // 0=Proveedor, 1=Cliente
}

function randomUID(): string {
  return '0x' + randomBytes(32).toString('hex');
}

function randomTimestamp(): string {
  // Random date in last 90 days
  const now = Date.now();
  const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;
  const ts = new Date(now - Math.random() * ninetyDaysMs);
  return ts.toISOString();
}

function randomBlockNumber(): number {
  // Arbitrum Sepolia approximate block range
  return Math.floor(Math.random() * 1_000_000) + 10_000_000;
}

// ──────────────────────────────────────────
async function main() {
  console.log('🌱  VDAO — Seeding Mock Attestations (50 entries)');
  console.log(`📡  ${SUPABASE_URL}`);

  // Verify connection
  const { error: pingErr } = await supabase.from('atestaciones_cache').select('count').limit(1);
  if (pingErr) {
    console.error('❌  Cannot connect. Make sure DB schema is applied first.');
    console.error('   ', pingErr.message);
    process.exit(1);
  }

  const attestations: Array<{
    uid: string;
    attester: string;
    receiver: string;
    rubro_id: number;
    interaction_type: number;
    score_service: number;
    score_treatment: number;
    role: number;
    counterpart_uid: string | null;
    timestamp: string;
    block_number: number;
  }> = [];

  // Generate 50 mock attestations
  // Every even-indexed attestation gets a counterpart pair (mutual)
  for (let i = 0; i < 50; i++) {
    let attester: string, receiver: string;
    do {
      attester = randomFrom(WALLETS);
      receiver = randomFrom(WALLETS);
    } while (attester === receiver);

    const uid = randomUID();
    const rubroId = randomFrom(RUBRO_IDS);
    const interactionType = randomInteractionType();
    const ts = randomTimestamp();

    // Create a counterpart for pairs (0→1, 2→3, etc.)
    let counterpartUID: string | null = null;
    if (i % 2 === 0 && i + 1 < 50) {
      counterpartUID = randomUID(); // Will be the UID of index i+1
    }

    attestations.push({
      uid,
      attester,
      receiver,
      rubro_id: rubroId,
      interaction_type: interactionType,
      score_service: randomScore(),
      score_treatment: randomScore(),
      role: randomRole(),
      counterpart_uid: counterpartUID,
      timestamp: ts,
      block_number: randomBlockNumber(),
    });
  }

  // Link even/odd counterpart pairs
  for (let i = 0; i < attestations.length - 1; i += 2) {
    attestations[i + 1].counterpart_uid = attestations[i].uid;
    if (attestations[i].counterpart_uid === null) {
      attestations[i].counterpart_uid = attestations[i + 1].uid;
    }
  }

  // Upsert into Supabase
  const BATCH = 25;
  for (let i = 0; i < attestations.length; i += BATCH) {
    const batch = attestations.slice(i, i + BATCH);
    const { error } = await supabase
      .from('atestaciones_cache')
      .upsert(batch, { onConflict: 'uid', ignoreDuplicates: false });
    if (error) {
      console.error(`❌  Batch ${i}:`, error.message);
      process.exit(1);
    }
    console.log(`  ✅  Attestations ${i + 1}–${Math.min(i + BATCH, attestations.length)} inserted`);
  }

  console.log('\n📊  Summary:');
  console.log(`   Total attestations: ${attestations.length}`);
  console.log(`   Mutual pairs: ${Math.floor(attestations.length / 2)}`);
  console.log(`   Unique wallets used: ${WALLETS.length}`);
  console.log(`   Rubros covered: ${new Set(attestations.map(a => a.rubro_id)).size}`);
  console.log('\n✨  Mock attestations seeded!');
}

main().catch((e) => { console.error(e); process.exit(1); });
