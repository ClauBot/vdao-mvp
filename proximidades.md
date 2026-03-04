# Proximidades Iniciales entre Rubros — Propuesta

*Valores propuestos de proximidad (0.00 - 1.00) entre pares de rubros significativos.*  
*Estos valores son propuestas iniciales que los usuarios override con atestaciones.*

---

## Metodología de Asignación

Los valores se asignaron considerando:
1. **Relación jerárquica:** Padre-hijo = +0.20 bonus, hermanos (mismo padre) = +0.10 bonus
2. **Co-ocurrencia esperada:** Probabilidad de que una persona trabaje en ambos rubros
3. **Transferencia de habilidades:** Qué tanto las competencias de un rubro aplican al otro
4. **Escala:** 0.00 (sin relación) → 1.00 (prácticamente el mismo campo)

---

## Alta Proximidad (> 0.60)

| Rubro A | Rubro B | Valor | Justificación |
|---------|---------|-------|---------------|
| T02 Desarrollo Web | T03 Frontend | 0.85 | Padre-hijo directo, subset |
| T02 Desarrollo Web | T04 Backend | 0.85 | Padre-hijo directo, subset |
| T03 Frontend | T04 Backend | 0.70 | Hermanos, full-stack frecuente |
| T01 Dev Software | T02 Dev Web | 0.80 | Padre-hijo, web es el subset más común |
| T01 Dev Software | T05 Mobile | 0.75 | Padre-hijo, mismo skillset base |
| T01 Dev Software | T06 DevOps | 0.65 | Hermanos, devs hacen DevOps frecuente |
| T01 Dev Software | T18 Bases de Datos | 0.75 | Padre-hijo, fundamental para dev |
| T01 Dev Software | T19 QA Testing | 0.70 | Padre-hijo, parte del ciclo |
| T08 IA | T09 Ciencia de Datos | 0.80 | Padre-hijo, herramientas compartidas |
| T10 Blockchain | T11 Smart Contracts | 0.85 | Padre-hijo directo |
| T10 Blockchain | FI03 DeFi | 0.75 | Crypto es finanzas + tech |
| T10 Blockchain | FI05 Tokenomics | 0.70 | Diseño económico de tokens |
| A05 Música | A06 Producción Musical | 0.85 | Padre-hijo directo |
| A07 Cine | EN06 Prod. Audiovisual | 0.80 | Mismo campo, diferente contexto |
| A00 Artes | A01 Artes Visuales | 0.75 | Padre-hijo |
| A04 Diseño Gráfico | M05 Branding | 0.75 | Multi-padre, diseño es base de branding |
| A04 Diseño Gráfico | T14 UX/UI | 0.70 | Multi-padre, design thinking compartido |
| M00 Marketing | M01 Marketing Digital | 0.80 | Padre-hijo, digital es el default |
| M01 Marketing Digital | M02 Redes Sociales | 0.80 | Padre-hijo |
| M01 Marketing Digital | M03 Email Marketing | 0.70 | Hermanos, mismas herramientas |
| M01 Marketing Digital | M08 Growth Hacking | 0.75 | Padre-hijo, growth es marketing avanzado |
| M02 Redes Sociales | M12 Influencer Marketing | 0.75 | Subconjunto de social media |
| EN02 Videojuegos | EN03 Game Design | 0.85 | Padre-hijo directo |
| EN02 Videojuegos | EN04 Esports | 0.65 | Hermanos, ecosistema gaming |
| CM04 Gastronomía | CM05 Repostería | 0.80 | Padre-hijo |
| CM04 Gastronomía | CM06 Cafeterías | 0.70 | Hermanos, food & beverage |
| SP02 Servicios Legales | SP12 Notaría | 0.75 | Padre-hijo |
| SP03 Contabilidad | FI06 Asesoría Financiera | 0.75 | Multi-padre, finanzas compartidas |
| CO00 Construcción | CO01 Residencial | 0.80 | Padre-hijo |
| CO00 Construcción | CO02 Comercial | 0.80 | Padre-hijo |
| CO01 Residencial | CO02 Comercial | 0.65 | Hermanos, skills transferibles |
| SA00 Salud | SA01 Medicina General | 0.80 | Padre-hijo |
| SA00 Salud | SA02 Salud Mental | 0.70 | Padre-hijo |
| ED00 Educación | ED01 Formal | 0.75 | Padre-hijo |
| ED00 Educación | ED02 Online | 0.75 | Padre-hijo |
| FI00 Finanzas | FI02 Inversiones | 0.75 | Padre-hijo |
| FI02 Inversiones | FI04 Trading | 0.70 | Hermanos, mismo mercado |

## Media Proximidad (0.30 - 0.60)

