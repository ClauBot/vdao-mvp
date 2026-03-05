import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

// GET /api/usuarios?wallet=0x...
export async function GET(request: NextRequest) {
  const wallet = request.nextUrl.searchParams.get('wallet');

  if (!wallet) {
    return NextResponse.json({ error: 'Parámetro wallet requerido' }, { status: 400 });
  }

  try {
    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT wallet, nivel, nombre_display, created_at FROM usuarios WHERE LOWER(wallet) = LOWER($1)`,
      [wallet]
    );

    if (rows.length === 0) {
      return NextResponse.json({ usuario: null });
    }

    return NextResponse.json({ usuario: rows[0] });
  } catch (e) {
    console.error('GET /api/usuarios error:', e);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
