-- VDAO MVP — Supabase Database Schema
-- Run this in the Supabase SQL editor

-- ============================================
-- 1. RUBROS (Categorías de actividad)
-- ============================================
CREATE TABLE rubros (
  id              SERIAL PRIMARY KEY,
  nombre          TEXT NOT NULL UNIQUE,
  nombre_en       TEXT,                          -- Para internacionalización futura
  descripcion     TEXT,
  activo          BOOLEAN DEFAULT false,         -- false = pendiente validación
  created_at      TIMESTAMPTZ DEFAULT now(),
  created_by      TEXT,                          -- wallet address del proponente
  validated_at    TIMESTAMPTZ,
  validation_count INT DEFAULT 0                 -- cuántos nivel 4 han aprobado
);

CREATE INDEX idx_rubros_nombre ON rubros(nombre);
CREATE INDEX idx_rubros_activo ON rubros(activo);

-- ============================================
-- 2. RUBRO_PADRES (DAG: relación many-to-many)
-- ============================================
-- Un rubro puede tener 0, 1, o múltiples padres
-- Permite la estructura de Grafo Dirigido Acíclico
CREATE TABLE rubro_padres (
  rubro_id    INT REFERENCES rubros(id) ON DELETE CASCADE,
  padre_id    INT REFERENCES rubros(id) ON DELETE CASCADE,
  PRIMARY KEY (rubro_id, padre_id),
  CHECK (rubro_id != padre_id)               -- No auto-referencia
);

CREATE INDEX idx_rubro_padres_padre ON rubro_padres(padre_id);

-- ============================================
-- 3. PROXIMIDADES (valores entre rubros)
-- ============================================
-- valor_propuesto = propuesta inicial del sistema
-- valor_actual = calculado de atestaciones (override progresivo)
CREATE TABLE proximidades (
  rubro_a             INT REFERENCES rubros(id) ON DELETE CASCADE,
  rubro_b             INT REFERENCES rubros(id) ON DELETE CASCADE,
  valor_propuesto     FLOAT NOT NULL CHECK (valor_propuesto BETWEEN 0 AND 1),
  valor_actual        FLOAT CHECK (valor_actual BETWEEN 0 AND 1),
  num_evaluaciones    INT DEFAULT 0,
  suma_ponderada      FLOAT DEFAULT 0,          -- Σ(score_i × peso_nivel_i) para recálculo rápido
  suma_pesos          FLOAT DEFAULT 0,          -- Σ(peso_nivel_i)
  ultima_actualizacion TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (rubro_a, rubro_b),
  CHECK (rubro_a < rubro_b)                     -- Normalización: A siempre < B
);

CREATE INDEX idx_proximidades_rubro_a ON proximidades(rubro_a);
CREATE INDEX idx_proximidades_rubro_b ON proximidades(rubro_b);

