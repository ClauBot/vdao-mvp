'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Rubro, Proximidad } from '@/lib/types';
import { calculateProximity } from '@/lib/proximity';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ChevronRight,
  Network,
  Users,
  Award,
  ArrowRight,
  Layers,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RubroDetailProps {
  rubro: Rubro | null;
  rubros: Rubro[];
  proximidades: Proximidad[];
  open: boolean;
  onClose: () => void;
  onEvaluar: (rubro: Rubro) => void;
  onEdit: (rubro: Rubro) => void;
  userLevel: 1 | 2 | 3 | 4;
  isConnected: boolean;
}

interface ClosestRubro {
  rubro: Rubro;
  prox: number;
}

export function RubroDetail({
  rubro,
  rubros,
  proximidades,
  open,
  onClose,
  onEvaluar,
  onEdit,
  userLevel,
  isConnected,
}: RubroDetailProps) {
  const [attestationCount, setAttestationCount] = useState<number | null>(null);
  const [topWallets, setTopWallets] = useState<Array<{ wallet: string; avg_score: number; count: number }>>([]);

  const rubroById = useMemo(() => {
    const m = new Map<number, Rubro>();
    rubros.forEach((r) => m.set(r.id, r));
    return m;
  }, [rubros]);

  const rubrosMap = useMemo(() => {
    const m = new Map<number, { id: number; padres: number[] }>();
    rubros.forEach((r) => m.set(r.id, { id: r.id, padres: r.padres }));
    return m;
  }, [rubros]);

  // Fetch attestation count and top wallets for this rubro
  useEffect(() => {
    if (!rubro) return;
    setAttestationCount(null);
    setTopWallets([]);
    fetch(`/api/atestaciones?rubro_id=${rubro.id}&count_only=true`)
      .then((res) => res.json())
      .then((data) => setAttestationCount(data.count ?? 0))
      .catch(() => setAttestationCount(0));
    fetch(`/api/atestaciones?rubro_id=${rubro.id}&top_wallets=true`)
      .then((res) => res.json())
      .then((data) => setTopWallets(data.wallets ?? []))
      .catch(() => setTopWallets([]));
  }, [rubro]);

  const parents = useMemo(() => {
    if (!rubro) return [];
    return rubro.padres.map((pid) => rubroById.get(pid)).filter(Boolean) as Rubro[];
  }, [rubro, rubroById]);

  const children = useMemo(() => {
    if (!rubro) return [];
    return rubros.filter((r) => r.padres.includes(rubro.id));
  }, [rubro, rubros]);

  const top10Closest = useMemo((): ClosestRubro[] => {
    if (!rubro) return [];
    return rubros
      .filter((r) => r.id !== rubro.id)
      .map((r) => {
        const stored = proximidades.find(
          (p) =>
            (p.rubro_a === rubro.id && p.rubro_b === r.id) ||
            (p.rubro_a === r.id && p.rubro_b === rubro.id)
        );
        const prox = stored
          ? (stored.valor_actual ?? stored.valor_propuesto)
          : calculateProximity(rubro.id, r.id, rubrosMap);
        return { rubro: r, prox };
      })
      .sort((a, b) => b.prox - a.prox)
      .slice(0, 10);
  }, [rubro, rubros, proximidades, rubrosMap]);

  if (!rubro) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 flex-1 min-w-0">
              <DialogTitle className="text-xl font-bold text-neutral-900 dark:text-neutral-100 pr-8">
                {rubro.nombre}
              </DialogTitle>
              {rubro.nombre_en && (
                <p className="text-sm text-neutral-500 italic">{rubro.nombre_en}</p>
              )}
              <div className="flex flex-wrap gap-2 pt-1">
                <Badge variant={rubro.activo ? 'default' : 'secondary'}
                  className={cn(
                    rubro.activo
                      ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400 hover:bg-green-100'
                      : ''
                  )}
                >
                  {rubro.activo ? 'Activo' : 'Pendiente validación'}
                </Badge>
                {parents.length === 0 && (
                  <Badge variant="outline">Categoría raíz</Badge>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </DialogHeader>

        {/* Body */}
        <ScrollArea className="flex-1 px-6 py-4">
          <div className="space-y-6">
            {/* Description */}
            {rubro.descripcion && (
              <div>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  {rubro.descripcion}
                </p>
              </div>
            )}

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-3 text-center">
                <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {attestationCount ?? '…'}
                </div>
                <div className="text-xs text-neutral-500 mt-0.5">Atestaciones</div>
              </div>
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-3 text-center">
                <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {children.length}
                </div>
                <div className="text-xs text-neutral-500 mt-0.5">Sub-rubros</div>
              </div>
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-3 text-center">
                <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {proximidades.filter((p) => p.rubro_a === rubro.id || p.rubro_b === rubro.id).length}
                </div>
                <div className="text-xs text-neutral-500 mt-0.5">Conexiones</div>
              </div>
            </div>

            <Separator />

            {/* Parents */}
            {parents.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-2 mb-3">
                  <Layers className="h-4 w-4" />
                  Padre(s)
                </h3>
                <div className="flex flex-wrap gap-2">
                  {parents.map((p) => (
                    <Badge key={p.id} variant="outline" className="text-sm px-3 py-1">
                      {p.nombre}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Children */}
            {children.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-2 mb-3">
                  <ChevronRight className="h-4 w-4" />
                  Sub-rubros ({children.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {children.map((c) => (
                    <Badge key={c.id} variant="secondary" className="text-sm px-3 py-1">
                      {c.nombre}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Top 10 Closest Rubros */}
            <div>
              <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-2 mb-3">
                <Network className="h-4 w-4" />
                Top 10 Rubros Más Cercanos
              </h3>
              <div className="space-y-1.5">
                {top10Closest.map(({ rubro: r, prox }, i) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <span className="text-xs text-neutral-400 w-5 text-right tabular-nums">
                      {i + 1}.
                    </span>
                    <span className="flex-1 text-sm text-neutral-800 dark:text-neutral-200 truncate">
                      {r.nombre}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-16 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${Math.round(prox * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-neutral-500 tabular-nums w-8 text-right">
                        {Math.round(prox * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top wallets */}
            <div>
              <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-2 mb-3">
                <Users className="h-4 w-4" />
                Top Wallets en este Rubro
              </h3>
              {topWallets.length > 0 ? (
                <div className="space-y-2">
                  {topWallets.map((w, i) => (
                    <div key={w.wallet} className="flex items-center gap-3 py-1.5">
                      <span className="text-xs text-neutral-400 w-5 text-right">{i + 1}.</span>
                      <span className="font-mono text-sm text-neutral-700 dark:text-neutral-300 flex-1 truncate">
                        {w.wallet.slice(0, 6)}...{w.wallet.slice(-4)}
                      </span>
                      <div className="flex items-center gap-1">
                        <Award className="h-3.5 w-3.5 text-yellow-500" />
                        <span className="text-sm font-medium">{w.avg_score}</span>
                      </div>
                      <span className="text-xs text-neutral-500">{w.count} atestaciones</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-neutral-400 italic">
                  Sin atestaciones en este rubro aún.
                </p>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3">
          <div className="text-xs text-neutral-400">ID: #{rubro.id}</div>
          <div className="flex gap-2">
            {isConnected && userLevel >= 4 && (
              <Button variant="outline" size="sm" onClick={() => onEdit(rubro)}>
                Editar
              </Button>
            )}
            {isConnected && (
              <Button
                size="sm"
                onClick={() => onEvaluar(rubro)}
                className="gap-2"
              >
                <Network className="h-4 w-4" />
                Evaluar Proximidad
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            )}
            {!isConnected && (
              <p className="text-xs text-neutral-500 italic self-center">
                Conecta tu wallet para evaluar
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
