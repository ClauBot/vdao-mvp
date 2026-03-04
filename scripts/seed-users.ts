/**
 * VDAO MVP — Seed: Users
 * Creates 10 test users at various levels (1-4).
 *
 * Usage:
 *   export SUPABASE_URL=https://xxx.supabase.co
 *   export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
 *   npx tsx scripts/seed-users.ts
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌  Missing env vars: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ──────────────────────────────────────────
// 10 test wallets matching the mock attestations seed
const TEST_USERS = [
  {
    wallet: '0xA1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0',
    nivel: 4,
    nombre_display: 'validador.eth',
  },
  {
    wallet: '0xB2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1',
    nivel: 4,
    nombre_display: 'gobernanza.eth',
  },
  {
    wallet: '0xC3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2',
    nivel: 3,
    nombre_display: 'evaluador.eth',
  },
  {
    wallet: '0xD4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3',
    nivel: 3,
    nombre_display: 'verificador.eth',
  },
  {
    wallet: '0xE5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4',
    nivel: 2,
    nombre_display: 'proponente.eth',
  },
  {
    wallet: '0xF6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5',
    nivel: 2,
    nombre_display: 'colaborador.eth',
  },
  {
    wallet: '0x17a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6',
    nivel: 1,
    nombre_display: 'usuario1.eth',
  },
  {
    wallet: '0x28b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7',
    nivel: 1,
    nombre_display: 'usuario2.eth',
  },
  {
    wallet: '0x39c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8',
    nivel: 1,
    nombre_display: 'nuevo1.eth',
  },
  {
    wallet: '0x40d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9',
    nivel: 1,
    nombre_display: 'nuevo2.eth',
  },
];

// ──────────────────────────────────────────
async function main() {
  console.log('🌱  VDAO — Seeding Test Users');
  console.log(`📡  ${SUPABASE_URL}`);

  // Verify connection
  const { error: pingErr } = await supabase.from('usuarios').select('count').limit(1);
  if (pingErr) {
    console.error('❌  Cannot connect. Make sure DB schema is applied first.');
    console.error('   ', pingErr.message);
    process.exit(1);
  }

  const rows = TEST_USERS.map((u) => ({
    wallet: u.wallet.toLowerCase(),
    nivel: u.nivel,
    nombre_display: u.nombre_display,
    created_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from('usuarios')
    .upsert(rows, { onConflict: 'wallet', ignoreDuplicates: false });

  if (error) {
    console.error('❌  Error inserting users:', error.message);
    process.exit(1);
  }

  console.log(`\n📊  Users seeded:`);
  const byLevel = TEST_USERS.reduce((acc, u) => {
    acc[u.nivel] = (acc[u.nivel] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);
  for (const [level, count] of Object.entries(byLevel)) {
    const label = ['', 'Participante', 'Proponente', 'Evaluador', 'Validador'][Number(level)];
    console.log(`   Nivel ${level} (${label}): ${count} users`);
  }
  console.log('\n✨  Users seeded!');
}

main().catch((e) => { console.error(e); process.exit(1); });
