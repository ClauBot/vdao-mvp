import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { applyRateLimit } from '@/lib/api-guard';
import { isValidWallet } from '@/lib/sanitize';
import proximidadesData from '@/config/proximidades-seed.json';

interface SeedProximidad {
  rubro_a: number;
  rubro_b: number;
  valor_propuesto: number;
  codigo_a?: string;
  codigo_b?: string;
}

// Weight per proposer level
const LEVEL_WEIGHTS: Record<number, number> = { 1: 1, 2: 2, 3: 4, 4: 8 };
// Initial "seed weight" — how much the proposed value resists change
const SEED_WEIGHT = 10;

// ---------- GET /api/proximidades ----------
export async function GET(request: NextRequest) {
  const blocked = applyRateLimit(request);
  if (blocked) return blocked;

  const { searchParams } = new URL(request.url);
  const rubroA = searchParams.get('rubro_a');
  const rubroB = searchParams.get('rubro_b');

  try {
    const pool = getPool();

    let queryText = `
      SELECT rubro_a, rubro_b, valor_propuesto, valor_actual, num_evaluaciones
      FROM proximidades
      WHERE 1=1
    `;
    const params: number[] = [];

    if (rubroA) {
      params.push(parseInt(rubroA));
      queryText += ` AND rubro_a = $${params.length}`;
    }
    if (rubroB) {
      params.push(parseInt(rubroB));
      queryText += ` AND rubro_b = $${params.length}`;
    }

    const { rows } = await pool.query(queryText, params);

    if (rows.length > 0) {
      return NextResponse.json({ proximidades: rows, source: 'pg' });
    }
  } catch (e) {
    console.error('GET /api/proximidades error:', e);
    // fall through
  }

  // Fallback: seed data
  const seed = proximidadesData as SeedProximidad[];
  let filtered = seed;
  if (rubroA) filtered = filtered.filter((p) => p.rubro_a === parseInt(rubroA) || p.rubro_b === parseInt(rubroA));
  if (rubroB) filtered = filtered.filter((p) => p.rubro_a === parseInt(rubroB) || p.rubro_b === parseInt(rubroB));

  const proximidades = filtered.map((p) => ({
    rubro_a: p.rubro_a,
    rubro_b: p.rubro_b,
    valor_propuesto: p.valor_propuesto,
    valor_actual: null,
    num_evaluaciones: 0,
  }));

  return NextResponse.json({ proximidades, source: 'seed' });
}

// ---------- POST /api/proximidades ----------
// Called after an EAS proximity attestation is created on-chain
export async function POST(request: NextRequest) {
  const blocked = applyRateLimit(request);
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const { rubro_a, rubro_b, score, proposer, proposer_level, uid } = body;

    if (!rubro_a || !rubro_b || !score || !proposer) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    if (!isValidWallet(proposer)) {
      return NextResponse.json({ error: 'Formato de wallet inválido' }, { status: 400 });
    }

    const level = Math.min(4, Math.max(1, Number(proposer_level) || 1)) as 1 | 2 | 3 | 4;
    const scoreFloat = Number(score) / 100;

    // Normalize rubro order (smaller id first)
    const [ra, rb] = rubro_a < rubro_b ? [rubro_a, rubro_b] : [rubro_b, rubro_a];

    const pool = getPool();

    // Store attestation cache
    if (uid) {
      await pool.query(
        `INSERT INTO proximidad_atestaciones_cache
          (uid, rubro_a, rubro_b, score, proposer, proposer_level, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (uid) DO UPDATE SET
           score = EXCLUDED.score,
           proposer_level = EXCLUDED.proposer_level,
           created_at = EXCLUDED.created_at`,
        [uid, ra, rb, score, proposer, level, new Date().toISOString()]
      );
    }

    // Get current proximity entry
    const existingRes = await pool.query(
      `SELECT valor_propuesto, valor_actual, num_evaluaciones
       FROM proximidades WHERE rubro_a = $1 AND rubro_b = $2`,
      [ra, rb]
    );

    let newValorActual: number;
    let newNumEvaluaciones: number;

    if (existingRes.rows.length > 0) {
      const existing = existingRes.rows[0];
      const evalWeight = LEVEL_WEIGHTS[level] ?? 1;
      const prevValor = existing.valor_actual ?? existing.valor_propuesto;
      const prevNumEval = existing.num_evaluaciones ?? 0;
      const oldTotalWeight = SEED_WEIGHT + prevNumEval * 2.5;
      const newTotalWeight = oldTotalWeight + evalWeight;

      newValorActual = Math.min(
        1,
        Math.max(0, (prevValor * oldTotalWeight + scoreFloat * evalWeight) / newTotalWeight)
      );
      newNumEvaluaciones = prevNumEval + 1;

      await pool.query(
        `UPDATE proximidades
         SET valor_actual = $1, num_evaluaciones = $2, ultima_actualizacion = $3
         WHERE rubro_a = $4 AND rubro_b = $5`,
        [newValorActual, newNumEvaluaciones, new Date().toISOString(), ra, rb]
      );
    } else {
      const evalWeight = LEVEL_WEIGHTS[level] ?? 1;
      newNumEvaluaciones = 1;

      const seedEntry = (proximidadesData as SeedProximidad[]).find(
        (p) => (p.rubro_a === ra && p.rubro_b === rb) || (p.rubro_a === rb && p.rubro_b === ra)
      );
      const valorPropuesto = seedEntry?.valor_propuesto ?? 0;

      newValorActual =
        (valorPropuesto * SEED_WEIGHT + scoreFloat * evalWeight) / (SEED_WEIGHT + evalWeight);

      await pool.query(
        `INSERT INTO proximidades (rubro_a, rubro_b, valor_propuesto, valor_actual, num_evaluaciones, ultima_actualizacion)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [ra, rb, valorPropuesto, newValorActual, newNumEvaluaciones, new Date().toISOString()]
      );
    }

    return NextResponse.json({
      success: true,
      rubro_a: ra,
      rubro_b: rb,
      valor_actual: newValorActual,
      num_evaluaciones: newNumEvaluaciones,
    });
  } catch (e) {
    const err = e as Error;
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 });
  }
}
