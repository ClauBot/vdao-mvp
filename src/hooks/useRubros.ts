'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Rubro, Proximidad } from '@/lib/types';

// ---------- useRubros ----------
export function useRubros() {
  const [rubros, setRubros] = useState<Rubro[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRubros = useCallback(async (search = '') => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: '200' });
      if (search) params.set('search', search);
      const res = await fetch(`/api/rubros?${params}`);
      if (!res.ok) throw new Error('Error al cargar rubros');
      const data = await res.json();
      setRubros(data.rubros ?? []);
      setTotal(data.total ?? 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRubros();
  }, [fetchRubros]);

  return { rubros, total, loading, error, refetch: fetchRubros };
}

// ---------- useProximidades ----------
export function useProximidades() {
  const [proximidades, setProximidades] = useState<Proximidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        const res = await fetch('/api/proximidades');
        if (!res.ok) throw new Error('Error al cargar proximidades');
        const data = await res.json();
        setProximidades(data.proximidades ?? []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  return { proximidades, loading, error };
}

// ---------- useUserLevel ----------
export function useUserLevel(wallet?: string): 1 | 2 | 3 | 4 {
  const [level, setLevel] = useState<1 | 2 | 3 | 4>(1);

  useEffect(() => {
    if (!wallet) return;
    async function fetchLevel() {
      try {
        const res = await fetch(`/api/usuarios?wallet=${wallet}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.usuario?.nivel) {
          const n = Math.min(4, Math.max(1, data.usuario.nivel)) as 1 | 2 | 3 | 4;
          setLevel(n);
        }
      } catch {
        // Keep default level 1
      }
    }
    fetchLevel();
  }, [wallet]);

  return level;
}
