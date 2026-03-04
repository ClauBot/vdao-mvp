'use client';

import { useState } from 'react';
import type { Rubro } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Search, X, Loader2, Plus } from 'lucide-react';

interface CreateRubroModalProps {
  open: boolean;
  onClose: () => void;
  rubros: Rubro[];
  walletAddress: string;
  onCreated: (rubro: Rubro) => void;
}

export function CreateRubroModal({
  open,
  onClose,
  rubros,
  walletAddress,
  onCreated,
}: CreateRubroModalProps) {
  const [nombre, setNombre] = useState('');
  const [nombreEn, setNombreEn] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [selectedPadres, setSelectedPadres] = useState<number[]>([]);
  const [parentSearch, setParentSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const filteredParents = rubros.filter(
    (r) =>
      r.nombre.toLowerCase().includes(parentSearch.toLowerCase()) &&
      !selectedPadres.includes(r.id)
  );

  const handleAddPadre = (id: number) => {
    setSelectedPadres((prev) => [...prev, id]);
    setParentSearch('');
  };

  const handleRemovePadre = (id: number) => {
    setSelectedPadres((prev) => prev.filter((p) => p !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nombre.trim() || nombre.trim().length < 3) {
      setError('El nombre debe tener al menos 3 caracteres');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/rubros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombre.trim(),
          nombre_en: nombreEn.trim() || undefined,
          descripcion: descripcion.trim() || undefined,
          padres: selectedPadres,
          created_by: walletAddress,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Error al crear rubro');
        return;
      }

      onCreated(data.rubro);
      handleClose();
    } catch {
      setError('Error de red. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNombre('');
    setNombreEn('');
    setDescripcion('');
    setSelectedPadres([]);
    setParentSearch('');
    setError('');
    onClose();
  };

  const rubroById = new Map(rubros.map((r) => [r.id, r]));

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Crear Rubro
          </DialogTitle>
          <DialogDescription>
            Proponer un nuevo rubro para la constelación CoRu. Quedará pendiente de validación.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Nombre */}
          <div className="space-y-1.5">
            <Label htmlFor="nombre">
              Nombre <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nombre"
              placeholder="ej. Inteligencia Artificial Aplicada"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              maxLength={100}
            />
          </div>

          {/* Nombre en inglés */}
          <div className="space-y-1.5">
            <Label htmlFor="nombre_en">
              Nombre en inglés <span className="text-neutral-400 text-xs">(opcional)</span>
            </Label>
            <Input
              id="nombre_en"
              placeholder="ej. Applied Artificial Intelligence"
              value={nombreEn}
              onChange={(e) => setNombreEn(e.target.value)}
              maxLength={100}
            />
          </div>

          {/* Descripción */}
          <div className="space-y-1.5">
            <Label htmlFor="descripcion">
              Descripción <span className="text-neutral-400 text-xs">(opcional)</span>
            </Label>
            <textarea
              id="descripcion"
              placeholder="Breve descripción del rubro..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
              maxLength={500}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          {/* Padres */}
          <div className="space-y-2">
            <Label>
              Padre(s) <span className="text-neutral-400 text-xs">(opcional)</span>
            </Label>

            {/* Selected parents */}
            {selectedPadres.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {selectedPadres.map((pid) => {
                  const p = rubroById.get(pid);
                  return (
                    <Badge key={pid} variant="secondary" className="gap-1 pr-1">
                      {p?.nombre ?? `#${pid}`}
                      <button
                        type="button"
                        onClick={() => handleRemovePadre(pid)}
                        className="ml-0.5 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            )}

            {/* Search for parents */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Buscar rubro padre..."
                value={parentSearch}
                onChange={(e) => setParentSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {parentSearch && (
              <ScrollArea className="max-h-40 rounded-md border border-neutral-200 dark:border-neutral-800">
                <div className="p-1">
                  {filteredParents.slice(0, 10).map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleAddPadre(r.id)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
                    >
                      {r.nombre}
                    </button>
                  ))}
                  {filteredParents.length === 0 && (
                    <p className="px-3 py-2 text-sm text-neutral-400">Sin resultados</p>
                  )}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-md">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !nombre.trim()}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creando...
                </>
              ) : (
                'Crear Rubro'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
