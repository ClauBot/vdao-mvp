import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Search, Network, Shield, Zap } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24">
      {/* Hero */}
      <div className="text-center space-y-6 mb-20">
        <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
          <span className="mr-2">🔗</span>
          Arbitrum Sepolia · EAS · Gasless
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Reputación{' '}
          <span className="text-blue-600">On-Chain</span>
          <br />
          con Evaluaciones Mutuas
        </h1>

        <p className="mx-auto max-w-2xl text-lg text-neutral-600 dark:text-neutral-400">
          VDAO es un sistema de reputación descentralizado donde las personas se evalúan
          mutuamente. Las evaluaciones son atestaciones inmutables en Ethereum. Los usuarios
          no pagan gas — tú firmas, nosotros pagamos.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/explorer">
              <Search className="mr-2 h-5 w-5" />
              Explorar Wallets
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/coru">
              <Network className="mr-2 h-5 w-5" />
              Ver Rubros (CoRu)
            </Link>
          </Button>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-20">
        <FeatureCard
          icon={<Shield className="h-6 w-6 text-blue-600" />}
          title="Evaluaciones Mutuas"
          description="Ambas partes de una interacción se evalúan mutuamente. La mutualidad hace el sistema resistente a spam y falsas evaluaciones."
        />
        <FeatureCard
          icon={<Network className="h-6 w-6 text-blue-600" />}
          title="Constelación de Rubros"
          description="152 rubros organizados como un grafo dirigido. Cada rubro tiene proximidades calculadas por la comunidad."
        />
        <FeatureCard
          icon={<Zap className="h-6 w-6 text-blue-600" />}
          title="Gasless"
          description="Las atestaciones son gratuitas para los usuarios. Firmás, nosotros pagamos el gas vía paymaster (ERC-4337)."
        />
      </div>

      {/* How it works */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-8 space-y-6">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          ¿Cómo funciona?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Conectá tu wallet',
              desc: 'MetaMask, WalletConnect o Coinbase Wallet. Auto-switch a Arbitrum Sepolia.',
            },
            {
              step: '02',
              title: 'Buscá una wallet',
              desc: 'Ingresá la dirección de alguien con quien interactuaste profesionalmente.',
            },
            {
              step: '03',
              title: 'Evaluá la interacción',
              desc: 'Seleccioná el rubro, tipo de interacción y scores de servicio/trato (1-4).',
            },
            {
              step: '04',
              title: 'Firma (sin pagar gas)',
              desc: 'Firmás la atestación y queda inmutable en EAS en Arbitrum Sepolia.',
            },
          ].map((item) => (
            <div key={item.step} className="space-y-2">
              <div className="text-3xl font-bold text-blue-600/30">{item.step}</div>
              <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                {item.title}
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="mt-12 text-center text-sm text-neutral-500 dark:text-neutral-500">
        Next.js 14 · Supabase · EAS · Arbitrum Sepolia · wagmi v2 · Pimlico Paymaster
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20">
        {icon}
      </div>
      <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">{title}</h3>
      <p className="text-sm text-neutral-600 dark:text-neutral-400">{description}</p>
    </div>
  );
}
