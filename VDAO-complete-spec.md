# VDAO — Especificación Completa

*Consolidación de los 3 documentos de Fileverse de SOXAvisual*

---

## Documento 1: ¿Qué es VDAO? (Explicación Simplificada)

**Fuente:** [Fileverse Doc 5](https://docs.fileverse.io/0x26916c1d9a9fdf71dcb504b94b15f09e8f9b9dc7/5)

VDAO es una alternativa simplificada a LinkedIn donde la reputación no es auto-declarada ni comprable. Incluye privacidad y credibilidad neutral.

### Concepto Central: "Happy or Not" Mutuo

- Después de cada trato comercial, **ambas partes se evalúan mutuamente**
- Tú calificas mi trato y servicio/producto, yo califico tu trato y cumplimiento
- Al estar en blockchain, **nadie puede manipular ni borrar** esa evaluación
- Es un registro de confianza inmutable

### Diferencias con "Crédito Social"

- **No hay botón de apagado para tu vida** — no hay autoridad central que juzgue globalmente
- Es un **pasaporte de habilidades**, no de obediencia
- Se enfoca en **interacciones comerciales P2P**, no en temas cívicos o corporativos
- **Tú decides quién ve** tus evaluaciones mediante bloqueos selectivos
- Ejemplo: reputación impecable como abogado visible solo para tus clientes, el mundo exterior ve una persona normal

### Reputación Contextual, No Global

- Ser un gran programador **no te hace buen contador**
- Si fallas en un rubro, el impacto se **limita a esa área específica**
- Tu poder de voto se adapta a tu expertise: **tu opinión pesa más en los temas que dominas**
- Las decisiones técnicas las toman quienes saben del tema

**Resumen:** Confianza verificada, contextual, portátil y bajo tus propios términos. Sin Big Brother.

---

## Documento 2: Whitepaper — Gamificación Reputacional y Coordinación P2P

**Fuente:** [Fileverse Doc 4](https://docs.fileverse.io/0x26916c1d9a9fdf71dcb504b94b15f09e8f9b9dc7/4)

### 1. Introducción y Principios

VDAO es un ecosistema **open source** y **no financiero**, diseñado como capa de gamificación de la reputación. Facilita coordinación P2P permitiendo a comunidades locales digitalizar su capital social a través de la confianza.

**Enfoque "Physical-First" y regional:** prioriza el contacto humano directo y la cercanía geográfica. La reputación construida en un contexto es portable y reconocida en otros.

#### 1.1. Principios Fundamentales y Ética 📜

1. **Superación de la Mera Cuantificación** — La complejidad humana no puede encerrarse en reglas matemáticas o legales. El sistema es herramienta de aceleración de confianza, no definición absoluta del individuo.
2. **Desintermediación** — Construcción y portabilidad de reputación sin intermediarios centralizados. Base de datos inmune a alteraciones arbitrarias.
3. **Voluntariedad y Libertad de Salida** — Participación estrictamente optativa. Se prohíbe implementación coercitiva. Los usuarios pueden entrar, acceder y abandonar a voluntad.
4. **Permisividad y Evolución (Permissionless)** — Se fomentan forks y subsistemas sin autorización previa.
5. **Adopción Orgánica** — Sostenibilidad mediante utilidad real y "carisma" de la comunidad, no mecanismos artificiales de retención.

#### 1.2. Regla de Mutualidad y Prohibición de Asimetría ⚖️

- **Evaluación Mutua:** Las interacciones requieren validación recíproca para equilibrio en el registro reputacional.
- **Prohibición de Uso Asimétrico:** Una organización **NO puede** condicionar acceso a servicios o exigir a empleados una VRep sin someterse a la misma exposición. Ejemplo: una empresa no puede exigir que atención al cliente sea evaluada si la gerencia no participa.
- **Periferia Organizativa:** Las organizaciones pueden ofrecer ventajas (perks) a usuarios basándose en su VRep, sin violar la regla de mutualidad.
- **Acciones Correctivas:** VDAO se reserva el derecho de implementar medidas contra abuso de poder o coerción.

#### 1.3. Definición y Naturaleza del Protocolo 🌳

- **Sistema de Atestaciones:** Reputación construida colectivamente a través de validaciones intersubjetivas (interacciones pasadas) entre pares.
- **Tokenización de Credenciales:** Acceso e identidad gestionados mediante tokens no transferibles representando nivelación y compromisos.
- A diferencia de DAOs tradicionales (expansión viral anónima), VDAO opera **"Physical-First" y regional**.
- **Objetivo final:** Mejorar drásticamente la coordinación P2P sin intermediarios de confianza.

#### 1.4. Objetivos del Sistema 🧭

1. **Aceleración de la Confianza** — Reducir fricción temporal en nuevas relaciones.
2. **Portabilidad de Reputación** — Historial transportable entre plataformas y contextos. Soberanía del usuario sobre su historial.
3. **Integridad y Desintermediación** — Base de datos inmutable, resistente a manipulación.
4. **Incentivos Positivos** — Priorizar construcción de valor y colaboración sobre lo punitivo.
5. **Trascendencia del Protocolo** — Meta final: que el protocolo social orgánico alcance un estándar tan alto de responsabilidad, puntualidad, honestidad y valores que opere naturalmente **sin necesidad de gamificación**.

### 2. Arquitectura del Sistema

Dos estratos fundamentales:

| Estrato | Descripción | Alcance |
|---------|-------------|---------|
| **Reputación Contextual** | Evaluación intersubjetiva pasada. Consolida historial mediante atestaciones verificables. | ✅ Este documento |
| **Reputación de Proclividad** | Capa predictiva. Estima probabilidad de comportamientos futuros basándose en patrones históricos. | ❌ Futuro |

### 3. Reputación Contextual: Elementos Constitutivos

#### 3.1. Credenciales de Acceso (Soulbound Tokens - SBT) 🪪

Mecanismo de gatekeeping y estratificación. Tokens no transferibles que definen identidad y permisos. Emisión es responsabilidad de Nivel 4.

**Implementación Técnica:**
- SBT incluye personaje con características elegidas por el usuario (o seleccionado de variedad prediseñada)
- Frontend simplificado para personalización
- **Account Abstraction** para gestión de billetera
- **Paymaster** (esponsorización de gas) para facilitar creación
- App agregadora opcional para onboarding de usuarios no técnicos
- Navegador local recomendado para restringir/advertir sobre URLs fuera del ecosistema

**Sistema de Nivelación:**

Cada nivel otorga multiplicadores diferentes sobre el **Poder De Voto (PDV)** y la reputación contextual. (Cantidades TBD)

##### Nivel 1: Introductorio
**Requisitos (uno de los siguientes):**
- Comprobación de humanidad vía **Gitcoin Passport** (15+ puntos), O
- Aprobación de **5 miembros de Nivel 4**, O
- **POAP GPS** + aprobaciones de **2 miembros de Nivel 4**

**Además:**
- Atestación del TOS básico
- Seguimiento en redes sociales
- Participación en foros

**Beneficios:**
- Multiplicador de PDV mínimo + VRep Contextual base
- Personalización del personaje del SBT

##### Nivel 2: Comunidad
**Requisitos:**
- Generación de **10+ referidos**
- Asistencia activa a eventos/meetups (con filtros de aprobación)
- Ser evaluado y evaluador en **6+ rubros distintos**
- Tiempo mínimo de participación: **3 meses**

**Beneficios:**
- Multiplicador de poder de voto bajo

##### Nivel 3: Dedicación
**Requisitos:**
- Reputación alta en **3+ rubros** (puntaje TBD)
- Coordinación/asistencia de eventos
- **40+ referidos**
- Soporte técnico verificado a nuevos usuarios
- Buena ejecución de rol de moderación/mood en foros
- Cooperación con gobernanza: **100+ atestaciones de elaboración de CoRu**
- Participación mínima activa: **8 meses**
- **Contribución Económica:** Aporte financiero mínimo para costos operativos de gas (Paymaster)

**Beneficios:**
- Multiplicador de PDV intermedio + PDV Contextual

##### Nivel 4: Responsabilidad
**Requisitos:**
- Reputación muy alta en **5+ rubros**
- Coordinación de eventos y referidos en alto volumen
- Asistencia técnica avanzada y rol de moderación en foros
- Cooperación profunda con gobernanza y sistemas de CoRu
- Participación mínima: **20 meses** (?)
- **Contribución Económica:** Aporte financiero mínimo para costos operativos de gas (Paymaster)

**Beneficios:**
- Multiplicador de poder de voto mediano-alto
- **Capacidad de emitir mintpass para SBTs de acceso**

#### 3.2. Esquemas de Atestación (Schemas) 📃

Las atestaciones son el alma del sistema. Deben estar **prediseñados, ser intuitivos y fáciles de usar** para evitar fatiga del usuario.

**Flujo UX optimizado:**
1. **Proveedor** genera plantilla pre-llenada basada en Schema con particularidades de la naturaleza y rubro
2. **En el intercambio:** proveedor presenta **código QR** que abre el schema pre-llenado (excepto evaluación)
3. **Cliente** solo emite puntaje de evaluación
4. Herramientas: app móvil o integración con navegador (Account Abstraction)

**Campos del Schema:**

| Campo | Descripción |
|-------|-------------|
| **Jerarquía de la Interacción** | Define quién provee el servicio/producto y quién lo recibe |
| **Naturaleza de la Interacción** | Clasifica el intercambio: **Comercial**, **Docente**, o **Investigación** |
| **Rubro de la Interacción** | Referencia a rubro validado en CoRu. Si no existe, se solicita adición a Nivel 4 |
| **Calidad del Servicio/Producto** | Escala 4 puntos: Muy bueno, Bueno, Malo, Muy malo |
| **Calidad del Trato** | Escala 4 puntos: Muy bueno, Bueno, Malo, Muy malo |
| **Addendum** | Máx. 3 hashes de referencia para evidencias externas (testigos, periodistas) |

**Nota sobre escala de 4 puntos:** Fuerza una posición, evita la neutralidad.

#### 3.3. Constelación de Rubros (CoRu) 🕸

La reputación es contextual → requiere base de datos que permita entender la cercanía entre áreas de conocimiento/actividad.

**Función:** Agregación continua y dinámica de rubros y subrubros y su intervinculación, con expresividad on-chain para uso en votaciones y contratos inteligentes.

**Estética (GUI):** Interfaces gráficas que visualizan:
- Flujo de vínculos
- Cercanía/distancia entre rubros
- Áreas carentes de evaluaciones (incentivando cobertura uniforme)

**Mecanismo de Construcción y Validación:**

1. **Validación de Rubros:** Cada rubro nuevo necesita umbral mínimo de **5 atestaciones por miembros Nivel 4** (mecanismos de corrección y retroceso TBD)
2. **Evaluación de Proximidad:** Cada rubro agrega y muestra su proximidad con los demás. Adición progresiva según necesidades del gráfico y demanda de la comunidad (mitiga explosión combinatoria).
3. **Incentivos:** Mérito por volumen de contribución estilo Wikipedia para evaluar vínculos faltantes.
4. **Ponderación por Expertise:** Mayor reputación contextual en un rubro = mayor peso en evaluación de proximidad de ese rubro.
5. **Resolución de Tensiones de Gobernanza:** CoRu distingue entre:
   - **Autoridad moral** (Coordinadores de nivel alto)
   - **Competencia técnica** (Expertos Contextuales)
   - Evita concentración de poder en generalistas sobre rubros que no dominan
6. **Creación de Sub-rubros:** Reservada a miembros de **Nivel 4** para evitar spam.

#### 3.4. Consideraciones de Integridad: Riesgo de Clustering 🧑🏻‍🤝‍🧑🏻

**Problema identificado:** Solicitudes de evaluación selectivas donde un miembro busca atestaciones solo de ciertas personas para inflar VRep y evitar calificaciones negativas → "clustering" o acumulación.

**Soluciones:**
- **Incentivo a la Desacumulación:** Soluciones técnicas que fomenten interacción con nuevos pares fuera del círculo cerrado.
- **Penalización por Cumulación Crónica:** VRep del usuario se ve afectada negativamente, preservando integridad del ecosistema.

### 4. Propuesta de Privacidad y Protección de Datos (WIP)

**Nota:** Esta sección está en proceso. Para el MVP no se implementa privacidad.

#### 4.1. Enfoque Híbrido ⛓

On-chain/off-chain:
- Existencia y pruebas criptográficas → **públicas** (inmutables)
- Calificaciones detalladas y contenido sensible → **privados** salvo disclosure explícito

#### 4.2. Mecanismos de Privacidad 🫥

##### Doble Compromiso (Dual-Commitment)
1. Ambas partes crean atestaciones off-chain con los datos
2. Ambos generan hash y lo comprometen on-chain
3. Atestación final on-chain contiene solo hash combinado → prueba acuerdo mutuo sin revelar contenido

##### Divulgación Selectiva (Tiered Disclosure)
- Bandas de reputación públicas (ej. Bronce, Plata, Oro) en vez de puntajes exactos
- ZK-proofs para revelar puntaje exacto a entidades específicas bajo demanda

##### Evaluación a Ciegas (Commit-Reveal)
1. Atestadores comprometen evaluación mediante hash
2. Evaluaciones se revelan en lote aleatorio
3. Parte evaluada solo ve puntaje final agregado, no evaluaciones individuales → evita represalias

##### Cifrado Umbral (Threshold Encryption)
- Evaluaciones cifradas con claves distribuidas
- Solo se desencripta puntaje agregado cuando hay suficientes evaluaciones

#### 4.3. Consideraciones de Confianza 🖖

- **Protección Temporal:** Buffers de retraso + VRF para liberación de datos (evita correlaciones de tráfico)
- **Oráculo Descentralizado:** Red de nodos para computar agregados de reputación
- **Disputas:** Sistema de resolución para atestaciones falsas con posible slashing

### 5. Glosario

| Término | Definición |
|---------|-----------|
| **VRep** | Reputación de un miembro dentro de VDAO |
| **PDV** | Poder De Voto |
| **PDProp** | Poder de propuesta |
| **Prop** | Propuesta sometida a votación en la DAO |
| **Schema** | Esquema estructurado para creación de atestaciones |
| **Plantilla** | Schema pre-llenado por el proveedor de servicios |
| **CoRu** | Constelación de Rubros (base de datos de relaciones inter-rubro) |
| **SBT** | Soulbound Token (token no transferible vinculado a identidad) |
| **TBD** | To Be Discussed |

---

## Documento 3: Solicitud de Cotización — MVP VDAO

**Fuente:** [Fileverse Doc 2](https://docs.fileverse.io/0x26916c1d9a9fdf71dcb504b94b15f09e8f9b9dc7/2)

### 1. Contexto General del Proyecto

MVP para validar infraestructura de atestaciones y visualización de datos de reputación. Naturaleza **no financiera**, enfocado en interacción social y reputación contextual.

**Stack Tecnológico Preferible:**
- Frontend: React.js / Next.js
- Conexión Blockchain: Ethers.js o Viem
- Gestión de Datos: Almacenamiento simple (indexación de eventos o DB ligera tipo Firebase/Supabase)

### 2. Módulo 1: Agregador de Atestaciones (Wallet Explorer)

**Objetivo:** Página web sencilla que liste atestaciones asociadas a una wallet. Acceso público, protegido por medidas anti-bot básicas.

#### Acceso Público y Anti-Sybil
- Sin restricción de propiedad de NFTs
- CAPTCHA (reCAPTCHA v2 o Cloudflare Turnstile) para prevenir scraping y ataques Sybil básicos

#### Consulta de Wallet
- Input para dirección de billetera (ETH address)
- Validación básica de formato
- Botón "Buscar" / "Consultar"

#### Visualización de Atestaciones (Dashboard)

Listar todas las atestaciones emitidas/recibidas por la wallet consultada:

| Campo | Detalle |
|-------|---------|
| Emisor | Address del atestador (enlace a Etherscan) |
| Receptor | Address del atestado (enlace a Etherscan) |
| Fecha/Hora | Timestamp del evento |
| Rubro | Etiqueta de texto |
| Naturaleza | Comercial, Docente, Investigación |
| Calidad del Servicio/Producto | Escala 1-4 |
| Calidad del Trato | Escala 1-4 |

**Privacidad MVP:** Nula (datos públicos). No se requieren cifrado ni ZK-proofs.

#### Schema de Datos

```solidity
struct Attestation {
    address attester;       // Emisor
    address receiver;       // Receptor
    uint256 sectorId;       // Rubro (uint o string)
    InteractionType interactionType;  // Comercial/Docente/Investigación
    uint8 scoreService;     // 1-4
    uint8 scoreTreatment;   // 1-4
    uint256 timestamp;      // Fecha/hora
}
```

#### Entregables Módulo 1
- Interfaz web responsiva
- Lógica de lectura de blockchain (read-only)
- Integración con CAPTCHA

### 3. Módulo 2: Visualizador de Constelación de Rubros (CoRu) — Modo Tabular

**Objetivo:** Página para visualizar, navegar y editar la base de datos de "Rubros" y sus relaciones de proximidad. Visualización tabular tipo hoja de cálculo.

#### Vista Principal (Hoja de Cálculo)

Tabla/Grid con todos los Rubros:

| Columna | Descripción |
|---------|-------------|
| Nombre del Rubro | Texto |
| Rubro Padre | Si es subrubro |
| Puntaje de Proximidad Promedio | Si aplica |
| Cantidad de Votos/Atestaciones | Que validan ese rubro |

#### Búsqueda y Filtrado
- Barra de búsqueda en tiempo real: filtrar rubros por nombre mientras se escribe

#### Reorganización por Proximidad (Feature clave)
1. **Acción:** Clic en una fila (Rubro A seleccionado)
2. **Resultado:** La tabla se reordena automáticamente:
   - Rubro seleccionado → primera posición (encabezado)
   - Resto → ordenado de mayor a menor proximidad con el Rubro seleccionado
3. **Nota MVP:** Fórmula de proximidad puede ser valor estático o cálculo simple

#### Gestión de Rubros (CRUD)

- Icono de edición (lápiz/configuración) al lado de cada rubro
- Modal/ventana emergente con formulario:
  - **Nombre del Rubro** (texto)
  - **Rubro Padre** (selector desplegable de rubros existentes o "Ninguno")
  - **Descripción breve** (opcional)
- Guardar: actualizar DB/tabla inmediatamente
- **Seguridad MVP:** Edición abierta o protegida por CAPTCHA simple

#### Manejo de Sub-rubros
- Toggle entre vista **"Plana"** (todos en lista) y vista **"Jerárquica"** (sub-rubros colapsados bajo padre)
- Si jerárquica: expandir/colapsar filas

#### Entregables Módulo 2
- Interfaz tipo Data Table
- Lógica de ordenamiento y filtrado en frontend
- Gestión de estado para selección de rubros
- Formularios modales para CRUD de rubros

### 4. Notas para el Desarrollador

- **Prioridad de Simplicidad:** Probar el concepto. UI tipo "Dashboard admin" o "Airtable" son aceptables.
- **Datos de Prueba:** Mecanismo fácil (scripts o mock data) para poblar rubros y atestaciones de ejemplo.
- **Privacidad:** Módulo 1 es público para MVP; no implementar esquema híbrido on-chain/off-chain del whitepaper.

---

## Resumen de Decisiones Confirmadas (conversaciones previas con Mau)

| Decisión | Valor | Notas |
|----------|-------|-------|
| Hosting | **Vercel** | Confirmado por Mau |
| Database | **Supabase** | Ya corriendo en NUC |
| Attestations | **EAS on-chain** (Arbitrum) | No simuladas |
| L2 | **Arbitrum Sepolia** (testnet) | Para MVP |
| CAPTCHA | **Fase 2** | No en MVP |
| Privacidad | **Ninguna** | MVP público |
| Paymaster | **No en MVP** | Dar testnet ETH directo |
| Repo | **Nuevo GitHub repo** | Fresh start |
| Proximidad | **Jaccard index** | `|A∩B| / |A∪B|` + bonuses jerárquicos |
