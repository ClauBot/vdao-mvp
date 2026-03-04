/**
 * VDAO MVP — Seed: Proximidades
 * Loads proximity pairs from src/config/proximidades-seed.json into Supabase.
 *
 * Usage:
 *   export SUPABASE_URL=https://xxx.supabase.co
 *   export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
 *   npx tsx scripts/seed-proximidades.ts
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

interface ProximidadSeed {
  rubro_a: number;
  rubro_b: number;
  valor_propuesto: number;
  codigo_a?: string;
  codigo_b?: string;
}

const BATCH = 50;

async function main() {
  console.log('🌱  VDAO — Seeding Proximidades');
  console.log(`📡  ${SUPABASE_URL}`);

  const filePath = path.join(__dirname, '../src/config/proximidades-seed.json');
  const proximidades: ProximidadSeed[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  console.log(`📂  Found ${proximidades.length} proximity pairs`);

  // Verify connection
  const { error: pingErr } = await supabase.from('proximidades').select('count').limit(1);
  if (pingErr) {
    console.error('❌  Cannot connect. Make sure rubros are seeded first.');
    console.error('   ', pingErr.message);
    process.exit(1);
  }

  const rows = proximidades.map((p) => ({
    rubro_a: p.rubro_a,
    rubro_b: p.rubro_b,
    valor_propuesto: p.valor_propuesto,
    valor_actual: null,
    num_evaluaciones: 0,
  }));

  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await supabase
      .from('proximidades')
      .upsert(batch, { onConflict: 'rubro_a,rubro_b', ignoreDuplicates: false });
    if (error) { console.error(`❌  Batch ${i}:`, error.message); process.exit(1); }
    console.log(`  ✅  Proximidades ${i + 1}–${Math.min(i + BATCH, rows.length)} upserted`);
  }

  console.log('\n✨  Proximidades seeded successfully!');
}

main().catch((e) => { console.error(e); process.exit(1); });
