import { Search } from 'lucide-react';

export const metadata = {
  title: 'Wallet Explorer — VDAO',
  description: 'Busca wallets y explora sus atestaciones de reputación on-chain.',
};

export default function ExplorerPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Wallet Explorer
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Busca cualquier wallet para ver su historial de atestaciones y reputación on-chain.
        </p>
      </div>

      {/* Search placeholder */}
      <div className="flex items-center gap-3 rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50 p-8 dark:border-neutral-800 dark:bg-neutral-900">
        <Search className="h-8 w-8 text-neutral-400" />
        <div className="space-y-1">
          <p className="font-medium text-neutral-700 dark:text-neutral-300">
            Módulo 1: Wallet Explorer
          </p>
          <p className="text-sm text-neutral-500 dark:text-neutral-500">
            Fase 2 — En desarrollo. Buscador + dashboard + crear atestaciones.
          </p>
        </div>
      </div>

      {/* Stats placeholder */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Atestaciones', value: '—' },
          { label: 'Wallets Activas', value: '—' },
          { label: 'Rubros', value: '140' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-neutral-200 p-4 text-center dark:border-neutral-800"
          >
            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {stat.value}
            </div>
            <div className="text-sm text-neutral-500 dark:text-neutral-500">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
