-- ============================================
-- VDAO MVP — Database Schema (Supabase/PostgreSQL)
-- ============================================
-- 6 tablas principales + índices + RLS policies
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- ===================
-- 1. RUBROS
-- ===================
CREATE TABLE rubros (
  id               SERIAL PRIMARY KEY,
  nombre           TEXT NOT NULL UNIQUE,
  nombre_en        TEXT,                          -- Para internacionalización futura
  descripcion      TEXT,
  activo           BOOLEAN DEFAULT false,         -- false = pendiente validación
  created_at       TIMESTAMPTZ DEFAULT now(),
  created_by       TEXT,                          -- wallet address del proponente
  validated_at     TIMESTAMPTZ,
  validation_count INT DEFAULT 0,                 -- Votos de aprobación recibidos
  rejection_count  INT DEFAULT 0                  -- Votos de rechazo recibidos
);

COMMENT ON TABLE rubros IS 'Catálogo de rubros/sectores profesionales (Constelación de Rubros)';
COMMENT ON COLUMN rubros.activo IS 'false = pendiente validación por nivel 4; true = validado y activo';
COMMENT ON COLUMN rubros.created_by IS 'Wallet address del usuario que propuso el rubro (nivel 2+)';

-- ===================
-- 2. RUBRO_PADRES (DAG: many-to-many)
-- ===================
CREATE TABLE rubro_padres (
  rubro_id INT NOT NULL REFERENCES rubros(id) ON DELETE CASCADE,
  padre_id INT NOT NULL REFERENCES rubros(id) ON DELETE CASCADE,
  PRIMARY KEY (rubro_id, padre_id),
  CONSTRAINT no_self_parent CHECK (rubro_id != padre_id)
);

COMMENT ON TABLE rubro_padres IS 'Relaciones padre-hijo entre rubros. Un rubro puede tener múltiples padres (DAG).';

-- ===================
-- 3. PROXIMIDADES
-- ===================
CREATE TABLE proximidades (
  rubro_a              INT NOT NULL REFERENCES rubros(id) ON DELETE CASCADE,
  rubro_b              INT NOT NULL REFERENCES rubros(id) ON DELETE CASCADE,
  valor_propuesto      FLOAT NOT NULL CHECK (valor_propuesto BETWEEN 0 AND 1),
  valor_actual         FLOAT CHECK (valor_actual BETWEEN 0 AND 1),
  num_evaluaciones     INT DEFAULT 0,
  ultima_actualizacion TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (rubro_a, rubro_b),
  CONSTRAINT ordered_pair CHECK (rubro_a < rubro_b),  -- Normalizar: siempre A < B
  CONSTRAINT different_rubros CHECK (rubro_a != rubro_b)
);

COMMENT ON TABLE proximidades IS 'Valores de proximidad entre pares de rubros. rubro_a siempre < rubro_b para evitar duplicados.';
COMMENT ON COLUMN proximidades.valor_propuesto IS 'Propuesta inicial (seed data). Se diluye con más evaluaciones.';
COMMENT ON COLUMN proximidades.valor_actual IS 'Valor calculado considerando atestaciones. NULL si no hay evaluaciones (usar valor_propuesto).';

