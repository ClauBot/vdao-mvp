# VDAO — Plan de Trabajo MVP

*Plan detallado para construir el MVP completo, ejecutable por cualquier IA o equipo de desarrollo.*

---

## 📋 Resumen Ejecutivo

**Producto:** MVP de VDAO — Sistema de reputación on-chain con evaluaciones mutuas y constelación de rubros.  
**Stack:** Next.js 14 (App Router) + Supabase + EAS (Arbitrum Sepolia) + Vercel + Paymaster (gas sponsorship para atestaciones)  
**Módulos:** 2 (Wallet Explorer + Visualizador CoRu)  
**Estimación:** ~40-60 horas de desarrollo  

---

## 🏗️ Arquitectura General

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND (Vercel)                 │
│              Next.js 14 + App Router                │
│                                                     │
│  ┌─────────────────┐    ┌────────────────────────┐  │
│  │  Módulo 1:       │    │  Módulo 2:             │  │
│  │  Wallet Explorer │    │  Visualizador CoRu     │  │
│  │  - Buscar wallet │    │  - Tabla de rubros     │  │
│  │  - Dashboard     │    │  - Proximidad          │  │
│  │  - Atestaciones  │    │  - CRUD rubros         │  │
│  └────────┬─────────┘    └──────────┬─────────────┘  │
│           │                         │                │
│  ┌────────┴─────────────────────────┴─────────────┐  │
│  │           Viem + EAS SDK + Wagmi               │  │
│  └────────┬─────────────────────────┬─────────────┘  │
└───────────┼─────────────────────────┼────────────────┘
            │                         │
    ┌───────▼───────┐        ┌───────▼────────┐
    │  EAS           │        │  Supabase       │
    │  (Arbitrum     │        │  (NUC)          │
    │   Sepolia)     │        │                 │
    │  - Attestations│        │  - Rubros       │
    │  - Schemas     │        │  - Proximidades │
    │               │        │  - Usuarios     │
    │               │        │  - Cache attest. │
    └───────────────┘        └─────────────────┘
```

---

## 📦 Fases y Sub-agentes

### FASE 0: Diseño de Datos (Claubot directo — sin sub-agente)

**Objetivo:** Definir toda la estructura de datos antes de escribir código.

#### Tarea 0.1: Lista de ~150 Rubros y Sub-rubros
**Archivo de salida:** `rubros.md`  
**Requisitos:**
- Categorías principales: Tecnología, Artes, Mercadotecnia, Entretenimiento, Servicios Profesionales, Educación, Salud, Construcción/Inmobiliaria, Finanzas, Comercio, Logística, Agricultura
- Cada rubro tiene: `id`, `nombre`, `descripción breve`, `padres[]` (puede tener 0, 1 o múltiples)
- Estructura de grafo dirigido acíclico (DAG), NO árbol simple
- ~150 rubros total entre categorías principales y sub-rubros
- Profundidad variable (algunos 2 niveles, otros 4+)
- Algunos rubros multi-padre (ej: "Ciencia Cognitiva" → hijo de "Psicología" + "Inteligencia Artificial")
- Nombres en español, con campo opcional de nombre en inglés para futura internacionalización
- Considerar diferencias culturales/conceptuales para expansión internacional

#### Tarea 0.2: Propuesta de Proximidades Iniciales
**Archivo de salida:** `proximidades.md`  
**Requisitos:**
- Matriz de proximidades entre rubros relevantes (no todos los 150x150, solo pares significativos)
- Valores de 0 a 1 (Jaccard + bonus jerárquico)
- Mínimo 200 pares con valores propuestos
- Categorizar: alta (>0.6), media (0.3-0.6), baja (<0.3)
- Estos valores son **propuestas iniciales** que los usuarios override con atestaciones
- Documentar la lógica de cómo se asignó cada valor

#### Tarea 0.3: Diseño de Schemas EAS
**Archivo de salida:** `schemas.md`  
**Requisitos:**
- **Schema 1 — Evaluación Mutua:**
  ```
  address attester          // Quien evalúa
  address receiver          // Quien recibe
  uint16 rubroId           // Rubro de la interacción
  uint8 interactionType    // 0=Comercial, 1=Docente, 2=Investigación
  uint8 scoreService       // 1-4 (Muy malo, Malo, Bueno, Muy bueno)
  uint8 scoreTreatment     // 1-4 (Muy malo, Malo, Bueno, Muy bueno)
  uint8 role               // 0=Proveedor, 1=Cliente
  bytes32 counterpartAttestation  // UID de la atestación de la contraparte (mutualidad)
  ```
- **Schema 2 — Proximidad de Rubros:**
  ```
  uint16 rubroA            // Primer rubro
  uint16 rubroB            // Segundo rubro
  uint8 proximityScore     // 1-100 (escala entera, se divide entre 100 para 0.00-1.00)
  uint8 proposerLevel      // Nivel del proponente (1-4), afecta peso
  ```
- **Schema 3 — Validación de Rubro Nuevo:**
  ```
  uint16 rubroId           // ID del rubro propuesto
  bool approved            // Aprobado o rechazado
  string reason            // Razón (opcional)
  ```
- Todos los schemas registrados en EAS de Arbitrum Sepolia
- Documentar UIDs de schemas desplegados

#### Tarea 0.4: Diseño de Base de Datos Supabase
**Archivo de salida:** `database-schema.sql`  
**Requisitos:**

```sql
-- Tablas principales:

