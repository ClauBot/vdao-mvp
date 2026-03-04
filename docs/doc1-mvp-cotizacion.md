# Solicitud de Cotización: MVP VDAO - Visualizador y Agregador de Atestaciones

## 1. Contexto General del Proyecto

Buscamos desarrollar un MVP (Producto Mínimo Viable) para validar la infraestructura de atestaciones y visualización de datos de reputación. El proyecto es de naturaleza **no financiera** y se enfoca en la interacción social y reputación contextual.

**Stack Tecnológico Preferible:**
- Frontend: React.js / Next.js.
- Conexión Blockchain: Ethers.js o Viem.
- Gestión de Datos: Almacenamiento simple (indexación de eventos o base de datos ligera tipo Firebase/Supabase para el MVP).

## 2. Módulo 1: Agregador de Atestaciones (Wallet Explorer)

**Objetivo:** Una página web sencilla que liste las atestaciones asociadas a una billetera (wallet) específica. El acceso es público, protegido solo por medidas anti-bot básicas.

### Requerimientos Funcionales:

**Acceso Público y Anti-Sybil:**
- No hay restricción de propiedad de NFTs.
- Implementar un CAPTCHA (ej. Google reCAPTCHA v2 o Cloudflare Turnstile) al cargar la página o antes de realizar consultas frecuentes para prevenir scraping automatizado y ataques Sybil básicos.

**Consulta de Wallet:**
- Un input para ingresar una dirección de billetera (ETH address).
- Validación básica de formato de dirección.
- Botón "Buscar" o "Consultar".

**Visualización de Atestaciones (Dashboard):**
- Listar todas las atestaciones emitidas/recibidas por la billetera consultada.
- Información a mostrar por atestación:
  - Emisor (Address del atestador - enlace a Etherscan).
  - Receptor (Address del atestado - enlace a Etherscan).
  - Fecha/Hora del evento.
  - Rubro (Etiqueta de texto).
  - Naturaleza de la interacción (Comercial, Docente, Investigación).
  - Puntaje de Evaluación:
    - Calidad del Servicio/Producto (Escala: 1-4).
    - Calidad del Trato (Escala: 1-4).

**Nota:** Para este MVP, la privacidad es nula (datos públicos); no se requieren mecanismos de cifrado o ZK-proofs.

### Esquema de Datos (Schema):

```
attester (address)
receiver (address)
sectorId (uint o string)
interactionType (enum)
scoreService (uint 1-4)
scoreTreatment (uint 1-4)
timestamp (uint)
```

### Entregables:
- Interfaz web responsiva.
- Lógica de lectura de blockchain (Read-only functions).
- Integración con CAPTCHA.

## 3. Módulo 2: Visualizador de Constelación de Rubros (CoRu) - Modo Tabular

**Objetivo:** Una página para visualizar, navegar y editar la base de datos de "Rubros" y sus relaciones de proximidad. Para este MVP, la visualización será tabular tipo hoja de cálculo (Excel/Google Sheets).

### Requerimientos Funcionales:

**Vista Principal (Hoja de Cálculo):**
- Una tabla (Grid) que liste todos los Rubros disponibles.
- Columnas a mostrar:
  - Nombre del Rubro.
  - Rubro Padre (si es subrubro).
  - Puntaje de Proximidad Promedio (si aplica).
  - Cantidad de Votos/Atestaciones que validan ese rubro.

**Búsqueda y Filtrado:**
- Barra de búsqueda en tiempo real: Filtrar los rubros por nombre mientras se escribe.

**Interacción de "Reorganización por Proximidad":**
- Acción de Usuario: Al hacer clic en una fila específica (Rubro A seleccionado).
- Lógica: La tabla debe reordenarse automáticamente.
  - El Rubro seleccionado se mueve a la primera posición (encabezado).
  - El resto de rubros se ordena de mayor a menor "proximidad" con el Rubro seleccionado.
- Nota: La fórmula de "proximidad" puede ser un valor estático o un cálculo simple para el MVP.

**Gestión de Rubros (Agregar/Editar):**
- Icono de Acción: Incluir un icono de edición (ej. lápiz o configuración) al lado de cada rubro en la tabla.
- Funcionalidad de Agregar/Editar:
  - Al hacer clic, abrir un modal o ventana emergente.
  - Formulario de Edición/Creación:
    - Campo: Nombre del Rubro (texto).
    - Campo: Rubro Padre (selector desplegable de rubros existentes o opción "Ninguno").
    - Campo: Descripción breve (opcional).
  - Guardar: Actualizar la base de datos/tabla inmediatamente.
- Nota de Seguridad: Para el MVP, esta edición puede ser abierta o protegida por un simple CAPTCHA.

**Manejo de Sub-rubros:**
- Opción de visualización para alternar entre vista "Plana" (todos los rubros en una lista) y vista "Jerárquica" (sub-rubros colapsados bajo el rubro padre).
- Si es jerárquica, permitir expandir/colapsar filas.

### Entregables:
- Interfaz tipo Data Table.
- Lógica de ordenamiento y filtrado en frontend.
- Gestión de estado para la selección de rubros.
- Formularios modales para CRUD de rubros.

## 4. Notas para el Desarrollador

- **Prioridad de Simplicidad:** El objetivo es probar el concepto. Diseños tipo "Dashboard admin" o "Airtable" son aceptables.
- **Datos de Prueba:** Se requiere un mecanismo fácil (scripts o mock data) para poblar la tabla de Rubros y algunas atestaciones de ejemplo.
- **Privacidad:** La sección de Atestaciones (Módulo 1) es pública para este MVP.
