# Resumen Inicial de los 3 Documentos (por Claubot)

*Primer análisis al recibir los documentos de SOXAvisual*

---

## Documento 1: VDAO (simplificado)

- Alternativa a LinkedIn donde la reputación no es auto-asignada
- Funciona como un "Happy or Not" mutuo — después de cada trato comercial, ambas partes se evalúan
- Las evaluaciones van a blockchain (inmutables, nadie las borra/manipula)
- Privacidad: Tú decides quién ve tus evaluaciones (bloqueos selectivos)
- Contextual: La reputación es por área/rubro, no global (ser buen programador ≠ buen contador)
- Poder de voto adaptativo: Tu opinión pesa más en temas que dominas
- Se diferencia del "crédito social chino" porque no hay autoridad central ni botón de apagado

---

## Documento 2: Whitepaper — VDAO: Gamificación Reputacional y Coordinación P2P

### 1. Introducción y Principios
- Ecosistema open source, no financiero
- Enfoque "Physical-First" y regional
- Principios: desintermediación, voluntariedad, permissionless, adopción orgánica
- Regla de mutualidad (evaluación siempre bidireccional, prohibida la asimetría)

### 2. Arquitectura
- Dos capas: Reputación Contextual (histórica) + Reputación de Proclividad (predictiva, futura)
- El whitepaper se enfoca solo en la Contextual

### 3. Componentes de Reputación Contextual

- **3.1 SBTs (Soulbound Tokens):** Credenciales no transferibles, 4 niveles de progresión, Account Abstraction + Paymaster para onboarding
- **3.2 Schemas de Atestación:** Plantillas pre-llenadas, QR codes, evaluación en escala de 4 puntos (sin neutralidad), campos: jerarquía, naturaleza, rubro, evaluación servicio + trato
- **3.3 Constelación de Rubros (CoRu):** Base de datos dinámica de relaciones entre rubros, visualización tipo grafo, PDV ponderado por expertise
- **3.4 Anti-clustering:** Penalización por evaluaciones selectivas/cerradas

### 4. Privacidad (WIP)
- Híbrido on-chain/off-chain
- Dual-commitment, ZK-proofs, commit-reveal, threshold encryption
- Bandas de reputación públicas (Bronce/Plata/Oro), puntaje exacto solo con disclosure

### 5. Glosario
- VRep, PDV, CoRu, SBT, Schema, etc.

---

## Documento 3: Solicitud de Cotización del MVP

**Stack sugerido:** React/Next.js + Ethers.js o Viem + Firebase/Supabase

### Módulo 1: Agregador de Atestaciones (Wallet Explorer)
- Página pública con CAPTCHA anti-bot
- Input para buscar por wallet address
- Dashboard que lista atestaciones emitidas/recibidas
- Por cada atestación: emisor, receptor, fecha, rubro, naturaleza (Comercial/Docente/Investigación), puntaje servicio (1-4), puntaje trato (1-4)
- Schema on-chain: attester, receiver, sectorId, interactionType, scoreService, scoreTreatment, timestamp
- Privacidad NULA para el MVP (todo público)

### Módulo 2: Visualizador CoRu (Constelación de Rubros) — Modo Tabular
- Tabla tipo spreadsheet con todos los rubros
- Columnas: nombre, rubro padre, proximidad promedio, cantidad de votos
- Búsqueda en tiempo real
- Click en un rubro → reordena la tabla por proximidad a ese rubro
- CRUD de rubros via modal (nombre, padre, descripción)
- Vista plana vs jerárquica (expandir/colapsar sub-rubros)

### Notas
- Prioridad: funcionalidad > diseño bonito
- Datos de prueba (mock data/scripts)
- Sin privacidad/ZK para el MVP
