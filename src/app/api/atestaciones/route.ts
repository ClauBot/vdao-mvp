import { NextResponse } from 'next/server';

export async function GET() {
  // TODO: Fetch attestations from Supabase cache
  return NextResponse.json({ atestaciones: [] });
}