| Rubro A | Rubro B | Valor | Justificación |
|---------|---------|-------|---------------|
| T02 Dev Web | T14 UX/UI | 0.55 | Frontend devs hacen UX frecuente |
| T02 Dev Web | CM01 E-commerce | 0.50 | Devs construyen tiendas online |
| T03 Frontend | A04 Diseño Gráfico | 0.45 | Diseño → código, flujo común |
| T04 Backend | T18 Bases de Datos | 0.60 | Backend siempre usa DBs |
| T05 Mobile | T02 Dev Web | 0.55 | PWAs, responsive, cross-platform |
| T06 DevOps | T07 Ciberseguridad | 0.45 | DevSecOps, infra segura |
| T07 Ciberseguridad | SP02 Legal | 0.35 | Compliance, GDPR, regulación |
| T08 IA | T17 VR/AR | 0.40 | AI en experiencias inmersivas |
| T08 IA | CI03 Ciencia Cognitiva | 0.55 | Multi-padre, NLP, cognición |
| T10 Blockchain | T07 Ciberseguridad | 0.40 | Criptografía, auditoría |
| T12 Redes | T07 Ciberseguridad | 0.50 | Network security |
| T12 Redes | T16 IoT | 0.55 | IoT requiere redes |
| T13 Soporte Técnico | T06 DevOps | 0.40 | Operaciones, troubleshooting |
| T14 UX/UI | M01 Marketing Digital | 0.45 | UX impacta conversión |
| T15 Automatización | T16 IoT | 0.50 | Sensores + control industrial |
| A02 Fotografía | A07 Cine | 0.50 | Composición visual compartida |
| A02 Fotografía | M00 Marketing | 0.40 | Fotografía comercial |
| A03 Ilustración | A04 Diseño Gráfico | 0.55 | Tools y estética compartidos |
| A03 Ilustración | A08 Animación | 0.50 | Dibujo es base de animación |
| A04 Diseño Gráfico | A14 Diseño de Moda | 0.40 | Diseño visual compartido |
| A05 Música | EN07 DJ | 0.60 | Producción musical aplicada |
| A07 Cine | A08 Animación | 0.50 | Narrativa visual, postproducción |
| A08 Animación | EN02 Videojuegos | 0.55 | 3D, rigging, game art |
| A09 Arte Digital | T10 Blockchain | 0.40 | NFTs, arte en cadena |
| A10 Teatro | EN08 Comedia | 0.55 | Performance en vivo |
| A12 Literatura | M09 Copywriting | 0.50 | Escritura aplicada al marketing |
| M00 Marketing | SP01 Consultoría | 0.40 | Consultores de marketing |
| M02 Redes Sociales | EN05 Streaming | 0.45 | Content creation compartido |
| M04 Content Marketing | A12 Literatura | 0.40 | Storytelling |
| M06 Publicidad | A07 Cine | 0.40 | Producción de comerciales |
| M07 Relaciones Públicas | M06 Publicidad | 0.50 | Comunicación corporativa |
| M10 Investigación | CI02 Ciencias Sociales | 0.45 | Metodología similar |
| EN01 Producción Eventos | M00 Marketing | 0.45 | Eventos como canal de marketing |
| EN01 Producción Eventos | LO00 Logística | 0.40 | Logística de eventos |
| EN02 Videojuegos | T01 Dev Software | 0.50 | Programación de juegos |
| EN09 Turismo | CM04 Gastronomía | 0.45 | Food tourism, experiencias |
| EN10 Deportes | EN11 Fitness | 0.60 | Actividad física compartida |
| EN10 Deportes | M00 Marketing | 0.35 | Sports marketing |
| SP01 Consultoría | SP07 Gestión Proyectos | 0.50 | Consultores gestionan proyectos |
| SP04 RRHH | ED03 Cap. Corporativa | 0.55 | RRHH organiza capacitación |
| SP04 RRHH | SP05 Coaching | 0.50 | Desarrollo de talento |
| SP08 Arquitectura | CO00 Construcción | 0.60 | Arquitecto → constructor |
| SP08 Arquitectura | SP09 Interiores | 0.55 | Diseño de espacios |
| SP10 Bienes Raíces | CO01 Residencial | 0.50 | Venta de lo construido |
| CO04 Ing. Eléctrica | CO07 Energías Renovables | 0.55 | Solar/eólica es eléctrica |
| CO04 Ing. Eléctrica | T15 Automatización | 0.50 | Automatización requiere eléctrica |
| CM01 E-commerce | LO01 Mensajería | 0.45 | Fulfillment de tiendas online |
| CM01 E-commerce | M01 Marketing Digital | 0.50 | Marketing de tiendas online |
| CM03 Import/Export | LO02 Transporte Carga | 0.55 | Logística internacional |
| CM03 Import/Export | LO04 Supply Chain | 0.55 | Cadena de suministro global |
| LO01 Mensajería | LO02 Transporte Carga | 0.50 | Hermanos, transporte de cosas |
| LO03 Almacenamiento | LO04 Supply Chain | 0.55 | Warehousing es parte de supply chain |
| AG01 Agricultura | AG02 Ganadería | 0.50 | Sector primario, rural |
| AG01 Agricultura | CM04 Gastronomía | 0.35 | Farm to table |
| AG03 Jardinería | SP09 Interiores | 0.35 | Paisajismo + decoración |
| AG04 Medio Ambiente | CO07 Energías Renovables | 0.50 | Sustentabilidad |
| AG04 Medio Ambiente | CI05 Ciencias Ambientales | 0.60 | Mismo campo, diferente enfoque |
| FI01 Banca | FI02 Inversiones | 0.55 | Servicios financieros |
| FI03 DeFi | FI04 Trading | 0.55 | Trading en DeFi |
| CI01 Inv. Académica | ED01 Ed. Formal | 0.55 | Profesores investigan |
| CI02 Ciencias Sociales | GO01 Admin Pública | 0.40 | Políticas basadas en investigación |
| CI04 Biotecnología | AG01 Agricultura | 0.40 | Agrobiotecnología |
| CI04 Biotecnología | SA00 Salud | 0.50 | Biofarma |
| GO02 ONG | GO04 Activismo | 0.55 | Sociedad civil organizada |
| GO03 Cooperación Int'l | GO02 ONG | 0.50 | ONGs internacionales |
| SA02 Salud Mental | SP05 Coaching | 0.45 | Desarrollo personal |
| SA03 Nutrición | EN11 Fitness | 0.55 | Nutrición deportiva |
| ED02 Ed. Online | T02 Dev Web | 0.40 | Plataformas de e-learning |
| ED07 Ed. Financiera | FI00 Finanzas | 0.50 | Enseñar finanzas |

