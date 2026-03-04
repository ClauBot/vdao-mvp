/**
 * VDAO MVP — Paymaster Integration (Pimlico ERC-4337)
 *
 * Enables gasless attestations: users sign, project pays the gas.
 *
 * Architecture:
 * - ERC-4337 Account Abstraction via Pimlico
 * - Smart Account: Simple Account (permissionless.js v0.3)
 * - Bundler: Pimlico bundler (Arbitrum Sepolia)
 * - Paymaster: Pimlico Verifying Paymaster (sponsorship policy)
 *
 * Why Pimlico:
 * ✅ Full support for Arbitrum Sepolia (421614)
 * ✅ Free testnet sponsorship (no upfront costs)
 * ✅ permissionless.js v0.3 native integration
 * ✅ ERC-4337 v0.7 compliant
 * ✅ Verifying paymaster = project controls spending policies
 * ✅ Built-in rate limiting via policy dashboard
 *
 * vs Alchemy: requires Account Kit + paid plan for some features
 * vs StackUp: less actively maintained, smaller ecosystem
 *
 * Gas estimates (Arbitrum Sepolia):
 * - EAS Attestation tx: ~100k–150k gas
 * - At ~0.1 gwei: ~0.00001–0.000015 ETH (~$0.03–0.045 at $3000 ETH)
 * - With Pimlico testnet sponsorship: FREE for users
 *
 * Rate limiting (configured in Pimlico dashboard):
 * - Max 10 UserOps / wallet / day
 * - Max gas per UserOp: 500,000
 *
 * Setup:
 * 1. Sign up at https://dashboard.pimlico.io
 * 2. Create an app → get API key
 * 3. Create sponsorship policy for Arbitrum Sepolia
 * 4. Set NEXT_PUBLIC_PIMLICO_API_KEY in .env.local
 */

import { createPimlicoClient } from 'permissionless/clients/pimlico';
import { createSmartAccountClient } from 'permissionless';
import { toSimpleSmartAccount } from 'permissionless/accounts';
import {
  createPublicClient,
  createWalletClient,
  http,
  type Account,
  type LocalAccount,
} from 'viem';
import { arbitrumSepolia } from 'viem/chains';
import { ARBITRUM_SEPOLIA_RPC } from './contracts';

// ============================================================
// ERC-4337 Entrypoint Addresses
// ============================================================

/** ERC-4337 EntryPoint v0.7 address (deterministic, same on all chains) */
export const ENTRYPOINT_V07 = '0x0000000071727De22E5E9d8BAf0edAc6f37da032' as const;

/** Simple Account Factory on Arbitrum Sepolia */
const SIMPLE_ACCOUNT_FACTORY = '0x91E60e0613810449d098b0b5Ec8b51A0FE8c8985' as const;

// ============================================================
// Configuration
// ============================================================

const PIMLICO_API_KEY = process.env.NEXT_PUBLIC_PIMLICO_API_KEY || '';

function getPimlicoRpc() {
  if (!PIMLICO_API_KEY) return '';
  return `https://api.pimlico.io/v2/arbitrum-sepolia/rpc?apikey=${PIMLICO_API_KEY}`;
}

/**
 * Whether the paymaster is configured and available.
 * Returns true when NEXT_PUBLIC_PIMLICO_API_KEY is set.
 */
export function isPaymasterAvailable(): boolean {
  return Boolean(PIMLICO_API_KEY);
}

// ============================================================
// Public Client (read-only)
// ============================================================

/** Read-only public client for Arbitrum Sepolia */
export const publicClient = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(ARBITRUM_SEPOLIA_RPC),
});

// ============================================================
// Pimlico Client (bundler + paymaster combined)
// ============================================================

/**
 * Creates a Pimlico client that handles both bundling and paymaster sponsorship.
 * permissionless v0.3 merges bundler + paymaster into a single client.
 */
