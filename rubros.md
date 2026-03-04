# Constelación de Rubros (CoRu) — Propuesta Inicial

*~150 rubros y sub-rubros organizados como DAG (Grafo Dirigido Acíclico)*  
*Algunos rubros tienen múltiples padres, indicados con `+`*

---

## Formato

```
ID | Nombre | Nombre (EN) | Padre(s) | Descripción
```

---

## 1. Tecnología (T)

| ID | Nombre | EN | Padres | Descripción |
|----|--------|----|--------|-------------|
| T00 | Tecnología | Technology | — | Sector raíz de tecnología |
| T01 | Desarrollo de Software | Software Development | T00 | Diseño, codificación y mantenimiento de software |
| T02 | Desarrollo Web | Web Development | T01 | Frontend, backend y full-stack web |
| T03 | Desarrollo Frontend | Frontend Development | T02 | Interfaces de usuario web (React, Vue, Angular) |
| T04 | Desarrollo Backend | Backend Development | T02 | Servidores, APIs, lógica de negocio |
| T05 | Desarrollo Mobile | Mobile Development | T01 | Apps iOS, Android, cross-platform |
| T06 | DevOps & Infraestructura | DevOps & Infrastructure | T01 | CI/CD, cloud, contenedores, servidores |
| T07 | Ciberseguridad | Cybersecurity | T00 | Seguridad informática, pentesting, compliance |
| T08 | Inteligencia Artificial | Artificial Intelligence | T00 | ML, deep learning, NLP, computer vision |
| T09 | Ciencia de Datos | Data Science | T00, T08 | Análisis, estadística, visualización de datos |
| T10 | Blockchain & Web3 | Blockchain & Web3 | T00 | Smart contracts, DeFi, NFTs, protocolos |
| T11 | Desarrollo Smart Contracts | Smart Contract Dev | T10, T01 | Solidity, Rust, auditoría de contratos |
| T12 | Redes y Telecomunicaciones | Networking & Telecom | T00 | Infraestructura de red, protocolos, ISPs |
| T13 | Soporte Técnico | Technical Support | T00 | Help desk, troubleshooting, mantenimiento |
| T14 | Diseño UX/UI | UX/UI Design | T00, A04 | Experiencia de usuario, interfaces, prototipos |
| T15 | Automatización Industrial | Industrial Automation | T00, CO05 | PLC, SCADA, robótica industrial |
| T16 | IoT (Internet de las Cosas) | IoT | T00, T12 | Sensores, dispositivos conectados, edge computing |
| T17 | Realidad Virtual/Aumentada | VR/AR | T00, EN00 | Inmersión digital, experiencias XR |
| T18 | Bases de Datos | Databases | T01 | SQL, NoSQL, administración de datos |
| T19 | QA & Testing | QA & Testing | T01 | Control de calidad, pruebas automatizadas |

## 2. Artes (A)

| ID | Nombre | EN | Padres | Descripción |
|----|--------|----|--------|-------------|
| A00 | Artes | Arts | — | Sector raíz de artes y expresión creativa |
| A01 | Artes Visuales | Visual Arts | A00 | Pintura, escultura, instalación |
| A02 | Fotografía | Photography | A00 | Fotografía artística, comercial, documental |
| A03 | Ilustración | Illustration | A00 | Ilustración digital y tradicional |
| A04 | Diseño Gráfico | Graphic Design | A00 | Identidad visual, layouts, composición |
| A05 | Música | Music | A00 | Composición, interpretación, producción |
| A06 | Producción Musical | Music Production | A05 | Grabación, mezcla, mastering |
| A07 | Cine y Video | Film & Video | A00 | Dirección, cinematografía, edición |
| A08 | Animación | Animation | A00, T00 | 2D, 3D, motion graphics |
| A09 | Arte Digital | Digital Art | A00, T00 | NFTs, arte generativo, AI art |
| A10 | Teatro y Artes Escénicas | Performing Arts | A00 | Actuación, dirección escénica |
| A11 | Danza | Dance | A00 | Coreografía, interpretación |
| A12 | Literatura y Escritura | Literature & Writing | A00 | Narrativa, poesía, ensayo |
| A13 | Artesanía | Crafts | A00 | Trabajo manual, cerámica, textil |
| A14 | Diseño de Moda | Fashion Design | A00 | Ropa, accesorios, textiles |

