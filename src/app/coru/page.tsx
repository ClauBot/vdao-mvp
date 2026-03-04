import { Network } from 'lucide-react';

export const metadata = {
  title: 'Constelación de Rubros — VDAO',
  description: '152 rubros organizados como DAG. Explora proximidades y relaciones entre sectores.',
};

export default function CoRuPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Constelación de Rubros
          <span className="ml-2 text-lg font-normal text-neutral-500">(CoRu)</span>
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          140 rubros organizados como un grafo dirigido acíclico (DAG). Haz click en cualquier
          rubro para ver sus proximidades con el resto.
        </p>
      </div>

      {/* Placeholder */}
      <div className="flex items-center gap-3 rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50 p-8 dark:border-neutral-800 dark:bg-neutral-900">
        <Network className="h-8 w-8 text-neutral-400" />
        <div className="space-y-1">
          <p className="font-medium text-neutral-700 dark:text-neutral-300">
            Módulo 2: Visualizador CoRu
          </p>
          <p className="text-sm text-neutral-500 dark:text-neutral-500">
            Fase 3 — En desarrollo. Tabla de rubros + reorganización por proximidad + CRUD.
          </p>
        </div>
      </div>

      {/* Category preview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { name: 'Tecnología', count: 20, color: 'blue' },
          { name: 'Artes', count: 15, color: 'purple' },
          { name: 'Mercadotecnia', count: 13, color: 'orange' },
          { name: 'Entretenimiento', count: 12, color: 'pink' },
          { name: 'Serv. Profesionales', count: 13, color: 'green' },
          { name: 'Educación', count: 9, color: 'yellow' },
          { name: 'Salud', count: 9, color: 'red' },
          { name: 'Construcción', count: 9, color: 'gray' },
          { name: 'Comercio', count: 9, color: 'indigo' },
          { name: 'Logística', count: 6, color: 'teal' },
          { name: 'Agricultura', count: 6, color: 'lime' },
          { name: 'Finanzas/Crypto', count: 8, color: 'cyan' },
          { name: 'Ciencias', count: 6, color: 'violet' },
          { name: 'Gobierno/ONG', count: 5, color: 'rose' },
        ].map((cat) => (
          <div
            key={cat.name}
            className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800"
          >
            <div className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
              {cat.name}
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-500">
              {cat.count} rubros
            </div>
          </div>
        ))}
      </div>

      <div className="text-sm text-neutral-500">
        Total: <span className="font-semibold">140 rubros</span> ·{' '}
        <span className="font-semibold">31</span> con múltiples padres ·{' '}
        <span className="font-semibold">14</span> categorías raíz ·{' '}
        <span className="font-semibold">124</span> pares de proximidad
      </div>
    </div>
  );
}
