'use client';

import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { arbitrumSepolia } from 'wagmi/chains';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Wallet, ChevronDown, LogOut, Copy, Check, AlertTriangle } from 'lucide-react';

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * ConnectButton — Wallet connection UI component.
 *
 * States:
 * 1. Disconnected → shows "Connect Wallet" button
 * 2. Wrong chain → shows "Switch to Arbitrum Sepolia" button
 * 3. Connected → shows truncated address with disconnect option
 */
export function ConnectButton() {
  const { address, isConnected, chain } = useAccount();
  const { connectors, connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  const [showConnectors, setShowConnectors] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const isWrongChain = isConnected && chain?.id !== arbitrumSepolia.id;

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Wrong chain state
  if (isWrongChain) {
    return (
      <Button
        onClick={() => switchChain({ chainId: arbitrumSepolia.id })}
        disabled={isSwitching}
        variant="destructive"
        size="sm"
        className="gap-2"
      >
        {isSwitching ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <AlertTriangle className="h-4 w-4" />
        )}
        {isSwitching ? 'Switching...' : 'Switch to Arbitrum Sepolia'}
      </Button>
    );
  }

  // Connected state
  if (isConnected && address) {
    return (
      <div className="relative">
        <Button
          onClick={() => setShowMenu(!showMenu)}
          variant="outline"
          size="sm"
          className="gap-2 font-mono text-sm"
        >
          <Wallet className="h-4 w-4" />
          {truncateAddress(address)}
          <ChevronDown className="h-3 w-3" />
        </Button>

        {showMenu && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowMenu(false)}
            />
            {/* Dropdown */}
            <div className="absolute right-0 top-full mt-1 z-20 w-56 rounded-md border border-neutral-200 bg-white shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
              <div className="p-2">
                {/* Chain indicator */}
                <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                  <span className="h-2 w-2 rounded-full bg-green-400" />
                  Arbitrum Sepolia
                </div>

                <hr className="my-1 border-neutral-200 dark:border-neutral-800" />

                {/* Copy address */}
                <button
                  onClick={() => {
                    handleCopyAddress();
                    setTimeout(() => setShowMenu(false), 500);
                  }}
                  className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  {copied ? 'Copied!' : 'Copy Address'}
                </button>

                {/* Arbiscan link */}
                <a
                  href={`https://sepolia.arbiscan.io/address/${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                  onClick={() => setShowMenu(false)}
                >
                  <Wallet className="h-4 w-4" />
                  View on Arbiscan
                </a>

                <hr className="my-1 border-neutral-200 dark:border-neutral-800" />

                {/* Disconnect */}
                <button
                  onClick={() => {
                    disconnect();
                    setShowMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  <LogOut className="h-4 w-4" />
                  Disconnect
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // Disconnected state — show connector options
  if (showConnectors) {
    return (
      <div className="relative">
        <div className="absolute right-0 top-full mt-1 z-20 w-56 rounded-md border border-neutral-200 bg-white shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
          <div className="p-2">
            <div className="px-2 py-1.5 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Connect Wallet
            </div>
            <hr className="my-1 border-neutral-200 dark:border-neutral-800" />

            {connectors.map((connector) => (
              <button
                key={connector.uid}
                onClick={() => {
                  connect({ connector, chainId: arbitrumSepolia.id });
                  setShowConnectors(false);
                }}
                disabled={isConnecting}
                className="flex w-full items-center gap-2 rounded px-2 py-2 text-sm text-neutral-700 hover:bg-neutral-100 disabled:opacity-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                {isConnecting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Wallet className="h-4 w-4" />
                )}
                {connector.name}
              </button>
            ))}

            <hr className="my-1 border-neutral-200 dark:border-neutral-800" />
            <button
              onClick={() => setShowConnectors(false)}
              className="flex w-full items-center justify-center rounded px-2 py-1.5 text-xs text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
            >
              Cancel
            </button>
          </div>
        </div>
        {/* Backdrop */}
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowConnectors(false)}
        />
      </div>
    );
  }

  return (
    <div className="relative">
      <Button
        onClick={() => setShowConnectors(true)}
        disabled={isConnecting}
        size="sm"
        className="gap-2"
      >
        {isConnecting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Wallet className="h-4 w-4" />
        )}
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </Button>
    </div>
  );
}
