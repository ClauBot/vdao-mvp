/**
 * VDAO MVP — Seed: Rubros
 * Loads ~152 rubros from src/config/rubros-seed.json into PostgreSQL.
 *
 * Usage:
 *   npx tsx scripts/seed-rubros.ts
 *   (reads DATABASE_URL from .env.local)
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

interface RubroSeed {
  id: number;
  codigo: string;
  nombre: string;
  nombre_en: string;
  descripcion: string;
  padres: number[];
  activo: boolean;
}

async function main() {
  console.log('VDAO — Seeding Rubros');

  const filePath = path.join(__dirname, '../src/config/rubros-seed.json');
  const rubros: RubroSeed[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  console.log(`Found ${rubros.length} rubros`);

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Upsert rubros
    for (const r of rubros) {
      await client.query(
        `INSERT INTO rubros (id, nombre, nombre_en, descripcion, activo, validation_count)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE SET
           nombre = EXCLUDED.nombre,
           nombre_en = EXCLUDED.nombre_en,
           descripcion = EXCLUDED.descripcion,
           activo = EXCLUDED.activo,
           validation_count = EXCLUDED.validation_count`,
        [r.id, r.nombre, r.nombre_en, r.descripcion, r.activo, r.activo ? 3 : 0]
      );
    }
    console.log(`  Rubros upserted: ${rubros.length}`);

    // Insert parent relationships
    const parents: { rubro_id: number; padre_id: number }[] = [];
    for (const r of rubros) {
      for (const p of r.padres) parents.push({ rubro_id: r.id, padre_id: p });
    }

    for (const rel of parents) {
      await client.query(
        `INSERT INTO rubro_padres (rubro_id, padre_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [rel.rubro_id, rel.padre_id]
      );
    }
    console.log(`  Parent relationships: ${parents.length}`);

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }

  await pool.end();
  console.log('Rubros seeded successfully!');
}

main().catch((e) => { console.error(e); process.exit(1); });
