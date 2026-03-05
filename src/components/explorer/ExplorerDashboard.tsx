'use client';

import { useState } from 'react';
import { ReputationSummary } from './ReputationSummary';
import { AttestationList } from './AttestationList';
import { CreateAttestation } from './CreateAttestation';
import { Button } from '@/components/ui/button';
import { isAddress } from 'viem';
import { AlertCircle, ArrowUpRight, RefreshCw } from 'lucide-react';

interface Props {
  wallet: string;
}

function truncateAddress(addr: string): string {
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 8)}…${addr.slice(-6)}`;
}

export function ExplorerDashboard({ wallet }: Props) {
  const [refreshKey, setRefreshKey] = useState(0);

  // Basic validation
  if (!isAddress(wallet)) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-5 dark:border-red-900 dark:bg-red-950/20">
        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-medium text-red-700 dark:text-red-400">
            Dirección inválida
          </p>
          <p className="text-sm text-red-600 dark:text-red-500">
            &ldquo;{wallet}&rdquo; no es una dirección Ethereum válida.
          </p>
        </div>
      </div>
    );
  }

  const normalizedWallet = wallet.toLowerCase() as `0x${string}`;
  const etherscanUrl = `https://sepolia.etherscan.io/address/${normalizedWallet}`;

  return (
    <div className="space-y-6">
      {/* Wallet header row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex-shrink-0" />
          <div className="min-w-0">
            <p className="font-mono text-sm font-medium truncate">
              {truncateAddress(normalizedWallet)}
            </p>
            <a
              href={etherscanUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Ver en Etherscan <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground h-8"
            onClick={() => setRefreshKey((k) => k + 1)}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Actualizar
          </Button>

          <CreateAttestation
            prefillReceiver={normalizedWallet}
            onSuccess={() => setRefreshKey((k) => k + 1)}
          />
        </div>
      </div>

      {/* Reputation summary card */}
      <ReputationSummary key={`summary-${refreshKey}`} wallet={normalizedWallet} />

      {/* Attestation list with tabs, filters, pagination */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Atestaciones</h2>
        <AttestationList key={`list-${refreshKey}`} wallet={normalizedWallet} />
      </div>
    </div>
  );
}
