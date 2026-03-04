import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ExplorerSearch } from '@/components/explorer/ExplorerSearch';
import { ExplorerDashboard } from '@/components/explorer/ExplorerDashboard';

export const metadata: Metadata = {
  title: 'Wallet Explorer — VDAO',
  description: 'Busca wallets y explora sus atestaciones de reputación on-chain.',
};

interface PageProps {
  searchParams: { wallet?: string };
}

export default function ExplorerPage({ searchParams }: PageProps) {
  const wallet = searchParams?.wallet?.trim() || '';

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Wallet Explorer</h1>
        <p className="text-muted-foreground">
          Busca cualquier wallet para ver su historial de reputación on-chain.
        </p>
      </div>

      {/* Search bar (client component) */}
      <Suspense fallback={null}>
        <ExplorerSearch initialWallet={wallet} />
      </Suspense>

      {/* Dashboard (only shown when wallet is provided) */}
      {wallet && (
        <Suspense
          fallback={
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-32 animate-pulse rounded-xl bg-muted"
                />
              ))}
            </div>
          }
        >
          <ExplorerDashboard wallet={wallet} />
        </Suspense>
      )}

      {/* Empty state */}
      {!wallet && (
        <div className="rounded-xl border-2 border-dashed border-border p-12 text-center space-y-2">
          <p className="text-muted-foreground text-sm">
            Ingresa una dirección Ethereum para ver su reputación
          </p>
          <p className="text-xs text-muted-foreground/60">
            Soporta direcciones 0x... y nombres ENS
          </p>
        </div>
      )}
    </div>
  );
}
