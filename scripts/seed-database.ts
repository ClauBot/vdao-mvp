/**
 * VDAO MVP — Database Seeder (all-in-one)
 * Loads rubros, proximidades, users, and mock attestations.
 *
 * Usage:
 *   npx tsx scripts/seed-database.ts
 */

import { execSync } from 'child_process';
import * as path from 'path';

const scripts = [
  'seed-rubros.ts',
  'seed-proximidades.ts',
  'seed-users.ts',
  'seed-mock-attestations.ts',
];

async function main() {
  console.log('VDAO MVP — Full Database Seed');
  console.log('================================\n');

  for (const script of scripts) {
    console.log(`--- Running ${script} ---`);
    execSync(`npx tsx ${path.join(__dirname, script)}`, { stdio: 'inherit' });
    console.log('');
  }

  console.log('Full seed complete!');
}

main().catch((e) => { console.error(e); process.exit(1); });
