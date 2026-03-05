import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, isAddress } from 'viem';
import { sepolia } from 'viem/chains';
import { SEPOLIA_RPC } from '@/lib/contracts';
import { EAS_CONTRACT_ADDRESS, GET_NONCE_ABI } from '@/lib/eas-delegated';

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(SEPOLIA_RPC),
});

// GET /api/attest-delegated/nonce?address=0x...
export async function GET(request: NextRequest) {
  try {
    const address = request.nextUrl.searchParams.get('address');

    if (!address || !isAddress(address)) {
      return NextResponse.json(
        { error: 'Valid Ethereum address required' },
        { status: 400 }
      );
    }

    const nonce = await publicClient.readContract({
      address: EAS_CONTRACT_ADDRESS as `0x${string}`,
      abi: GET_NONCE_ABI,
      functionName: 'getNonce',
      args: [address as `0x${string}`],
    });

    return NextResponse.json({ nonce: nonce.toString() });
  } catch (error) {
    console.error('Error fetching nonce:', error);
    return NextResponse.json(
      { error: 'Failed to fetch nonce' },
      { status: 500 }
    );
  }
}
