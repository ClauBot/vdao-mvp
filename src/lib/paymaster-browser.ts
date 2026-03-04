/**
 * Browser-side Paymaster Helper
 *
 * Extends paymaster.ts to work with wagmi WalletClients (browser wallets like MetaMask).
 * While paymaster.ts is designed for LocalAccounts (private keys),
 * this module handles the EIP-4337 flow for connected browser wallets.
 */

import { createSmartAccountClient } from 'permissionless';
import { toSimpleSmartAccount } from 'permissionless/accounts';
import { http, type WalletClient } from 'viem';
import { arbitrumSepolia } from 'viem/chains';
import {
  publicClient,
  ENTRYPOINT_V07,
  createPimlicoSponsorClient,
} from './paymaster';

const SIMPLE_ACCOUNT_FACTORY = '0x91E60e0613810449d098b0b5Ec8b51A0FE8c8985' as const;
const PIMLICO_API_KEY = process.env.NEXT_PUBLIC_PIMLICO_API_KEY || '';

function getPimlicoRpc(): string {
  return `https://api.pimlico.io/v2/arbitrum-sepolia/rpc?apikey=${PIMLICO_API_KEY}`;
}

/**
 * Creates a gasless smart account client from a wagmi WalletClient.
 *
 * permissionless v0.3's toSimpleSmartAccount() accepts WalletClient as owner,
 * allowing browser wallets (MetaMask, WalletConnect, etc.) to create ERC-4337 accounts.
 *
 * The user signs the UserOperation via their browser wallet,
 * but pays NO gas — Pimlico's paymaster sponsors it.
 */
export async function createGaslessClientFromWalletClient(walletClient: WalletClient) {
  const pimlicoRpc = getPimlicoRpc();

  // Create the Simple Smart Account using the browser wallet as owner
  const smartAccount = await toSimpleSmartAccount({
    client: publicClient,
    // permissionless v0.3 accepts WalletClient as owner
    owner: walletClient as Parameters<typeof toSimpleSmartAccount>[0]['owner'],
    factoryAddress: SIMPLE_ACCOUNT_FACTORY,
    entryPoint: {
      address: ENTRYPOINT_V07,
      version: '0.7',
    },
  });

  const pimlicoClient = createPimlicoSponsorClient();

  const smartAccountClient = createSmartAccountClient({
    account: smartAccount,
    chain: arbitrumSepolia,
    bundlerTransport: http(pimlicoRpc),
    paymaster: pimlicoClient,
    userOperation: {
      estimateFeesPerGas: async () => {
        return (await pimlicoClient.getUserOperationGasPrice()).fast;
      },
    },
  });

  return {
    smartAccountClient,
    smartAccountAddress: smartAccount.address,
    eoaAddress: walletClient.account!.address,
  };
}
