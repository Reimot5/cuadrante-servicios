export enum Grupo {
  A = 'A',
  B = 'B',
}

export enum Estado {
  G = 'G',     // Guardia
  LIC = 'LIC', // Licencia
  C = 'C',     // Comisión
  PE = 'PE',   // Parte Enfermo
  X = 'X',     // Bloqueado
  S = 'S',     // Semana
}

export enum Origen {
  manual = 'manual',
  auto = 'auto',
}

export enum EstadoPeriodo {
  BORRADOR = 'BORRADOR',
  PUBLICADO = 'PUBLICADO',
}

export interface Persona {
  id: string;
  nombre: string;
  grupo: Grupo;
  isConductor: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Asignacion {
  id: string;
  fecha: string;
  personaId: string;
  persona?: Persona;
  estado: Estado;
  origen: Origen;
  nota?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ValidacionDia {
  fecha: string;
  valido: boolean;
  errores: string[];
  guardias: number;
  tieneGrupoA: boolean;
  tieneConductor: boolean;
}

export interface ResultadoAutoAsignacion {
  diasProcesados: number;
  guardiasAsignadas: number;
  errores: { fecha: string; mensaje: string }[];
  exito: boolean;
}

export interface Periodo {
  id: string;
  fechaInicio: string;
  fechaFin: string;
  estado: EstadoPeriodo;
  createdBy: string;
  createdAt: string;
  publishedAt?: string;
}

export interface AuditLog {
  id: string;
  usuario: string;
  accion: string;
  detalle: string;
  fecha: string;
}

export interface User {
  id: string;
  username: string;
  rol: string;
}

