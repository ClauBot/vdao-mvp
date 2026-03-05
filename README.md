# VDAO — Reputación Mutua On-Chain

Sistema de reputación descentralizado donde individuos se evalúan mutuamente a través de ~140 rubros profesionales/comerciales. Las evaluaciones son **atestaciones inmutables** en Sepolia vía EAS (Ethereum Attestation Service).

> Inspirado en el concepto de **Happy or Not**, pero mutuo: ambas partes de una interacción se evalúan entre sí. Esto hace el sistema resistente a spam.

**Demo:** https://vdao-mvp.vercel.app  
**Repo:** https://github.com/ClauBot/vdao-mvp

---

## 🗺️ Arquitectura

```
┌───────────────────────────────────┐
│        Next.js 14 (Vercel)        │
│  /explorer   /coru   /api/*       │
└──────────────┬────────────────────┘
               │
    ┌──────────┴──────────┐
    │                     │
┌───▼────────┐    ┌───────▼──────┐
│  EAS       │    │  PostgreSQL   │
│  Sepolia   │    │  (local/cloud)│
│  L1        │    │               │
│  Attest.   │    │  Rubros       │
│  Schemas   │    │  Proximidades │
│            │    │  Usuarios     │
│            │    │  Attest.Cache │
└────────────┘    └───────────────┘
```

**Stack:**
- **Frontend:** Next.js 14 App Router + TypeScript + Tailwind CSS + shadcn/ui
- **Wallet:** wagmi v2 + viem + WalletConnect
- **Blockchain:** Sepolia testnet (EAS attestations)
- **Gas:** EAS Delegated Attestations — gasless para usuarios (server relayer paga gas)
- **DB:** PostgreSQL (local con `pg`, compatible con Supabase para producción)

---

## 📦 Módulos

### Módulo 1 — Wallet Explorer (`/explorer`)
- Buscar cualquier dirección ETH (o ENS)
- Dashboard con atestaciones recibidas / emitidas
- Resumen de reputación: score promedio, rubros activos, nivel
- Crear atestación gasless (el usuario firma, nosotros pagamos gas)

### Módulo 2 — Visualizador CoRu (`/coru`)
- Tabla de ~140 rubros organizados como grafo DAG (múltiples padres permitidos)
- 14 categorías raíz, 160 relaciones padre-hijo
- Reorganización por proximidad (click en rubro → tabla reordena por similitud)
- Vista plana / jerárquica
- CRUD de rubros (nivel 2+ propone, nivel 4 valida)
- Evaluación de proximidad entre rubros (nivel 1+)

---

## ⛓️ EAS Schemas (Sepolia L1)

