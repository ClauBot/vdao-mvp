/**
 * VDAO MVP — Database Seeder
 * Loads rubros and proximidades from JSON seed files into Supabase.
 *
 * Usage:
 *   export SUPABASE_URL=https://xxx.supabase.co
 *   export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
 *   npx tsx scripts/seed-database.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing env vars: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
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

interface ProximidadSeed {
  rubro_a: number;
  rubro_b: number;
  valor_propuesto: number;
  codigo_a: string;
  codigo_b: string;
}

async function seedRubros(rubros: RubroSeed[]) {
  console.log(`\n📂 Seeding ${rubros.length} rubros...`);

  // Insert rubros (without parent relationships)
  const rubrosToInsert = rubros.map((r) => ({
    id: r.id,
    nombre: r.nombre,
    nombre_en: r.nombre_en,
    descripcion: r.descripcion,
    activo: r.activo,
    created_by: null,
    validation_count: r.activo ? 3 : 0, // Root/seeded rubros are pre-validated
  }));

  // Upsert in batches to avoid request size limits
  const BATCH_SIZE = 50;
  for (let i = 0; i < rubrosToInsert.length; i += BATCH_SIZE) {
    const batch = rubrosToInsert.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from('rubros').upsert(batch, {
      onConflict: 'id',
      ignoreDuplicates: false,
    });

    if (error) {
      console.error(`❌ Error inserting rubros batch ${i}-${i + BATCH_SIZE}:`, error);
      throw error;
    }
    console.log(`  ✅ Inserted rubros ${i + 1}-${Math.min(i + BATCH_SIZE, rubrosToInsert.length)}`);
  }

  // Now insert parent relationships
  const parentRelations: { rubro_id: number; padre_id: number }[] = [];
  for (const rubro of rubros) {
    for (const padreId of rubro.padres) {
      parentRelations.push({ rubro_id: rubro.id, padre_id: padreId });
    }
  }

  if (parentRelations.length > 0) {
    console.log(`\n🔗 Inserting ${parentRelations.length} parent relationships...`);
    for (let i = 0; i < parentRelations.length; i += BATCH_SIZE) {
      const batch = parentRelations.slice(i, i + BATCH_SIZE);
      const { error } = await supabase.from('rubro_padres').upsert(batch, {
        onConflict: 'rubro_id,padre_id',
        ignoreDuplicates: true,
      });

      if (error) {
        console.error(`❌ Error inserting parent relations batch:`, error);
        throw error;
      }
    }
    console.log(`  ✅ Parent relationships inserted`);
  }
}

async function seedProximidades(proximidades: ProximidadSeed[]) {
  console.log(`\n📏 Seeding ${proximidades.length} proximity pairs...`);

  const toInsert = proximidades.map((p) => ({
    rubro_a: p.rubro_a,
    rubro_b: p.rubro_b,
    valor_propuesto: p.valor_propuesto,
    valor_actual: null, // Will be calculated from attestations
    num_evaluaciones: 0,
  }));

  const BATCH_SIZE = 50;
  for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
    const batch = toInsert.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from('proximidades').upsert(batch, {
      onConflict: 'rubro_a,rubro_b',
      ignoreDuplicates: false,
    });

    if (error) {
      console.error(`❌ Error inserting proximidades batch ${i}-${i + BATCH_SIZE}:`, error);
      throw error;
    }
    console.log(
      `  ✅ Inserted proximidades ${i + 1}-${Math.min(i + BATCH_SIZE, toInsert.length)}`
    );
  }
}

async function runSqlSchema() {
  console.log('\n📋 Note: Database schema (DDL) should be run manually via Supabase SQL Editor');
  console.log('   File: database-schema.sql');
  console.log('   This script only seeds data (DML), not schema creation.');
}

async function main() {
  console.log('🚀 VDAO MVP — Database Seeder');
  console.log('================================');
  console.log(`📡 Supabase URL: ${SUPABASE_URL}`);

  // Test connection
  const { error: pingError } = await supabase.from('rubros').select('count').limit(1);
  if (pingError) {
    console.error('❌ Cannot connect to Supabase. Make sure:');
    console.error('   1. The database schema has been applied (run database-schema.sql first)');
    console.error('   2. Environment variables are correct');
    console.error('   Error:', pingError.message);
    process.exit(1);
  }
  console.log('✅ Connected to Supabase');

  await runSqlSchema();

  // Load seed data
  const rubrosPath = path.join(__dirname, '../src/config/rubros-seed.json');
  const proximidadesPath = path.join(__dirname, '../src/config/proximidades-seed.json');

  const rubros: RubroSeed[] = JSON.parse(fs.readFileSync(rubrosPath, 'utf-8'));
  const proximidades: ProximidadSeed[] = JSON.parse(fs.readFileSync(proximidadesPath, 'utf-8'));

  console.log(`\n📊 Data to seed:`);
  console.log(`   Rubros: ${rubros.length}`);
  console.log(`   Proximidades: ${proximidades.length}`);

  // Seed in order (rubros first, then relationships)
  await seedRubros(rubros);
  await seedProximidades(proximidades);

  console.log('\n✨ Seeding complete!');
  console.log('\nNext steps:');
  console.log('  1. Run: npx tsx scripts/deploy-schemas.ts (to register EAS schemas)');
  console.log('  2. Update .env with schema UIDs from the deploy output');
}

main().catch((err) => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
