import { PrismaClient } from '@prisma/client';
import { Estado, Origen } from '../types';

const prisma = new PrismaClient();

export const aplicarDescansosAutomaticos = async (
  personaId: string,
  fecha: Date,
  estado: Estado
): Promise<void> => {
  // Solo aplica para estados C y S
  if (estado !== Estado.C && estado !== Estado.S) {
    return;
  }

  // Obtener reglas configurables activas para este estado
  const reglas = await prisma.reglaConfigurable.findMany({
    where: {
      estadoTrigger: estado,
      activa: true,
    },
    orderBy: {
      prioridad: 'asc',
    },
  });

  // Aplicar regla por defecto: 2 días de descanso (X)
  const diasDescanso = reglas.length > 0 ? reglas[0].diasDescanso : 2;
  const estadoDescanso = reglas.length > 0 ? reglas[0].estadoDescanso : Estado.X;

  const fechaSiguiente = new Date(fecha);
  fechaSiguiente.setDate(fechaSiguiente.getDate() + 1);

  // Crear días de descanso automáticos
  for (let i = 0; i < diasDescanso; i++) {
    const fechaDescanso = new Date(fechaSiguiente);
    fechaDescanso.setDate(fechaDescanso.getDate() + i);
    fechaDescanso.setHours(0, 0, 0, 0);

    // Verificar si ya existe una asignación para esta fecha
    const asignacionExistente = await prisma.asignacion.findUnique({
      where: {
        fecha_personaId: {
          fecha: fechaDescanso,
          personaId,
        },
      },
    });

    // Solo crear si no existe o si es automática (no sobrescribir manuales)
    if (!asignacionExistente) {
      await prisma.asignacion.create({
        data: {
          fecha: fechaDescanso,
          personaId,
          estado: estadoDescanso,
          origen: Origen.auto,
          nota: `Descanso automático después de ${estado}`,
        },
      });
    } else if (asignacionExistente.origen === Origen.auto) {
      // Actualizar solo si es automática
      await prisma.asignacion.update({
        where: { id: asignacionExistente.id },
        data: {
          estado: estadoDescanso,
          nota: `Descanso automático después de ${estado}`,
        },
      });
    }
  }
};

export const inicializarReglasDefault = async (): Promise<void> => {
  // Verificar si ya existen reglas
  const reglasExistentes = await prisma.reglaConfigurable.count();

  if (reglasExistentes === 0) {
    // Crear reglas por defecto
    await prisma.reglaConfigurable.createMany({
      data: [
        {
          estadoTrigger: Estado.C,
          diasDescanso: 2,
          estadoDescanso: Estado.X,
          prioridad: 1,
          activa: true,
          descripcion: 'Después de Comisión, 2 días bloqueados',
        },
        {
          estadoTrigger: Estado.S,
          diasDescanso: 2,
          estadoDescanso: Estado.X,
          prioridad: 1,
          activa: true,
          descripcion: 'Después de Semana, 2 días bloqueados',
        },
      ],
    });
  }
};

