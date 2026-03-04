import { NextResponse } from 'next/server';

export async function GET() {
  // TODO: Fetch rubros from Supabase
  return NextResponse.json({ rubros: [] });
}