-- 1. rubros (cache + gestión)
rubros (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  nombre_en TEXT,             -- Para internacionalización futura
  descripcion TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ,
  created_by TEXT,            -- wallet address del proponente
  validated_at TIMESTAMPTZ,
  validation_count INT DEFAULT 0
)

-- 2. rubro_padres (relación many-to-many para DAG)
rubro_padres (
  rubro_id INT REFERENCES rubros(id),
  padre_id INT REFERENCES rubros(id),
  PRIMARY KEY (rubro_id, padre_id)
)

-- 3. proximidades (cache de valores calculados + propuestas)
proximidades (
  rubro_a INT REFERENCES rubros(id),
  rubro_b INT REFERENCES rubros(id),
  valor_propuesto FLOAT,      -- Propuesta inicial (0-1)
  valor_actual FLOAT,         -- Calculado de atestaciones (override progresivo)
  num_evaluaciones INT DEFAULT 0,
  ultima_actualizacion TIMESTAMPTZ,
  PRIMARY KEY (rubro_a, rubro_b)
)

-- 4. usuarios (cache de datos on-chain)
usuarios (
  wallet TEXT PRIMARY KEY,
  nivel INT DEFAULT 1,        -- 1-4
  nombre_display TEXT,
  created_at TIMESTAMPTZ
)

-- 5. atestaciones_cache (indexación de eventos EAS)
atestaciones_cache (
  uid TEXT PRIMARY KEY,       -- EAS attestation UID
  attester TEXT NOT NULL,
  receiver TEXT NOT NULL,
  rubro_id INT REFERENCES rubros(id),
  interaction_type INT,       -- 0=Comercial, 1=Docente, 2=Investigación
  score_service INT,          -- 1-4
  score_treatment INT,        -- 1-4
  role INT,                   -- 0=Proveedor, 1=Cliente
  counterpart_uid TEXT,       -- UID de la contraparte
  timestamp TIMESTAMPTZ,
  block_number BIGINT
)

-- 6. proximidad_atestaciones_cache
proximidad_atestaciones_cache (
  uid TEXT PRIMARY KEY,
  rubro_a INT REFERENCES rubros(id),
  rubro_b INT REFERENCES rubros(id),
  score INT,                  -- 1-100
  proposer TEXT,              -- wallet
  proposer_level INT,         -- 1-4
  timestamp TIMESTAMPTZ
)

