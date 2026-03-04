'use client';

import { useState, useMemo, useCallback, useTransition } from 'react';
import type { Rubro, Proximidad } from '@/lib/types';
import { calculateProximity } from '@/lib/proximity';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  ChevronRight,
  ChevronDown,
  Search,
  RotateCcw,
  Network,
  ArrowUpDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------- Props ----------
interface RubrosTableProps {
  rubros: Rubro[];
  proximidades: Proximidad[];
  loading: boolean;
  onSelectRubro: (rubro: Rubro) => void;
  selectedRubroId?: number | null;
}

// ---------- Helper: compute avg proximity for a rubro ----------
function computeAvgProximity(rubroId: number, proximidades: Proximidad[]): number {
  const pairs = proximidades.filter(
    (p) => p.rubro_a === rubroId || p.rubro_b === rubroId
  );
  if (pairs.length === 0) return 0;
  const sum = pairs.reduce((acc, p) => acc + (p.valor_actual ?? p.valor_propuesto), 0);
  return sum / pairs.length;
}

// ---------- ProximityBar ----------
function ProximityBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  return (
    <div className="flex items-center gap-2 min-w-[80px]">
      <div className="flex-1 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-neutral-500 tabular-nums w-8 text-right">{pct}%</span>
    </div>
  );
}

// ---------- ProximityCell (for reorder mode) ----------
function ProximityCell({ value }: { value: number | undefined }) {
  if (value === undefined) return <span className="text-neutral-400 text-xs">—</span>;
  const pct = Math.round(value * 100);
  const color =
    pct >= 70
      ? 'text-green-600 dark:text-green-400'
      : pct >= 40
      ? 'text-yellow-600 dark:text-yellow-400'
      : 'text-neutral-500';
  return (
    <span className={cn('text-sm font-semibold tabular-nums', color)}>
      {pct}%
    </span>
  );
}

// ---------- Pagination ----------
const PAGE_SIZE = 20;

