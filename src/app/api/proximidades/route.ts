import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
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
  const { searchParams } = new URL(request.url);
  const rubroA = searchParams.get('rubro_a');
  const rubroB = searchParams.get('rubro_b');

  try {
    const supabase = createServiceClient();

    let query = supabase
      .from('proximidades')
      .select('rubro_a, rubro_b, valor_propuesto, valor_actual, num_evaluaciones');

    if (rubroA) query = query.eq('rubro_a', parseInt(rubroA));
    if (rubroB) query = query.eq('rubro_b', parseInt(rubroB));

    const { data, error } = await query;

    if (!error && data && data.length > 0) {
      return NextResponse.json({ proximidades: data, source: 'supabase' });
    }
  } catch {
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
  try {
    const body = await request.json();
    const { rubro_a, rubro_b, score, proposer, proposer_level, uid } = body;

    if (!rubro_a || !rubro_b || !score || !proposer) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const level = Math.min(4, Math.max(1, Number(proposer_level) || 1)) as 1 | 2 | 3 | 4;
    const scoreFloat = Number(score) / 100;

    // Normalize rubro order (smaller id first)
    const [ra, rb] = rubro_a < rubro_b ? [rubro_a, rubro_b] : [rubro_b, rubro_a];

    const supabase = createServiceClient();

    // Store attestation cache
    if (uid) {
      await supabase.from('proximidad_atestaciones_cache').upsert({
        uid,
        rubro_a: ra,
        rubro_b: rb,
        score,
        proposer,
        proposer_level: level,
        timestamp: new Date().toISOString(),
      });
    }

    // Get current proximity entry
    const { data: existing } = await supabase
      .from('proximidades')
      .select('valor_propuesto, valor_actual, num_evaluaciones')
      .eq('rubro_a', ra)
      .eq('rubro_b', rb)
      .single();

    let newValorActual: number;
    let newNumEvaluaciones: number;

    if (existing) {
      // Recalculate valor_actual with weighted formula:
      // valor_actual = (valor_propuesto * SEED_WEIGHT + Σ(score_i * weight_i)) / (SEED_WEIGHT + Σ(weight_i))
      //
      // Simplified incremental update:
      // current_total_weight = SEED_WEIGHT + (num_evaluaciones * avg_weight_per_eval)
      // We approximate by tracking numerator/denominator via num_evaluaciones
      //
      // For simplicity: use the stored valor_actual as the previous weighted average
      // and apply incremental update:
      // new_avg = (old_avg * old_total_weight + new_score * new_weight) / (old_total_weight + new_weight)

      const evalWeight = LEVEL_WEIGHTS[level] ?? 1;
      const prevValor = existing.valor_actual ?? existing.valor_propuesto;
      const prevNumEval = existing.num_evaluaciones ?? 0;
      // Approximate old total weight: SEED_WEIGHT + prevNumEval (assume avg weight 2.5)
      const oldTotalWeight = SEED_WEIGHT + prevNumEval * 2.5;
      const newTotalWeight = oldTotalWeight + evalWeight;

      newValorActual = Math.min(1, Math.max(0, (prevValor * oldTotalWeight + scoreFloat * evalWeight) / newTotalWeight));
      newNumEvaluaciones = prevNumEval + 1;

      await supabase
        .from('proximidades')
        .update({
          valor_actual: newValorActual,
          num_evaluaciones: newNumEvaluaciones,
          ultima_actualizacion: new Date().toISOString(),
        })
        .eq('rubro_a', ra)
        .eq('rubro_b', rb);
    } else {
      // New proximity pair — seed weight + this evaluation
      const evalWeight = LEVEL_WEIGHTS[level] ?? 1;
      newValorActual = (scoreFloat * evalWeight) / (SEED_WEIGHT + evalWeight);
      newNumEvaluaciones = 1;

      // Find proposed value from seed
      const seedEntry = (proximidadesData as SeedProximidad[]).find(
        (p) => (p.rubro_a === ra && p.rubro_b === rb) || (p.rubro_a === rb && p.rubro_b === ra)
      );
      const valorPropuesto = seedEntry?.valor_propuesto ?? 0;

      // Recalculate with proposed
      newValorActual = (valorPropuesto * SEED_WEIGHT + scoreFloat * evalWeight) / (SEED_WEIGHT + evalWeight);

      await supabase.from('proximidades').insert({
        rubro_a: ra,
        rubro_b: rb,
        valor_propuesto: valorPropuesto,
        valor_actual: newValorActual,
        num_evaluaciones: newNumEvaluaciones,
        ultima_actualizacion: new Date().toISOString(),
      });
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
