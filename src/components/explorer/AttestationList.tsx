'use client';

import { useEffect, useState, useMemo } from 'react';
import { AttestationCard } from './AttestationCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
// supabase replaced with fetch
import { INTERACTION_TYPES, type Atestacion } from '@/lib/types';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
  Inbox,
} from 'lucide-react';

const PAGE_SIZE = 20;

type SortKey = 'date_desc' | 'date_asc' | 'score_service_desc' | 'score_treatment_desc';

interface FilterState {
  rubro: string; // rubro id or 'all'
  nature: string; // '0' | '1' | '2' | 'all'
  dateFrom: string;
  dateTo: string;
  sort: SortKey;
}

interface Props {
  wallet: string;
}

function AttestationSkeleton() {
  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="h-4 w-48" />
      <div className="flex gap-3">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-24" />
      </div>
    </div>
  );
}

interface TabSectionProps {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}

function TabButton({ label, count, active, onClick }: TabSectionProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      }`}
    >
      {label}
      <span
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
          active ? 'bg-primary-foreground/20' : 'bg-muted'
        }`}
      >
        {count}
      </span>
    </button>
  );
}

export function AttestationList({ wallet }: Props) {
  const [received, setReceived] = useState<Atestacion[]>([]);
  const [emitted, setEmitted] = useState<Atestacion[]>([]);
  const [rubros, setRubros] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'received' | 'emitted'>('received');
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<FilterState>({
    rubro: 'all',
    nature: 'all',
    dateFrom: '',
    dateTo: '',
    sort: 'date_desc',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchRubro, setSearchRubro] = useState('');

  // Fetch all attestations from Supabase cache
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const normalizedWallet = wallet.toLowerCase();

        const [attRes, rubrosRes] = await Promise.all([
          fetch(`/api/atestaciones?wallet=${encodeURIComponent(normalizedWallet)}`).then((r) => r.json()),
          fetch('/api/rubros?limit=500').then((r) => r.json()),
        ]);

        setReceived((attRes.received || []) as Atestacion[]);
        setEmitted((attRes.emitted || []) as Atestacion[]);

        // Build rubro lookup
        const rubroMap: Record<number, string> = {};
        ((rubrosRes.rubros || []) as Array<{ id: number; nombre: string }>).forEach((r) => {
          rubroMap[r.id] = r.nombre;
        });
        setRubros(rubroMap);
      } catch (err) {
        console.error('AttestationList fetch error:', err);
        setError('Error cargando atestaciones. Intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [wallet]);

  // Reset page when filter/tab changes
  useEffect(() => {
    setPage(1);
  }, [filter, activeTab]);

  // Apply filters + sort
  const activeList = activeTab === 'received' ? received : emitted;

  const filtered = useMemo(() => {
    let list = [...activeList];

    if (filter.rubro !== 'all') {
      list = list.filter((a) => String(a.rubro_id) === filter.rubro);
    }
    if (filter.nature !== 'all') {
      list = list.filter((a) => String(a.interaction_type) === filter.nature);
    }
    if (filter.dateFrom) {
      const from = new Date(filter.dateFrom).getTime();
      list = list.filter((a) => new Date(a.created_at).getTime() >= from);
    }
    if (filter.dateTo) {
      const to = new Date(filter.dateTo + 'T23:59:59').getTime();
      list = list.filter((a) => new Date(a.created_at).getTime() <= to);
    }

    switch (filter.sort) {
      case 'date_asc':
        list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'date_desc':
        list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'score_service_desc':
        list.sort((a, b) => b.score_service - a.score_service);
        break;
      case 'score_treatment_desc':
        list.sort((a, b) => b.score_treatment - a.score_treatment);
        break;
    }

    return list;
  }, [activeList, filter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Unique rubro IDs across all attestations for filter dropdown
  const allRubroIds = useMemo(() => {
    const ids = new Set([...received, ...emitted].map((a) => a.rubro_id));
    return Array.from(ids);
  }, [received, emitted]);

  const filteredRubroOptions = allRubroIds.filter((id) => {
    const nombre = rubros[id] || String(id);
    return nombre.toLowerCase().includes(searchRubro.toLowerCase());
  });

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <AttestationSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/20 dark:text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tab buttons */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-1">
          <TabButton
            label="Recibidas"
            count={received.length}
            active={activeTab === 'received'}
            onClick={() => setActiveTab('received')}
          />
          <TabButton
            label="Emitidas"
            count={emitted.length}
            active={activeTab === 'emitted'}
            onClick={() => setActiveTab('emitted')}
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => setShowFilters((v) => !v)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
          {(filter.rubro !== 'all' ||
            filter.nature !== 'all' ||
            filter.dateFrom ||
            filter.dateTo) && (
            <span className="ml-0.5 h-2 w-2 rounded-full bg-blue-500" />
          )}
        </Button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="rounded-lg border border-border bg-muted/30 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Rubro filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Rubro</label>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar rubro..."
                value={searchRubro}
                onChange={(e) => setSearchRubro(e.target.value)}
                className="pl-7 h-8 text-xs"
              />
            </div>
            {searchRubro && (
              <div className="max-h-32 overflow-auto rounded border bg-background text-xs">
                <button
                  className="w-full px-2 py-1 text-left hover:bg-muted"
                  onClick={() => {
                    setFilter((f) => ({ ...f, rubro: 'all' }));
                    setSearchRubro('');
                  }}
                >
                  Todos
                </button>
                {filteredRubroOptions.map((id) => (
                  <button
                    key={id}
                    className={`w-full px-2 py-1 text-left hover:bg-muted ${
                      filter.rubro === String(id) ? 'bg-primary/10 font-medium' : ''
                    }`}
                    onClick={() => {
                      setFilter((f) => ({ ...f, rubro: String(id) }));
                      setSearchRubro(rubros[id] || String(id));
                    }}
                  >
                    {rubros[id] || `Rubro #${id}`}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Nature filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Naturaleza</label>
            <Select
              value={filter.nature}
              onValueChange={(v) => setFilter((f) => ({ ...f, nature: v }))}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {INTERACTION_TYPES.map((t, i) => (
                  <SelectItem key={i} value={String(i)}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date range */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Desde</label>
            <Input
              type="date"
              value={filter.dateFrom}
              onChange={(e) => setFilter((f) => ({ ...f, dateFrom: e.target.value }))}
              className="h-8 text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Hasta</label>
            <Input
              type="date"
              value={filter.dateTo}
              onChange={(e) => setFilter((f) => ({ ...f, dateTo: e.target.value }))}
              className="h-8 text-xs"
            />
          </div>

          {/* Sort */}
          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-medium text-muted-foreground">Ordenar por</label>
            <Select
              value={filter.sort}
              onValueChange={(v) => setFilter((f) => ({ ...f, sort: v as SortKey }))}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date_desc">Fecha (más reciente)</SelectItem>
                <SelectItem value="date_asc">Fecha (más antigua)</SelectItem>
                <SelectItem value="score_service_desc">Score Servicio (mayor)</SelectItem>
                <SelectItem value="score_treatment_desc">Score Trato (mayor)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reset */}
          <div className="sm:col-span-2 flex items-end">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => {
                setFilter({
                  rubro: 'all',
                  nature: 'all',
                  dateFrom: '',
                  dateTo: '',
                  sort: 'date_desc',
                });
                setSearchRubro('');
              }}
            >
              Limpiar filtros
            </Button>
          </div>
        </div>
      )}

      {/* Results count */}
      <p className="text-xs text-muted-foreground">
        {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
        {filtered.length !== activeList.length && ` (filtrado de ${activeList.length})`}
      </p>

      {/* Attestation cards */}
      {paginated.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
          <Inbox className="h-10 w-10 opacity-30" />
          <p className="text-sm">
            {activeList.length === 0
              ? `No hay atestaciones ${activeTab === 'received' ? 'recibidas' : 'emitidas'} aún`
              : 'No hay resultados con los filtros actuales'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {paginated.map((att) => (
            <AttestationCard
              key={att.uid}
              attestation={att}
              rubroNombre={rubros[att.rubro_id] || `Rubro #${att.rubro_id}`}
              viewMode={activeTab}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" /> Anterior
          </Button>

          <span className="text-xs text-muted-foreground">
            Página {page} de {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="gap-1"
          >
            Siguiente <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
