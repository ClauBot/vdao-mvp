'use client';

import { Badge } from '@/components/ui/badge';
import { INTERACTION_TYPES, SCORE_LABELS, ROLE_LABELS, type Atestacion } from '@/lib/types';
import { ExternalLink, ArrowUpRight } from 'lucide-react';

// ---------------------------------------------------------------------------
// Built-in date formatting (no external dependency)
// ---------------------------------------------------------------------------

function formatDate(dateStr: string): { relative: string; absolute: string } {
  try {
    const d = new Date(dateStr);
    const now = Date.now();
    const diff = now - d.getTime();
    const SEC = 1000;
    const MIN = 60 * SEC;
    const HR = 60 * MIN;
    const DAY = 24 * HR;
    const WEEK = 7 * DAY;
    const MONTH = 30 * DAY;
    const YEAR = 365 * DAY;

    let relative: string;
    if (diff < MIN) relative = 'hace un momento';
    else if (diff < HR) relative = `hace ${Math.floor(diff / MIN)} min`;
    else if (diff < DAY) relative = `hace ${Math.floor(diff / HR)} h`;
    else if (diff < WEEK) relative = `hace ${Math.floor(diff / DAY)} días`;
    else if (diff < MONTH) relative = `hace ${Math.floor(diff / WEEK)} sem`;
    else if (diff < YEAR) relative = `hace ${Math.floor(diff / MONTH)} meses`;
    else relative = `hace ${Math.floor(diff / YEAR)} años`;

    const absolute = d.toLocaleString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return { relative, absolute };
  } catch {
    return { relative: '', absolute: dateStr };
  }
}

function truncateAddress(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

/** Visual score indicator: 4 dots, filled up to the score */
function ScoreDots({ score, label }: { score: number; label: string }) {
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <span className="text-[10px] text-muted-foreground leading-none">{label}</span>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={`inline-block h-2 w-5 rounded-sm transition-colors ${
              i <= score
                ? score >= 3
                  ? 'bg-emerald-500'
                  : score === 2
                    ? 'bg-amber-500'
                    : 'bg-red-500'
                : 'bg-muted'
            }`}
          />
        ))}
        <span className="ml-1 text-[10px] font-medium text-muted-foreground">
          {SCORE_LABELS[score]}
        </span>
      </div>
    </div>
  );
}

function natureBadgeVariant(type: 0 | 1 | 2): 'comercial' | 'docente' | 'investigacion' {
  if (type === 0) return 'comercial';
  if (type === 1) return 'docente';
  return 'investigacion';
}

interface Props {
  attestation: Atestacion;
  rubroNombre: string;
  viewMode: 'received' | 'emitted';
}

export function AttestationCard({ attestation, rubroNombre, viewMode }: Props) {
  const { relative, absolute } = formatDate(attestation.created_at);

  const counterparty =
    viewMode === 'received' ? attestation.attester : attestation.receiver;

  const counterpartyLabel = viewMode === 'received' ? 'Evaluado por' : 'Evaluado a';

  const easExplorerUrl = `https://arbitrum-sepolia.easscan.org/attestation/view/${attestation.uid}`;
  const arbiscanUrl = `https://sepolia.arbiscan.io/address/${counterparty}`;

  return (
    <div className="rounded-lg border border-border bg-card p-4 hover:border-border/80 hover:shadow-sm transition-all space-y-3">
      {/* Top row: counterparty + badges */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="space-y-0.5 min-w-0">
          <p className="text-xs text-muted-foreground">{counterpartyLabel}</p>
          <div className="flex items-center gap-1">
            <a
              href={arbiscanUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-0.5 truncate"
            >
              {truncateAddress(counterparty)}
              <ArrowUpRight className="h-3 w-3 flex-shrink-0" />
            </a>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant={natureBadgeVariant(attestation.interaction_type)}>
            {INTERACTION_TYPES[attestation.interaction_type]}
          </Badge>
          <Badge variant="outline" className="text-[11px]">
            {ROLE_LABELS[attestation.role]}
          </Badge>
        </div>
      </div>

      {/* Middle row: rubro + date */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <span className="font-medium text-foreground truncate max-w-[200px]">{rubroNombre}</span>
        <span
          className="text-xs text-muted-foreground"
          title={absolute}
        >
          {relative || absolute}
        </span>
      </div>

      {/* Scores */}
      <div className="flex flex-wrap gap-4">
        <ScoreDots score={attestation.score_service} label="Servicio" />
        <ScoreDots score={attestation.score_treatment} label="Trato" />
      </div>

      {/* Footer: EAS link */}
      <div className="pt-1 border-t border-border/60">
        <a
          href={easExplorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <ExternalLink className="h-3 w-3" />
          Ver en EAS Explorer · {attestation.uid.slice(0, 10)}…
        </a>
      </div>
    </div>
  );
}
