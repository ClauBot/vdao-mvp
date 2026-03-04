import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import rubrosData from '@/config/rubros-seed.json';

// ---------- Types ----------
interface RubroRow {
  id: number;
  nombre: string;
  nombre_en?: string;
  descripcion?: string;
  activo: boolean;
  padres: number[];
  created_at?: string;
  created_by?: string;
  validation_count?: number;
}

interface SeedRubro {
  id: number;
  codigo?: string;
  nombre: string;
  nombre_en?: string;
  descripcion?: string;
  padres: number[];
  activo: boolean;
}

// ---------- GET /api/rubros ----------
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const limit = Number(searchParams.get('limit') || 200);
  const offset = Number(searchParams.get('offset') || 0);

  try {
    const pool = getPool();

    let queryText = `
      SELECT
        r.id,
        r.nombre,
        r.nombre_en,
        r.descripcion,
        r.activo,
        r.created_at,
        r.created_by,
        r.validation_count,
        COALESCE(
          (SELECT array_agg(rp.padre_id ORDER BY rp.padre_id)
           FROM rubro_padres rp WHERE rp.rubro_id = r.id),
          '{}'
        ) AS padres
      FROM rubros r
    `;
    const params: (string | number)[] = [];

    if (search) {
      params.push(`%${search}%`);
      queryText += ` WHERE r.nombre ILIKE $${params.length}`;
    }

    queryText += ` ORDER BY r.id LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const { rows } = await pool.query(queryText, params);

    const rubros: RubroRow[] = rows.map((row) => ({
      id: row.id,
      nombre: row.nombre,
      nombre_en: row.nombre_en,
      descripcion: row.descripcion,
      activo: row.activo,
      padres: row.padres ?? [],
      created_at: row.created_at,
      created_by: row.created_by,
      validation_count: row.validation_count ?? 0,
    }));

    return NextResponse.json({ rubros, total: rubros.length, source: 'pg' });
  } catch (e) {
    console.error('GET /api/rubros error:', e);
    // Fallback: use seed JSON
  }

  // Fallback: use seed JSON
  const seed = rubrosData as SeedRubro[];
  let filtered = seed;
  if (search) {
    const q = search.toLowerCase();
    filtered = seed.filter((r) => r.nombre.toLowerCase().includes(q));
  }

  const page = filtered.slice(offset, offset + limit);
  const rubros: RubroRow[] = page.map((r) => ({
    id: r.id,
    nombre: r.nombre,
    nombre_en: r.nombre_en,
    descripcion: r.descripcion,
    activo: r.activo,
    padres: r.padres,
    validation_count: 0,
  }));

  return NextResponse.json({ rubros, total: filtered.length, source: 'seed' });
}

// ---------- POST /api/rubros ----------
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, nombre_en, descripcion, padres = [], created_by } = body;

    if (!nombre || nombre.trim().length < 3) {
      return NextResponse.json(
        { error: 'El nombre debe tener al menos 3 caracteres' },
        { status: 400 }
      );
    }

    const pool = getPool();

    // Check duplicate
    const dupCheck = await pool.query(
      `SELECT id FROM rubros WHERE LOWER(nombre) = LOWER($1) LIMIT 1`,
      [nombre.trim()]
    );
    if (dupCheck.rows.length > 0) {
      return NextResponse.json(
        { error: 'Ya existe un rubro con ese nombre' },
        { status: 409 }
      );
    }

    // Insert rubro
    const insertRes = await pool.query(
      `INSERT INTO rubros (nombre, nombre_en, descripcion, activo, created_by, validation_count)
       VALUES ($1, $2, $3, false, $4, 0)
       RETURNING *`,
      [
        nombre.trim(),
        nombre_en?.trim() || null,
        descripcion?.trim() || null,
        created_by || null,
      ]
    );

    const newRubro = insertRes.rows[0];
    if (!newRubro) {
      return NextResponse.json({ error: 'Error al crear rubro' }, { status: 500 });
    }

    // Insert parent relationships
    if (padres.length > 0) {
      const padreValues = padres
        .map((_: number, i: number) => `($1, $${i + 2})`)
        .join(', ');
      await pool.query(
        `INSERT INTO rubro_padres (rubro_id, padre_id) VALUES ${padreValues}`,
        [newRubro.id, ...padres]
      );
    }

    return NextResponse.json({ rubro: { ...newRubro, padres } }, { status: 201 });
  } catch (e) {
    const err = e as Error;
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 });
  }
}

// ---------- PATCH /api/rubros ----------
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, nombre, nombre_en, descripcion, padres, activo } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    const pool = getPool();

    const setClauses: string[] = [];
    const params: (string | number | boolean | null)[] = [];

    if (nombre !== undefined) {
      params.push(nombre.trim());
      setClauses.push(`nombre = $${params.length}`);
    }
    if (nombre_en !== undefined) {
      params.push(nombre_en?.trim() || null);
      setClauses.push(`nombre_en = $${params.length}`);
    }
    if (descripcion !== undefined) {
      params.push(descripcion?.trim() || null);
      setClauses.push(`descripcion = $${params.length}`);
    }
    if (activo !== undefined) {
      params.push(activo);
      setClauses.push(`activo = $${params.length}`);
    }

    if (setClauses.length === 0 && padres === undefined) {
      return NextResponse.json({ error: 'Nada que actualizar' }, { status: 400 });
    }

    let updated = null;
    if (setClauses.length > 0) {
      params.push(id);
      const { rows } = await pool.query(
        `UPDATE rubros SET ${setClauses.join(', ')} WHERE id = $${params.length} RETURNING *`,
        params
      );
      updated = rows[0];
      if (!updated) {
        return NextResponse.json({ error: 'Error al actualizar rubro' }, { status: 500 });
      }
    } else {
      const { rows } = await pool.query(`SELECT * FROM rubros WHERE id = $1`, [id]);
      updated = rows[0];
    }

    // Update parent relationships if provided
    if (padres !== undefined) {
      await pool.query(`DELETE FROM rubro_padres WHERE rubro_id = $1`, [id]);
      if (padres.length > 0) {
        const padreValues = padres
          .map((_: number, i: number) => `($1, $${i + 2})`)
          .join(', ');
        await pool.query(
          `INSERT INTO rubro_padres (rubro_id, padre_id) VALUES ${padreValues}`,
          [id, ...padres]
        );
      }
    }

    return NextResponse.json({ rubro: { ...updated, padres: padres ?? [] } });
  } catch (e) {
    const err = e as Error;
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 });
  }
}
