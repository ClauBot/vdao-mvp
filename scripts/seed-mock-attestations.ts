/**
 * VDAO MVP — Seed: Mock Attestations
 * Generates 50 fake attestations with random wallets, rubros, and scores.
 * Stored in atestaciones_cache (not on-chain).
 *
 * Usage:
 *   npx tsx scripts/seed-mock-attestations.ts
 */

import { Pool } from 'pg';
import { randomBytes } from 'crypto';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('Missing DATABASE_URL in .env.local');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });

const WALLETS = [
  '0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0',
  '0xb2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1',
  '0xc3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2',
  '0xd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3',
  '0xe5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4',
  '0xf6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5',
  '0x17a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6',
  '0x28b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7',
  '0x39c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8',
  '0x40d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9',
];

const RUBRO_IDS = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  11, 12, 20, 25, 30, 35, 40, 45, 50, 55,
  60, 65, 70, 75, 80, 85, 90, 95, 100, 105,
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomUID(): string {
  return '0x' + randomBytes(32).toString('hex');
}

function randomTimestamp(): string {
  const now = Date.now();
  const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;
  return new Date(now - Math.random() * ninetyDaysMs).toISOString();
}

async function main() {
  console.log('VDAO — Seeding Mock Attestations (50 entries)');

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
    created_at: string;
  }> = [];

  for (let i = 0; i < 50; i++) {
    let attester: string, receiver: string;
    do {
      attester = randomFrom(WALLETS);
      receiver = randomFrom(WALLETS);
    } while (attester === receiver);

    attestations.push({
      uid: randomUID(),
      attester,
      receiver,
      rubro_id: randomFrom(RUBRO_IDS),
      interaction_type: Math.floor(Math.random() * 3),
      score_service: Math.floor(Math.random() * 4) + 1,
      score_treatment: Math.floor(Math.random() * 4) + 1,
      role: Math.random() > 0.5 ? 0 : 1,
      counterpart_uid: null,
      created_at: randomTimestamp(),
    });
  }

  // Link mutual pairs
  for (let i = 0; i < attestations.length - 1; i += 2) {
    attestations[i].counterpart_uid = attestations[i + 1].uid;
    attestations[i + 1].counterpart_uid = attestations[i].uid;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const a of attestations) {
      await client.query(
        `INSERT INTO atestaciones_cache
          (uid, attester, receiver, rubro_id, interaction_type, score_service, score_treatment, role, counterpart_uid, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         ON CONFLICT (uid) DO NOTHING`,
        [a.uid, a.attester, a.receiver, a.rubro_id, a.interaction_type, a.score_service, a.score_treatment, a.role, a.counterpart_uid, a.created_at]
      );
    }
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }

  await pool.end();

  console.log(`Attestations seeded: ${attestations.length}`);
  console.log(`Mutual pairs: ${Math.floor(attestations.length / 2)}`);
  console.log(`Rubros covered: ${new Set(attestations.map(a => a.rubro_id)).size}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
