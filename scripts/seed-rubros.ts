/**
 * VDAO MVP — Seed: Rubros
 * Loads ~152 rubros from src/config/rubros-seed.json into Supabase.
 *
 * Usage:
 *   export SUPABASE_URL=https://xxx.supabase.co
 *   export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
 *   npx tsx scripts/seed-rubros.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌  Missing env vars: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface RubroSeed {
  id: number;
  codigo: string;
  nombre: string;
  nombre_en: string;
  descripcion: string;
  padres: number[];
  activo: boolean;
}

const BATCH = 50;

async function main() {
  console.log('🌱  VDAO — Seeding Rubros');
  console.log(`📡  ${SUPABASE_URL}`);

  const filePath = path.join(__dirname, '../src/config/rubros-seed.json');
  const rubros: RubroSeed[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  console.log(`📂  Found ${rubros.length} rubros`);

  // Verify connection
  const { error: pingErr } = await supabase.from('rubros').select('count').limit(1);
  if (pingErr) {
    console.error('❌  Cannot connect. Make sure the DB schema is applied first.');
    console.error('   ', pingErr.message);
    process.exit(1);
  }

  // Upsert rubros (without parent relations first)
  const rows = rubros.map((r) => ({
    id: r.id,
    nombre: r.nombre,
    nombre_en: r.nombre_en,
    descripcion: r.descripcion,
    activo: r.activo,
    created_by: null,
    validation_count: r.activo ? 3 : 0,
  }));

  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await supabase
      .from('rubros')
      .upsert(batch, { onConflict: 'id', ignoreDuplicates: false });
    if (error) { console.error(`❌  Batch ${i}:`, error.message); process.exit(1); }
    console.log(`  ✅  Rubros ${i + 1}–${Math.min(i + BATCH, rows.length)} upserted`);
  }

  // Upsert parent relationships
  const parents: { rubro_id: number; padre_id: number }[] = [];
  for (const r of rubros) {
    for (const p of r.padres) parents.push({ rubro_id: r.id, padre_id: p });
  }

  if (parents.length) {
    console.log(`🔗  Inserting ${parents.length} parent relationships`);
    for (let i = 0; i < parents.length; i += BATCH) {
      const batch = parents.slice(i, i + BATCH);
      const { error } = await supabase
        .from('rubro_padres')
        .upsert(batch, { onConflict: 'rubro_id,padre_id', ignoreDuplicates: true });
      if (error) { console.error(`❌  Parents batch ${i}:`, error.message); process.exit(1); }
    }
    console.log('  ✅  Parent relationships done');
  }

  console.log('\n✨  Rubros seeded successfully!');
}

main().catch((e) => { console.error(e); process.exit(1); });
