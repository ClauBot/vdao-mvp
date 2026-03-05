import { NextResponse } from 'next/server';
import { generateNonce } from '@/lib/auth';

// GET /api/auth/nonce — generate a fresh nonce for SIWE
export async function GET() {
  const nonce = generateNonce();
  return NextResponse.json({ nonce });
}
