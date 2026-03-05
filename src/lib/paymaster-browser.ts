/**
 * Browser-side Paymaster Helper
 *
 * Uses /api/paymaster proxy to talk to Pimlico.
 * The API key never leaves the server.
 */

import { createSmartAccountClient } from 'permissionless';
import { toSimpleSmartAccount } from 'permissionless/accounts';
import { createPimlicoClient } from 'permissionless/clients/pimlico';
import { http, type WalletClient, type Transport, type Chain, type Account } from 'viem';
import { sepolia } from "viem/chains";
import { publicClient, ENTRYPOINT_V07 } from './paymaster';

/** Proxy URL — keeps Pimlico API key server-side */
const PROXY_RPC = '/api/paymaster';

/**
 * Creates a gasless smart account client from a wagmi WalletClient.
 *
 * permissionless v0.3's toSimpleSmartAccount accepts a WalletClient directly —
 * its internal toOwner() handles the conversion to a LocalAccount signer.
 * This avoids manual toAccount() wrappers that can break signing with
 * non-MetaMask wallets (Rainbow, WalletConnect, etc.).
 */
export async function createGaslessClientFromWalletClient(walletClient: WalletClient) {
  if (!walletClient.account) {
    throw new Error('WalletClient has no account. Ensure the wallet is connected.');
  }

  // Verify the wallet is on Sepolia
  const walletChainId = await walletClient.getChainId();
  if (walletChainId !== sepolia.id) {
    throw new Error(
      `Wallet is on chain ${walletChainId}, but paymaster requires Sepolia (${sepolia.id}). ` +
      'Please switch your wallet to Sepolia.'
    );
  }

  // Pass the WalletClient directly — permissionless's toOwner() handles
  // the signMessage wrapping correctly for all wallet types.
  // Cast needed: we've already verified account exists above.
  const typedClient = walletClient as WalletClient<Transport, Chain, Account>;

  const smartAccount = await toSimpleSmartAccount({
    client: publicClient,
    owner: typedClient,
    entryPoint: {
      address: ENTRYPOINT_V07,
      version: '0.7',
    },
  });

  console.log('[PAYMASTER]', {
    eoa: walletClient.account.address,
    smartAccount: smartAccount.address,
  });

  const pimlicoClient = createPimlicoClient({
    transport: http(PROXY_RPC),
    chain: sepolia,
    entryPoint: {
      address: ENTRYPOINT_V07,
      version: '0.7',
    },
  });

  const smartAccountClient = createSmartAccountClient({
    account: smartAccount,
    chain: sepolia,
    bundlerTransport: http(PROXY_RPC),
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
    eoaAddress: walletClient.account.address,
  };
}
