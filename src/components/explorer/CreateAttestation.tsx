'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
// Select components available for future use (currently using custom ScoreSelector)
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import {
  EAS_CONTRACT_ADDRESS,
  SCHEMA_EVALUATION_UID,
} from '@/lib/eas';
import { isPaymasterAvailable } from '@/lib/paymaster';
import { INTERACTION_TYPES, ROLE_LABELS, SCORE_LABELS, type Rubro } from '@/lib/types';
import {
  encodeFunctionData,
  encodeAbiParameters,
  isAddress,
  type Address,
} from 'viem';
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Star,
  ExternalLink,
  Zap,
} from 'lucide-react';

// ── EAS attest() ABI ────────────────────────────────────────
const EAS_ATTEST_ABI = [
  {
    inputs: [
      {
        components: [
          { name: 'schema', type: 'bytes32' },
          {
            components: [
              { name: 'recipient', type: 'address' },
              { name: 'expirationTime', type: 'uint64' },
              { name: 'revocable', type: 'bool' },
              { name: 'refUID', type: 'bytes32' },
              { name: 'data', type: 'bytes' },
              { name: 'value', type: 'uint256' },
            ],
            name: 'data',
            type: 'tuple',
          },
        ],
        name: 'request',
        type: 'tuple',
      },
    ],
    name: 'attest',
    outputs: [{ name: '', type: 'bytes32' }],
    stateMutability: 'payable',
    type: 'function',
  },
] as const;

// ── Schema encoder (no ethers.js dependency) ─────────────────
function encodeEvaluationSchema(params: {
  receiver: Address;
  rubroId: number;
  interactionType: number;
  scoreService: number;
  scoreTreatment: number;
  role: number;
  counterpartUID: `0x${string}`;
}): `0x${string}` {
  return encodeAbiParameters(
    [
      { name: 'receiver', type: 'address' },
      { name: 'rubroId', type: 'uint16' },
      { name: 'interactionType', type: 'uint8' },
      { name: 'scoreService', type: 'uint8' },
      { name: 'scoreTreatment', type: 'uint8' },
      { name: 'role', type: 'uint8' },
      { name: 'counterpartUID', type: 'bytes32' },
    ],
    [
      params.receiver,
      params.rubroId,
      params.interactionType,
      params.scoreService,
      params.scoreTreatment,
      params.role,
      params.counterpartUID,
    ]
  );
}