-- ============================================
-- 4. USUARIOS (cache de datos + niveles)
-- ============================================
CREATE TABLE usuarios (
  wallet          TEXT PRIMARY KEY,
  nivel           INT DEFAULT 1 CHECK (nivel BETWEEN 1 AND 4),
  nombre_display  TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 5. ATESTACIONES_CACHE (indexación de EAS)
-- ============================================
-- Cache local de atestaciones on-chain para queries rápidas
CREATE TABLE atestaciones_cache (
  uid              TEXT PRIMARY KEY,              -- EAS attestation UID
  attester         TEXT NOT NULL,
  receiver         TEXT NOT NULL,
  rubro_id         INT REFERENCES rubros(id),
  interaction_type INT CHECK (interaction_type IN (0, 1, 2)),  -- 0=Comercial, 1=Docente, 2=Investigación
  score_service    INT CHECK (score_service BETWEEN 1 AND 4),
  score_treatment  INT CHECK (score_treatment BETWEEN 1 AND 4),
  role             INT CHECK (role IN (0, 1)),    -- 0=Proveedor, 1=Cliente
  counterpart_uid  TEXT,                          -- UID de la atestación de la contraparte
  created_at       TIMESTAMPTZ NOT NULL,
  block_number     BIGINT,
  indexed_at       TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_atestaciones_attester ON atestaciones_cache(attester);
CREATE INDEX idx_atestaciones_receiver ON atestaciones_cache(receiver);
CREATE INDEX idx_atestaciones_rubro ON atestaciones_cache(rubro_id);
CREATE INDEX idx_atestaciones_created ON atestaciones_cache(created_at DESC);
CREATE INDEX idx_atestaciones_attester_rubro ON atestaciones_cache(attester, rubro_id);
CREATE INDEX idx_atestaciones_receiver_rubro ON atestaciones_cache(receiver, rubro_id);

-- ============================================
-- 6. PROXIMIDAD_ATESTACIONES_CACHE
-- ============================================
-- Cache de atestaciones de proximidad on-chain
CREATE TABLE proximidad_atestaciones_cache (
  uid             TEXT PRIMARY KEY,               -- EAS attestation UID
  rubro_a         INT REFERENCES rubros(id),
  rubro_b         INT REFERENCES rubros(id),
  score           INT CHECK (score BETWEEN 1 AND 100),
  proposer        TEXT NOT NULL,                  -- wallet del evaluador
  proposer_level  INT CHECK (proposer_level BETWEEN 1 AND 4),
  created_at      TIMESTAMPTZ NOT NULL,
  indexed_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_prox_atest_rubros ON proximidad_atestaciones_cache(rubro_a, rubro_b);
CREATE INDEX idx_prox_atest_proposer ON proximidad_atestaciones_cache(proposer);

-- ============================================
-- 7. VALIDACIONES_RUBRO_CACHE
-- ============================================
-- Cache de atestaciones de validación de rubros nuevos
CREATE TABLE validaciones_rubro_cache (
  uid             TEXT PRIMARY KEY,               -- EAS attestation UID
  rubro_id        INT REFERENCES rubros(id),
  validator       TEXT NOT NULL,                  -- wallet del nivel 4
  approved        BOOLEAN NOT NULL,
  reason          TEXT,
  created_at      TIMESTAMPTZ NOT NULL,
  indexed_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_validaciones_rubro ON validaciones_rubro_cache(rubro_id);

-- ============================================
-- 8. CONFIGURACION (settings del sistema)
-- ============================================
CREATE TABLE configuracion (
  clave           TEXT PRIMARY KEY,
  valor           JSONB NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Insertar config inicial
INSERT INTO configuracion (clave, valor) VALUES
  ('validadores_requeridos', '3'),                -- Mínimo nivel 4 para aprobar rubro
  ('peso_propuesta_inicial', '10'),               -- Peso de la propuesta en fórmula de override
  ('pesos_nivel', '{"1": 1, "2": 2, "3": 4, "4": 8}'),
  ('max_atestaciones_dia', '20');                 -- Rate limit por wallet

-- ============================================
-- RLS (Row Level Security)
-- ============================================
-- Lectura pública para todas las tablas
-- Escritura solo vía service role (indexer backend)

ALTER TABLE rubros ENABLE ROW LEVEL SECURITY;
ALTER TABLE rubro_padres ENABLE ROW LEVEL SECURITY;
ALTER TABLE proximidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE atestaciones_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE proximidad_atestaciones_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE validaciones_rubro_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;

-- Lectura pública
CREATE POLICY "Public read" ON rubros FOR SELECT USING (true);
CREATE POLICY "Public read" ON rubro_padres FOR SELECT USING (true);
CREATE POLICY "Public read" ON proximidades FOR SELECT USING (true);
CREATE POLICY "Public read" ON usuarios FOR SELECT USING (true);
CREATE POLICY "Public read" ON atestaciones_cache FOR SELECT USING (true);
CREATE POLICY "Public read" ON proximidad_atestaciones_cache FOR SELECT USING (true);
CREATE POLICY "Public read" ON validaciones_rubro_cache FOR SELECT USING (true);
CREATE POLICY "Public read" ON configuracion FOR SELECT USING (true);

-- Escritura solo service role (las API routes del backend usan service_role key)
-- No se crean políticas de INSERT/UPDATE/DELETE para anon — solo service_role bypasea RLS

-- ============================================
-- FUNCIÓN: Recalcular proximidad
-- ============================================
CREATE OR REPLACE FUNCTION recalcular_proximidad(p_rubro_a INT, p_rubro_b INT)
RETURNS VOID AS $$
DECLARE
  v_peso_propuesta FLOAT;
  v_valor_propuesto FLOAT;
  v_suma_ponderada FLOAT;
  v_suma_pesos FLOAT;
  v_num_eval INT;
  v_pesos JSONB;
  r RECORD;
BEGIN
  -- Normalizar orden
  IF p_rubro_a > p_rubro_b THEN
    v_suma_ponderada := p_rubro_a;
    p_rubro_a := p_rubro_b;
    p_rubro_b := v_suma_ponderada::INT;
  END IF;

  -- Obtener config
  SELECT (valor)::FLOAT INTO v_peso_propuesta FROM configuracion WHERE clave = 'peso_propuesta_inicial';
  SELECT valor INTO v_pesos FROM configuracion WHERE clave = 'pesos_nivel';
  SELECT valor_propuesto INTO v_valor_propuesto FROM proximidades WHERE rubro_a = p_rubro_a AND rubro_b = p_rubro_b;

  IF v_valor_propuesto IS NULL THEN
    v_valor_propuesto := 0;
  END IF;

  -- Calcular suma ponderada de atestaciones
  v_suma_ponderada := 0;
  v_suma_pesos := 0;
  v_num_eval := 0;

  FOR r IN
    SELECT score, proposer_level
    FROM proximidad_atestaciones_cache
    WHERE rubro_a = p_rubro_a AND rubro_b = p_rubro_b
  LOOP
    v_suma_ponderada := v_suma_ponderada + (r.score::FLOAT / 100.0) * (v_pesos->>r.proposer_level::TEXT)::FLOAT;
    v_suma_pesos := v_suma_pesos + (v_pesos->>r.proposer_level::TEXT)::FLOAT;
    v_num_eval := v_num_eval + 1;
  END LOOP;

  -- Actualizar proximidad
  UPDATE proximidades SET
    valor_actual = (v_valor_propuesto * v_peso_propuesta + v_suma_ponderada) / (v_peso_propuesta + v_suma_pesos),
    num_evaluaciones = v_num_eval,
    suma_ponderada = v_suma_ponderada,
    suma_pesos = v_suma_pesos,
    ultima_actualizacion = now()
  WHERE rubro_a = p_rubro_a AND rubro_b = p_rubro_b;

  -- Si no existe el par, insertarlo
  IF NOT FOUND THEN
    INSERT INTO proximidades (rubro_a, rubro_b, valor_propuesto, valor_actual, num_evaluaciones, suma_ponderada, suma_pesos)
    VALUES (p_rubro_a, p_rubro_b, 0, v_suma_ponderada / NULLIF(v_suma_pesos, 0), v_num_eval, v_suma_ponderada, v_suma_pesos);
  END IF;
END;
$$ LANGUAGE plpgsql;