-- RLS: lectura pública, escritura solo vía service role (indexer)
-- Índices en: attester, receiver, rubro_id, timestamp
```

---

### FASE 1: Infraestructura (Sub-agente: `vdao-infra`)

**Modelo recomendado:** Sonnet  
**Tiempo estimado:** 4-6 horas  

#### Tarea 1.1: Setup del Proyecto
**Requisitos:**
- Crear repo en GitHub: `vdao-mvp`
- Next.js 14 con App Router y TypeScript
- Tailwind CSS + shadcn/ui para componentes
- Estructura de carpetas:
  ```
  src/
    app/
      page.tsx              # Landing / home
      explorer/
        page.tsx            # Módulo 1: Wallet Explorer
      coru/
        page.tsx            # Módulo 2: Visualizador CoRu
      api/
        rubros/             # CRUD rubros
        atestaciones/       # Leer/indexar atestaciones
        proximidades/       # Leer/calcular proximidades
    components/
      ui/                   # shadcn components
      explorer/             # Componentes Módulo 1
      coru/                 # Componentes Módulo 2
      shared/               # Header, Footer, WalletConnect
    lib/
      supabase.ts           # Cliente Supabase
      eas.ts                # EAS SDK config
      contracts.ts          # ABIs y addresses
      proximity.ts          # Lógica de cálculo Jaccard
      types.ts              # TypeScript types
    config/
      rubros-seed.json      # Datos iniciales de rubros
      proximidades-seed.json # Proximidades iniciales
  ```
- ESLint + Prettier configurados
- Variables de entorno documentadas en `.env.example`:
  ```
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_ANON_KEY=
  SUPABASE_SERVICE_ROLE_KEY=
  NEXT_PUBLIC_EAS_CONTRACT=
  NEXT_PUBLIC_SCHEMA_EVALUATION_UID=
  NEXT_PUBLIC_SCHEMA_PROXIMITY_UID=
  NEXT_PUBLIC_SCHEMA_VALIDATION_UID=
  NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC=
  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
  ```

#### Tarea 1.2: Supabase Setup
**Requisitos:**
- Crear proyecto en Supabase (o usar el del NUC)
- Ejecutar `database-schema.sql`
- Configurar RLS policies (lectura pública, escritura service role)
- Crear índices para queries frecuentes
- Seed data: cargar `rubros-seed.json` y `proximidades-seed.json`
- Verificar que las queries necesarias funcionan

#### Tarea 1.3: EAS Schemas Deploy
**Requisitos:**
- Conectar a Arbitrum Sepolia
- Registrar los 3 schemas en EAS:
  1. Schema Evaluación Mutua
  2. Schema Proximidad de Rubros
  3. Schema Validación de Rubro
- Guardar UIDs de schemas en config
- Script de deploy reproducible (`scripts/deploy-schemas.ts`)
- Documentar gas costs y addresses

#### Tarea 1.4: Wallet Connection
**Requisitos:**
- Wagmi v2 + Viem + WalletConnect
- Soporte: MetaMask, WalletConnect, Coinbase Wallet
- Chain: Arbitrum Sepolia (chain ID 421614)
- Auto-switch de chain si el usuario está en otra red
- Componente `ConnectButton` reutilizable

#### Tarea 1.5: Paymaster Setup (Gas Sponsorship)
**Requisitos:**
- Las atestaciones deben ser **gratuitas para el usuario** — el proyecto paga el gas
- Opciones de implementación (evaluar en orden de preferencia):
  1. **Alchemy Gas Manager** (Account Kit) — tiene free tier para testnets
  2. **Pimlico** — paymaster-as-a-service, soporta Arbitrum Sepolia
  3. **StackUp** — alternativa con bundler incluido
  4. **Custom Paymaster** — contrato propio si las opciones SaaS no sirven
- Integrar con EAS SDK: al crear atestación, la tx pasa por el paymaster
- El usuario firma la atestación pero **no paga gas**
- Configurar spending limits (máx atestaciones por wallet por día para evitar abuse)
- Documentar costos estimados de gas por atestación en Arbitrum Sepolia
- Variables de entorno:
  ```
  PAYMASTER_API_KEY=
  PAYMASTER_POLICY_ID=
  BUNDLER_RPC_URL=
  ```

---

### FASE 2: Módulo 1 — Wallet Explorer (Sub-agente: `vdao-explorer`)

**Modelo recomendado:** Sonnet  
**Tiempo estimado:** 8-12 horas  

#### Tarea 2.1: Página de Búsqueda
**Requisitos:**
- Input para dirección ETH (0x...)
- Validación de formato (regex + checksum)
- Soporte para ENS (resolver nombre → address)
- Botón "Buscar"
- URL con query param: `/explorer?wallet=0x...`
- Estado de loading con skeleton
- Error handling (wallet no encontrada, sin atestaciones)

#### Tarea 2.2: Dashboard de Atestaciones
**Requisitos:**
- Dos secciones: "Atestaciones Recibidas" y "Atestaciones Emitidas"
- Por cada atestación mostrar:
  - Emisor/Receptor (address truncada + link a Arbiscan)
  - Fecha/hora (formato legible + relative time)
  - Rubro (nombre del rubro, clickeable → va a CoRu)
  - Naturaleza (badge: Comercial/Docente/Investigación)
  - Score Servicio (visual: 4 estrellas o barras)
  - Score Trato (visual: 4 estrellas o barras)
  - Link a la atestación en EAS Explorer
- Paginación (20 por página)
- Filtros: por rubro, por naturaleza, por fecha
- Ordenamiento: por fecha (default), por score

#### Tarea 2.3: Resumen de Reputación
**Requisitos:**
- Card de resumen en la parte superior del dashboard:
  - Total de atestaciones (emitidas + recibidas)
  - Score promedio de servicio
  - Score promedio de trato
  - Rubros activos (en cuántos rubros tiene atestaciones)
  - Nivel del usuario (1-4)
- Mini gráfico de distribución de scores (opcional para MVP)

#### Tarea 2.4: Crear Atestación
**Requisitos:**
- Botón "Evaluar" (requiere wallet conectada)
- Formulario modal:
  1. Dirección del evaluado (input o escanear QR)
  2. Rubro (selector con búsqueda, datos de Supabase)
  3. Naturaleza (radio: Comercial/Docente/Investigación)
  4. Tu rol (radio: Proveedor/Cliente)
  5. Score Servicio (selector visual 1-4)
  6. Score Trato (selector visual 1-4)
- Al enviar:
  1. Crear atestación on-chain via EAS SDK **a través del paymaster** (usuario no paga gas)
  2. Esperar confirmación tx
  3. Indexar en Supabase (vía API route)
  4. Mostrar confirmación con link a EAS Explorer
- Manejo de errores: paymaster rechaza (rate limit), tx rechazada, etc.

#### Tarea 2.5: Indexador de Atestaciones
**Requisitos:**
- API route que lea eventos de EAS en Arbitrum Sepolia
- Parsear datos del schema y guardar en `atestaciones_cache`
- Se ejecuta:
  - Al crear una nueva atestación (post-tx)
  - Al buscar una wallet (verificar si hay nuevas)
  - Opcionalmente: cron job cada 5 min (fase futura)
- Usar EAS GraphQL API o lectura directa de eventos

---

### FASE 3: Módulo 2 — Visualizador CoRu (Sub-agente: `vdao-coru`)

**Modelo recomendado:** Sonnet  
**Tiempo estimado:** 8-12 horas  

#### Tarea 3.1: Tabla de Rubros
**Requisitos:**
- Data Table con columnas:
  - Nombre del Rubro
  - Padre(s) (puede ser múltiples, mostrar como badges)
  - Proximidad Promedio (barra visual 0-1)
  - Cantidad de Atestaciones
  - Status (Activo/Pendiente validación)
- Barra de búsqueda en tiempo real (filtro por nombre)
- Toggle: Vista Plana vs Vista Jerárquica
  - Plana: todos los rubros en lista
  - Jerárquica: rubros raíz expandibles, sub-rubros colapsados
  - Expandir/colapsar con click
- Paginación o virtual scrolling (150 rubros)
- Responsive (funcionar en móvil)

#### Tarea 3.2: Reorganización por Proximidad
**Requisitos:**
- Click en cualquier rubro → la tabla se reordena:
  1. Rubro seleccionado se mueve arriba (destacado visual)
  2. Resto se ordena por proximidad descendente a ese rubro
  3. Mostrar valor de proximidad en columna extra
- Animación suave en el reordenamiento
- Indicador visual claro de "modo proximidad" activo
- Botón para resetear al orden original
- Los valores de proximidad vienen de:
  1. `proximidades.valor_actual` si hay evaluaciones (override)
  2. `proximidades.valor_propuesto` si no hay evaluaciones aún
  3. Fallback: cálculo Jaccard en tiempo real si no hay entrada en la tabla

#### Tarea 3.3: CRUD de Rubros
**Requisitos:**
- **Crear rubro** (requiere wallet nivel 2+):
  - Modal con: nombre, nombre_en (opcional), descripción, padre(s) (multi-select)
  - Validación: nombre único, al menos 3 caracteres
  - Al crear: status "pendiente validación"
  - Notificación a nivel 4 (futuro, no en MVP)
- **Editar rubro** (requiere wallet nivel 4):
  - Mismos campos que crear
  - Log de cambios (quién editó, cuándo)
- **Ver detalle de rubro:**
  - Card/modal con: nombre, descripción, padres, hijos
  - Lista de atestaciones en ese rubro
  - Top wallets por reputación en ese rubro
  - Proximidades principales (top 10 rubros más cercanos)
- **Nota MVP:** La verificación de nivel puede ser simplificada (hardcoded o tabla de usuarios manual)

#### Tarea 3.4: Evaluación de Proximidad
**Requisitos:**
- Desde el detalle de un rubro, botón "Evaluar Proximidad"
- Modal que muestra lista de otros rubros con campo de score (1-100)
- Al enviar: crear atestación on-chain con Schema 2 (Proximidad)
- El peso de la evaluación depende del nivel del usuario
- Fórmula de override:
  ```
  valor_actual = (valor_propuesto * peso_propuesta + Σ(score_i * peso_nivel_i)) / (peso_propuesta + Σ(peso_nivel_i))
  ```
  Donde:
  - `peso_propuesta` decrece con más evaluaciones (ej: starts at 10, stays fixed)
  - `peso_nivel_1` = 1, `peso_nivel_2` = 2, `peso_nivel_3` = 4, `peso_nivel_4` = 8
- Recalcular `valor_actual` después de cada nueva atestación de proximidad
- Indexar en `proximidad_atestaciones_cache`

---

### FASE 4: Integración y Polish (Sub-agente: `vdao-integration` o Claubot directo)

**Modelo recomendado:** Sonnet  
**Tiempo estimado:** 4-6 horas  

#### Tarea 4.1: Landing Page
- Explicación simple de VDAO (basada en Doc 3)
- CTAs: "Explorar Wallets" y "Ver Rubros"
- Estadísticas globales (total atestaciones, total rubros, total usuarios)
- Diseño limpio, tipo dashboard

#### Tarea 4.2: Navegación y Layout
- Header con: logo, navegación (Explorer / CoRu), ConnectButton
- Footer con links relevantes
- Breadcrumbs
- Responsive design

#### Tarea 4.3: Mock Data y Scripts de Seed
- Script `scripts/seed-rubros.ts`: carga los ~150 rubros en Supabase
- Script `scripts/seed-proximidades.ts`: carga proximidades iniciales
- Script `scripts/seed-atestaciones.ts`: crea 50-100 atestaciones de ejemplo en EAS
- Script `scripts/seed-users.ts`: crea usuarios de ejemplo con niveles 1-4
- Documentar cómo ejecutar los seeds

#### Tarea 4.4: Deploy
- Configurar Vercel project
- Variables de entorno en Vercel
- Domain (si aplica)
- Verificar que Supabase es accesible desde Vercel
- README con instrucciones de setup local

#### Tarea 4.5: Testing Básico
- Verificar flujo completo: buscar wallet → ver atestaciones
- Verificar flujo: crear atestación → aparece en dashboard
- Verificar CoRu: búsqueda, reorganización, CRUD
- Verificar en móvil
- Fix bugs encontrados

---

## 🔧 Configuración de Sub-agentes

### Sub-agente 1: `vdao-infra`
```
Tarea: Fase 1 completa (setup proyecto, Supabase, EAS, wallet connection)
Modelo: sonnet
Contexto a pasar:
  - PLAN-DE-TRABAJO.md (este archivo)
  - database-schema.sql (de Fase 0)
  - schemas.md (de Fase 0)
  - decisiones-y-respuestas.md
