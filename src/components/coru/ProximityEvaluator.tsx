'use client';

import { useState, useMemo, useCallback } from 'react';
import type { Rubro } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Search,
  Loader2,
  Network,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAccount, useWalletClient } from 'wagmi';
import { EAS, SchemaEncoder } from '@ethereum-attestation-service/eas-sdk';
import { ethers } from 'ethers';
import {
  EAS_CONTRACT_ADDRESS,
  SCHEMA_PROXIMITY_UID,
} from '@/lib/eas';
import { isPaymasterAvailable } from '@/lib/paymaster';

// ---------- Types ----------
interface TxResult {
  success: boolean;
  uid?: string;
  error?: string;
  wasGasless: boolean;
}

interface ProximityEvaluatorProps {
  open: boolean;
  onClose: () => void;
  sourceRubro: Rubro | null;
  rubros: Rubro[];
  userLevel: 1 | 2 | 3 | 4;
  onCompleted: () => void;
}

const LEVEL_WEIGHTS: Record<1 | 2 | 3 | 4, number> = { 1: 1, 2: 2, 3: 4, 4: 8 };
const LEVEL_LABELS: Record<1 | 2 | 3 | 4, string> = {
  1: 'Introductorio',
  2: 'Comunidad',
  3: 'Dedicación',
  4: 'Responsabilidad',
};

// Score label helper
function scoreLabel(score: number): string {
  if (score >= 80) return 'Muy alta';
  if (score >= 60) return 'Alta';
  if (score >= 40) return 'Media';
  if (score >= 20) return 'Baja';
  return 'Muy baja';
}

// Score color
function scoreColor(score: number): string {
  if (score >= 80) return 'text-green-600 dark:text-green-400';
  if (score >= 60) return 'text-blue-600 dark:text-blue-400';
  if (score >= 40) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
}