export function createPimlicoSponsorClient() {
  const rpc = getPimlicoRpc();
  if (!rpc) {
    throw new Error(
      'Pimlico not configured. Set NEXT_PUBLIC_PIMLICO_API_KEY in .env.local\n' +
        'Get your API key at: https://dashboard.pimlico.io'
    );
  }

  return createPimlicoClient({
    transport: http(rpc),
    chain: arbitrumSepolia,
    entryPoint: {
      address: ENTRYPOINT_V07,
      version: '0.7',
    },
  });
}

// ============================================================
// Smart Account Creation
// ============================================================

/**
 * Creates a gasless smart account client for a user's EOA signer.
 *
 * The smart account is a Simple Account (ERC-4337) that wraps the user's
 * EOA. Transactions are sent as UserOperations sponsored by Pimlico.
 *
 * @param signer - A viem LocalAccount (e.g., from privateKeyToAccount)
 *                 For browser wallets, use a custom account from wagmi wallet client.
 * @returns Smart account client ready to send gasless txs
 *
 * @example
 * ```ts
 * // In a React component with wagmi:
 * const walletClient = useWalletClient()
 * const account = walletClientToLocalAccount(walletClient.data!)
 * const { smartClient, address } = await createGaslessClient(account)
 * ```
 */
export async function createGaslessClient(signer: LocalAccount) {
  if (!isPaymasterAvailable()) {
    throw new Error(PAYMASTER_SETUP_GUIDE);
  }

  const pimlicoRpc = getPimlicoRpc();

  // Create the Simple Smart Account
  const smartAccount = await toSimpleSmartAccount({
    client: publicClient,
    owner: signer,
    factoryAddress: SIMPLE_ACCOUNT_FACTORY,
    entryPoint: {
      address: ENTRYPOINT_V07,
      version: '0.7',
    },
  });

  // Create the Pimlico sponsor client
  const pimlicoClient = createPimlicoSponsorClient();

  // Create the smart account client with paymaster middleware
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
    eoaAddress: signer.address,
  };
}

// ============================================================
// Gasless Transaction Result
// ============================================================

export interface GaslessResult {
  /** ERC-4337 UserOperation hash */
  userOpHash: string;
  /** Underlying transaction hash (available after inclusion) */
  txHash?: string;
  success: boolean;
  error?: string;
  /** Whether the tx was gasless (true) or user paid gas (false) */
  wasGasless: boolean;
}

// ============================================================
// Direct Transaction (fallback when paymaster not configured)
// ============================================================

/**
 * Sends a transaction directly (user pays gas).
 * Used as fallback when NEXT_PUBLIC_PIMLICO_API_KEY is not set.
 */
export async function sendDirectTransaction(
  account: Account,
  to: `0x${string}`,
  data: `0x${string}`,
  value: bigint = 0n
): Promise<GaslessResult> {
  try {
    const walletClient = createWalletClient({
      account,
      chain: arbitrumSepolia,
      transport: http(ARBITRUM_SEPOLIA_RPC),
    });

    const hash = await walletClient.sendTransaction({ to, data, value, account });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    return {
      userOpHash: hash,
      txHash: hash,
      success: receipt.status === 'success',
      wasGasless: false,
    };
  } catch (error: unknown) {
    const e = error as { shortMessage?: string; message?: string };
    return {
      userOpHash: '',
      success: false,
      error: e.shortMessage || e.message || 'Transaction failed',
      wasGasless: false,
    };
  }
}

// ============================================================
// Setup Instructions
// ============================================================

export const PAYMASTER_SETUP_GUIDE = `
Pimlico Paymaster Setup Required
=================================
1. Sign up at https://dashboard.pimlico.io
2. Create a new app → copy your API key
3. Add to .env.local:
   NEXT_PUBLIC_PIMLICO_API_KEY=pim_your_api_key_here
4. In Pimlico dashboard, create a Sponsorship Policy:
   - Chain: Arbitrum Sepolia (421614)
   - Max UserOps per wallet per day: 10
   - Max gas per UserOp: 500,000
5. Restart the dev server (pnpm dev)

Note: On testnet, Pimlico offers free sponsorship for development.
`.trim();
