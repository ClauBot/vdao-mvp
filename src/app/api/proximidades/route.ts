import { NextResponse } from 'next/server';

export async function GET() {
  // TODO: Fetch proximidades from Supabase
  return NextResponse.json({ proximidades: [] });
}