| Schema | UID | Explorer |
|--------|-----|----------|
| Evaluación Mutua | `0xc6fb97ee...8c09c5` | [Ver](https://sepolia.easscan.org/schema/view/0xc6fb97ee8ff47e6e81db00330937bcfcc1add401a9eca8c3b45149aa2a8c09c5) |
| Proximidad | `0xd363eb10...bc30df` | [Ver](https://sepolia.easscan.org/schema/view/0xd363eb1054af738797280d7a7c954d2c10d0cbf67ed0f676126971e28cbc30df) |
| Validación | `0x2b5d3d86...b3e8be` | [Ver](https://sepolia.easscan.org/schema/view/0x2b5d3d86ad720516a52401bc5000a1cf92f080bde9df0820ebecc7077cb3e8be) |

**Contratos EAS (Sepolia):**
- EAS: `0xC2679fBD37d54388Ce493F1DB75320D236e1815e`
- Schema Registry: `0x0a7E2Ff54e76B8E6659aedc9103FB21c038050D0`

---

## 🚀 Setup Local

### Prerrequisitos
- Node.js 18+
- pnpm (`npm install -g pnpm`)
- PostgreSQL 14+

### 1. Clonar e instalar

```bash
git clone https://github.com/ClauBot/vdao-mvp.git
cd vdao-mvp
pnpm install
```

### 2. Crear base de datos

```bash
# Crear DB y usuario
psql -U postgres -c "CREATE DATABASE vdao_mvp;"
psql -U postgres -c "CREATE USER vdao WITH PASSWORD 'vdao2026';"
psql -U postgres -c "ALTER DATABASE vdao_mvp OWNER TO vdao;"
psql -U postgres -d vdao_mvp -c "GRANT ALL ON SCHEMA public TO vdao;"

# Ejecutar schema (7 tablas + índices + RLS)
PGPASSWORD=vdao2026 psql -h localhost -U vdao -d vdao_mvp -f database-schema.sql
```

### 3. Seedear datos

```bash
# Inserta 140 rubros + 160 relaciones padre-hijo
node -e "
const{Pool}=require('pg');
const rubros=require('./src/config/rubros-seed.json');
const pool=new Pool({connectionString:'postgresql://vdao:vdao2026@localhost:5432/vdao_mvp'});
(async()=>{const c=await pool.connect();await c.query('BEGIN');
for(const r of rubros){
  await c.query('INSERT INTO rubros(id,nombre,nombre_en,descripcion,activo) VALUES(\$1,\$2,\$3,\$4,\$5) ON CONFLICT DO NOTHING',[r.id,r.nombre,r.nombre_en,r.descripcion,r.activo!==false]);
  if(r.padres) for(const p of r.padres) await c.query('INSERT INTO rubro_padres(rubro_id,padre_id) VALUES(\$1,\$2) ON CONFLICT DO NOTHING',[r.id,p]);
}
await c.query('COMMIT');c.release();await pool.end();console.log('Done');})();
"
```

### 4. Variables de entorno

Crear `.env.local`:

```env
DATABASE_URL=postgresql://vdao:vdao2026@localhost:5432/vdao_mvp

NEXT_PUBLIC_EAS_CONTRACT=0xC2679fBD37d54388Ce493F1DB75320D236e1815e
NEXT_PUBLIC_SCHEMA_EVALUATION_UID=0xc6fb97ee8ff47e6e81db00330937bcfcc1add401a9eca8c3b45149aa2a8c09c5
NEXT_PUBLIC_SCHEMA_PROXIMITY_UID=0xd363eb1054af738797280d7a7c954d2c10d0cbf67ed0f676126971e28cbc30df
NEXT_PUBLIC_SCHEMA_VALIDATION_UID=0x2b5d3d86ad720516a52401bc5000a1cf92f080bde9df0820ebecc7077cb3e8be
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=placeholder

# Gasless Relayer — private key of wallet that pays gas for delegated attestations
RELAYER_PRIVATE_KEY=0x...

# Legacy Supabase vars (needed for build, can be placeholder)
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder
SUPABASE_SERVICE_ROLE_KEY=placeholder
```

### 5. Correr

```bash
npx next dev -p 3456
# → http://localhost:3456
```

Para servir en red local:
```bash
npx next dev -p 3456 -H 0.0.0.0
```

---

## 📊 Base de Datos

7 tablas PostgreSQL:

| Tabla | Descripción |
|-------|-------------|
| `rubros` | 140 rubros profesionales/comerciales |
| `rubro_padres` | Relaciones DAG (un rubro puede tener múltiples padres) |
| `proximidades` | Distancia/similitud entre pares de rubros |
| `usuarios` | Wallets registradas con nivel (1-4) |
| `atestaciones_cache` | Cache local de atestaciones EAS |
| `proximidad_atestaciones_cache` | Cache de atestaciones de proximidad |
| `validacion_rubros_cache` | Cache de validaciones de rubros |

### Categorías raíz (14):
Tecnología, Artes, Mercadotecnia, Entretenimiento, Servicios Profesionales, Educación, Salud, Construcción e Ingeniería, Comercio, Logística y Transporte, Agricultura y Medio Ambiente, Finanzas y Crypto, Ciencias e Investigación, Gobierno y ONG

---

## 🔑 Decisiones de Diseño

- **Escala 1-4:** Fuerza una posición, evita neutralidad
- **DAG no árbol:** Rubros pueden tener múltiples padres (ej: Ciencia Cognitiva → Psicología + IA + Ciencias)
- **Proximidad Jaccard:** `|A∩B| / |A∪B|` + bonos por jerarquía
- **Niveles 1-4:** Determinan permisos (crear rubros, validar, votar)
- **Gasless:** Usuarios firman EIP-712 typed data, server relayer paga gas vía `attestByDelegation()`
- **Privacidad NULL en MVP:** Todo público, privacidad en fase 2

---

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── layout.tsx            # Root layout + providers
│   ├── explorer/page.tsx     # Wallet Explorer
│   ├── coru/page.tsx         # CoRu Visualizer
│   └── api/
│       ├── rubros/           # CRUD rubros
│       ├── proximidades/     # Proximidades
│       ├── atestaciones/     # Atestaciones EAS (indexing)
│       ├── attest-delegated/ # Gasless delegated attestation relayer
│       │   ├── route.ts      # POST: submit attestByDelegation, GET: health check
│       │   └── nonce/route.ts # GET: fetch EAS nonce for address
│       └── usuarios/         # Usuarios
├── components/
│   ├── explorer/             # AttestationList, Card, Create, Summary
│   ├── coru/                 # RubrosTable, ProximityEvaluator, CRUD
│   └── shared/               # Header, Footer, ConnectButton, Providers
├── config/
│   └── rubros-seed.json      # 140 rubros con padres
├── lib/
│   ├── db.ts                 # PostgreSQL pool (pg)
│   ├── wagmi.ts              # wagmi v2 config (Sepolia)
│   ├── eas.ts                # EAS SDK helpers
│   ├── eas-delegated.ts      # EAS delegated attestation ABI + EIP-712 types
│   ├── paymaster.ts          # Pimlico paymaster (legacy, deprecated)
│   └── paymaster-browser.ts  # Pimlico paymaster (legacy, deprecated)
└── scripts/
    ├── deploy-schemas-sepolia.ts  # Deploy EAS schemas
    ├── test-delegated.ts          # Integration test: delegated attestation
    ├── seed-rubros.ts
    ├── seed-proximidades.ts
    └── seed-mock-attestations.ts
```

---

## 🛣️ Roadmap

- [x] Fase 0: Diseño de datos (rubros, proximidades, schemas)
- [x] Fase 1: Infraestructura (Next.js + DB + EAS + Wallet)
- [x] Fase 2: Wallet Explorer
- [x] Fase 3: CoRu Visualizer
- [x] Fase 4: Integración y polish
- [x] EAS Schemas desplegados en Sepolia
- [x] Deploy Vercel (demo)
- [x] Gasless attestations via EAS delegated attestations (reemplaza Pimlico ERC-4337)
- [ ] Mobile-first UI
- [ ] CAPTCHA anti-sybil (fase 2)
- [ ] Migración a mainnet

---

## 👥 Créditos

- **Idea:** anon
- **Creación:** ClauBot de empleadodigital.mx
- **Gerente de empleadodigital:** mexi

---

## 📄 Licencia

MIT
