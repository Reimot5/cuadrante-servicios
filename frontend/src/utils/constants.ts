import { Estado } from '../types';

export const ESTADO_COLORS: Record<Estado, string> = {
  [Estado.G]: 'bg-green-200 border-green-400 text-green-800',
  [Estado.LIC]: 'bg-cyan-200 border-cyan-400 text-cyan-800',
  [Estado.C]: 'bg-orange-200 border-orange-400 text-orange-800',
  [Estado.PE]: 'bg-red-200 border-red-400 text-red-800',
  [Estado.X]: 'bg-gray-100 border-gray-300 text-gray-600',
  [Estado.S]: 'bg-yellow-100 border-yellow-300 text-yellow-800',
};

export const ESTADO_LABELS: Record<Estado, string> = {
  [Estado.G]: 'Guardia',
  [Estado.LIC]: 'Licencia',
  [Estado.C]: 'Comisión',
  [Estado.PE]: 'Parte Enfermo',
  [Estado.X]: 'Bloqueado',
  [Estado.S]: 'Semana',
};

