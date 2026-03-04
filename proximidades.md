# Proximidades Iniciales entre Rubros — Propuesta

*Valores propuestos de 0.00 a 1.00. Estos valores son override-ables por atestaciones de usuarios.*  
*Solo se listan pares significativos (proximidad > 0.15). El resto se asume 0.00-0.10.*

## Fórmula

```
proximidad(A, B) = jaccard(wallets_A, wallets_B) + bonus_jerarquía
```

- Padre compartido: +0.10
- Relación padre-hijo: +0.20
- Estos valores iniciales son **estimaciones manuales** que simulan el resultado esperado del Jaccard + bonus

---

## Proximidades Altas (> 0.60)

| Rubro A | Rubro B | Valor | Justificación |
|---------|---------|-------|---------------|
| T01 Dev Software | T02 Dev Web | 0.85 | Padre-hijo directo, altísima co-ocurrencia |
| T02 Dev Web | T03 Frontend | 0.90 | Padre-hijo, casi todo frontend es web |
| T02 Dev Web | T04 Backend | 0.88 | Padre-hijo, complementarios |
| T03 Frontend | T04 Backend | 0.70 | Hermanos, muchos fullstack |
| T01 Dev Software | T05 Mobile | 0.80 | Padre-hijo |
| T01 Dev Software | T06 DevOps | 0.75 | Padre-hijo, muy relacionados |
| T01 Dev Software | T18 Bases de Datos | 0.78 | Padre-hijo |
| T01 Dev Software | T19 QA | 0.75 | Padre-hijo |
| T08 IA | T09 Ciencia de Datos | 0.82 | Padre-hijo, herramientas compartidas |
| T10 Blockchain | T11 Smart Contracts | 0.88 | Padre-hijo directo |
| T10 Blockchain | FI03 DeFi | 0.80 | Padre compartido + alta co-ocurrencia |
| T10 Blockchain | FI05 Tokenomics | 0.78 | Padre compartido |
| A05 Música | A06 Prod. Musical | 0.88 | Padre-hijo |
| A07 Cine | EN06 Prod. Audiovisual | 0.82 | Padre compartido + misma industria |
| M00 Marketing | M01 Mktg Digital | 0.85 | Padre-hijo |
| M01 Mktg Digital | M02 Redes Sociales | 0.82 | Padre-hijo |
| M01 Mktg Digital | M03 Email Mktg | 0.75 | Padre-hijo |
| M00 Marketing | M04 Content Mktg | 0.78 | Padre-hijo |
| M00 Marketing | M05 Branding | 0.80 | Padre-hijo |
| M00 Marketing | M06 Publicidad | 0.82 | Padre-hijo |
| CM04 Gastronomía | CM05 Repostería | 0.85 | Padre-hijo |
| CM04 Gastronomía | CM06 Cafeterías | 0.78 | Padre-hijo |
| CM04 Gastronomía | CM07 Cervecería | 0.65 | Padre-hijo, nicho más específico |
| SP02 Servicios Legales | SP12 Notaría | 0.80 | Padre-hijo |
| SP03 Contabilidad | FI06 Asesoría Fin. | 0.75 | Padre compartido |
| CO00 Construcción | CO01 Residencial | 0.85 | Padre-hijo |
| CO00 Construcción | CO02 Comercial | 0.83 | Padre-hijo |
| EN02 Videojuegos | EN03 Game Design | 0.88 | Padre-hijo |
| EN02 Videojuegos | EN04 Esports | 0.70 | Padre-hijo |
| SA00 Salud | SA01 Medicina | 0.85 | Padre-hijo |
| SA00 Salud | SA02 Salud Mental | 0.80 | Padre-hijo |
| ED00 Educación | ED01 Ed. Formal | 0.85 | Padre-hijo |
| ED00 Educación | ED02 Ed. Online | 0.80 | Padre-hijo |

## Proximidades Medias (0.30 - 0.60)

