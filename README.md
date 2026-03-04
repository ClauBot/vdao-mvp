# VDAO — Reputación Mutua On-Chain

Sistema de reputación descentralizado donde individuos se evalúan mutuamente. Las evaluaciones son **atestaciones inmutables** en Arbitrum vía EAS (Ethereum Attestation Service). Los usuarios **no pagan gas** — las atestaciones son gasless gracias a Pimlico Paymaster.

> Inspirado en el concepto de **Happy or Not**, pero mutuo: ambas partes de una interacción se evalúan entre sí. Esto hace el sistema resistente a spam.

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
│  EAS       │    │  Supabase     │
│  Arbitrum  │    │  (NUC/Cloud)  │
│  Sepolia   │    │               │
│  Attest.   │    │  Rubros       │
│  Schemas   │    │  Proximidades │
│            │    │  Usuarios     │
│            │    │  Attest.Cache │
└────────────┘    └───────────────┘
```

**Stack:**
- **Frontend:** Next.js 14 App Router + TypeScript + Tailwind CSS + shadcn/ui
- **Wallet:** wagmi v2 + viem + WalletConnect
- **Blockchain:** Arbitrum Sepolia (EAS attestations)
- **Gas:** Pimlico Paymaster (ERC-4337 / Account Abstraction)
- **DB:** Supabase (PostgreSQL con RLS)

---

## 📦 Módulos

### Módulo 1 — Wallet Explorer (`/explorer`)
- Buscar cualquier dirección ETH (o ENS)
- Dashboard con atestaciones recibidas / emitidas
- Resumen de reputación: score promedio, rubros activos, nivel
- Crear atestación (requiere wallet conectada)
- Gasless: el usuario firma, nosotros pagamos

### Módulo 2 — Visualizador CoRu (`/coru`)
- Tabla de ~152 rubros organizados como grafo DAG
- Reorganización por proximidad (click en rubro → tabla reordena por similitud)
- Vista plana / jerárquica
- CRUD de rubros (nivel 2 para crear, nivel 4 para validar)
- Evaluación de proximidad entre rubros (nivel 1+)

---

## 🚀 Setup Local

### Prerrequisitos
- Node.js 18+
- pnpm (`npm install -g pnpm`)
- Cuenta en Supabase (o instancia local)
- Cuenta en WalletConnect Cloud (gratis)

### 1. Clonar e instalar

```bash
git clone https://github.com/your-org/vdao-mvp
cd vdao-mvp
pnpm install
```

### 2. Variables de entorno

```bash
cp .env.example .env.local
```

Editar `.env.local` con los valores reales (ver sección [Variables de Entorno](#variables-de-entorno)).

### 3. Preparar base de datos

Ejecutar el esquema SQL en Supabase Studio o SQL Editor:

```bash
# Copiar y ejecutar en Supabase SQL Editor:
cat database-schema.sql
```

### 4. Seed de datos

```bash
# Cargar todo en orden (rubros → proximidades → usuarios → mock attestations)
pnpm seed

# O por separado:
pnpm seed:rubros
pnpm seed:proximidades
pnpm seed:users
pnpm seed:attestations
```

### 5. Correr en desarrollo

```bash
pnpm dev
```

Abrir [http://localhost:3000](http://localhost:3000).

---

## 🔑 Variables de Entorno

Todas las variables están documentadas en `.env.example`.

| Variable | Requerida | Descripción |
|----------|-----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Anon key de Supabase (pública) |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ (seed/server) | Service role key (nunca exponer al cliente) |
| `NEXT_PUBLIC_EAS_CONTRACT` | ✅ | Dirección del contrato EAS en Arbitrum Sepolia |
| `NEXT_PUBLIC_SCHEMA_EVALUATION_UID` | ✅ | UID del schema de evaluación mutua |
| `NEXT_PUBLIC_SCHEMA_PROXIMITY_UID` | ✅ | UID del schema de proximidad |
| `NEXT_PUBLIC_SCHEMA_VALIDATION_UID` | ✅ | UID del schema de validación |
| `NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC` | ✅ | RPC de Arbitrum Sepolia |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | ✅ | Project ID de WalletConnect Cloud |
| `NEXT_PUBLIC_PIMLICO_API_KEY` | ✅ | API key de Pimlico (paymaster) |
| `BUNDLER_RPC_URL` | ✅ | Bundler RPC (Pimlico) |
| `DEPLOYER_PRIVATE_KEY` | Solo deploy | Private key para registrar schemas EAS |

---

## 📋 Scripts disponibles

```bash
pnpm dev                  # Desarrollo local
pnpm build                # Build de producción
pnpm start                # Servidor de producción
pnpm lint                 # ESLint
pnpm type-check           # TypeScript check

# Seeds (requieren SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)
pnpm seed                 # Ejecuta todos los seeds en orden
pnpm seed:rubros          # Solo rubros (~152)
pnpm seed:proximidades    # Solo pares de proximidad
pnpm seed:users           # 10 usuarios de prueba (niveles 1-4)
pnpm seed:attestations    # 50 atestaciones mock