Carpeta de trabajo: ~/projects/vdao-mvp/
Entregables: Repo funcional con setup completo, schemas desplegados, DB lista
```

### Sub-agente 2: `vdao-explorer`
```
Tarea: Fase 2 completa (Wallet Explorer)
Modelo: sonnet
Contexto a pasar:
  - PLAN-DE-TRABAJO.md (Fase 2 específicamente)
  - Repo de Fase 1 (ya configurado)
  - schemas.md (UIDs de schemas)
  - rubros-seed.json
Dependencia: Fase 1 completada
Entregables: Módulo 1 funcional (buscar wallet, dashboard, crear atestación)
```

### Sub-agente 3: `vdao-coru`
```
Tarea: Fase 3 completa (Visualizador CoRu)
Modelo: sonnet
Contexto a pasar:
  - PLAN-DE-TRABAJO.md (Fase 3 específicamente)
  - Repo de Fase 1 (ya configurado)
  - rubros.md + rubros-seed.json
  - proximidades.md + proximidades-seed.json
  - proximity.ts (lógica Jaccard)
Dependencia: Fase 1 completada (puede correr en paralelo con Fase 2)
Entregables: Módulo 2 funcional (tabla, proximidad, CRUD, evaluación)
```

### Sub-agente 4: `vdao-integration`
```
Tarea: Fase 4 (integración, landing, polish, deploy)
Modelo: sonnet
Contexto a pasar:
  - PLAN-DE-TRABAJO.md (Fase 4)
  - Repo con Fases 1+2+3 completadas
