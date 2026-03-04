'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { wagmiConfig } from '@/lib/wagmi';
import { useState } from 'react';

/**
 * Wraps the app with all necessary providers:
 * - WagmiProvider: wallet connection + chain state
 * - QueryClientProvider: async data fetching
 */
export function Providers({ children }: { children: React.ReactNode }) {
  // Create QueryClient per render to avoid shared state in SSR
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