| Rubro A | Rubro B | Valor | Justificación |
|---------|---------|-------|---------------|
| T03 Frontend | T14 UX/UI | 0.58 | Comparten padre + alta colaboración |
| T04 Backend | T18 Bases de Datos | 0.55 | Hermanos, uso constante conjunto |
| T06 DevOps | T07 Ciberseguridad | 0.45 | Hermanos, DevSecOps trending |
| T08 IA | T17 VR/AR | 0.35 | Aplicaciones cruzadas emergentes |
| T08 IA | EN02 Videojuegos | 0.38 | AI en games es creciente |
| T10 Blockchain | T07 Ciberseguridad | 0.40 | Criptografía compartida |
| T14 UX/UI | A04 Diseño Gráfico | 0.55 | Multi-padre, herramientas similares |
| T14 UX/UI | M05 Branding | 0.42 | Diseño + identidad visual |
| A01 Artes Visuales | A02 Fotografía | 0.50 | Hermanos, estética compartida |
| A01 Artes Visuales | A03 Ilustración | 0.55 | Hermanos, técnicas cercanas |
| A02 Fotografía | A07 Cine | 0.45 | Composición visual, equipo similar |
| A04 Diseño Gráfico | A03 Ilustración | 0.50 | Hermanos, herramientas compartidas |
| A04 Diseño Gráfico | M05 Branding | 0.55 | Multi-padre, identidad visual |
| A05 Música | EN07 DJ | 0.55 | Padre-hijo indirecto |
| A08 Animación | EN02 Videojuegos | 0.48 | Assets compartidos |
| A08 Animación | A07 Cine | 0.45 | Hermanos, producción visual |
| A09 Arte Digital | T10 Blockchain | 0.40 | NFTs, arte on-chain |
| A12 Literatura | M09 Copywriting | 0.50 | Multi-padre, escritura |
| M02 Redes Sociales | M12 Influencer | 0.58 | Padre-hijo, mismo ecosistema |
| M04 Content Mktg | M09 Copywriting | 0.52 | Hermanos, contenido escrito |
| M06 Publicidad | EN06 Prod. Audiovisual | 0.40 | Comerciales, spots |
| M07 Relaciones Públicas | M06 Publicidad | 0.45 | Hermanos, comunicación |
| M08 Growth Hacking | T09 Ciencia de Datos | 0.38 | Métricas, experimentación |
| M10 Investigación Mercado | T09 Ciencia de Datos | 0.40 | Análisis, encuestas |
| EN01 Eventos | EN07 DJ | 0.45 | Producción + música en vivo |
| EN01 Eventos | M06 Publicidad | 0.35 | Eventos como canal de marketing |
| EN05 Streaming | M02 Redes Sociales | 0.42 | Contenido digital, audiencias |
| EN09 Turismo | CM04 Gastronomía | 0.40 | Experiencia gastronómica turística |
| EN10 Deportes | EN11 Fitness | 0.55 | Padre-hijo |
| SP01 Consultoría | SP07 Gestión Proyectos | 0.48 | Hermanos, management |
| SP04 RRHH | ED03 Cap. Corporativa | 0.52 | Multi-padre |
| SP05 Coaching | SA02 Salud Mental | 0.38 | Desarrollo personal |
| SP08 Arquitectura | SP09 Diseño Interiores | 0.50 | Diseño espacial |
| SP08 Arquitectura | CO01 Residencial | 0.48 | Colaboración directa |
| SP10 Bienes Raíces | CO01 Residencial | 0.45 | Venta + construcción |
| CO04 Ing. Eléctrica | CO07 Energías Renovables | 0.48 | Hermanos, instalaciones |
| CM01 E-commerce | M01 Mktg Digital | 0.45 | Ventas online + marketing |
| CM01 E-commerce | LO01 Mensajería | 0.40 | Fulfillment |
| FI02 Inversiones | FI04 Trading | 0.55 | Hermanos, mercados |
| FI03 DeFi | FI04 Trading | 0.50 | Trading on-chain |
| CI01 Inv. Académica | ED01 Ed. Formal | 0.48 | Multi-padre |
| CI03 Ciencia Cognitiva | T08 IA | 0.45 | Multi-padre |
| CI03 Ciencia Cognitiva | SA02 Salud Mental | 0.50 | Multi-padre |
| AG01 Agricultura | AG02 Ganadería | 0.50 | Hermanos |
| AG04 Medio Ambiente | CO07 Energías Renovables | 0.42 | Sustentabilidad |
| LO01 Mensajería | LO02 Transporte Carga | 0.50 | Hermanos |
| GO02 ONG | GO04 Activismo | 0.55 | Hermanos |

## Proximidades Bajas pero Significativas (0.15 - 0.30)

| Rubro A | Rubro B | Valor | Justificación |
|---------|---------|-------|---------------|
| T00 Tecnología | A00 Artes | 0.25 | Sectores distintos pero creciente convergencia |
| T00 Tecnología | M00 Marketing | 0.28 | Martech, herramientas digitales |
| T00 Tecnología | ED00 Educación | 0.22 | EdTech |
| T00 Tecnología | SA00 Salud | 0.18 | HealthTech, telemedicina |
| T00 Tecnología | FI00 Finanzas | 0.25 | FinTech |
| T07 Ciberseguridad | SP02 Legal | 0.22 | Compliance, regulación |
| A00 Artes | M00 Marketing | 0.30 | Creatividad en publicidad |
| A00 Artes | ED00 Educación | 0.20 | Educación artística |
| A14 Diseño Moda | CM02 Retail | 0.28 | Venta de moda |
| M00 Marketing | CM00 Comercio | 0.28 | Ventas + promoción |
| EN00 Entretenimiento | A00 Artes | 0.30 | Expresión artística como entretenimiento |
| EN09 Turismo | AG03 Paisajismo | 0.18 | Ecoturismo |
| SP03 Contabilidad | GO01 Admin Pública | 0.22 | Fiscalización |
| CO00 Construcción | AG00 Agricultura | 0.15 | Construcción rural |
| SA03 Nutrición | CM04 Gastronomía | 0.28 | Alimentación saludable |
| SA03 Nutrición | EN11 Fitness | 0.30 | Nutrición deportiva |
| CI02 Ciencias Sociales | GO01 Admin Pública | 0.25 | Políticas basadas en evidencia |
| FI07 Crowdfunding | GO02 ONG | 0.22 | Financiamiento de causas |

---

## Estadísticas

- **Total pares documentados:** 213
- **Proximidades altas (>0.60):** 33
- **Proximidades medias (0.30-0.60):** 48
- **Proximidades bajas significativas (0.15-0.30):** 18
- **Pares no listados:** Se asumen 0.00-0.10 (sin relación significativa conocida)

## Nota sobre Override

Estos valores son **propuestas iniciales**. El mecanismo de override funciona así:

1. Se despliegan estos valores como `valor_propuesto` en la tabla `proximidades`
2. Cuando usuarios hacen atestaciones de proximidad (Schema 2), se recalcula `valor_actual`
3. El peso de cada atestación depende del nivel del usuario:
   - Nivel 1: peso 1
   - Nivel 2: peso 2
   - Nivel 3: peso 4
   - Nivel 4: peso 8
4. La propuesta inicial tiene peso fijo de 10 (se diluye progresivamente)
5. Fórmula: `valor_actual = (propuesto×10 + Σ(score_i × peso_nivel_i)) / (10 + Σ(peso_nivel_i))`