Dependencia: Fases 2 y 3 completadas
Entregables: MVP desplegado en Vercel, documentado, con mock data
```

---

## 📊 Secuencia de Ejecución

```
Fase 0 (Claubot)     ████████░░░░░░░░░░░░░░░░░░░░░░  (2-3h)
                              │
Fase 1 (vdao-infra)           ████████████░░░░░░░░░░░░  (4-6h)
                                          │
                              ┌───────────┴───────────┐
Fase 2 (vdao-explorer)       ████████████████████░░░░  (8-12h)
Fase 3 (vdao-coru)           ████████████████████░░░░  (8-12h) ← PARALELO
                              └───────────┬───────────┘
                                          │
Fase 4 (vdao-integration)                ████████████  (4-6h)
```

**Tiempo total estimado:** 26-39 horas de compute  
**Tiempo real (con paralelismo):** 18-27 horas  
**Fases 2 y 3 corren en paralelo** — ambas dependen solo de Fase 1.

---

## ✅ Checklist de Entregables Finales

- [ ] Repo GitHub `vdao-mvp` con README completo
- [ ] Base de datos Supabase con ~150 rubros seeded
- [ ] 3 Schemas EAS registrados en Arbitrum Sepolia
- [ ] Módulo 1: Wallet Explorer funcional
- [ ] Módulo 2: Visualizador CoRu funcional
- [ ] Mock data: 50-100 atestaciones de ejemplo
- [ ] Deploy en Vercel accesible
- [ ] Documentación de setup local
- [ ] Scripts de seed reproducibles

---

## 📖 Documentos de Referencia

| Archivo | Contenido |
|---------|-----------|
| `VDAO-complete-spec.md` | Los 3 documentos de Fileverse (spec completa) |
| `decisiones-y-respuestas.md` | Decisiones técnicas confirmadas por Mau |
| `resumen-inicial-claubot.md` | Primer análisis de los docs |
| `docs/doc1-mvp-cotizacion.md` | Solicitud de cotización MVP |
| `docs/doc2-whitepaper.md` | Whitepaper completo |
| `docs/doc3-que-es-vdao.md` | Explicación simplificada |

---

## ⚠️ Fuera de Alcance del MVP

- Privacidad (ZK-proofs, commit-reveal, threshold encryption)
- Paymaster avanzado (para MVP se usa paymaster básico solo para atestaciones; el onboarding completo con Account Abstraction + SBT mint es fase futura)
- CAPTCHA (fase 2)
- SBTs con personajes personalizables
- Gitcoin Passport integration
- App móvil
- Navegador local seguro
- Sistema de disputas
- Oráculo descentralizado
- Reputación de Proclividad (capa predictiva)
- Multi-idioma / multi-país

---

*Plan creado: 4 marzo 2026*  
*Última actualización: 4 marzo 2026*
