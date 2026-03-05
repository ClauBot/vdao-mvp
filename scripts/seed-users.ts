/**
 * VDAO MVP — Seed: Users
 * Creates 10 test users at various levels (1-4).
 *
 * Usage:
 *   npx tsx scripts/seed-users.ts
 */

import { Pool } from 'pg';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('Missing DATABASE_URL in .env.local');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });

const TEST_USERS = [
  { wallet: '0xA1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0', nivel: 4, nombre_display: 'validador.eth' },
  { wallet: '0xB2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1', nivel: 4, nombre_display: 'gobernanza.eth' },
  { wallet: '0xC3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2', nivel: 3, nombre_display: 'evaluador.eth' },
  { wallet: '0xD4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3', nivel: 3, nombre_display: 'verificador.eth' },
  { wallet: '0xE5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4', nivel: 2, nombre_display: 'proponente.eth' },
  { wallet: '0xF6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5', nivel: 2, nombre_display: 'colaborador.eth' },
  { wallet: '0x17a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6', nivel: 1, nombre_display: 'usuario1.eth' },
  { wallet: '0x28b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7', nivel: 1, nombre_display: 'usuario2.eth' },
  { wallet: '0x39c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8', nivel: 1, nombre_display: 'nuevo1.eth' },
  { wallet: '0x40d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9', nivel: 1, nombre_display: 'nuevo2.eth' },
];

async function main() {
  console.log('VDAO — Seeding Test Users');

  for (const u of TEST_USERS) {
    await pool.query(
      `INSERT INTO usuarios (wallet, nivel, nombre_display)
       VALUES ($1, $2, $3)
       ON CONFLICT (wallet) DO UPDATE SET
         nivel = EXCLUDED.nivel,
         nombre_display = EXCLUDED.nombre_display`,
      [u.wallet.toLowerCase(), u.nivel, u.nombre_display]
    );
  }

  console.log(`Users seeded: ${TEST_USERS.length}`);
  const byLevel: Record<number, number> = {};
  for (const u of TEST_USERS) byLevel[u.nivel] = (byLevel[u.nivel] || 0) + 1;
  const labels = ['', 'Participante', 'Proponente', 'Evaluador', 'Validador'];
  for (const [level, count] of Object.entries(byLevel)) {
    console.log(`  Nivel ${level} (${labels[Number(level)]}): ${count}`);
  }

  await pool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
