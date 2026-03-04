# VDAO: Gamificación Reputacional y Coordinación P2P 🤝

*(Glosario al final del documento)*

## 1. Introducción y Principios

VDAO es un ecosistema de código abierto (open source) y naturaleza no financiera, diseñado como una capa de gamificación de la reputación. Su arquitectura facilita la coordinación Peer to Peer (P2P), permitiendo a comunidades locales digitalizar su capital social a través de la confianza. Operando con un enfoque "Physical-First" y regional, el proyecto prioriza el contacto humano directo y la cercanía geográfica como base fundamental, sirviendo de puente para que la reputación construida en un contexto sea portable y reconocida en otros, mejorando drásticamente la eficiencia de la colaboración sin depender de intermediarios centralizados.

### 1.1. Principios Fundamentales y Ética 📜

- **Superación de la Mera Cuantificación:** La complejidad humana y la conciencia no pueden ni deben encerrarse exclusivamente en reglas matemáticas o legales. El sistema busca actuar como una herramienta de aceleración de confianza, no como una definición absoluta del individuo.
- **Desintermediación:** Facilitamos la construcción y portabilidad de reputación sin intermediarios centralizados.
- **Voluntariedad y Libertad de Salida:** La participación es estrictamente optativa. Se prohíbe cualquier implementación coercitiva.
- **Permisividad y Evolución (Permissionless):** Se fomenta la creación de forks y subsistemas sin autorización previa.
- **Adopción Orgánica:** Sostenibilidad mediante utilidad real y "carisma" de la comunidad.

### 1.2. Regla de Mutualidad y Prohibición de Asimetría ⚖️

- **Principio de Evaluación Mutua:** Las interacciones requieren validación recíproca.
- **Prohibición de Uso Asimétrico:** Una organización no puede exigir evaluación a sus empleados sin someterse a la misma exposición.
- **Periferia Organizativa:** Las organizaciones pueden ofrecer ventajas (perks) basándose en VRep, sin violar la mutualidad.
- **Acciones Correctivas:** VDAO puede implementar medidas para desincentivar abuso de poder o coerción.

### 1.3. Definición y Naturaleza del Protocolo 🌳

- **Sistema de Atestaciones:** Reputación construida colectivamente a través de validaciones intersubjetivas entre pares.
- **Tokenización de Credenciales:** Acceso e identidad gestionados mediante tokens no transferibles (SBTs).
- **Enfoque "Physical-First":** Prioriza cercanía geográfica y contacto humano directo.

### 1.4. Objetivos del Sistema 🧭

1. **Aceleración de la Confianza:** Reducir fricción temporal en nuevas relaciones.
2. **Portabilidad de Reputación:** Historial transportable entre plataformas y contextos.
3. **Integridad y Desintermediación:** Base de datos inmutable y resistente a manipulación.
4. **Incentivos Positivos:** Priorizar construcción de valor y colaboración sobre lo punitivo.
5. **Trascendencia del Protocolo:** Meta final: que el protocolo social orgánico opere naturalmente sin necesidad de gamificación.

## 2. Arquitectura del Sistema

Dos estratos fundamentales:

1. **Reputación Contextual (Evaluación Intersubjetiva Pasada):** Historial consolidado mediante atestaciones verificables.
2. **Reputación de Proclividad (Futura):** Capa predictiva basada en patrones históricos (fuera de alcance de este documento).

## 3. Reputación Contextual: Elementos Constitutivos

### 3.1. Credenciales de Acceso (Soulbound Tokens) 🪪

**Implementación Técnica:**
- SBT con personaje personalizable elegido por el usuario.
- Account Abstraction para gestión de billetera.
- Paymaster (esponsorización de gas).
- App agregadora opcional para usuarios no técnicos.
- Navegador local recomendado para seguridad.

**Sistema de Nivelación:**

**Nivel 1: Introductorio**
- Gitcoin Passport (15+ puntos), O
- Aprobación de 5 miembros Nivel 4, O
- POAP GPS + 2 aprobaciones Nivel 4
- Atestación TOS, seguimiento redes, participación foros
- Beneficios: PDV mínimo + VRep base, personalización SBT

**Nivel 2: Comunidad**
- 10+ referidos
- Asistencia activa a eventos/meetups
- Evaluado/evaluador en 6+ rubros distintos
- 3 meses mínimo de participación
- Beneficios: Multiplicador PDV bajo

