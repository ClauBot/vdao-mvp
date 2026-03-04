'use client';

import { useState, useTransition, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, AlertCircle, ArrowRight } from 'lucide-react';
import { createPublicClient, http, isAddress, type Address } from 'viem';
import { mainnet } from 'viem/chains';

// Mainnet public client for ENS resolution (ENS lives on Ethereum mainnet)
const ensClient = createPublicClient({
  chain: mainnet,
  transport: http('https://eth.llamarpc.com'),
});

async function resolveEns(input: string): Promise<Address | null> {
  if (!input.endsWith('.eth') && !input.includes('.')) return null;
  try {
    const resolved = await ensClient.getEnsAddress({ name: input });
    return resolved ?? null;
  } catch {
    return null;
  }
}

function isValidEthAddress(input: string): boolean {
  return isAddress(input);
}

interface Props {
  initialWallet: string;
}

export function ExplorerSearch({ initialWallet }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [input, setInput] = useState(initialWallet);
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState('');
  const [ensResolved, setEnsResolved] = useState<string>('');

  const handleSearch = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed) {
      setError('Ingresa una dirección o nombre ENS');
      return;
    }

    setError('');
    setEnsResolved('');

    // Case 1: direct ETH address
    if (isValidEthAddress(trimmed)) {
      startTransition(() => {
        router.push(`/explorer?wallet=${trimmed.toLowerCase()}`);
      });
      return;
    }

    // Case 2: looks like ENS name
    if (trimmed.includes('.')) {
      setResolving(true);
      try {
        const resolved = await resolveEns(trimmed);
        if (resolved) {
          setEnsResolved(resolved);
          startTransition(() => {
            router.push(`/explorer?wallet=${resolved.toLowerCase()}`);
          });
        } else {
          setError(`No se encontró dirección para "${trimmed}"`);
        }
      } catch {
        setError('Error resolviendo nombre ENS');
      } finally {
        setResolving(false);
      }
      return;
    }

    // Case 3: invalid
    setError('Dirección inválida. Usa formato 0x... o nombre.eth');
  }, [input, router]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  const isLoading = resolving || isPending;

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="0x... o nombre.eth"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (error) setError('');
              if (ensResolved) setEnsResolved('');
            }}
            onKeyDown={handleKeyDown}
            className={`pl-9 h-10 font-mono text-sm ${
              error ? 'border-red-500 focus-visible:ring-red-500' : ''
            }`}
            disabled={isLoading}
            spellCheck={false}
            autoComplete="off"
          />
        </div>

        <Button
          onClick={handleSearch}
          disabled={isLoading || !input.trim()}
          className="h-10 gap-2 min-w-[100px]"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
          {resolving ? 'Resolviendo...' : isPending ? 'Buscando...' : 'Buscar'}
        </Button>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ENS resolved display */}
      {ensResolved && !error && (
        <p className="text-xs text-muted-foreground">
          ENS resuelto a:{' '}
          <span className="font-mono font-medium text-foreground">{ensResolved}</span>
        </p>
      )}

      {/* Currently viewing hint */}
      {initialWallet && !error && !ensResolved && (
        <p className="text-xs text-muted-foreground">
          Viendo:{' '}
          <span className="font-mono">{initialWallet}</span>
        </p>
      )}
    </div>
  );
}