// ---------- Main Component ----------
export function RubrosTable({
  rubros,
  proximidades,
  loading,
  onSelectRubro,
  selectedRubroId,
}: RubrosTableProps) {
  const [search, setSearch] = useState('');
  const [hierarchical, setHierarchical] = useState(false);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(1);
  const [proximityRubro, setProximityRubro] = useState<Rubro | null>(null);
  const [, startTransition] = useTransition();

  // Build rubros map for Jaccard
  const rubrosMap = useMemo(() => {
    const m = new Map<number, { id: number; padres: number[] }>();
    rubros.forEach((r) => m.set(r.id, { id: r.id, padres: r.padres }));
    return m;
  }, [rubros]);

  // Lookup rubro by ID
  const rubroById = useMemo(() => {
    const m = new Map<number, Rubro>();
    rubros.forEach((r) => m.set(r.id, r));
    return m;
  }, [rubros]);

  // Filter by search
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return rubros;
    return rubros.filter((r) => r.nombre.toLowerCase().includes(q));
  }, [rubros, search]);

  // Proximity computation (via map for fast lookup)
  const getProximityTo = useCallback(
    (rubroId: number, targetId: number): number => {
      // Check stored values first
      const stored = proximidades.find(
        (p) =>
          (p.rubro_a === rubroId && p.rubro_b === targetId) ||
          (p.rubro_a === targetId && p.rubro_b === rubroId)
      );
      if (stored) {
        return stored.valor_actual ?? stored.valor_propuesto;
      }
      // Jaccard fallback
      return calculateProximity(rubroId, targetId, rubrosMap);
    },
    [proximidades, rubrosMap]
  );

  // Sort by proximity to selected rubro
  const sorted = useMemo(() => {
    if (!proximityRubro) return filtered;
    const withProx = filtered.map((r) => ({
      r,
      prox: r.id === proximityRubro.id ? 1.1 : getProximityTo(r.id, proximityRubro.id),
    }));
    withProx.sort((a, b) => b.prox - a.prox);
    return withProx.map((x) => x.r);
  }, [filtered, proximityRubro, getProximityTo]);

  const proximityMap = useMemo(() => {
    if (!proximityRubro) return null;
    const m = new Map<number, number>();
    filtered.forEach((r) => {
      if (r.id === proximityRubro.id) {
        m.set(r.id, 1);
      } else {
        m.set(r.id, getProximityTo(r.id, proximityRubro.id));
      }
    });
    return m;
  }, [filtered, proximityRubro, getProximityTo]);

  // Hierarchical view: roots + children
  const roots = useMemo(() => sorted.filter((r) => r.padres.length === 0), [sorted]);
  const childrenOf = useMemo(() => {
    const m = new Map<number, Rubro[]>();
    sorted.forEach((r) => {
      r.padres.forEach((pid) => {
        const arr = m.get(pid) ?? [];
        arr.push(r);
        m.set(pid, arr);
      });
    });
    return m;
  }, [sorted]);

  // Flatten hierarchical with expand/collapse
  const hierarchicalRows = useMemo(() => {
    if (!hierarchical) return [];
    const rows: Array<{ rubro: Rubro; depth: number }> = [];
    function traverse(id: number, depth: number) {
      const r = rubroById.get(id);
      if (!r) return;
      rows.push({ rubro: r, depth });
      if (expanded.has(id)) {
        const kids = childrenOf.get(id) ?? [];
        kids.forEach((kid) => traverse(kid.id, depth + 1));
      }
    }
    roots.forEach((r) => traverse(r.id, 0));
    return rows;
  }, [hierarchical, roots, expanded, childrenOf, rubroById]);

  const flatRows = useMemo(() => sorted.map((r) => ({ rubro: r, depth: 0 })), [sorted]);
  const displayRows = hierarchical ? hierarchicalRows : flatRows;

  // Pagination
  const totalPages = Math.ceil(displayRows.length / PAGE_SIZE);
  const pageRows = displayRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (v: string) => {
    setSearch(v);
    setPage(1);
  };

  const handleToggleExpand = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleProximityClick = (rubro: Rubro) => {
    startTransition(() => {
      if (proximityRubro?.id === rubro.id) {
        setProximityRubro(null);
      } else {
        setProximityRubro(rubro);
        setPage(1);
      }
    });
  };

  const handleResetProximity = () => {
    setProximityRubro(null);
    setPage(1);
  };

  // ---------- Skeleton ----------
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            placeholder="Buscar rubro..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* View toggle + proximity indicator */}
        <div className="flex items-center gap-4">
          {proximityRubro && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg text-sm">
              <Network className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span className="text-blue-700 dark:text-blue-300 font-medium">
                Proximidad a: {proximityRubro.nombre}
              </span>
              <button
                onClick={handleResetProximity}
                className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Switch
              id="view-toggle"
              checked={hierarchical}
              onCheckedChange={(v) => {
                setHierarchical(v);
                setPage(1);
              }}
            />
            <Label htmlFor="view-toggle" className="text-sm cursor-pointer">
              {hierarchical ? 'Jerárquico' : 'Plano'}
            </Label>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="text-sm text-neutral-500">
        {sorted.length} rubro{sorted.length !== 1 ? 's' : ''} mostrado{sorted.length !== 1 ? 's' : ''}
        {search && ` para "${search}"`}
        {proximityRubro && ' · ordenados por proximidad'}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-500 uppercase tracking-wider">
          <span>Rubro</span>
          <span className="hidden sm:block text-center w-32">Padre(s)</span>
          <span className="text-center w-28">Prox. Prom.</span>
          {proximityRubro && <span className="text-center w-20">A Selec.</span>}
          <span className="text-center w-16">Status</span>
        </div>

        {/* Rows */}
        {pageRows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
            <Search className="h-8 w-8 mb-3 opacity-40" />
            <p>Sin resultados</p>
          </div>
        ) : (
          <div>
            {pageRows.map(({ rubro, depth }) => {
              const isSelected = selectedRubroId === rubro.id;
              const isProximitySelected = proximityRubro?.id === rubro.id;
              const hasChildren = (childrenOf.get(rubro.id)?.length ?? 0) > 0;
              const avgProx = computeAvgProximity(rubro.id, proximidades);
              const proxToSelected = proximityMap?.get(rubro.id);

              return (
                <div
                  key={rubro.id}
                  onClick={() => {
                    onSelectRubro(rubro);
                    handleProximityClick(rubro);
                  }}
                  className={cn(
                    'grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-4 py-3 border-b border-neutral-100 dark:border-neutral-800/60 cursor-pointer transition-colors last:border-0',
                    isSelected || isProximitySelected
                      ? 'bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100/80 dark:hover:bg-blue-950/60'
                      : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                  )}
                >
                  {/* Name */}
                  <div
                    className="flex items-center gap-1 min-w-0"
                    style={{ paddingLeft: `${depth * 20}px` }}
                  >
                    {hierarchical && hasChildren && (
                      <button
                        onClick={(e) => handleToggleExpand(rubro.id, e)}
                        className="shrink-0 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                      >
                        {expanded.has(rubro.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                    )}
                    {hierarchical && !hasChildren && depth > 0 && (
                      <span className="w-4 shrink-0" />
                    )}
                    <span className="font-medium text-sm text-neutral-900 dark:text-neutral-100 truncate">
                      {isProximitySelected && (
                        <span className="mr-1.5 text-blue-500">★</span>
                      )}
                      {rubro.nombre}
                    </span>
                  </div>

                  {/* Parents */}
                  <div className="hidden sm:flex items-center gap-1 flex-wrap w-32 justify-center">
                    {rubro.padres.length === 0 ? (
                      <Badge variant="secondary" className="text-xs">Raíz</Badge>
                    ) : (
                      rubro.padres.slice(0, 2).map((pid) => {
                        const parent = rubroById.get(pid);
                        return (
                          <Badge key={pid} variant="outline" className="text-xs truncate max-w-[5rem]">
                            {parent?.nombre ?? `#${pid}`}
                          </Badge>
                        );
                      })
                    )}
                    {rubro.padres.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{rubro.padres.length - 2}
                      </Badge>
                    )}
                  </div>

                  {/* Avg proximity bar */}
                  <div className="flex items-center justify-center w-28">
                    <ProximityBar value={avgProx} />
                  </div>

                  {/* Proximity to selected */}
                  {proximityRubro && (
                    <div className="flex items-center justify-center w-20">
                      <ProximityCell value={proxToSelected} />
                    </div>
                  )}

                  {/* Status */}
                  <div className="flex items-center justify-center w-16">
                    <Badge
                      variant={rubro.activo ? 'default' : 'secondary'}
                      className={cn(
                        'text-xs',
                        rubro.activo
                          ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400 border-green-200 dark:border-green-800 hover:bg-green-100'
                          : 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
                      )}
                    >
                      {rubro.activo ? 'Activo' : 'Pendiente'}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-400">
          <span>
            Página {page} de {totalPages} · {displayRows.length} rubros
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              ‹ Anterior
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let p: number;
              if (totalPages <= 5) p = i + 1;
              else if (page <= 3) p = i + 1;
              else if (page >= totalPages - 2) p = totalPages - 4 + i;
              else p = page - 2 + i;
              return (
                <Button
                  key={p}
                  variant={page === p ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPage(p)}
                  className="w-8 h-8 p-0"
                >
                  {p}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Siguiente ›
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export { ArrowUpDown };