## 3. Mercadotecnia (M)

| ID | Nombre | EN | Padres | Descripción |
|----|--------|----|--------|-------------|
| M00 | Mercadotecnia | Marketing | — | Sector raíz de marketing y comunicación comercial |
| M01 | Marketing Digital | Digital Marketing | M00, T00 | SEO, SEM, analytics, funnel |
| M02 | Redes Sociales | Social Media | M01 | Gestión de comunidades, content creation |
| M03 | Email Marketing | Email Marketing | M01 | Newsletters, automatización, segmentación |
| M04 | Content Marketing | Content Marketing | M00 | Estrategia de contenido, storytelling |
| M05 | Branding | Branding | M00, A04 | Identidad de marca, posicionamiento |
| M06 | Publicidad | Advertising | M00 | Campañas publicitarias, medios pagados |
| M07 | Relaciones Públicas | Public Relations | M00 | Comunicación corporativa, crisis management |
| M08 | Growth Hacking | Growth Hacking | M01 | Experimentación, viralidad, métricas |
| M09 | Copywriting | Copywriting | M00, A12 | Textos persuasivos, guiones publicitarios |
| M10 | Investigación de Mercado | Market Research | M00 | Estudios, encuestas, análisis competitivo |
| M11 | Trade Marketing | Trade Marketing | M00 | Punto de venta, merchandising, retail |
| M12 | Influencer Marketing | Influencer Marketing | M02 | Colaboraciones, embajadores de marca |

## 4. Entretenimiento (EN)

| ID | Nombre | EN | Padres | Descripción |
|----|--------|----|--------|-------------|
| EN00 | Entretenimiento | Entertainment | — | Sector raíz de entretenimiento |
| EN01 | Producción de Eventos | Event Production | EN00 | Conciertos, festivales, conferencias |
| EN02 | Videojuegos | Video Games | EN00, T00 | Diseño, desarrollo, publicación |
| EN03 | Game Design | Game Design | EN02 | Mecánicas, narrativa, level design |
| EN04 | Esports | Esports | EN02 | Competencias, equipos, streaming |
| EN05 | Streaming y Podcasting | Streaming & Podcasting | EN00, T00 | Contenido en vivo, audio bajo demanda |
| EN06 | Producción Audiovisual | Audiovisual Production | EN00, A07 | TV, series, documentales |
| EN07 | DJ y Música en Vivo | DJ & Live Music | EN00, A05 | Sets, performances, booking |
| EN08 | Comedia y Stand-up | Comedy & Stand-up | EN00, A10 | Shows de comedia, guiones |
| EN09 | Turismo y Hospitalidad | Tourism & Hospitality | EN00 | Experiencias turísticas, hotelería |
| EN10 | Deportes | Sports | EN00 | Organización deportiva, entrenamiento |
| EN11 | Fitness y Bienestar | Fitness & Wellness | EN10, SA00 | Entrenamiento personal, yoga, nutrición deportiva |

## 5. Servicios Profesionales (SP)

| ID | Nombre | EN | Padres | Descripción |
|----|--------|----|--------|-------------|
| SP00 | Servicios Profesionales | Professional Services | — | Sector raíz de servicios especializados |
| SP01 | Consultoría de Negocios | Business Consulting | SP00 | Estrategia, operaciones, transformación |
| SP02 | Servicios Legales | Legal Services | SP00 | Abogacía, contratos, propiedad intelectual |
| SP03 | Contabilidad y Finanzas | Accounting & Finance | SP00 | Contabilidad, auditoría, fiscal |
| SP04 | Recursos Humanos | Human Resources | SP00 | Reclutamiento, capacitación, cultura |
| SP05 | Coaching y Mentoring | Coaching & Mentoring | SP00 | Desarrollo personal y profesional |
| SP06 | Traducción e Interpretación | Translation | SP00 | Idiomas, localización, interpretación |
| SP07 | Gestión de Proyectos | Project Management | SP00 | PMO, Agile, Scrum, planificación |
| SP08 | Arquitectura | Architecture | SP00, CO00 | Diseño arquitectónico, planos |
| SP09 | Diseño de Interiores | Interior Design | SP00, A00 | Espacios, decoración, funcionalidad |
| SP10 | Bienes Raíces | Real Estate | SP00 | Compra-venta, valuación, desarrollo |
| SP11 | Seguros | Insurance | SP00 | Pólizas, risk management, claims |
| SP12 | Notaría y Fe Pública | Notary Services | SP02 | Certificación, escrituras |

