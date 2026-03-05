/**
 * Browser-side Paymaster Helper
 *
 * Uses /api/paymaster proxy to talk to Pimlico.
 * The API key never leaves the server.
 */

import { createSmartAccountClient } from 'permissionless';
import { toSimpleSmartAccount } from 'permissionless/accounts';
import { createPimlicoClient } from 'permissionless/clients/pimlico';
import { http, type WalletClient } from 'viem';
import { sepolia } from "viem/chains";
import { publicClient, ENTRYPOINT_V07 } from './paymaster';

const SIMPLE_ACCOUNT_FACTORY = '0x91E60e0613810449d098b0b5Ec8b51A0FE8c8985' as const;

// Use the backend proxy instead of Pimlico directly
function getProxyRpc(): string {
  return '/api/paymaster';
}

/**
 * Creates a gasless smart account client from a wagmi WalletClient.
 * All Pimlico communication goes through /api/paymaster (server-side proxy).
 */
export async function createGaslessClientFromWalletClient(walletClient: WalletClient) {
  const proxyRpc = getProxyRpc();

  const smartAccount = await toSimpleSmartAccount({
    client: publicClient,
    owner: walletClient as Parameters<typeof toSimpleSmartAccount>[0]['owner'],
    factoryAddress: SIMPLE_ACCOUNT_FACTORY,
    entryPoint: {
      address: ENTRYPOINT_V07,
      version: '0.7',
    },
  });

  const pimlicoClient = createPimlicoClient({
    transport: http(proxyRpc),
    chain: sepolia,
    entryPoint: {
      address: ENTRYPOINT_V07,
      version: '0.7',
    },
  });

  const smartAccountClient = createSmartAccountClient({
    account: smartAccount,
    chain: sepolia,
    bundlerTransport: http(proxyRpc),
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
