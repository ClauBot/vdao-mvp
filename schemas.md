# Schemas EAS — Diseño Detallado

*3 schemas para registrar en EAS (Ethereum Attestation Service) en Arbitrum Sepolia*

---

## Schema 1: Evaluación Mutua

**Propósito:** Registrar evaluaciones bidireccionales después de una interacción comercial, docente o de investigación.

### Campos

```solidity
// Schema string para EAS:
// "address receiver, uint16 rubroId, uint8 interactionType, uint8 scoreService, uint8 scoreTreatment, uint8 role, bytes32 counterpartUID"

address receiver          // Dirección del evaluado (attester es implícito en EAS)
uint16  rubroId           // ID del rubro (referencia a tabla rubros en Supabase)
uint8   interactionType   // 0 = Comercial, 1 = Docente, 2 = Investigación
uint8   scoreService      // 1 = Muy malo, 2 = Malo, 3 = Bueno, 4 = Muy bueno
uint8   scoreTreatment    // 1 = Muy malo, 2 = Malo, 3 = Bueno, 4 = Muy bueno
uint8   role              // 0 = Proveedor (yo proveo), 1 = Cliente (yo recibo)
bytes32 counterpartUID    // UID de la atestación de la contraparte (0x0 si aún no existe)
```

### Configuración EAS

| Parámetro | Valor |
|-----------|-------|
| Revocable | `true` (permite correcciones) |
| Resolver | `0x0` (sin resolver custom para MVP) |
| Referenced Attestation | Vía `counterpartUID` (link manual, no ref nativo de EAS) |

### Validaciones (frontend)

- `rubroId` debe existir en Supabase y estar activo
- `scoreService` y `scoreTreatment` deben estar entre 1 y 4
- `interactionType` debe ser 0, 1 o 2
- `role` debe ser 0 o 1
- `receiver` no puede ser igual a `attester` (no auto-evaluación)
- `counterpartUID` es `bytes32(0)` si la contraparte aún no ha evaluado; se actualiza cuando la contraparte crea su atestación

### Flujo de Mutualidad

```
1. Alice evalúa a Bob → Atestación A (counterpartUID = 0x0)
2. Bob evalúa a Alice → Atestación B (counterpartUID = UID de A)
3. Frontend actualiza referencia: A.counterpartUID = UID de B (vía nueva atestación o off-chain en Supabase)
```

**Nota MVP:** La mutualidad se verifica off-chain (Supabase). En futuro, un resolver contract puede enforcearlo on-chain.

---

## Schema 2: Proximidad de Rubros

**Propósito:** Registrar evaluaciones de qué tan cercanos/relacionados están dos rubros.

### Campos

```solidity
// Schema string para EAS:
// "uint16 rubroA, uint16 rubroB, uint8 proximityScore, uint8 proposerLevel"

uint16 rubroA             // ID del primer rubro
uint16 rubroB             // ID del segundo rubro
uint8  proximityScore     // 1-100 (dividir entre 100 para obtener 0.01-1.00)
uint8  proposerLevel      // Nivel del evaluador al momento de la atestación (1-4)
```

### Configuración EAS

| Parámetro | Valor |
|-----------|-------|
| Revocable | `true` |
| Resolver | `0x0` |

### Validaciones (frontend)

- `rubroA` y `rubroB` deben existir y estar activos
- `rubroA` ≠ `rubroB`
- `proximityScore` entre 1 y 100
- `proposerLevel` entre 1 y 4
- Se normaliza para que `rubroA < rubroB` (evitar duplicados A→B vs B→A)
- `proposerLevel` se verifica contra tabla `usuarios` en Supabase

### Fórmula de Peso

```
peso = {
  nivel 1: 1,
  nivel 2: 2,
  nivel 3: 4,
  nivel 4: 8
}
```

### Recálculo de Proximidad

Cuando se crea una nueva atestación de proximidad:

```javascript
// Pseudo-código
const PESO_PROPUESTA = 10; // Peso fijo de la propuesta inicial

function recalcularProximidad(rubroA, rubroB) {
  const propuesta = getValorPropuesto(rubroA, rubroB); // 0.00-1.00
  const atestaciones = getAtestacionesProximidad(rubroA, rubroB);
  
  let sumaPonderada = propuesta * PESO_PROPUESTA;
  let sumaPesos = PESO_PROPUESTA;
  
  for (const att of atestaciones) {
    const peso = [0, 1, 2, 4, 8][att.proposerLevel];
    sumaPonderada += (att.proximityScore / 100) * peso;
    sumaPesos += peso;
  }
  
  return sumaPonderada / sumaPesos; // valor_actual
}
```