## 6. Educación (ED)

| ID | Nombre | EN | Padres | Descripción |
|----|--------|----|--------|-------------|
| ED00 | Educación | Education | — | Sector raíz de educación y formación |
| ED01 | Educación Formal | Formal Education | ED00 | Escuelas, universidades, certificaciones |
| ED02 | Educación Online | Online Education | ED00, T00 | E-learning, MOOCs, plataformas digitales |
| ED03 | Capacitación Corporativa | Corporate Training | ED00, SP04 | Talleres, workshops empresariales |
| ED04 | Tutoría y Clases Particulares | Tutoring | ED00 | Enseñanza individual o grupos pequeños |
| ED05 | Educación STEM | STEM Education | ED00, T00 | Ciencia, tecnología, ingeniería, matemáticas |
| ED06 | Educación Artística | Arts Education | ED00, A00 | Enseñanza de artes y creatividad |
| ED07 | Educación Financiera | Financial Education | ED00, SP03 | Finanzas personales, inversión, ahorro |
| ED08 | Idiomas | Language Education | ED00 | Enseñanza de idiomas |

## 7. Salud (SA)

| ID | Nombre | EN | Padres | Descripción |
|----|--------|----|--------|-------------|
| SA00 | Salud | Health | — | Sector raíz de salud y bienestar |
| SA01 | Medicina General | General Medicine | SA00 | Consulta médica, diagnóstico |
| SA02 | Salud Mental | Mental Health | SA00 | Psicología, psiquiatría, terapia |
| SA03 | Nutrición | Nutrition | SA00 | Dietas, planes alimenticios, asesoría |
| SA04 | Fisioterapia | Physiotherapy | SA00 | Rehabilitación, terapia física |
| SA05 | Medicina Alternativa | Alternative Medicine | SA00 | Homeopatía, acupuntura, naturismo |
| SA06 | Odontología | Dentistry | SA00 | Servicios dentales |
| SA07 | Veterinaria | Veterinary | SA00 | Salud animal |
| SA08 | Farmacia | Pharmacy | SA00 | Medicamentos, asesoría farmacéutica |

## 8. Construcción e Ingeniería (CO)

| ID | Nombre | EN | Padres | Descripción |
|----|--------|----|--------|-------------|
| CO00 | Construcción e Ingeniería | Construction & Engineering | — | Sector raíz |
| CO01 | Construcción Residencial | Residential Construction | CO00 | Casas, departamentos, remodelaciones |
| CO02 | Construcción Comercial | Commercial Construction | CO00 | Oficinas, locales, naves industriales |
| CO03 | Ingeniería Civil | Civil Engineering | CO00 | Infraestructura, vías, puentes |
| CO04 | Ingeniería Eléctrica | Electrical Engineering | CO00 | Instalaciones eléctricas, energía |
| CO05 | Ingeniería Mecánica | Mechanical Engineering | CO00 | Máquinas, manufactura, mantenimiento |
| CO06 | Plomería e Instalaciones | Plumbing & Installations | CO00 | Agua, gas, instalaciones hidráulicas |
| CO07 | Energías Renovables | Renewable Energy | CO00, T00 | Solar, eólica, eficiencia energética |
| CO08 | Topografía y Agrimensura | Surveying | CO00 | Medición de terrenos, mapeo |

## 9. Comercio (CM)

