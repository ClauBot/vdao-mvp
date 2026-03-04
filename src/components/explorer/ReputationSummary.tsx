'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabase';
import { NIVEL_LABELS } from '@/lib/types';
import { Star, Award, BarChart2, Layers, TrendingUp } from 'lucide-react';

interface WalletSummary {
  wallet: string;
  total_received: number;
  total_emitted: number;
  avg_score_service: number | null;
  avg_score_treatment: number | null;
  active_rubros: number;
  nivel: 1 | 2 | 3 | 4;
}

interface Props {
  wallet: string;
}

/** Renders a score value (1-4) as a visual bar with color */
function ScoreBar({ score, label }: { score: number | null; label: string }) {
  if (score === null) return null;
  const rounded = Math.round(score * 10) / 10;
  const pct = ((score - 1) / 3) * 100; // 1→0%, 4→100%
  const color =
    score >= 3.5
      ? 'bg-emerald-500'
      : score >= 2.5
        ? 'bg-blue-500'
        : score >= 1.5
          ? 'bg-amber-500'
          : 'bg-red-500';

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span className="font-medium text-foreground">{rounded}/4</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${Math.max(pct, 4)}%` }}
        />
      </div>
    </div>
  );
}

function nivelBadgeVariant(nivel: number): 'outline' | 'secondary' | 'default' | 'destructive' {
  if (nivel === 4) return 'default';
  if (nivel === 3) return 'secondary';
  return 'outline';
}

export function ReputationSummary({ wallet }: Props) {
  const [summary, setSummary] = useState<WalletSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSummary() {
      setLoading(true);
      setError(null);

      try {
        // Try the Supabase view first
        const { data: viewData, error: viewError } = await supabase
          .from('resumen_wallet')
          .select('*')
          .eq('wallet', wallet.toLowerCase())
          .single();

        if (viewError && viewError.code !== 'PGRST116') {
          // PGRST116 = no rows found, which is OK
          throw viewError;
        }

        if (viewData) {
          setSummary(viewData as WalletSummary);
          return;
        }

        // Fallback: compute from atestaciones_cache
        const [receivedResult, emittedResult, userResult] = await Promise.all([
          supabase
            .from('atestaciones_cache')
            .select('score_service, score_treatment, rubro_id')
            .eq('receiver', wallet.toLowerCase()),
          supabase
            .from('atestaciones_cache')
            .select('score_service, score_treatment, rubro_id')
            .eq('attester', wallet.toLowerCase()),
          supabase
            .from('usuarios')
            .select('nivel')
            .eq('wallet', wallet.toLowerCase())
            .single(),
        ]);

        const received = receivedResult.data || [];
        const emitted = emittedResult.data || [];

        const allScoresService = received
          .map((r) => r.score_service)
          .filter(Boolean) as number[];
        const allScoresTreatment = received
          .map((r) => r.score_treatment)
          .filter(Boolean) as number[];

        const avgService =
          allScoresService.length > 0
            ? allScoresService.reduce((a, b) => a + b, 0) / allScoresService.length
            : null;
        const avgTreatment =
          allScoresTreatment.length > 0
            ? allScoresTreatment.reduce((a, b) => a + b, 0) / allScoresTreatment.length
            : null;

        const activeRubros = new Set([
          ...received.map((r) => r.rubro_id),
          ...emitted.map((r) => r.rubro_id),
        ]).size;

        setSummary({
          wallet,
          total_received: received.length,
          total_emitted: emitted.length,
          avg_score_service: avgService,
          avg_score_treatment: avgTreatment,
          active_rubros: activeRubros,
          nivel: (userResult.data?.nivel ?? 1) as 1 | 2 | 3 | 4,
        });
      } catch (err) {
        console.error('ReputationSummary error:', err);
        setError('Error cargando resumen de reputación');
      } finally {
        setLoading(false);
      }
    }

    fetchSummary();
  }, [wallet]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-8 w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20">
        <CardContent className="p-4 text-sm text-red-600 dark:text-red-400">{error}</CardContent>
      </Card>
    );
  }

  if (!summary) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          No hay datos de reputación para esta wallet.
        </CardContent>
      </Card>
    );
  }

  const totalAtestaciones = summary.total_received + summary.total_emitted;

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-sm">Reputación On-chain</span>
          </div>
          <Badge variant={nivelBadgeVariant(summary.nivel)} className="gap-1">
            <TrendingUp className="h-3 w-3" />
            Nivel {summary.nivel} — {NIVEL_LABELS[summary.nivel]}
          </Badge>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <BarChart2 className="h-3.5 w-3.5" /> Total
            </p>
            <p className="text-2xl font-bold">{totalAtestaciones}</p>
            <p className="text-xs text-muted-foreground">
              {summary.total_received} recibidas · {summary.total_emitted} emitidas
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Star className="h-3.5 w-3.5" /> Score Servicio
            </p>
            <p className="text-2xl font-bold">
              {summary.avg_score_service !== null
                ? (Math.round(summary.avg_score_service * 10) / 10).toFixed(1)
                : '—'}
            </p>
            <p className="text-xs text-muted-foreground">promedio /4</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Star className="h-3.5 w-3.5" /> Score Trato
            </p>
            <p className="text-2xl font-bold">
              {summary.avg_score_treatment !== null
                ? (Math.round(summary.avg_score_treatment * 10) / 10).toFixed(1)
                : '—'}
            </p>
            <p className="text-xs text-muted-foreground">promedio /4</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Layers className="h-3.5 w-3.5" /> Rubros
            </p>
            <p className="text-2xl font-bold">{summary.active_rubros}</p>
            <p className="text-xs text-muted-foreground">activos</p>
          </div>
        </div>

        {/* Score bars */}
        {(summary.avg_score_service !== null || summary.avg_score_treatment !== null) && (
          <div className="space-y-3">
            <ScoreBar score={summary.avg_score_service} label="Calidad del servicio" />
            <ScoreBar score={summary.avg_score_treatment} label="Calidad del trato" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