**Ejemplo:**
- Propuesta inicial: 0.50 (peso 10)
- 3 evaluaciones nivel 2 (peso 2 c/u) con scores: 70, 80, 60
- 1 evaluación nivel 4 (peso 8) con score: 90

```
valor = (0.50×10 + 0.70×2 + 0.80×2 + 0.60×2 + 0.90×8) / (10 + 2 + 2 + 2 + 8)
valor = (5.0 + 1.4 + 1.6 + 1.2 + 7.2) / 24
valor = 16.4 / 24 = 0.683
```

---

## Schema 3: Validación de Rubro

**Propósito:** Registrar votos de aprobación/rechazo de rubros nuevos por miembros nivel 4.

### Campos

```solidity
// Schema string para EAS:
// "uint16 rubroId, bool approved, string reason"

uint16 rubroId            // ID del rubro propuesto (de Supabase)
bool   approved           // true = aprobado, false = rechazado
string reason             // Razón del voto (opcional, puede ser "")
```

### Configuración EAS

| Parámetro | Valor |
|-----------|-------|
| Revocable | `true` (permite cambiar voto) |
| Resolver | `0x0` |

### Validaciones (frontend)

- `rubroId` debe existir en Supabase con status "pendiente"
- Solo wallets con nivel 4 pueden crear esta atestación
- Una wallet solo puede votar una vez por rubro (verificar en Supabase)
- Verificación de nivel se hace off-chain (tabla usuarios)

### Lógica de Aprobación

```javascript
// Cantidad de validadores requeridos (configurable, decidido por nivel 4)
const VALIDADORES_REQUERIDOS = 3; // Default, puede cambiar por votación

function verificarAprobacion(rubroId) {
  const votos = getVotosValidacion(rubroId);
  const aprobaciones = votos.filter(v => v.approved).length;
  const rechazos = votos.filter(v => !v.approved).length;
  
  if (aprobaciones >= VALIDADORES_REQUERIDOS) {
    activarRubro(rubroId); // Marcar como activo en Supabase
  }
  
  if (rechazos >= VALIDADORES_REQUERIDOS) {
    rechazarRubro(rubroId); // Marcar como rechazado
  }
}
```

---

## Registro de Schemas en EAS

### Script de Deploy

```typescript
// scripts/deploy-schemas.ts
import { SchemaRegistry } from "@ethereum-attestation-service/eas-sdk";
import { ethers } from "ethers";

const SCHEMA_REGISTRY_ADDRESS = "0x0a7E2Ff54e76B8E6659aedc9103FB21c038050D0"; // Arbitrum Sepolia

async function deploySchemas() {
  const provider = new ethers.JsonRpcProvider(process.env.ARBITRUM_SEPOLIA_RPC);
  const signer = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
  const registry = new SchemaRegistry(SCHEMA_REGISTRY_ADDRESS);
  registry.connect(signer);

  // Schema 1: Evaluación Mutua
  const schema1 = await registry.register({
    schema: "address receiver, uint16 rubroId, uint8 interactionType, uint8 scoreService, uint8 scoreTreatment, uint8 role, bytes32 counterpartUID",
    resolverAddress: "0x0000000000000000000000000000000000000000",
    revocable: true,
  });
  console.log("Schema 1 (Evaluación):", schema1);

  // Schema 2: Proximidad
  const schema2 = await registry.register({
    schema: "uint16 rubroA, uint16 rubroB, uint8 proximityScore, uint8 proposerLevel",
    resolverAddress: "0x0000000000000000000000000000000000000000",
    revocable: true,
  });
  console.log("Schema 2 (Proximidad):", schema2);

  // Schema 3: Validación
  const schema3 = await registry.register({
    schema: "uint16 rubroId, bool approved, string reason",
    resolverAddress: "0x0000000000000000000000000000000000000000",
    revocable: true,
  });
  console.log("Schema 3 (Validación):", schema3);
}

deploySchemas().catch(console.error);
```

### UIDs (se llenan después del deploy)

```
SCHEMA_EVALUATION_UID=
SCHEMA_PROXIMITY_UID=
SCHEMA_VALIDATION_UID=
```

---

## Direcciones EAS en Arbitrum Sepolia

| Contrato | Dirección |
|----------|-----------|
| EAS | `0xaEF4103A04090071165F78D45D83A0C0782c2B2a` |
| Schema Registry | `0x0a7E2Ff54e76B8E6659aedc9103FB21c038050D0` |

**Chain ID:** 421614  
**Explorer:** https://arbitrum-sepolia.easscan.org
