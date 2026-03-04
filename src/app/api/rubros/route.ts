import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
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
    const supabase = createServiceClient();

    // Try Supabase first
    let query = supabase
      .from('rubros')
      .select(`
        id,
        nombre,
        nombre_en,
        descripcion,
        activo,
        created_at,
        created_by,
        validation_count,
        rubro_padres!rubro_id(padre_id)
      `)
      .order('id')
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.ilike('nombre', `%${search}%`);
    }

    const { data, error } = await query;

    if (!error && data && data.length > 0) {
      // Map Supabase rows to our Rubro format
      const rubros: RubroRow[] = data.map((row: Record<string, unknown>) => ({
        id: row.id as number,
        nombre: row.nombre as string,
        nombre_en: row.nombre_en as string | undefined,
        descripcion: row.descripcion as string | undefined,
        activo: row.activo as boolean,
        padres: Array.isArray(row.rubro_padres)
          ? (row.rubro_padres as Array<{ padre_id: number }>).map((p) => p.padre_id)
          : [],
        created_at: row.created_at as string | undefined,
        created_by: row.created_by as string | undefined,
        validation_count: row.validation_count as number | undefined,
      }));

      return NextResponse.json({ rubros, total: rubros.length, source: 'supabase' });
    }
  } catch {
    // Fall through to seed data
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

    const supabase = createServiceClient();

    // Check duplicate
    const { data: existing } = await supabase
      .from('rubros')
      .select('id')
      .ilike('nombre', nombre.trim())
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Ya existe un rubro con ese nombre' },
        { status: 409 }
      );
    }

    // Insert rubro
    const { data: newRubro, error: insertError } = await supabase
      .from('rubros')
      .insert({
        nombre: nombre.trim(),
        nombre_en: nombre_en?.trim() || null,
        descripcion: descripcion?.trim() || null,
        activo: false, // Pending validation
        created_by: created_by || null,
        validation_count: 0,
      })
      .select()
      .single();

    if (insertError || !newRubro) {
      return NextResponse.json({ error: 'Error al crear rubro' }, { status: 500 });
    }

    // Insert parent relationships
    if (padres.length > 0) {
      await supabase.from('rubro_padres').insert(
        padres.map((p: number) => ({ rubro_id: newRubro.id, padre_id: p }))
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

    const supabase = createServiceClient();

    const updateData: Record<string, unknown> = {};
    if (nombre !== undefined) updateData.nombre = nombre.trim();
    if (nombre_en !== undefined) updateData.nombre_en = nombre_en?.trim() || null;
    if (descripcion !== undefined) updateData.descripcion = descripcion?.trim() || null;
    if (activo !== undefined) updateData.activo = activo;

    const { data: updated, error } = await supabase
      .from('rubros')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !updated) {
      return NextResponse.json({ error: 'Error al actualizar rubro' }, { status: 500 });
    }

    // Update parent relationships if provided
    if (padres !== undefined) {
      await supabase.from('rubro_padres').delete().eq('rubro_id', id);
      if (padres.length > 0) {
        await supabase.from('rubro_padres').insert(
          padres.map((p: number) => ({ rubro_id: id, padre_id: p }))
        );
      }
    }

    return NextResponse.json({ rubro: { ...updated, padres: padres ?? [] } });
  } catch (e) {
    const err = e as Error;
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 });
  }
}
