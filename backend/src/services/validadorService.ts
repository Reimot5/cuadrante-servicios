import { PrismaClient, Asignacion, Persona } from '@prisma/client';
import { ValidacionDia, Estado, Grupo } from '../types';

const prisma = new PrismaClient();

export const validarDia = async (fecha: Date): Promise<ValidacionDia> => {
  const fechaSinHora = new Date(fecha);
  fechaSinHora.setHours(0, 0, 0, 0);

  const asignaciones = await prisma.asignacion.findMany({
    where: {
      fecha: fechaSinHora,
      estado: Estado.G,
    },
    include: {
      persona: true,
    },
  });

  const guardias = asignaciones.length;
  const tieneGrupoA = asignaciones.some((a) => a.persona.grupo === Grupo.A);
  const tieneConductor = asignaciones.some((a) => a.persona.isConductor);

  const errores: string[] = [];

  if (guardias !== 4) {
    errores.push(`Se requieren exactamente 4 guardias, pero hay ${guardias}`);
  }

  // Nota: tieneGrupoA se mantiene solo para información, ya no es requisito

  if (!tieneConductor) {
    errores.push('Debe haber al menos 1 conductor en guardia');
  }

  return {
    fecha: fechaSinHora,
    valido: errores.length === 0,
    errores,
    guardias,
    tieneGrupoA,
    tieneConductor,
  };
};

export const validarRango = async (
  fechaInicio: Date,
  fechaFin: Date
): Promise<ValidacionDia[]> => {
  const validaciones: ValidacionDia[] = [];
  const fechaActual = new Date(fechaInicio);

  while (fechaActual <= fechaFin) {
    const validacion = await validarDia(fechaActual);
    validaciones.push(validacion);
    fechaActual.setDate(fechaActual.getDate() + 1);
  }

  return validaciones;
};

