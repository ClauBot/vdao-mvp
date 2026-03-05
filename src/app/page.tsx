import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Network, Shield, Zap, CheckCircle, Users, FileText } from 'lucide-react';
import { getPool } from '@/lib/db';

async function getStats() {
  try {
    const pool = getPool();
    const [rubros, atestaciones, usuarios] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM rubros WHERE activo = true'),
      pool.query('SELECT COUNT(*) FROM atestaciones_cache'),
      pool.query('SELECT COUNT(*) FROM usuarios'),
    ]);
    return {
      rubros: rubros.rows[0].count,
      atestaciones: atestaciones.rows[0].count,
      usuarios: usuarios.rows[0].count,
    };
  } catch {
    return { rubros: '—', atestaciones: '—', usuarios: '—' };
  }
}

export default async function HomePage() {
  const stats = await getStats();
  const STATS = [
    { label: 'Atestaciones', value: stats.atestaciones, icon: FileText },
    { label: 'Rubros', value: stats.rubros, icon: Network },
    { label: 'Usuarios', value: stats.usuarios, icon: Users },
  ];
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="py-20 sm:py-32 text-center space-y-8">
        <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
          <span className="mr-2">🔗</span>
          Sepolia · EAS · Gasless
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 leading-tight">
          VDAO —{' '}
          <span className="text-blue-600">Sistema de Reputación</span>
          <br />
          Mutua On-Chain
        </h1>

        <p className="mx-auto max-w-2xl text-lg sm:text-xl text-neutral-600 dark:text-neutral-400">
          Inspirado en <strong>Happy or Not</strong>, pero mutuo: ambas partes de
          una interacción se evalúan entre sí. Las evaluaciones son{' '}
          <em>atestaciones inmutables</em> en Ethereum. Tú firmas, nosotros pagamos el gas.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/explorer">
              <Search className="mr-2 h-5 w-5" />
              Explorar Wallets
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
            <Link href="/coru">
              <Network className="mr-2 h-5 w-5" />
              Ver Rubros (CoRu)
            </Link>
          </Button>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────── */}
      <section className="py-12 border-y border-neutral-200 dark:border-neutral-800">
        <div className="grid grid-cols-3 gap-8 text-center">
          {STATS.map(({ label, value, icon: Icon }) => (
            <div key={label} className="space-y-1">
              <div className="flex justify-center mb-2">
                <Icon className="h-5 w-5 text-blue-500" />
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100">
                {value}
              </div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────── */}
      <section className="py-20 space-y-10">
        <div className="text-center space-y-3">
          <Badge variant="secondary">¿Cómo funciona?</Badge>
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Evaluaciones mutuas, como Happy or Not
          </h2>
          <p className="mx-auto max-w-xl text-neutral-600 dark:text-neutral-400">
            Pero en blockchain, y entre dos personas que interactuaron entre sí. La
            mutualidad hace el sistema resistente a spam.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Conectá tu wallet',
              desc: 'MetaMask, WalletConnect o Coinbase Wallet. Auto-switch a Sepolia testnet.',
            },
            {
              step: '02',
              title: 'Buscá una wallet',
              desc: 'Ingresá la dirección de alguien con quien interactuaste profesionalmente.',
            },
            {
              step: '03',
              title: 'Evaluá la interacción',
              desc: 'Rubro, tipo (Comercial/Docente/Investigación), tu rol y scores 1-4.',
            },
            {
              step: '04',
              title: 'Firma gratis',
              desc: 'Firmás la atestación y queda inmutable en EAS. Nosotros pagamos el gas.',
            },
          ].map((item) => (
            <Card key={item.step} className="border-neutral-200 dark:border-neutral-800">
              <CardContent className="pt-6 space-y-2">
                <div className="text-3xl font-bold text-blue-600/30">{item.step}</div>
                <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {item.title}
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">{item.desc}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section className="py-12 space-y-8">
        <h2 className="text-2xl font-bold text-center text-neutral-900 dark:text-neutral-100">
          Por qué VDAO
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Shield className="h-6 w-6 text-blue-600" />}
            title="Evaluaciones Mutuas"
            description="Ambas partes se evalúan mutuamente. Sin mutualidad, la atestación no tiene el mismo peso. Esto reduce spam y evaluaciones falsas."
          />
          <FeatureCard
            icon={<Network className="h-6 w-6 text-blue-600" />}
            title="Constelación de Rubros (CoRu)"
            description="152 rubros organizados como grafo dirigido acíclico. Cada rubro tiene proximidades calculadas por la comunidad vía atestaciones."
          />
          <FeatureCard
            icon={<Zap className="h-6 w-6 text-blue-600" />}
            title="Gasless"
            description="Las atestaciones son gratuitas para los usuarios. Firmás con tu wallet, nosotros pagamos el gas vía paymaster (ERC-4337 / Pimlico)."
          />
        </div>
      </section>

      {/* ── Trust signals ─────────────────────────────────── */}
      <section className="py-16 space-y-6">
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-8">
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            Construido sobre estándares abiertos
          </h3>
          <ul className="space-y-3">
            {[
              'Atestaciones inmutables via EAS (Ethereum Attestation Service)',
              'Sepolia — Testnet de Ethereum',
              'Gas patrocinado via Pimlico Paymaster (ERC-4337)',
              'Datos públicos en Supabase con RLS policies',
              'Código abierto en GitHub',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Tech footnote ─────────────────────────────────── */}
      <div className="pb-12 text-center text-xs text-neutral-400 dark:text-neutral-600">
        Next.js 14 · Supabase · EAS · Sepolia · wagmi v2 · Pimlico Paymaster
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