**Nivel 3: Dedicación**
- Reputación alta en 3+ rubros
- Coordinación/asistencia de eventos
- 40+ referidos
- Soporte técnico a nuevos usuarios
- Moderación en foros
- 100+ atestaciones de CoRu
- 8 meses mínimo participación
- Contribución económica (costos gas/Paymaster)
- Beneficios: Multiplicador PDV intermedio + PDV Contextual

**Nivel 4: Responsabilidad**
- Reputación muy alta en 5+ rubros
- Coordinación eventos y referidos alto volumen
- Asistencia técnica avanzada y moderación
- Cooperación profunda con gobernanza y CoRu
- 20 meses mínimo participación
- Contribución económica
- Beneficios: PDV mediano-alto, capacidad de emitir mintpass para SBTs

### 3.2. Esquemas de Atestación (Schemas) 📃

**UX Flow:**
1. Proveedor genera plantilla pre-llenada basada en Schema
2. En el intercambio, presenta código QR que abre el schema pre-llenado
3. Cliente solo emite puntaje de evaluación
4. App móvil o integración con navegador (Account Abstraction)

**Campos del Schema:**
- **Jerarquía:** Quién provee y quién recibe
- **Naturaleza:** Comercial, Docente, o Investigación
- **Rubro:** Referencia a rubro validado en CoRu
- **Evaluación:** Dos campos independientes, escala 4 puntos:
  - Calidad del Servicio/Producto
  - Calidad del Trato
  - Escala: Muy bueno, Bueno, Malo, Muy malo
- **Addendum:** Máx. 3 hashes de referencia para evidencias externas

### 3.3. Constelación de Rubros (CoRu) 🕸

**Función:** Agregación continua y dinámica de rubros/subrubros y sus intervinculaciones, con expresividad on-chain.

**Estética (GUI):** Interfaces que visualizan flujo de vínculos, cercanía/distancia entre rubros y áreas carentes de evaluaciones.

**Mecanismo de Construcción:**
- Cada rubro nuevo: umbral mínimo de 5 atestaciones por Nivel 4
- Evaluación de proximidad: adición progresiva según necesidades del gráfico
- Incentivos: mérito por volumen de contribución (estilo Wikipedia)
- Ponderación por Expertise: mayor reputación contextual = mayor peso en evaluación de proximidad
- Resolución de tensiones: distingue autoridad moral (coordinadores) de competencia técnica (expertos)
- Creación de sub-rubros: reservada a Nivel 4

### 3.4. Consideraciones de Integridad: Riesgo de Clustering 🧑🏻‍🤝‍🧑🏻

- Solicitudes de evaluación selectivas → "clustering" artificial
- Incentivo a la Desacumulación: promover interacción con nuevos pares
- Penalización por Cumulación Crónica: VRep afectada negativamente

## 4. Propuesta de Privacidad y Protección de Datos (WIP)

### 4.1. Enfoque Híbrido ⛓
On-chain/off-chain. Pruebas criptográficas públicas, calificaciones detalladas privadas salvo disclosure explícito.

### 4.2. Mecanismos de Privacidad 🫥

1. **Doble Compromiso (Dual-Commitment):** Ambas partes generan hash → commit on-chain solo hash combinado.
2. **Divulgación Selectiva (Tiered Disclosure):** Bandas de reputación públicas (Bronce/Plata/Oro) + ZK-proofs para puntaje exacto bajo demanda.
3. **Evaluación a Ciegas (Commit-Reveal):** Hash primero → revelación en lote aleatorio → evaluado ve solo agregado.
4. **Cifrado Umbral (Threshold Encryption):** Claves distribuidas, solo se desencripta agregado con suficientes evaluaciones.

### 4.3. Consideraciones de Confianza 🖖
- Buffers de retraso + VRF para liberación de datos
- Oráculo descentralizado + sistema de disputas + slashing

## 5. Glosario

- **VRep:** Reputación de un miembro dentro de VDAO
- **PDV:** Poder De Voto
- **PDProp:** Poder de propuesta
- **Prop:** Propuesta sometida a votación
- **Schema:** Esquema estructurado para atestaciones
- **Plantilla:** Schema pre-llenado por el proveedor
- **CoRu:** Constelación de Rubros
- **SBT:** Soulbound Token (no transferible)
- **TBD:** To Be Discussed
