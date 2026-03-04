# Decisiones y Respuestas — Conversación con Mau

## Decisiones Confirmadas

| Tema | Decisión |
|------|----------|
| Hosting | **Vercel** |
| DB | **Supabase** |
| Atestaciones | **On-chain (EAS)** |
| CAPTCHA | **Fase 2** (no en MVP) |
| Repo | **Nuevo en GitHub** |
| Coordinación | Claubot revisa todo, sub-agentes para coding |

## Lógica de Proximidad Acordada

**Fórmula: Índice de Jaccard ponderado**

```
proximidad(A, B) = |wallets_A ∩ wallets_B| / |wallets_A ∪ wallets_B|
```

- wallets_A = wallets con atestaciones en rubro A
- wallets_B = wallets con atestaciones en rubro B
- Intersección = wallets activas en ambos rubros

**Bonus por jerarquía:**
- Rubros con padre compartido: +0.1
- Relación padre-hijo directa: +0.2

**Resultado:** Escala 0 a 1 (1 = máxima proximidad)

**Nota importante:** Las proximidades iniciales son propuestas. A medida que más evaluaciones existan, las atestaciones de proximidad hacen override de la propuesta inicial. El nivel del usuario (1-4) que hace la propuesta afecta el peso.

## Respuestas a Preguntas sobre CoRu

### 1. ¿Multi-sector o sector específico?
**Multi-sector.** No limitado a crypto/web3.

### 2. ¿Quién crea los rubros?
- Usuarios de **nivel 2+** proponen
- **3+ usuarios de nivel 4** validan
- La cantidad de validadores debe ser **variable, por votación de los nivel 4**

### 3. ¿Caso de uso inicial?
Que individuos puedan evaluarse mutuamente en una cantidad amplia de rubros generales. **El enfoque es comercial.**

### 4. ¿Cuántos rubros para arrancar?
- Lista propuesta de **~150 rubros y sub-rubros**
- Campos: **tecnología, artes, mercadotecnia, entretenimiento** y otros relevantes
- Propuesta de valores de proximidad entre rubros importantes
- Los usuarios validan o modifican proximidades vía atestaciones (requiere su propio schema)
- El nivel del usuario (1-4) que propone proximidad **afecta el peso**
- Las proximidades se "califican" — más evaluaciones → override de la propuesta inicial

### 5. ¿Universales o por comunidad?
- **De momento universales**
- Si se extiende a otros países: considerar **diferencias culturales y conceptuales** respecto a lo que significa cada rubro/concepto

### 6. ¿Profundidad de jerarquía?
- **Infinita** (sin límite de niveles)
- Algunos rubros pueden tener **2 o más padres** (ej. Ciencia Cognitiva)
- Es un **grafo dirigido acíclico (DAG)**, no un árbol simple

### 7. ¿Qué tan dinámico?
- Se agregan **cada semana** de ser necesario
