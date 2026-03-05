/**
 * /api/paymaster — JSON-RPC proxy to Pimlico
 *
 * The browser sends ERC-4337 JSON-RPC requests here.
 * This route forwards them to Pimlico with the API key,
 * keeping the key server-side only.
 */

import { NextRequest, NextResponse } from 'next/server';
import { applyRateLimit } from '@/lib/api-guard';

const PIMLICO_API_KEY = process.env.PIMLICO_API_KEY || '';
const PIMLICO_RPC = PIMLICO_API_KEY
  ? `https://api.pimlico.io/v2/sepolia/rpc?apikey=${PIMLICO_API_KEY}`
  : '';

export async function POST(request: NextRequest) {
  const blocked = applyRateLimit(request);
  if (blocked) return blocked;

  if (!PIMLICO_RPC) {
    return NextResponse.json(
      { jsonrpc: '2.0', id: null, error: { code: -32603, message: 'Paymaster not configured' } },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();

    const response = await fetch(PIMLICO_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { jsonrpc: '2.0', id: null, error: { code: -32603, message: 'Proxy error' } },
      { status: 500 }
    );
  }
}

// Also support GET for health check
export async function GET() {
  return NextResponse.json({ available: Boolean(PIMLICO_RPC) });
}
