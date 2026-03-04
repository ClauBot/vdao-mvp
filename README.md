# SOXA Reputation — Sistema de Atestaciones Multi-Sector

**Autor:** SOXAvisual  
**Fecha inicio:** 4 marzo 2026  
**Chain:** Arbitrum (L2) — testnet para MVP  
**Status:** 📝 Diseño inicial

---

## Concepto

Sistema de reputación on-chain donde individuos se evalúan mutuamente en ~150 rubros comerciales/profesionales. Las evaluaciones se registran como atestaciones en blockchain.

## Arquitectura Core

### Niveles de Usuario (1-4)
| Nivel | Permisos |
|-------|----------|
| 1 | Participar, ser evaluado |
| 2 | Proponer nuevos rubros/cambios |
| 3 | Evaluar, atestar |
| 4 | Validar propuestas (gobernanza) |

- Cantidad de validadores nivel 4 requeridos es **variable**, decidida por votación entre nivel 4

### Rubros (~150)
- Campos: Tecnología, Artes, Mercadotecnia, Entretenimiento + otros
- Jerarquía **infinita** — un rubro puede tener **múltiples padres** (ej: Ciencia Cognitiva → Psicología + IA)
- Se agregan semanalmente si es necesario
- Universales por ahora, pero diseñados para extensión multi-país (diferencias culturales)

### Proximidades entre Rubros
- Propuesta inicial de valores de proximidad entre rubros
- Usuarios validan/modifican proximidades vía atestaciones (schema propio)
- El **nivel del usuario** que propone afecta el peso
- Más evaluaciones → override progresivo de la propuesta inicial

### Evaluaciones Mutuas
- Enfoque comercial
- Rubros generales pero amplios
- Individuos evalúan a otros individuos

## Decisiones Técnicas

### MVP
- **Sin privacidad** — testeo y ajustes tempranos
- **Arbitrum testnet** — para pruebas iniciales
- **Sin paymaster** — dar centavos de testnet ETH a usuarios para simplificar

### Futuro
- Paymaster para atestaciones gratuitas en mainnet
- Consideraciones de privacidad
- Extensión multi-país con adaptaciones culturales

## Stack Propuesto

- **Atestaciones:** EAS (Ethereum Attestation Service) en Arbitrum
- **Schemas:** Múltiples (evaluación, proximidad de rubros, gobernanza)
- **Frontend:** TBD
- **Backend:** TBD

## TODO

- [ ] Definir lista de ~150 rubros y sub-rubros
- [ ] Proponer valores de proximidad entre rubros
- [ ] Diseñar schemas EAS (evaluación, proximidad, gobernanza)
- [ ] Definir mecánica de niveles (cómo se sube de nivel)
- [ ] Smart contracts para gobernanza de validadores nivel 4
- [ ] Deploy en Arbitrum Sepolia
- [ ] Frontend MVP

---

## Archivos

- `rubros.md` — Lista de rubros y sub-rubros (pendiente)
- `schemas.md` — Diseño de schemas EAS (pendiente)
- `proximidades.md` — Valores de proximidad entre rubros (pendiente)