## Baja Proximidad (< 0.30)

| Rubro A | Rubro B | Valor | Justificación |
|---------|---------|-------|---------------|
| T01 Dev Software | SA01 Medicina | 0.10 | Campos muy distintos |
| T01 Dev Software | CO01 Construcción | 0.10 | BIM es el único cruce |
| T08 IA | A13 Artesanía | 0.05 | Prácticamente sin relación |
| T10 Blockchain | SA06 Odontología | 0.02 | Sin relación |
| A01 Artes Visuales | CO06 Plomería | 0.02 | Sin relación |
| A05 Música | SP03 Contabilidad | 0.05 | Sin relación significativa |
| A11 Danza | T04 Backend | 0.02 | Sin relación |
| M00 Marketing | CO06 Plomería | 0.10 | Marketing de servicios (mínimo) |
| EN04 Esports | SA06 Odontología | 0.02 | Sin relación |
| SP02 Legal | A11 Danza | 0.05 | IP de coreografías (mínimo) |
| SP03 Contabilidad | A13 Artesanía | 0.10 | Contabilidad del negocio (mínimo) |
| ED08 Idiomas | T11 Smart Contracts | 0.05 | Sin relación |
| SA07 Veterinaria | T10 Blockchain | 0.02 | Sin relación |
| CO08 Topografía | A05 Música | 0.01 | Sin relación |
| LO05 Transporte Pasajeros | CI01 Inv. Académica | 0.05 | Sin relación |
| AG02 Ganadería | EN04 Esports | 0.01 | Sin relación |
| FI04 Trading | SA04 Fisioterapia | 0.02 | Sin relación |
| GO01 Admin Pública | CM07 Cervecería | 0.10 | Regulación (mínimo) |

---

## Estadísticas

- **Total pares documentados:** 213
- **Alta proximidad (>0.60):** 37 pares
- **Media proximidad (0.30-0.60):** 68 pares
- **Baja proximidad (<0.30):** 18 pares
- **Pares implícitos (por jerarquía):** ~90 adicionales (padre-hijo no listados explícitamente tienen valor base de 0.70+)

## Nota sobre Override

Estos valores son **propuestas iniciales**. La fórmula de override es:

```
valor_actual = (valor_propuesto × 10 + Σ(score_i × peso_nivel_i)) / (10 + Σ(peso_nivel_i))
```

Donde `peso_nivel_i` = {1, 2, 4, 8} para niveles {1, 2, 3, 4}.

A medida que se acumulan atestaciones de proximidad, el `valor_propuesto` se diluye y el `valor_actual` refleja la opinión de la comunidad.
