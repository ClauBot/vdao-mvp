'use client';

import { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { Network, Plus, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  RubrosTable,
  RubroDetail,
  CreateRubroModal,
  EditRubroModal,
  ProximityEvaluator,
} from '@/components/coru';
import { useRubros, useProximidades, useUserLevel } from '@/hooks/useRubros';
import type { Rubro } from '@/lib/types';

export default function CoRuPage() {
  const { address, isConnected } = useAccount();
  const userLevel = useUserLevel(address);

  const { rubros, total, loading, refetch } = useRubros();
  const { proximidades, loading: proxLoading } = useProximidades();

  // Modal state
  const [selectedRubro, setSelectedRubro] = useState<Rubro | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Rubro | null>(null);
  const [evaluatorOpen, setEvaluatorOpen] = useState(false);
  const [evaluatorSource, setEvaluatorSource] = useState<Rubro | null>(null);

  // Stats
  const activeCount = rubros.filter((r) => r.activo).length;
  const pendingCount = total - activeCount;
  const rootCount = rubros.filter((r) => r.padres.length === 0).length;
  const multiParentCount = rubros.filter((r) => r.padres.length > 1).length;

  const handleSelectRubro = useCallback((rubro: Rubro) => {
    setSelectedRubro(rubro);
    setDetailOpen(true);
  }, []);

  const handleOpenEvaluator = useCallback((rubro: Rubro) => {
    setEvaluatorSource(rubro);
    setDetailOpen(false);
    setEvaluatorOpen(true);
  }, []);

  const handleOpenEdit = useCallback((rubro: Rubro) => {
    setEditTarget(rubro);
    setDetailOpen(false);
    setEditOpen(true);
  }, []);

  const handleCreated = useCallback(
    () => {
      refetch();
      setCreateOpen(false);
    },
    [refetch]
  );

  const handleUpdated = useCallback(
    () => {
      refetch();
      setEditOpen(false);
    },
    [refetch]
  );

  const handleEvaluationCompleted = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <TooltipProvider>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                Constelación de Rubros
              </h1>
              <Badge variant="secondary" className="text-base px-2 py-0.5">
                CoRu
              </Badge>
            </div>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm max-w-xl">
              {total} rubros organizados como grafo dirigido acíclico (DAG). Haz click en
              cualquier rubro para explorar su proximidad con el resto.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {isConnected && userLevel >= 2 ? (
              <Button
                onClick={() => setCreateOpen(true)}
                size="sm"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Proponer Rubro
              </Button>
            ) : isConnected ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="outline" disabled className="gap-2">
                    <Plus className="h-4 w-4" />
                    Proponer Rubro
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Requiere nivel 2 (Comunidad) o superior
                </TooltipContent>
              </Tooltip>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="outline" disabled className="gap-2">
                    <Plus className="h-4 w-4" />
                    Proponer Rubro
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Conecta tu wallet para proponer rubros
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            label="Total Rubros"
            value={loading ? '…' : total.toString()}
            icon={<Network className="h-4 w-4" />}
            color="blue"
          />
          <StatCard
            label="Activos"
            value={loading ? '…' : activeCount.toString()}
            color="green"
          />
          <StatCard
            label="Pendientes"
            value={loading ? '…' : pendingCount.toString()}
            color="yellow"
          />
          <StatCard
            label="Multi-padre"
            value={loading ? '…' : multiParentCount.toString()}
            suffix={`/ ${rootCount} raíz`}
            color="purple"
          />
        </div>

        {/* Info banner for proximity mode */}
        <div className="flex items-start gap-2 px-4 py-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900 text-sm text-blue-700 dark:text-blue-300">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          <span>
            <strong>Tip:</strong> Haz click en cualquier rubro para ver su detalle y activar el{' '}
            <strong>modo proximidad</strong> — la tabla se reordena mostrando los rubros más
            cercanos primero. Usa el toggle para alternar entre vista{' '}
            <strong>plana</strong> y <strong>jerárquica</strong>.
          </span>
        </div>

        <Separator />

        {/* Main table */}
        <RubrosTable
          rubros={rubros}
          proximidades={proximidades}
          loading={loading || proxLoading}
          onSelectRubro={handleSelectRubro}
          selectedRubroId={selectedRubro?.id}
        />
      </div>

      {/* ---- Modals ---- */}

      {/* Rubro Detail */}
      <RubroDetail
        rubro={selectedRubro}
        rubros={rubros}
        proximidades={proximidades}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onEvaluar={handleOpenEvaluator}
        onEdit={handleOpenEdit}
        userLevel={userLevel}
        isConnected={isConnected}
      />

      {/* Create Rubro */}
      <CreateRubroModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        rubros={rubros}
        walletAddress={address ?? ''}
        onCreated={handleCreated}
      />

      {/* Edit Rubro */}
      <EditRubroModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        rubro={editTarget}
        rubros={rubros}
        onUpdated={handleUpdated}
      />

      {/* Proximity Evaluator */}
      <ProximityEvaluator
        open={evaluatorOpen}
        onClose={() => setEvaluatorOpen(false)}
        sourceRubro={evaluatorSource}
        rubros={rubros}
        userLevel={userLevel}
        onCompleted={handleEvaluationCompleted}
      />
    </TooltipProvider>
  );
}

// ---------- StatCard ----------
function StatCard({
  label,
  value,
  suffix,
  icon,
  color = 'neutral',
}: {
  label: string;
  value: string;
  suffix?: string;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'purple' | 'neutral';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-950/40 border-blue-100 dark:border-blue-900',
    green: 'bg-green-50 dark:bg-green-950/40 border-green-100 dark:border-green-900',
    yellow: 'bg-yellow-50 dark:bg-yellow-950/40 border-yellow-100 dark:border-yellow-900',
    purple: 'bg-purple-50 dark:bg-purple-950/40 border-purple-100 dark:border-purple-900',
    neutral: 'bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800',
  };

  const valueColor = {
    blue: 'text-blue-700 dark:text-blue-300',
    green: 'text-green-700 dark:text-green-300',
    yellow: 'text-yellow-700 dark:text-yellow-300',
    purple: 'text-purple-700 dark:text-purple-300',
    neutral: 'text-neutral-900 dark:text-neutral-100',
  };

  return (
    <div
      className={`rounded-xl border px-4 py-3 flex flex-col gap-1 ${colorClasses[color]}`}
    >
      <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400">
        {icon}
        {label}
      </div>
      <div className={`text-2xl font-bold tabular-nums ${valueColor[color]}`}>{value}</div>
      {suffix && (
        <div className="text-xs text-neutral-400">{suffix}</div>
      )}
    </div>
  );
}
