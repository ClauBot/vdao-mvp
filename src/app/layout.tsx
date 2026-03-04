import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { Providers } from '@/components/shared/Providers';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: {
    default: 'VDAO - Reputación Mutua On-Chain',
    template: '%s | VDAO',
  },
  description:
    'Sistema de reputación descentralizado con evaluaciones mutuas. Construye tu reputación profesional on-chain, rubro por rubro. Atestaciones en Arbitrum via EAS.',
  keywords: [
    'reputación',
    'blockchain',
    'EAS',
    'Arbitrum',
    'web3',
    'attestation',
    'on-chain',
    'rubros',
    'evaluación mutua',
  ],
  authors: [{ name: 'VDAO' }],
  creator: 'VDAO',
  openGraph: {
    title: 'VDAO - Reputación Mutua On-Chain',
    description: 'Sistema de reputación descentralizado con evaluaciones mutuas. Construye tu reputación profesional on-chain.',
    type: 'website',
    siteName: 'VDAO',
    locale: 'es_MX',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VDAO - Reputación Mutua On-Chain',
    description: 'Sistema de reputación descentralizado con evaluaciones mutuas on Arbitrum.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
