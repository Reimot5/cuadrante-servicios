import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    rol: string;
  };
}

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

export interface ValidacionDia {
  fecha: Date;
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

