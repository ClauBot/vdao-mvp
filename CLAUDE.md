# VDAO MVP — Phase 1: Infrastructure Setup

You are building the infrastructure for VDAO, an on-chain mutual reputation system.

## Your Task (Phase 1)

Read PLAN-DE-TRABAJO.md for full context. Execute tasks 1.1 through 1.5:

### 1.1 Project Setup
- Initialize Next.js 14 with App Router + TypeScript IN THIS REPO (the docs are already here)
- Add Tailwind CSS + shadcn/ui
- Create the folder structure from the plan
- Configure ESLint + Prettier
- Create .env.example with all needed variables

### 1.2 Supabase Setup
- Create the seed scripts that load rubros and proximidades from the .md files
- Create `scripts/setup-supabase.ts` that runs the SQL from database-schema.sql
- Create seed JSON files: `src/config/rubros-seed.json` and `src/config/proximidades-seed.json`
- Parse rubros.md to generate the JSON (152 rubros, preserve IDs and parent relationships)

### 1.3 EAS Schema Deploy Script
- Create `scripts/deploy-schemas.ts` based on schemas.md
- Use @ethereum-attestation-service/eas-sdk
- Target: Arbitrum Sepolia (chain ID 421614)
- EAS address: 0xaEF4103A04090071165F78D45D83A0C0782c2B2a
- Schema Registry: 0x0a7E2Ff54e76B8E6659aedc9103FB21c038050D0

### 1.4 Wallet Connection
- Install wagmi v2 + viem + @tanstack/react-query
- Configure for Arbitrum Sepolia
- Create ConnectButton component with MetaMask + WalletConnect support
- Auto chain-switch to Arbitrum Sepolia

### 1.5 Paymaster Setup
- Research and integrate a paymaster for gasless attestations
- Options: Alchemy Gas Manager, Pimlico, StackUp, or custom
- The goal: users sign attestations but DON'T pay gas
- Create `src/lib/paymaster.ts` with the integration
- Document the chosen solution and why

## Important Files to Read
- `PLAN-DE-TRABAJO.md` — Full project plan
- `database-schema.sql` — PostgreSQL schema (7 tables)
- `schemas.md` — 3 EAS schemas with deploy script
- `rubros.md` — 152 rubros to seed
- `proximidades.md` — 213 proximity pairs to seed

## Constraints
- Use pnpm as package manager
- TypeScript strict mode
- All code in src/
- Commit frequently with descriptive messages
- Push to origin/main when done

When completely finished, run this command to notify:
openclaw system event --text "Done: Phase 1 infrastructure complete - Next.js + Supabase schema + EAS scripts + Wallet + Paymaster" --mode now
