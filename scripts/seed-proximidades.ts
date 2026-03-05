/**
 * VDAO MVP — Seed: Proximidades
 * Loads proximity pairs from src/config/proximidades-seed.json into PostgreSQL.
 *
 * Usage:
 *   npx tsx scripts/seed-proximidades.ts
 */

import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('Missing DATABASE_URL in .env.local');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });

interface ProximidadSeed {
  rubro_a: number;
  rubro_b: number;
  valor_propuesto: number;
}

async function main() {
  console.log('VDAO — Seeding Proximidades');

  const filePath = path.join(__dirname, '../src/config/proximidades-seed.json');
  const proximidades: ProximidadSeed[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  console.log(`Found ${proximidades.length} proximity pairs`);

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    for (const p of proximidades) {
      await client.query(
        `INSERT INTO proximidades (rubro_a, rubro_b, valor_propuesto, num_evaluaciones)
         VALUES ($1, $2, $3, 0)
         ON CONFLICT (rubro_a, rubro_b) DO UPDATE SET
           valor_propuesto = EXCLUDED.valor_propuesto`,
        [p.rubro_a, p.rubro_b, p.valor_propuesto]
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
  console.log(`Proximidades seeded: ${proximidades.length}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
