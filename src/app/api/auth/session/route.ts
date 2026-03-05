import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

// GET /api/auth/session — return current session
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ authenticated: false });
  }
  return NextResponse.json({ authenticated: true, wallet: session.wallet });
}