# EAS
pnpm deploy:schemas       # Registra los 3 schemas en EAS (requiere DEPLOYER_PRIVATE_KEY)
```

---

## 🗄️ Estructura de Carpetas

```
vdao-mvp/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── layout.tsx            # Root layout (Header + Footer)
│   │   ├── globals.css           # Estilos globales
│   │   ├── explorer/
│   │   │   └── page.tsx          # Módulo 1: Wallet Explorer
│   │   ├── coru/
│   │   │   └── page.tsx          # Módulo 2: CoRu
│   │   └── api/
│   │       ├── rubros/           # CRUD rubros
│   │       ├── atestaciones/     # Leer/indexar atestaciones
│   │       └── proximidades/     # Leer/calcular proximidades
│   ├── components/
│   │   ├── ui/                   # shadcn/ui primitives
│   │   ├── explorer/             # Componentes del Explorer
│   │   ├── coru/                 # Componentes del CoRu
│   │   └── shared/               # Header, Footer, ConnectButton
│   ├── lib/
│   │   ├── supabase.ts           # Cliente Supabase
│   │   ├── eas.ts                # EAS SDK config
│   │   ├── wagmi.ts              # wagmi config
│   │   ├── contracts.ts          # ABIs y addresses
│   │   ├── proximity.ts          # Lógica Jaccard
│   │   ├── types.ts              # TypeScript types
│   │   └── utils.ts              # cn() y utilidades
│   ├── hooks/
│   │   └── useRubros.ts          # Hook para fetching de rubros
│   └── config/
│       ├── rubros-seed.json      # ~152 rubros iniciales
│       └── proximidades-seed.json # Proximidades propuestas
├── scripts/
│   ├── deploy-schemas.ts         # Registrar schemas EAS
│   ├── seed-database.ts          # Seed completo (legacy)
│   ├── seed-rubros.ts            # Seed: rubros
│   ├── seed-proximidades.ts      # Seed: proximidades
│   ├── seed-mock-attestations.ts # Seed: 50 mock attestations
│   └── seed-users.ts             # Seed: 10 test users
├── database-schema.sql           # DDL de la base de datos
├── .env.example                  # Variables de entorno documentadas
└── PLAN-DE-TRABAJO.md            # Plan técnico completo del MVP
```

---

## 🔗 Contratos / Direcciones

| Recurso | Red | Dirección / UID |
|---------|-----|-----------------|
| EAS Contract | Arbitrum Sepolia | `0xaEF4103A04090071165F78D45D83A0C0782c2B2a` |
| Schema Registry | Arbitrum Sepolia | `0x0a7E2Ff54e76B8E6659aedc9103FB21c038050D0` |
| Schema: Evaluación | Arbitrum Sepolia | Ver `NEXT_PUBLIC_SCHEMA_EVALUATION_UID` |
| Schema: Proximidad | Arbitrum Sepolia | Ver `NEXT_PUBLIC_SCHEMA_PROXIMITY_UID` |
| Schema: Validación | Arbitrum Sepolia | Ver `NEXT_PUBLIC_SCHEMA_VALIDATION_UID` |

---

## 📐 Schemas EAS

### Schema 1 — Evaluación Mutua
```
address attester          // Quien evalúa
address receiver          // Quien recibe
uint16 rubroId            // Rubro de la interacción
uint8 interactionType     // 0=Comercial, 1=Docente, 2=Investigación
uint8 scoreService        // 1-4 (Muy malo → Muy bueno)
uint8 scoreTreatment      // 1-4 (Muy malo → Muy bueno)
uint8 role                // 0=Proveedor, 1=Cliente
bytes32 counterpartAttestation  // UID de la atestación de la contraparte
```

### Schema 2 — Proximidad de Rubros
```
uint16 rubroA             // Primer rubro
uint16 rubroB             // Segundo rubro
uint8 proximityScore      // 1-100
uint8 proposerLevel       // Nivel del proponente (afecta peso)
```

### Schema 3 — Validación de Rubro
```
uint16 rubroId            // ID del rubro propuesto
bool approved             // Aprobado o rechazado
string reason             // Razón (opcional)
```

---

## 🚢 Deploy a Vercel

```bash
# 1. Push a GitHub
git push origin main

# 2. Importar en Vercel
# https://vercel.com/new → Import Git Repository

# 3. Configurar variables de entorno en Vercel Dashboard
# (mismas que en .env.local, excepto las que comienzan con NEXT_PUBLIC_ se pueden ver)

# 4. Deploy automático en cada push a main
```

**Notas de deploy:**
- Framework: Next.js (auto-detectado)
- Build command: `pnpm build`
- Output dir: `.next`
- Asegurarse de que `SUPABASE_SERVICE_ROLE_KEY` esté en las env vars de Vercel (no expuesta al cliente)

---

## 🧩 Niveles de Usuario

| Nivel | Nombre | Permisos |
|-------|--------|----------|
| 1 | Participante | Conectar wallet, ser evaluado, buscar wallets |
| 2 | Proponente | + Proponer nuevos rubros |
| 3 | Evaluador | + Emitir atestaciones, evaluar proximidades |
| 4 | Validador | + Aprobar/rechazar propuestas de rubros (gobernanza) |

---

## 📖 Documentación adicional

- [`PLAN-DE-TRABAJO.md`](./PLAN-DE-TRABAJO.md) — Plan técnico completo del MVP
- [`database-schema.sql`](./database-schema.sql) — DDL de la base de datos
- [`src/config/rubros-seed.json`](./src/config/rubros-seed.json) — Datos de rubros
- [`src/config/proximidades-seed.json`](./src/config/proximidades-seed.json) — Proximidades iniciales

---

## ⚠️ Fuera de Alcance (MVP)

- Privacidad / ZK-proofs
- SBTs personalizables
- Sistema de disputas
- Multi-idioma
- App móvil nativa
- Paymaster avanzado (Account Abstraction completo)

---

*VDAO MVP — Marzo 2026*  
*Built on Arbitrum • Powered by EAS • Open Source*