// ── Score selector ───────────────────────────────────────────
function ScoreSelector({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm">{label}</Label>
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            className={`flex-1 flex flex-col items-center gap-1 rounded-lg border-2 p-2 transition-all text-xs ${
              value === s
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400'
                : 'border-border hover:border-muted-foreground text-muted-foreground hover:text-foreground'
            }`}
          >
            <Star
              className={`h-4 w-4 ${value >= s ? 'fill-current' : 'opacity-30'}`}
            />
            <span className="leading-tight text-center">
              {SCORE_LABELS[s]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Radio-style option picker ────────────────────────────────
function RadioGroup<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm">{label}</Label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-3 py-1.5 rounded-full text-sm border-2 transition-colors ${
              value === opt.value
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 font-medium'
                : 'border-border text-muted-foreground hover:border-muted-foreground hover:text-foreground'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Form state ──────────────────────────────────────────────
interface FormState {
  receiver: string;
  rubroId: string;
  interactionType: 0 | 1 | 2;
  role: 0 | 1;
  scoreService: 1 | 2 | 3 | 4;
  scoreTreatment: 1 | 2 | 3 | 4;
}

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

interface Props {
  prefillReceiver?: string;
  onSuccess?: () => void;
}

export function CreateAttestation({ prefillReceiver, onSuccess }: Props) {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const [open, setOpen] = useState(false);
  const [rubros, setRubros] = useState<Rubro[]>([]);
  const [rubroSearch, setRubroSearch] = useState('');
  const [loadingRubros, setLoadingRubros] = useState(false);

  const [form, setForm] = useState<FormState>({
    receiver: prefillReceiver || '',
    rubroId: '',
    interactionType: 0,
    role: 0,
    scoreService: 3,
    scoreTreatment: 3,
  });

  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [txHash, setTxHash] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [receiverError, setReceiverError] = useState<string>('');

  // Fetch rubros when modal opens
  useEffect(() => {
    if (!open) return;
    setLoadingRubros(true);
    supabase
      .from('rubros')
      .select('*')
      .eq('activo', true)
      .order('nombre')
      .then(({ data, error }) => {
        if (!error && data) setRubros(data as Rubro[]);
        setLoadingRubros(false);
      });
  }, [open]);

  // Validate receiver address
  const validateReceiver = useCallback(
    (addr: string): boolean => {
      if (!addr) {
        setReceiverError('La dirección es requerida');
        return false;
      }
      if (!isAddress(addr)) {
        setReceiverError('Dirección Ethereum inválida');
        return false;
      }
      if (addr.toLowerCase() === address?.toLowerCase()) {
        setReceiverError('No puedes evaluarte a ti mismo');
        return false;
      }
      setReceiverError('');
      return true;
    },
    [address]
  );

  const filteredRubros = rubros.filter((r) =>
    r.nombre.toLowerCase().includes(rubroSearch.toLowerCase())
  );

  const handleSubmit = async () => {
    // Basic validation
    if (!validateReceiver(form.receiver)) return;
    if (!form.rubroId) {
      setErrorMsg('Selecciona un rubro');
      return;
    }
    if (!walletClient || !publicClient) {
      setErrorMsg('Wallet no conectada');
      return;
    }
    if (!SCHEMA_EVALUATION_UID) {
      setErrorMsg('Schema UID no configurado. Ejecuta scripts/deploy-schemas.ts primero.');
      return;
    }

    setSubmitState('submitting');
    setErrorMsg('');

    try {
      const receiver = form.receiver as Address;

      // 1. Encode the schema data
      const schemaData = encodeEvaluationSchema({
        receiver,
        rubroId: parseInt(form.rubroId),
        interactionType: form.interactionType,
        scoreService: form.scoreService,
        scoreTreatment: form.scoreTreatment,
        role: form.role,
        counterpartUID:
          '0x0000000000000000000000000000000000000000000000000000000000000000',
      });

      // 2. Encode the full attest() calldata
      const calldata = encodeFunctionData({
        abi: EAS_ATTEST_ABI,
        functionName: 'attest',
        args: [
          {
            schema: SCHEMA_EVALUATION_UID as `0x${string}`,
            data: {
              recipient: receiver,
              expirationTime: 0n,
              revocable: true,
              refUID:
                '0x0000000000000000000000000000000000000000000000000000000000000000',
              data: schemaData,
              value: 0n,
            },
          },
        ],
      });

      let hash: `0x${string}`;

      // 3a. Gasless path (if Pimlico configured)
      if (isPaymasterAvailable()) {
        // Dynamic import to avoid issues when Pimlico is not configured
        const { createGaslessClientFromWalletClient } = await import(
          '@/lib/paymaster-browser'
        );
        const { smartAccountClient } = await createGaslessClientFromWalletClient(walletClient);
        hash = await smartAccountClient.sendTransaction({
          to: EAS_CONTRACT_ADDRESS as Address,
          data: calldata,
          value: 0n,
        });
      } else {
        // 3b. Direct path
        hash = await walletClient.sendTransaction({
          to: EAS_CONTRACT_ADDRESS as Address,
          data: calldata,
          value: 0n,
        });
      }

      // 4. Wait for receipt
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt.status !== 'success') {
        throw new Error('La transacción fue revertida');
      }

      setTxHash(hash);

      // 5. Index in Supabase via API route
      try {
        await fetch('/api/atestaciones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            txHash: hash,
            attester: address,
            receiver: form.receiver,
            rubroId: parseInt(form.rubroId),
            interactionType: form.interactionType,
            scoreService: form.scoreService,
            scoreTreatment: form.scoreTreatment,
            role: form.role,
          }),
        });
      } catch (indexErr) {
        // Indexing failure is non-critical
        console.warn('Indexing failed (non-critical):', indexErr);
      }

      setSubmitState('success');
      onSuccess?.();
    } catch (err: unknown) {
      console.error('Attestation error:', err);
      const e = err as { shortMessage?: string; message?: string };
      setErrorMsg(
        e.shortMessage || e.message || 'Error creando atestación. Intenta de nuevo.'
      );
      setSubmitState('error');
    }
  };

  const handleClose = () => {
    if (submitState === 'submitting') return;
    setOpen(false);
    // Reset after close animation
    setTimeout(() => {
      setForm({
        receiver: prefillReceiver || '',
        rubroId: '',
        interactionType: 0,
        role: 0,
        scoreService: 3,
        scoreTreatment: 3,
      });
      setSubmitState('idle');
      setTxHash('');
      setErrorMsg('');
      setReceiverError('');
      setRubroSearch('');
    }, 300);
  };

  if (!isConnected) {
    return (
      <Button variant="outline" size="sm" disabled>
        Conecta tu wallet para evaluar
      </Button>
    );
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-2">
        <Star className="h-4 w-4" />
        Evaluar
        {isPaymasterAvailable() && (
          <span className="ml-0.5">
            <Zap className="h-3 w-3 text-yellow-400" />
          </span>
        )}
      </Button>

      <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {/* ── Success state ── */}
          {submitState === 'success' ? (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <CheckCircle2 className="h-16 w-16 text-emerald-500" />
              <div className="space-y-1">
                <DialogTitle>¡Atestación creada!</DialogTitle>
                <DialogDescription>
                  Tu evaluación fue registrada on-chain exitosamente.
                </DialogDescription>
              </div>
              <a
                href={`https://arbitrum-sepolia.easscan.org/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                Ver en EAS Explorer
              </a>
              <Button onClick={handleClose} className="mt-2">
                Cerrar
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  Crear Atestación
                  {isPaymasterAvailable() && (
                    <Badge variant="secondary" className="gap-1 text-xs">
                      <Zap className="h-3 w-3 text-yellow-500" /> Sin gas
                    </Badge>
                  )}
                </DialogTitle>
                <DialogDescription>
                  Evalúa tu experiencia con otra wallet on-chain.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5">
                {/* Receiver address */}
                <div className="space-y-2">
                  <Label htmlFor="receiver">Dirección del evaluado</Label>
                  <Input
                    id="receiver"
                    placeholder="0x..."
                    value={form.receiver}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, receiver: e.target.value }));
                      if (receiverError) validateReceiver(e.target.value);
                    }}
                    onBlur={() => validateReceiver(form.receiver)}
                    className={receiverError ? 'border-red-500' : ''}
                    disabled={submitState === 'submitting'}
                  />
                  {receiverError && (
                    <p className="text-xs text-red-500">{receiverError}</p>
                  )}
                </div>

                {/* Rubro selector */}
                <div className="space-y-2">
                  <Label>Rubro</Label>
                  {loadingRubros ? (
                    <div className="h-9 animate-pulse rounded-md bg-muted" />
                  ) : (
                    <div className="space-y-1">
                      <Input
                        placeholder="Buscar rubro..."
                        value={rubroSearch}
                        onChange={(e) => setRubroSearch(e.target.value)}
                        className="h-8 text-sm"
                        disabled={submitState === 'submitting'}
                      />
                      <div className="max-h-36 overflow-y-auto rounded-md border bg-background">
                        {filteredRubros.length === 0 ? (
                          <p className="p-2 text-xs text-muted-foreground">
                            Sin resultados
                          </p>
                        ) : (
                          filteredRubros.map((r) => (
                            <button
                              key={r.id}
                              type="button"
                              onClick={() => {
                                setForm((f) => ({
                                  ...f,
                                  rubroId: String(r.id),
                                }));
                                setRubroSearch(r.nombre);
                              }}
                              className={`w-full px-3 py-2 text-left text-sm transition-colors hover:bg-muted ${
                                form.rubroId === String(r.id)
                                  ? 'bg-primary/10 font-medium text-primary'
                                  : ''
                              }`}
                              disabled={submitState === 'submitting'}
                            >
                              {r.nombre}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Interaction type */}
                <RadioGroup
                  label="Naturaleza de la interacción"
                  options={INTERACTION_TYPES.map((t, i) => ({
                    value: i as 0 | 1 | 2,
                    label: t,
                  }))}
                  value={form.interactionType}
                  onChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      interactionType: v as 0 | 1 | 2,
                    }))
                  }
                />

                {/* Role */}
                <RadioGroup
                  label="Tu rol en la interacción"
                  options={ROLE_LABELS.map((l, i) => ({
                    value: i as 0 | 1,
                    label: l,
                  }))}
                  value={form.role}
                  onChange={(v) =>
                    setForm((f) => ({ ...f, role: v as 0 | 1 }))
                  }
                />

                {/* Scores */}
                <ScoreSelector
                  label="Calidad del servicio"
                  value={form.scoreService}
                  onChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      scoreService: v as 1 | 2 | 3 | 4,
                    }))
                  }
                />
                <ScoreSelector
                  label="Calidad del trato"
                  value={form.scoreTreatment}
                  onChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      scoreTreatment: v as 1 | 2 | 3 | 4,
                    }))
                  }
                />

                {/* Error message */}
                {(submitState === 'error' || errorMsg) && (
                  <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/20 dark:text-red-400">
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}
              </div>

              <DialogFooter className="mt-2">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={submitState === 'submitting'}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={submitState === 'submitting' || !form.rubroId}
                  className="gap-2 min-w-[120px]"
                >
                  {submitState === 'submitting' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Star className="h-4 w-4" />
                      Enviar
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
