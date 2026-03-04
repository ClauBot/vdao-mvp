/**
 * /api/atestaciones
 *
 * GET  ?wallet=0x... — Fetch attestations for a wallet from Supabase cache
 *                      (with optional EAS GraphQL fallback for fresh data)
 * POST              — Index a new attestation after on-chain tx confirms
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { createPublicClient, http, decodeAbiParameters } from 'viem';
import { arbitrumSepolia } from 'viem/chains';
import { ARBITRUM_SEPOLIA_RPC, EAS_ADDRESS } from '@/lib/contracts';

// ── EAS GraphQL endpoint for Arbitrum Sepolia ────────────────
const EAS_GRAPHQL_URL = 'https://arbitrum-sepolia.easscan.org/graphql';

// ── Minimal EAS contract ABI for log decoding ────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const EAS_ATTESTED_EVENT = {
  name: 'Attested',
  type: 'event',
  inputs: [
    { name: 'recipient', type: 'address', indexed: true },
    { name: 'attester', type: 'address', indexed: true },
    { name: 'uid', type: 'bytes32', indexed: false },
    { name: 'schemaUID', type: 'bytes32', indexed: true },
  ],
} as const;

// ── EAS Schema data decoder ──────────────────────────────────
function decodeEvaluationSchema(data: `0x${string}`) {
  try {
    const decoded = decodeAbiParameters(
      [
        { name: 'receiver', type: 'address' },
        { name: 'rubroId', type: 'uint16' },
        { name: 'interactionType', type: 'uint8' },
        { name: 'scoreService', type: 'uint8' },
        { name: 'scoreTreatment', type: 'uint8' },
        { name: 'role', type: 'uint8' },
        { name: 'counterpartUID', type: 'bytes32' },
      ],
      data
    );
    return {
      receiver: decoded[0] as string,
      rubroId: Number(decoded[1]),
      interactionType: Number(decoded[2]),
      scoreService: Number(decoded[3]),
      scoreTreatment: Number(decoded[4]),
      role: Number(decoded[5]),
      counterpartUID: decoded[6] as string,
    };
  } catch {
    return null;
  }
}

// ── EAS GraphQL query ────────────────────────────────────────
async function fetchFromEASGraphQL(wallet: string, schemaUID: string) {
  const query = `
    query GetAttestations($wallet: String!, $schemaId: String!) {
      received: attestations(
        where: {
          recipient: { equals: $wallet, mode: insensitive }
          schemaId: { equals: $schemaId }
          revoked: { equals: false }
        }
        orderBy: { timeCreated: desc }
        take: 200
      ) {
        id
        attester
        recipient
        schemaId
        data
        timeCreated
        txid
        revoked
      }
      emitted: attestations(
        where: {
          attester: { equals: $wallet, mode: insensitive }
          schemaId: { equals: $schemaId }
          revoked: { equals: false }
        }
        orderBy: { timeCreated: desc }
        take: 200
      ) {
        id
        attester
        recipient
        schemaId
        data
        timeCreated
        txid
        revoked
      }
    }
  `;

  const response = await fetch(EAS_GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      variables: { wallet, schemaId: schemaUID },
    }),
    next: { revalidate: 60 }, // Cache for 60s
  });

  if (!response.ok) return null;
  const json = await response.json();
  return json.data as {
    received: Array<{
      id: string;
      attester: string;
      recipient: string;
      schemaId: string;
      data: string;
      timeCreated: number;
      txid: string;
    }>;
    emitted: Array<{
      id: string;
      attester: string;
      recipient: string;
      schemaId: string;
      data: string;
      timeCreated: number;
      txid: string;
    }>;
  } | null;
}

// ─────────────────────────────────────────────────────────────
// GET /api/atestaciones?wallet=0x...
// ─────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const wallet = request.nextUrl.searchParams.get('wallet');

  if (!wallet) {
    return NextResponse.json(
      { error: 'Parámetro wallet requerido' },
      { status: 400 }
    );
  }

  const normalizedWallet = wallet.toLowerCase();
  const supabase = createServiceClient();

  try {
    // 1. Try Supabase cache first
    const [receivedRes, emittedRes] = await Promise.all([
      supabase
        .from('atestaciones_cache')
        .select('*')
        .eq('receiver', normalizedWallet)
        .order('created_at', { ascending: false }),
      supabase
        .from('atestaciones_cache')
        .select('*')
        .eq('attester', normalizedWallet)
        .order('created_at', { ascending: false }),
    ]);

    const cachedReceived = receivedRes.data || [];
    const cachedEmitted = emittedRes.data || [];

    // 2. If cache is empty AND schema UID is configured, try EAS GraphQL
    const schemaUID = process.env.NEXT_PUBLIC_SCHEMA_EVALUATION_UID;
    if (cachedReceived.length === 0 && cachedEmitted.length === 0 && schemaUID) {
      const easData = await fetchFromEASGraphQL(normalizedWallet, schemaUID).catch(
        () => null
      );

      if (easData) {
        // Parse and index new attestations
        const allRaw = [...(easData.received || []), ...(easData.emitted || [])];

        const toInsert = allRaw
          .map((att) => {
            const decoded = decodeEvaluationSchema(att.data as `0x${string}`);
            if (!decoded) return null;

            return {
              uid: att.id,
              attester: att.attester.toLowerCase(),
              receiver: att.recipient.toLowerCase(),
              rubro_id: decoded.rubroId,
              interaction_type: decoded.interactionType,
              score_service: decoded.scoreService,
              score_treatment: decoded.scoreTreatment,
              role: decoded.role,
              counterpart_uid:
                decoded.counterpartUID ===
                '0x0000000000000000000000000000000000000000000000000000000000000000'
                  ? null
                  : decoded.counterpartUID,
              created_at: new Date(att.timeCreated * 1000).toISOString(),
            };
          })
          .filter(Boolean);

        if (toInsert.length > 0) {
          await supabase
            .from('atestaciones_cache')
            .upsert(toInsert, { onConflict: 'uid', ignoreDuplicates: true });
        }

        // Return EAS data directly
        return NextResponse.json({
          received: easData.received
            .map((att) => {
              const decoded = decodeEvaluationSchema(att.data as `0x${string}`);
              if (!decoded) return null;
              return {
                uid: att.id,
                attester: att.attester.toLowerCase(),
                receiver: att.recipient.toLowerCase(),
                rubro_id: decoded.rubroId,
                interaction_type: decoded.interactionType,
                score_service: decoded.scoreService,
                score_treatment: decoded.scoreTreatment,
                role: decoded.role,
                created_at: new Date(att.timeCreated * 1000).toISOString(),
              };
            })
            .filter(Boolean),
          emitted: easData.emitted
            .map((att: { id: string; attester: string; recipient: string; schemaId: string; data: string; timeCreated: number; txid: string }) => {
              const decoded = decodeEvaluationSchema(att.data as `0x${string}`);
              if (!decoded) return null;
              return {
                uid: att.id,
                attester: att.attester.toLowerCase(),
                receiver: att.recipient.toLowerCase(),
                rubro_id: decoded.rubroId,
                interaction_type: decoded.interactionType,
                score_service: decoded.scoreService,
                score_treatment: decoded.scoreTreatment,
                role: decoded.role,
                created_at: new Date(att.timeCreated * 1000).toISOString(),
              };
            })
            .filter(Boolean),
          source: 'eas_graphql',
        });
      }
    }

    return NextResponse.json({
      received: cachedReceived,
      emitted: cachedEmitted,
      source: 'supabase_cache',
    });
  } catch (error) {
    console.error('GET /api/atestaciones error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────
// POST /api/atestaciones — Index a new attestation
// Body: { txHash, attester, receiver, rubroId, interactionType,
//         scoreService, scoreTreatment, role }
// ─────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  let body: {
    txHash: string;
    attester: string;
    receiver: string;
    rubroId: number;
    interactionType: number;
    scoreService: number;
    scoreTreatment: number;
    role: number;
    uid?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const { txHash, attester, receiver, rubroId, interactionType, scoreService, scoreTreatment, role } = body;

  if (!txHash || !attester || !receiver) {
    return NextResponse.json(
      { error: 'Campos requeridos: txHash, attester, receiver' },
      { status: 400 }
    );
  }

  const supabase = createServiceClient();

  try {
    let uid = body.uid;

    // If no UID provided, try to get it from the tx receipt
    if (!uid) {
      try {
        const client = createPublicClient({
          chain: arbitrumSepolia,
          transport: http(ARBITRUM_SEPOLIA_RPC),
        });

        const receipt = await client.getTransactionReceipt({
          hash: txHash as `0x${string}`,
        });

        // Find the Attested event in logs
        // Event topic: keccak256("Attested(address,address,bytes32,bytes32)")
        const ATTESTED_TOPIC =
          '0x8bf46bf4cfd674fa735a3d63ec1c9ad4153f033c290341f3a588b75685141b35';

        const attestedLog = receipt.logs.find(
          (log) =>
            log.address.toLowerCase() === EAS_ADDRESS.toLowerCase() &&
            log.topics[0] === ATTESTED_TOPIC
        );

        if (attestedLog) {
          // uid is the non-indexed bytes32 in the log data
          uid = attestedLog.data as string;
          if (uid.length > 66) {
            // data might have extra bytes; take first 32 bytes
            uid = `0x${uid.slice(2, 66)}`;
          }
        }
      } catch (receiptErr) {
        console.warn('Could not fetch UID from receipt:', receiptErr);
      }
    }

    // Fallback UID: use txHash if we couldn't extract it
    if (!uid) {
      uid = txHash;
    }

    const record = {
      uid,
      attester: attester.toLowerCase(),
      receiver: receiver.toLowerCase(),
      rubro_id: rubroId,
      interaction_type: interactionType,
      score_service: scoreService,
      score_treatment: scoreTreatment,
      role,
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('atestaciones_cache')
      .upsert(record, { onConflict: 'uid', ignoreDuplicates: false });

    if (error) {
      console.error('Supabase upsert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Optionally update/create user record
    await supabase
      .from('usuarios')
      .upsert(
        { wallet: attester.toLowerCase(), nivel: 1 },
        { onConflict: 'wallet', ignoreDuplicates: true }
      );

    return NextResponse.json({ success: true, uid, indexed: true });
  } catch (error) {
    console.error('POST /api/atestaciones error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