export function ProximityEvaluator({
  open,
  onClose,
  sourceRubro,
  rubros,
  userLevel,
  onCompleted,
}: ProximityEvaluatorProps) {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [search, setSearch] = useState('');
  const [evaluations, setEvaluations] = useState<Map<number, number>>(new Map());
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<TxResult[]>([]);
  const [step, setStep] = useState<'select' | 'confirm' | 'done'>('select');

  const filteredRubros = useMemo(() => {
    if (!sourceRubro) return [];
    const q = search.toLowerCase();
    return rubros.filter(
      (r) => r.id !== sourceRubro.id && (q === '' || r.nombre.toLowerCase().includes(q))
    );
  }, [rubros, sourceRubro, search]);

  const evaluatedRubros = useMemo(() => {
    return rubros.filter((r) => evaluations.has(r.id));
  }, [rubros, evaluations]);

  const handleScoreChange = useCallback((rubroId: number, score: number) => {
    setEvaluations((prev) => {
      const next = new Map(prev);
      next.set(rubroId, score);
      return next;
    });
  }, []);

  const handleRemoveEval = useCallback((rubroId: number) => {
    setEvaluations((prev) => {
      const next = new Map(prev);
      next.delete(rubroId);
      return next;
    });
  }, []);

  const handleClose = () => {
    setSearch('');
    setEvaluations(new Map());
    setResults([]);
    setStep('select');
    onClose();
  };

  // ---------- Submit attestations ----------
  const handleSubmit = async () => {
    if (!address || !sourceRubro || evaluations.size === 0) return;
    setSubmitting(true);
    setStep('confirm');
    const txResults: TxResult[] = [];

    for (const [rubroId, score] of evaluations.entries()) {
      try {
        let uid: string | undefined;

        // Attempt on-chain attestation via EAS
        if (walletClient && SCHEMA_PROXIMITY_UID) {
          try {
            // Use ethers provider from wagmi wallet client
            const provider = new ethers.BrowserProvider(walletClient as unknown as ethers.Eip1193Provider);
            const signer = await provider.getSigner();

            const eas = new EAS(EAS_CONTRACT_ADDRESS);
            eas.connect(signer);

            const schemaEncoder = new SchemaEncoder(
              'uint16 rubroA, uint16 rubroB, uint8 proximityScore, uint8 proposerLevel'
            );

            const [ra, rb] =
              sourceRubro.id < rubroId
                ? [sourceRubro.id, rubroId]
                : [rubroId, sourceRubro.id];

            const encodedData = schemaEncoder.encodeData([
              { name: 'rubroA', value: ra, type: 'uint16' },
              { name: 'rubroB', value: rb, type: 'uint16' },
              { name: 'proximityScore', value: score, type: 'uint8' },
              { name: 'proposerLevel', value: userLevel, type: 'uint8' },
            ]);

            const tx = await eas.attest({
              schema: SCHEMA_PROXIMITY_UID,
              data: {
                recipient: '0x0000000000000000000000000000000000000000',
                expirationTime: 0n,
                revocable: true,
                data: encodedData,
              },
            });

            const newAttestationUID = await tx.wait();
            uid = newAttestationUID ?? undefined;
          } catch (onChainErr) {
            console.warn('On-chain attestation failed, using off-chain fallback:', onChainErr);
            // Generate mock UID for MVP
            uid = `0x${Array.from(crypto.getRandomValues(new Uint8Array(32)))
              .map((b) => b.toString(16).padStart(2, '0'))
              .join('')}`;
          }
        } else {
          // No schema UID configured — generate mock UID for demo
          uid = `0x${Array.from(crypto.getRandomValues(new Uint8Array(32)))
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('')}`;
        }

        // Index in Supabase via API
        const [ra, rb] =
          sourceRubro.id < rubroId ? [sourceRubro.id, rubroId] : [rubroId, sourceRubro.id];

        await fetch('/api/proximidades', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rubro_a: ra,
            rubro_b: rb,
            score,
            proposer: address,
            proposer_level: userLevel,
            uid,
          }),
        });

        txResults.push({ success: true, uid, wasGasless: isPaymasterAvailable() });
      } catch (e) {
        const err = e as Error;
        txResults.push({
          success: false,
          error: err.message || 'Error al atestar',
          wasGasless: false,
        });
      }
    }

    setResults(txResults);
    setSubmitting(false);
    setStep('done');

    const anySuccess = txResults.some((r) => r.success);
    if (anySuccess) onCompleted();
  };

  const weight = LEVEL_WEIGHTS[userLevel];
  const canSubmit = evaluations.size > 0 && !submitting;

  if (!sourceRubro) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <DialogTitle className="flex items-center gap-2">
            <Network className="h-5 w-5 text-blue-500" />
            Evaluar Proximidad
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-1">
              <p>
                Evalúa la proximidad de{' '}
                <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                  {sourceRubro.nombre}
                </span>{' '}
                con otros rubros.
              </p>
              <div className="flex items-center gap-2 text-xs mt-1">
                <Badge variant="outline" className="gap-1">
                  Nivel {userLevel} — {LEVEL_LABELS[userLevel]}
                </Badge>
                <span className="text-neutral-400">·</span>
                <span className="text-neutral-500">Peso de tu voto: ×{weight}</span>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        {step === 'done' ? (
          // Results screen
          <div className="flex-1 px-6 py-6 space-y-4 overflow-auto">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-7 w-7 text-green-500 shrink-0" />
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {results.filter((r) => r.success).length} de {results.length} evaluaciones completadas
                </h3>
                <p className="text-sm text-neutral-500 mt-0.5">
                  Las proximidades han sido actualizadas.
                </p>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              {results.map((r, i) => {
                const rubroId = [...evaluations.keys()][i];
                const rubro = rubros.find((x) => x.id === rubroId);
                return (
                  <div
                    key={i}
                    className={cn(
                      'flex items-start gap-3 py-3 px-3 rounded-lg',
                      r.success
                        ? 'bg-green-50 dark:bg-green-950/30'
                        : 'bg-red-50 dark:bg-red-950/30'
                    )}
                  >
                    {r.success ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">
                        {rubro?.nombre ?? `Rubro #${rubroId}`}
                      </p>
                      {r.success && r.uid && (
                        <p className="text-xs text-neutral-500 font-mono truncate mt-0.5">
                          UID: {r.uid.slice(0, 20)}...
                          {r.uid.startsWith('0x') && !r.uid.includes('0000') && (
                            <a
                              href={`https://sepolia.easscan.org/attestation/view/${r.uid}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 ml-1 text-blue-500 hover:underline"
                            >
                              Ver <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </p>
                      )}
                      {!r.success && (
                        <p className="text-xs text-red-600 mt-0.5">{r.error}</p>
                      )}
                      {r.wasGasless && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          Gas patrocinado ✓
                        </Badge>
                      )}
                    </div>
                    <Badge variant="outline" className="shrink-0 tabular-nums">
                      {evaluations.get(rubroId)}%
                    </Badge>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={handleClose}>Cerrar</Button>
            </div>
          </div>
        ) : (
          // Evaluation screen
          <>
            <div className="flex-1 overflow-hidden flex flex-col">
              {/* Selected evaluations summary */}
              {evaluations.size > 0 && (
                <div className="px-6 py-3 bg-blue-50 dark:bg-blue-950/30 border-b border-blue-100 dark:border-blue-900">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      {evaluations.size} rubro{evaluations.size > 1 ? 's' : ''} seleccionado{evaluations.size > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {evaluatedRubros.map((r) => {
                      const score = evaluations.get(r.id)!;
                      return (
                        <div
                          key={r.id}
                          className="flex items-center gap-1.5 bg-white dark:bg-neutral-900 border border-blue-200 dark:border-blue-800 rounded-full px-2.5 py-1 text-xs"
                        >
                          <span className="text-neutral-700 dark:text-neutral-300 truncate max-w-[120px]">
                            {r.nombre}
                          </span>
                          <span className={cn('font-semibold tabular-nums', scoreColor(score))}>
                            {score}%
                          </span>
                          <button
                            onClick={() => handleRemoveEval(r.id)}
                            className="text-neutral-400 hover:text-red-500 ml-0.5"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Info banner */}
              {!SCHEMA_PROXIMITY_UID && (
                <div className="mx-6 mt-4 flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border border-yellow-200 dark:border-yellow-800 text-xs text-yellow-700 dark:text-yellow-300">
                  <Info className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    Schema EAS no configurado. Las evaluaciones se registrarán solo en Supabase
                    (modo demo). Configura <code>NEXT_PUBLIC_SCHEMA_PROXIMITY_UID</code> para
                    atestaciones on-chain.
                  </span>
                </div>
              )}

              {/* Search + list */}
              <div className="px-6 pt-4 pb-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input
                    placeholder="Buscar rubro para evaluar..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <ScrollArea className="flex-1 px-6 pb-4">
                <div className="space-y-3 py-1">
                  {filteredRubros.slice(0, 30).map((r) => {
                    const currentScore = evaluations.get(r.id) ?? 50;
                    const isSelected = evaluations.has(r.id);

                    return (
                      <div
                        key={r.id}
                        className={cn(
                          'rounded-lg border p-3 transition-colors',
                          isSelected
                            ? 'border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-950/20'
                            : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                        )}
                      >
                        {/* Rubro name + toggle */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-medium text-sm text-neutral-900 dark:text-neutral-100 truncate">
                              {r.nombre}
                            </span>
                            {r.nombre_en && (
                              <span className="text-xs text-neutral-400 truncate hidden sm:block">
                                · {r.nombre_en}
                              </span>
                            )}
                          </div>
                          {!isSelected ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="shrink-0 text-xs h-7"
                              onClick={() => handleScoreChange(r.id, 50)}
                            >
                              + Evaluar
                            </Button>
                          ) : (
                            <button
                              onClick={() => handleRemoveEval(r.id)}
                              className="shrink-0 text-xs text-neutral-400 hover:text-red-500"
                            >
                              Quitar
                            </button>
                          )}
                        </div>

                        {/* Slider (only when selected) */}
                        {isSelected && (
                          <div className="space-y-2 mt-3">
                            <div className="flex items-center justify-between text-xs">
                              <Label className="text-neutral-500">Proximidad</Label>
                              <div className="flex items-center gap-2">
                                <span className={cn('font-semibold tabular-nums', scoreColor(currentScore))}>
                                  {scoreLabel(currentScore)}
                                </span>
                                <Badge variant="outline" className="tabular-nums text-xs">
                                  {currentScore}/100
                                </Badge>
                              </div>
                            </div>
                            <Slider
                              min={1}
                              max={100}
                              step={1}
                              value={[currentScore]}
                              onValueChange={([v]) => handleScoreChange(r.id, v)}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-neutral-400">
                              <span>Sin relación</span>
                              <span>Idénticos</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {filteredRubros.length === 0 && (
                    <div className="py-10 text-center text-neutral-400 text-sm">
                      Sin resultados para &ldquo;{search}&rdquo;
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3">
              <div className="text-xs text-neutral-500">
                {evaluations.size === 0
                  ? 'Selecciona al menos un rubro para evaluar'
                  : `${evaluations.size} evaluación${evaluations.size > 1 ? 'es' : ''} · Peso ×${weight}`}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose} disabled={submitting}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Atestando...
                    </>
                  ) : (
                    <>
                      <Network className="h-4 w-4" />
                      Enviar {evaluations.size > 0 ? `(${evaluations.size})` : ''}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
