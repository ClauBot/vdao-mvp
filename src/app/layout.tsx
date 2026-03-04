import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { Providers } from '@/components/shared/Providers';
import { Header } from '@/components/shared/Header';

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
  title: 'VDAO — Reputación On-Chain',
  description:
    'Sistema de reputación mutual on-chain. Evalúa y sé evaluado por quienes conoces. Construye tu reputación profesional en la cadena.',
  keywords: ['reputación', 'blockchain', 'EAS', 'Arbitrum', 'web3', 'attestation'],
  openGraph: {
    title: 'VDAO',
    description: 'Sistema de reputación on-chain con evaluaciones mutuas',
    type: 'website',
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
          <Header />
          <main className="min-h-[calc(100vh-3.5rem)]">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
