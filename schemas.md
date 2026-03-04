# Schemas EAS — VDAO

*3 schemas para registrar en EAS (Ethereum Attestation Service) en Arbitrum Sepolia*

---

## Schema 1: Evaluación Mutua

**Propósito:** Registrar evaluaciones bidireccionales entre dos partes después de una interacción comercial, docente o de investigación.

**EAS Schema String:**
```
address receiver, uint16 rubroId, uint8 interactionType, uint8 scoreService, uint8 scoreTreatment, uint8 role, bytes32 counterpartUID
```

**Campos:**

| Campo | Tipo | Valores | Descripción |
|-------|------|---------|-------------|
| receiver | address | 0x... | Wallet del evaluado |
| rubroId | uint16 | 0-65535 | ID del rubro (referencia a tabla rubros en Supabase) |
| interactionType | uint8 | 0=Comercial, 1=Docente, 2=Investigación | Naturaleza de la interacción |
| scoreService | uint8 | 1=Muy malo, 2=Malo, 3=Bueno, 4=Muy bueno | Calidad del servicio/producto |
| scoreTreatment | uint8 | 1=Muy malo, 2=Malo, 3=Bueno, 4=Muy bueno | Calidad del trato |
| role | uint8 | 0=Proveedor, 1=Cliente | Rol del attester en la interacción |
| counterpartUID | bytes32 | UID o 0x0 | UID de la atestación de la contraparte (0x0 si aún no existe) |

**Notas:**
- `attester` es implícito en EAS (quien firma la tx)
- `timestamp` es implícito en EAS
- `counterpartUID` permite vincular ambas evaluaciones de una interacción
- Revocable: **No** (evaluaciones son permanentes)
- Resolver: **Ninguno** (MVP sin validación on-chain)

---

## Schema 2: Proximidad de Rubros

**Propósito:** Registrar la evaluación de un usuario sobre qué tan cercanos/relacionados son dos rubros.

**EAS Schema String:**
```
uint16 rubroA, uint16 rubroB, uint8 proximityScore
```

**Campos:**

| Campo | Tipo | Valores | Descripción |
|-------|------|---------|-------------|
| rubroA | uint16 | 0-65535 | ID del primer rubro |
| rubroB | uint16 | 0-65535 | ID del segundo rubro (rubroA < rubroB para evitar duplicados) |
| proximityScore | uint8 | 1-100 | Proximidad percibida (÷100 para escala 0.01-1.00) |

**Notas:**
- El nivel del attester se lee de la tabla `usuarios` en Supabase para calcular el peso
- Convención: `rubroA` siempre tiene ID menor que `rubroB` (normalización)
- Revocable: **Sí** (usuario puede cambiar su evaluación)
- Resolver: **Ninguno**

---

## Schema 3: Validación de Rubro

**Propósito:** Registrar la aprobación o rechazo de un rubro nuevo propuesto por un usuario nivel 2+, emitida por un usuario nivel 4.

**EAS Schema String:**
```
uint16 rubroId, bool approved, string reason
```

**Campos:**

| Campo | Tipo | Valores | Descripción |
|-------|------|---------|-------------|
| rubroId | uint16 | 0-65535 | ID del rubro propuesto |
| approved | bool | true/false | Aprobado o rechazado |
| reason | string | Texto libre | Razón de la decisión (opcional) |

**Notas:**
- Solo usuarios nivel 4 pueden emitir esta atestación
- Se necesitan 3+ aprobaciones para activar un rubro (cantidad variable, votada por nivel 4)
- Revocable: **Sí** (nivel 4 puede cambiar su voto)
- Resolver: **Ninguno**

---

## Deploy

**Chain:** Arbitrum Sepolia (Chain ID: 421614)  
**EAS Contract:** `0xaEF4103A04090071165F78D45D83A0C0782c2B2a`  
**Schema Registry:** `0x55D26f9ae0203EF95494AE4C170eD35f4Cf77797`

**Script de deploy:** `scripts/deploy-schemas.ts`

**UIDs (post-deploy):**
- Schema 1 (Evaluación): `TBD`
- Schema 2 (Proximidad): `TBD`
- Schema 3 (Validación): `TBD`

---

## Ejemplo de Atestación (Schema 1)

```json
{
  "schema": "SCHEMA_1_UID",
  "data": {
    "receiver": "0x1234...5678",
    "rubroId": 42,
    "interactionType": 0,
    "scoreService": 4,
    "scoreTreatment": 3,
    "role": 1,
    "counterpartUID": "0xabcd...ef01"
  },
  "recipient": "0x1234...5678",
  "revocable": false
}
```
