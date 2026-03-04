/**
 * wagmi v2 configuration for VDAO MVP
 * Chain: Sepolia (11155111)
 */

import { createConfig, http } from 'wagmi';
import { sepolia } from "wagmi/chains";;
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'placeholder';
const rpcUrl =
  process.env.NEXT_PUBLIC_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';

export const config = createConfig({
  chains: [sepolia],
  connectors: [
    injected(),
    walletConnect({ projectId }),
    coinbaseWallet({ appName: 'VDAO' }),
  ],
  transports: {
    [sepolia.id]: http(rpcUrl),
  },
  ssr: true,
});

export const VDAO_CHAIN = sepolia;
export const VDAO_CHAIN_ID = sepolia.id; // 11155111
