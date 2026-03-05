import { NextRequest, NextResponse } from 'next/server';
import {
  createPublicClient,
  createWalletClient,
  http,
  isAddress,
  isHex,
  decodeEventLog,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import { SEPOLIA_RPC } from '@/lib/contracts';
import { SCHEMA_EVALUATION_UID } from '@/lib/eas';
import { applyRateLimit } from '@/lib/api-guard';
import { isValidWallet } from '@/lib/sanitize';
import {
  EAS_CONTRACT_ADDRESS,
  ATTEST_BY_DELEGATION_ABI,
  ATTESTED_EVENT_ABI,
  splitSignature,
} from '@/lib/eas-delegated';

const RELAYER_PRIVATE_KEY = process.env.RELAYER_PRIVATE_KEY;

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(SEPOLIA_RPC),
});

// GET /api/attest-delegated — health check
export async function GET() {
  const available = !!RELAYER_PRIVATE_KEY;
  return NextResponse.json({ available });
}

// POST /api/attest-delegated — submit delegated attestation
export async function POST(request: NextRequest) {
  const blocked = applyRateLimit(request);
  if (blocked) return blocked;

  try {
    if (!RELAYER_PRIVATE_KEY) {
      return NextResponse.json(
        { error: 'Relayer not configured' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const {
      signature,
      attester,
      recipient,
      schemaUid,
      schemaData,
      // Fields for DB indexing
      rubroId,
      interactionType,
      scoreService,
      scoreTreatment,
      role,
    } = body;

    // Validate required fields
    if (!signature || !isHex(signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }
    if (!attester || !isAddress(attester)) {
      return NextResponse.json({ error: 'Invalid attester address' }, { status: 400 });
    }
    if (!recipient || !isAddress(recipient)) {
      return NextResponse.json({ error: 'Invalid recipient address' }, { status: 400 });
    }
    if (!schemaUid || !isHex(schemaUid)) {
      return NextResponse.json({ error: 'Invalid schema UID' }, { status: 400 });
    }
    if (!schemaData || !isHex(schemaData)) {
      return NextResponse.json({ error: 'Invalid schema data' }, { status: 400 });
    }

    // Split signature into v, r, s
    const { v, r, s } = splitSignature(signature as `0x${string}`);

    // Create relayer wallet
    const relayerAccount = privateKeyToAccount(RELAYER_PRIVATE_KEY as `0x${string}`);
    const walletClient = createWalletClient({
      account: relayerAccount,
      chain: sepolia,
      transport: http(SEPOLIA_RPC),
    });

    // Submit attestByDelegation
    const txHash = await walletClient.writeContract({
      address: EAS_CONTRACT_ADDRESS as `0x${string}`,
      abi: ATTEST_BY_DELEGATION_ABI,
      functionName: 'attestByDelegation',
      args: [
        {
          schema: schemaUid as `0x${string}`,
          data: {
            recipient: recipient as `0x${string}`,
            expirationTime: 0n,
            revocable: true,
            refUID: '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`,
            data: schemaData as `0x${string}`,
            value: 0n,
          },
          signature: { v, r, s },
          attester: attester as `0x${string}`,
        },
      ],
      value: 0n,
    });

    // Wait for receipt
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash,
      confirmations: 1,
    });

    // Extract attestation UID from Attested event
    let uid: string | null = null;
    for (const log of receipt.logs) {
      try {
        const decoded = decodeEventLog({
          abi: ATTESTED_EVENT_ABI,
          data: log.data,
          topics: log.topics,
        });
        if (decoded.eventName === 'Attested') {
          uid = decoded.args.uid;
          break;
        }
      } catch {
        // Not the event we're looking for
      }
    }

    if (!uid) {
      return NextResponse.json(
        { error: 'Transaction succeeded but could not extract attestation UID', txHash },
        { status: 500 }
      );
    }

    // Index in DB via existing /api/atestaciones logic
    if (rubroId !== undefined && isValidWallet(attester) && isValidWallet(recipient)) {
      try {
        const baseUrl = request.nextUrl.origin;
        await fetch(`${baseUrl}/api/atestaciones`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            txHash,
            uid,
            attester,
            receiver: recipient,
            rubroId,
            interactionType,
            scoreService,
            scoreTreatment,
            role,
          }),
        });
      } catch (indexErr) {
        console.warn('DB indexing failed (non-critical):', indexErr);
      }
    }

    return NextResponse.json({
      success: true,
      txHash,
      uid,
      attester,
      recipient,
    });
  } catch (error: unknown) {
    console.error('Error submitting delegated attestation:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to submit attestation', details: message },
      { status: 500 }
    );
  }
}
