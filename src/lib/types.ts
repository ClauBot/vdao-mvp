export interface Rubro {
  id: number;
  nombre: string;
  nombre_en?: string;
  descripcion?: string;
  activo: boolean;
  padres: number[];
  created_at?: string;
  created_by?: string;
  validation_count?: number;
  rejection_count?: number;
}

export interface Proximidad {
  rubro_a: number;
  rubro_b: number;
  valor_propuesto: number;
  valor_actual?: number;
  num_evaluaciones: number;
}

export interface Usuario {
  wallet: string;
  nivel: 1 | 2 | 3 | 4;
  nombre_display?: string;
}

export interface Atestacion {
  uid: string;
  attester: string;
  receiver: string;
  rubro_id: number;
  interaction_type: 0 | 1 | 2; // Commercial, Teaching, Research
  score_service: 1 | 2 | 3 | 4;
  score_treatment: 1 | 2 | 3 | 4;
  role: 0 | 1; // Provider, Client
  counterpart_uid?: string;
  created_at: string;
  block_number?: number;
}

export interface ProximidadAtestacion {
  uid: string;
  rubro_a: number;
  rubro_b: number;
  score: number; // 1-100
  proposer: string;
  proposer_level: 1 | 2 | 3 | 4;
  created_at: string;
}

export const INTERACTION_TYPES = ['Comercial', 'Docente', 'Investigación'] as const;
export const SCORE_LABELS = ['', 'Muy malo', 'Malo', 'Bueno', 'Muy bueno'] as const;
export const ROLE_LABELS = ['Proveedor', 'Cliente'] as const;
export const NIVEL_LABELS = ['', 'Introductorio', 'Comunidad', 'Dedicación', 'Responsabilidad'] as const;