| ID | Nombre | EN | Padres | Descripción |
|----|--------|----|--------|-------------|
| CM00 | Comercio | Commerce | — | Sector raíz de comercio |
| CM01 | E-commerce | E-commerce | CM00, T00 | Tiendas online, marketplaces |
| CM02 | Retail | Retail | CM00 | Venta al menudeo, tiendas físicas |
| CM03 | Importación/Exportación | Import/Export | CM00 | Comercio internacional, aduanas |
| CM04 | Gastronomía | Gastronomy | CM00 | Restaurantes, catering, food trucks |
| CM05 | Panadería y Repostería | Bakery & Pastry | CM04 | Productos horneados, pastelería |
| CM06 | Cafeterías y Barismo | Coffee & Barista | CM04 | Café de especialidad, preparación |
| CM07 | Cervecería Artesanal | Craft Brewery | CM04 | Producción y venta de cerveza artesanal |
| CM08 | Venta Mayorista | Wholesale | CM00 | Distribución, venta por volumen |

## 10. Logística y Transporte (LO)

| ID | Nombre | EN | Padres | Descripción |
|----|--------|----|--------|-------------|
| LO00 | Logística y Transporte | Logistics & Transport | — | Sector raíz |
| LO01 | Mensajería y Paquetería | Courier & Parcel | LO00 | Entregas last-mile, paquetería |
| LO02 | Transporte de Carga | Freight Transport | LO00 | Mudanzas, fletes, carga pesada |
| LO03 | Almacenamiento | Warehousing | LO00 | Bodegas, inventario, fulfillment |
| LO04 | Cadena de Suministro | Supply Chain | LO00 | Procurement, gestión de proveedores |
| LO05 | Transporte de Pasajeros | Passenger Transport | LO00 | Taxis, ride-sharing, shuttles |

## 11. Agricultura y Medio Ambiente (AG)

| ID | Nombre | EN | Padres | Descripción |
|----|--------|----|--------|-------------|
| AG00 | Agricultura y Medio Ambiente | Agriculture & Environment | — | Sector raíz |
| AG01 | Agricultura | Agriculture | AG00 | Cultivos, cosecha, agroindustria |
| AG02 | Ganadería | Livestock | AG00 | Cría de animales, producción pecuaria |
| AG03 | Jardinería y Paisajismo | Landscaping | AG00 | Diseño de jardines, mantenimiento |
| AG04 | Medio Ambiente | Environmental Services | AG00 | Consultoría ambiental, sustentabilidad |
| AG05 | Acuicultura | Aquaculture | AG00 | Pesca, cultivo acuático |

## 12. Finanzas y Crypto (FI)

| ID | Nombre | EN | Padres | Descripción |
|----|--------|----|--------|-------------|
| FI00 | Finanzas y Crypto | Finance & Crypto | — | Sector raíz |
| FI01 | Banca y Crédito | Banking & Credit | FI00 | Servicios bancarios, préstamos |
| FI02 | Inversiones | Investments | FI00 | Bolsa, fondos, portafolios |
| FI03 | DeFi | DeFi | FI00, T10 | Finanzas descentralizadas, yield, lending |
| FI04 | Trading | Trading | FI00 | Compra-venta de activos, análisis técnico |
| FI05 | Tokenomics | Tokenomics | FI00, T10 | Diseño económico de tokens |
| FI06 | Asesoría Financiera | Financial Advisory | FI00, SP03 | Planeación financiera personal/empresarial |
| FI07 | Crowdfunding | Crowdfunding | FI00 | Financiamiento colectivo |

## 13. Ciencias e Investigación (CI)

| ID | Nombre | EN | Padres | Descripción |
|----|--------|----|--------|-------------|
| CI00 | Ciencias e Investigación | Sciences & Research | — | Sector raíz |
| CI01 | Investigación Académica | Academic Research | CI00, ED00 | Papers, metodología, peer review |
| CI02 | Ciencias Sociales | Social Sciences | CI00 | Sociología, antropología, política |
| CI03 | Ciencia Cognitiva | Cognitive Science | CI00, SA02, T08 | Multi-padre: Ciencia + Salud Mental + IA |
| CI04 | Biotecnología | Biotechnology | CI00, SA00 | Ingeniería genética, biofarma |
| CI05 | Ciencias Ambientales | Environmental Science | CI00, AG04 | Ecología, cambio climático |

