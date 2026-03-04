/**
 * VDAO MVP — Wagmi v2 Configuration
 * Chain: Arbitrum Sepolia (421614)
 * Wallets: MetaMask, WalletConnect, Coinbase Wallet, Injected
 */

import { createConfig, http } from 'wagmi';
import { arbitrumSepolia } from 'wagmi/chains';
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors';

const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'vdao-mvp-placeholder';

const rpcUrl =
  process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC || 'https://sepolia-rollup.arbitrum.io/rpc';

export const wagmiConfig = createConfig({
  chains: [arbitrumSepolia],
  connectors: [
    // MetaMask and any other browser extension wallet
    injected({
      shimDisconnect: true,
    }),
    // WalletConnect v2 (QR code, mobile wallets)
    walletConnect({
      projectId: walletConnectProjectId,
      metadata: {
        name: 'VDAO',
        description: 'Sistema de reputación on-chain con evaluaciones mutuas',
        url: 'https://vdao.xyz',
        icons: ['https://vdao.xyz/icon.png'],
      },
    }),
    // Coinbase Wallet
    coinbaseWallet({
      appName: 'VDAO',
      appLogoUrl: 'https://vdao.xyz/icon.png',
    }),
  ],
  transports: {
    [arbitrumSepolia.id]: http(rpcUrl),
  },
});

// Export the target chain for easy reference
export const VDAO_CHAIN = arbitrumSepolia;
export const VDAO_CHAIN_ID = arbitrumSepolia.id; // 421614