-- ===================
-- 4. USUARIOS
-- ===================
CREATE TABLE usuarios (
  wallet         TEXT PRIMARY KEY,
  nivel          INT DEFAULT 1 CHECK (nivel BETWEEN 1 AND 4),
  nombre_display TEXT,
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE usuarios IS 'Cache de usuarios del sistema con su nivel actual.';
COMMENT ON COLUMN usuarios.nivel IS '1=Introductorio, 2=Comunidad, 3=Dedicación, 4=Responsabilidad';

-- ===================
-- 5. ATESTACIONES_CACHE
-- ===================
CREATE TABLE atestaciones_cache (
  uid              TEXT PRIMARY KEY,               -- EAS attestation UID
  attester         TEXT NOT NULL,                   -- Wallet del evaluador
  receiver         TEXT NOT NULL,                   -- Wallet del evaluado
  rubro_id         INT REFERENCES rubros(id),
  interaction_type INT CHECK (interaction_type IN (0, 1, 2)),  -- 0=Comercial, 1=Docente, 2=Investigación
  score_service    INT CHECK (score_service BETWEEN 1 AND 4),
  score_treatment  INT CHECK (score_treatment BETWEEN 1 AND 4),
  role             INT CHECK (role IN (0, 1)),      -- 0=Proveedor, 1=Cliente
  counterpart_uid  TEXT,                            -- UID de la atestación de la contraparte
  created_at       TIMESTAMPTZ NOT NULL,            -- Timestamp del bloque
  block_number     BIGINT,
  indexed_at       TIMESTAMPTZ DEFAULT now(),       -- Cuando se indexó en Supabase
  CONSTRAINT no_self_attestation CHECK (attester != receiver)
);

COMMENT ON TABLE atestaciones_cache IS 'Cache local de atestaciones de evaluación mutua indexadas desde EAS.';

-- ===================
-- 6. PROXIMIDAD_ATESTACIONES_CACHE
-- ===================
CREATE TABLE proximidad_atestaciones_cache (
  uid            TEXT PRIMARY KEY,                  -- EAS attestation UID
  rubro_a        INT NOT NULL REFERENCES rubros(id),
  rubro_b        INT NOT NULL REFERENCES rubros(id),
  score          INT NOT NULL CHECK (score BETWEEN 1 AND 100),
  proposer       TEXT NOT NULL,                     -- Wallet del evaluador
  proposer_level INT NOT NULL CHECK (proposer_level BETWEEN 1 AND 4),
  created_at     TIMESTAMPTZ NOT NULL,
  indexed_at     TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT prox_ordered_pair CHECK (rubro_a < rubro_b),
  CONSTRAINT prox_different CHECK (rubro_a != rubro_b)
);

COMMENT ON TABLE proximidad_atestaciones_cache IS 'Cache de atestaciones de proximidad entre rubros indexadas desde EAS.';

-- ===================
-- 7. VALIDACION_RUBROS_CACHE
-- ===================
CREATE TABLE validacion_rubros_cache (
  uid        TEXT PRIMARY KEY,                      -- EAS attestation UID
  rubro_id   INT NOT NULL REFERENCES rubros(id),
  voter      TEXT NOT NULL,                         -- Wallet del nivel 4 que vota
  approved   BOOLEAN NOT NULL,
  reason     TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  indexed_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_vote UNIQUE (rubro_id, voter)   -- Un voto por rubro por wallet
);

COMMENT ON TABLE validacion_rubros_cache IS 'Cache de votos de validación de rubros nuevos.';

-- ============================================
-- ÍNDICES
-- ============================================

-- Rubros
CREATE INDEX idx_rubros_activo ON rubros(activo);
CREATE INDEX idx_rubros_nombre ON rubros(nombre);
CREATE INDEX idx_rubros_created_by ON rubros(created_by);

-- Rubro padres
CREATE INDEX idx_rubro_padres_padre ON rubro_padres(padre_id);

-- Proximidades
CREATE INDEX idx_proximidades_rubro_a ON proximidades(rubro_a);
CREATE INDEX idx_proximidades_rubro_b ON proximidades(rubro_b);

-- Usuarios
CREATE INDEX idx_usuarios_nivel ON usuarios(nivel);

-- Atestaciones
CREATE INDEX idx_atestaciones_attester ON atestaciones_cache(attester);
CREATE INDEX idx_atestaciones_receiver ON atestaciones_cache(receiver);
CREATE INDEX idx_atestaciones_rubro ON atestaciones_cache(rubro_id);
CREATE INDEX idx_atestaciones_created ON atestaciones_cache(created_at DESC);
CREATE INDEX idx_atestaciones_counterpart ON atestaciones_cache(counterpart_uid);

-- Proximidad atestaciones
CREATE INDEX idx_prox_att_rubros ON proximidad_atestaciones_cache(rubro_a, rubro_b);
CREATE INDEX idx_prox_att_proposer ON proximidad_atestaciones_cache(proposer);

-- Validación
CREATE INDEX idx_validacion_rubro ON validacion_rubros_cache(rubro_id);
CREATE INDEX idx_validacion_voter ON validacion_rubros_cache(voter);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE rubros ENABLE ROW LEVEL SECURITY;
ALTER TABLE rubro_padres ENABLE ROW LEVEL SECURITY;
ALTER TABLE proximidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE atestaciones_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE proximidad_atestaciones_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE validacion_rubros_cache ENABLE ROW LEVEL SECURITY;

-- Lectura pública para todas las tablas
CREATE POLICY "Lectura pública rubros" ON rubros FOR SELECT USING (true);
CREATE POLICY "Lectura pública rubro_padres" ON rubro_padres FOR SELECT USING (true);
CREATE POLICY "Lectura pública proximidades" ON proximidades FOR SELECT USING (true);
CREATE POLICY "Lectura pública usuarios" ON usuarios FOR SELECT USING (true);
CREATE POLICY "Lectura pública atestaciones" ON atestaciones_cache FOR SELECT USING (true);
CREATE POLICY "Lectura pública prox_atestaciones" ON proximidad_atestaciones_cache FOR SELECT USING (true);
CREATE POLICY "Lectura pública validacion" ON validacion_rubros_cache FOR SELECT USING (true);

-- Escritura solo vía service_role (el indexer/API backend)
CREATE POLICY "Escritura service_role rubros" ON rubros FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Update service_role rubros" ON rubros FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "Escritura service_role rubro_padres" ON rubro_padres FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Escritura service_role proximidades" ON proximidades FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Escritura service_role usuarios" ON usuarios FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Escritura service_role atestaciones" ON atestaciones_cache FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Escritura service_role prox_atestaciones" ON proximidad_atestaciones_cache FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Escritura service_role validacion" ON validacion_rubros_cache FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- ============================================
-- FUNCIONES ÚTILES
-- ============================================

-- Función para obtener proximidad entre dos rubros (normaliza el orden)
CREATE OR REPLACE FUNCTION get_proximidad(a INT, b INT)
RETURNS FLOAT AS $$
DECLARE
  result FLOAT;
  low_id INT := LEAST(a, b);
  high_id INT := GREATEST(a, b);
BEGIN
  SELECT COALESCE(valor_actual, valor_propuesto)
  INTO result
  FROM proximidades
  WHERE rubro_a = low_id AND rubro_b = high_id;
  
  RETURN COALESCE(result, 0.0);
END;
$$ LANGUAGE plpgsql STABLE;

-- Función para obtener rubros ordenados por proximidad a un rubro dado
CREATE OR REPLACE FUNCTION rubros_por_proximidad(rubro_id INT)
RETURNS TABLE(id INT, nombre TEXT, proximidad FLOAT) AS $$
BEGIN
  RETURN QUERY
  SELECT r.id, r.nombre, 
    COALESCE(get_proximidad(rubro_id, r.id), 0.0) AS proximidad
  FROM rubros r
  WHERE r.id != rubro_id AND r.activo = true
  ORDER BY proximidad DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Función para recalcular proximidad después de nueva atestación
CREATE OR REPLACE FUNCTION recalcular_proximidad(a INT, b INT)
RETURNS FLOAT AS $$
DECLARE
  low_id INT := LEAST(a, b);
  high_id INT := GREATEST(a, b);
  propuesto FLOAT;
  peso_propuesta FLOAT := 10.0;
  suma_ponderada FLOAT;
  suma_pesos FLOAT;
  att RECORD;
  peso_nivel FLOAT;
  nuevo_valor FLOAT;
BEGIN
  -- Obtener valor propuesto
  SELECT valor_propuesto INTO propuesto
  FROM proximidades
  WHERE rubro_a = low_id AND rubro_b = high_id;
  
  IF propuesto IS NULL THEN
    propuesto := 0.0;
    peso_propuesta := 0.0;
  END IF;
  
  suma_ponderada := propuesto * peso_propuesta;
  suma_pesos := peso_propuesta;
  
  -- Sumar atestaciones
  FOR att IN
    SELECT score, proposer_level
    FROM proximidad_atestaciones_cache
    WHERE rubro_a = low_id AND rubro_b = high_id
  LOOP
    peso_nivel := CASE att.proposer_level
      WHEN 1 THEN 1.0
      WHEN 2 THEN 2.0
      WHEN 3 THEN 4.0
      WHEN 4 THEN 8.0
      ELSE 1.0
    END;
    suma_ponderada := suma_ponderada + (att.score::FLOAT / 100.0) * peso_nivel;
    suma_pesos := suma_pesos + peso_nivel;
  END LOOP;
  
  IF suma_pesos = 0 THEN
    nuevo_valor := 0.0;
  ELSE
    nuevo_valor := suma_ponderada / suma_pesos;
  END IF;
  
  -- Actualizar
  UPDATE proximidades
  SET valor_actual = nuevo_valor,
      num_evaluaciones = (
        SELECT COUNT(*) FROM proximidad_atestaciones_cache
        WHERE rubro_a = low_id AND rubro_b = high_id
      ),
      ultima_actualizacion = now()
  WHERE rubro_a = low_id AND rubro_b = high_id;
  
  RETURN nuevo_valor;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Vista de rubros con sus padres
CREATE OR REPLACE VIEW rubros_con_padres AS
SELECT 
  r.id,
  r.nombre,
  r.nombre_en,
  r.descripcion,
  r.activo,
  r.validation_count,
  COALESCE(
    array_agg(DISTINCT p.nombre) FILTER (WHERE p.nombre IS NOT NULL),
    '{}'
  ) AS padres,
  COALESCE(
    array_agg(DISTINCT p.id) FILTER (WHERE p.id IS NOT NULL),
    '{}'
  ) AS padre_ids
FROM rubros r
LEFT JOIN rubro_padres rp ON r.id = rp.rubro_id
LEFT JOIN rubros p ON rp.padre_id = p.id
GROUP BY r.id;

-- Vista de resumen por wallet
CREATE OR REPLACE VIEW resumen_wallet AS
SELECT 
  wallet,
  COUNT(*) FILTER (WHERE wallet = attester) AS atestaciones_emitidas,
  COUNT(*) FILTER (WHERE wallet = receiver) AS atestaciones_recibidas,
  ROUND(AVG(score_service)::numeric, 2) FILTER (WHERE wallet = receiver) AS avg_score_service,
  ROUND(AVG(score_treatment)::numeric, 2) FILTER (WHERE wallet = receiver) AS avg_score_treatment,
  COUNT(DISTINCT rubro_id) AS rubros_activos
FROM (
  SELECT attester AS wallet, attester, receiver, score_service, score_treatment, rubro_id
  FROM atestaciones_cache
  UNION ALL
  SELECT receiver AS wallet, attester, receiver, score_service, score_treatment, rubro_id
  FROM atestaciones_cache
) combined
GROUP BY wallet;