## 14. Gobierno y ONG (GO)

| ID | Nombre | EN | Padres | Descripción |
|----|--------|----|--------|-------------|
| GO00 | Gobierno y ONG | Government & NGO | — | Sector raíz |
| GO01 | Administración Pública | Public Administration | GO00 | Gobierno, políticas públicas |
| GO02 | ONG y Sociedad Civil | NGOs & Civil Society | GO00 | Organizaciones sin fines de lucro |
| GO03 | Cooperación Internacional | International Cooperation | GO00 | Desarrollo, ayuda humanitaria |
| GO04 | Activismo y Comunidad | Activism & Community | GO00 | Organización comunitaria, causas sociales |

---

## Rubros Multi-Padre (DAG)

Los siguientes rubros tienen **2 o más padres**, demostrando la naturaleza de grafo del sistema:

| Rubro | Padres |
|-------|--------|
| T09 Ciencia de Datos | T00 Tecnología + T08 IA |
| T11 Smart Contracts | T10 Blockchain + T01 Dev Software |
| T14 Diseño UX/UI | T00 Tecnología + A04 Diseño Gráfico |
| T15 Automatización Industrial | T00 Tecnología + CO05 Ing. Mecánica |
| T16 IoT | T00 Tecnología + T12 Redes |
| T17 VR/AR | T00 Tecnología + EN00 Entretenimiento |
| A08 Animación | A00 Artes + T00 Tecnología |
| A09 Arte Digital | A00 Artes + T00 Tecnología |
| M01 Marketing Digital | M00 Marketing + T00 Tecnología |
| M05 Branding | M00 Marketing + A04 Diseño Gráfico |
| M09 Copywriting | M00 Marketing + A12 Literatura |
| EN02 Videojuegos | EN00 Entretenimiento + T00 Tecnología |
| EN05 Streaming | EN00 Entretenimiento + T00 Tecnología |
| EN06 Prod. Audiovisual | EN00 Entretenimiento + A07 Cine |
| EN07 DJ/Música en Vivo | EN00 Entretenimiento + A05 Música |
| EN08 Comedia | EN00 Entretenimiento + A10 Teatro |
| EN11 Fitness | EN10 Deportes + SA00 Salud |
| ED02 Educación Online | ED00 Educación + T00 Tecnología |
| ED03 Cap. Corporativa | ED00 Educación + SP04 RRHH |
| ED05 STEM | ED00 Educación + T00 Tecnología |
| ED06 Ed. Artística | ED00 Educación + A00 Artes |
| ED07 Ed. Financiera | ED00 Educación + SP03 Contabilidad |
| CO07 Energías Renovables | CO00 Construcción + T00 Tecnología |
| CM01 E-commerce | CM00 Comercio + T00 Tecnología |
| FI03 DeFi | FI00 Finanzas + T10 Blockchain |
| FI05 Tokenomics | FI00 Finanzas + T10 Blockchain |
| FI06 Asesoría Financiera | FI00 Finanzas + SP03 Contabilidad |
| CI01 Inv. Académica | CI00 Ciencias + ED00 Educación |
| CI03 Ciencia Cognitiva | CI00 Ciencias + SA02 Salud Mental + T08 IA |
| CI04 Biotecnología | CI00 Ciencias + SA00 Salud |
| CI05 Ciencias Ambientales | CI00 Ciencias + AG04 Medio Ambiente |

---

## Estadísticas

- **Total rubros:** 152
- **Categorías raíz:** 14
- **Rubros multi-padre:** 31
- **Profundidad máxima:** 4 niveles (ej: Tecnología → Dev Software → Dev Web → Frontend)
- **Sectores cubiertos:** Tecnología, Artes, Mercadotecnia, Entretenimiento, Servicios Profesionales, Educación, Salud, Construcción, Comercio, Logística, Agricultura, Finanzas/Crypto, Ciencias, Gobierno/ONG
