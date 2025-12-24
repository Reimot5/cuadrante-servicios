import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';
import { canEditPast } from '../middlewares/authMiddleware';
import { aplicarDescansosAutomaticos } from '../services/reglasService';
import { autoAsignarGuardias } from '../services/autoAsignadorService';
import { validarDia, validarRango } from '../services/validadorService';
import { Estado, Origen } from '../types';

const prisma = new PrismaClient();

export const getAsignaciones = async (req: AuthRequest, res: Response) => {
  try {
    const { fechaInicio, fechaFin, grupo, estado, personaId } = req.query;

    const where: any = {};

    if (fechaInicio && fechaFin) {
      where.fecha = {
        gte: new Date(fechaInicio as string),
        lte: new Date(fechaFin as string),
      };
    }

    if (personaId) {
      where.personaId = personaId;
    }

    if (estado) {
      where.estado = estado;
    }

    const asignaciones = await prisma.asignacion.findMany({
      where,
      include: {
        persona: true,
      },
      orderBy: [{ fecha: 'asc' }, { persona: { nombre: 'asc' } }],
    });

    // Filtrar por grupo si se especifica
    let result = asignaciones;
    if (grupo) {
      result = asignaciones.filter((a) => a.persona.grupo === grupo);
    }

    res.json(result);
  } catch (error) {
    console.error('Error al obtener asignaciones:', error);
    res.status(500).json({ error: 'Error al obtener asignaciones' });
  }
};

export const createAsignacion = async (req: AuthRequest, res: Response) => {
  try {
    const { fecha, personaId, estado, nota } = req.body;

    if (!fecha || !personaId || !estado) {
      return res.status(400).json({ error: 'Fecha, personaId y estado son requeridos' });
    }

    const fechaSinHora = new Date(fecha);
    fechaSinHora.setHours(0, 0, 0, 0);

    // Validar que puede editar el pasado
    if (!canEditPast(req, fechaSinHora)) {
      return res.status(403).json({ error: 'No tiene permisos para editar fechas pasadas' });
    }

    // Verificar si ya existe
    const existente = await prisma.asignacion.findUnique({
      where: {
        fecha_personaId: {
          fecha: fechaSinHora,
          personaId,
        },
      },
    });

    let asignacion;

    if (existente) {
      // Actualizar solo si no es manual o si el usuario puede sobrescribir
      if (existente.origen === Origen.manual || req.user?.rol === 'ADMIN') {
        asignacion = await prisma.asignacion.update({
          where: { id: existente.id },
          data: {
            estado,
            origen: Origen.manual,
            nota,
          },
          include: { persona: true },
        });
      } else {
        return res.status(400).json({ error: 'No se puede sobrescribir asignación manual' });
      }
    } else {
      asignacion = await prisma.asignacion.create({
        data: {
          fecha: fechaSinHora,
          personaId,
          estado,
          origen: Origen.manual,
          nota,
        },
        include: { persona: true },
      });
    }

    // Aplicar reglas automáticas de descanso
    await aplicarDescansosAutomaticos(personaId, fechaSinHora, estado);

    // Registrar en audit log
    await prisma.auditLog.create({
      data: {
        usuario: req.user?.username || 'sistema',
        accion: existente ? 'UPDATE_ASIGNACION' : 'CREATE_ASIGNACION',
        detalle: JSON.stringify({
          asignacionId: asignacion.id,
          fecha: fechaSinHora,
          personaId,
          estado,
        }),
      },
    });

    res.status(existente ? 200 : 201).json(asignacion);
  } catch (error) {
    console.error('Error al crear asignación:', error);
    res.status(500).json({ error: 'Error al crear asignación' });
  }
};

export const createAsignacionRango = async (req: AuthRequest, res: Response) => {
  try {
    const { fechaInicio, fechaFin, personaId, estado, nota } = req.body;

    if (!fechaInicio || !fechaFin || !personaId || !estado) {
      return res.status(400).json({
        error: 'fechaInicio, fechaFin, personaId y estado son requeridos',
      });
    }

    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    const asignaciones = [];
    const fechaActual = new Date(inicio);

    while (fechaActual <= fin) {
      const fechaSinHora = new Date(fechaActual);
      fechaSinHora.setHours(0, 0, 0, 0);

      // Validar permisos
      if (!canEditPast(req, fechaSinHora)) {
        return res.status(403).json({
          error: `No tiene permisos para editar la fecha ${fechaSinHora.toISOString().split('T')[0]}`,
        });
      }

      // Crear o actualizar
      const asignacion = await prisma.asignacion.upsert({
        where: {
          fecha_personaId: {
            fecha: fechaSinHora,
            personaId,
          },
        },
        update: {
          estado,
          origen: Origen.manual,
          nota,
        },
        create: {
          fecha: fechaSinHora,
          personaId,
          estado,
          origen: Origen.manual,
          nota,
        },
      });

      asignaciones.push(asignacion);

      // Aplicar reglas automáticas
      await aplicarDescansosAutomaticos(personaId, fechaSinHora, estado);

      fechaActual.setDate(fechaActual.getDate() + 1);
    }

    // Registrar en audit log
    await prisma.auditLog.create({
      data: {
        usuario: req.user?.username || 'sistema',
        accion: 'CREATE_ASIGNACION_RANGO',
        detalle: JSON.stringify({
          fechaInicio,
          fechaFin,
          personaId,
          estado,
          cantidad: asignaciones.length,
        }),
      },
    });

    res.status(201).json(asignaciones);
  } catch (error) {
    console.error('Error al crear asignaciones en rango:', error);
    res.status(500).json({ error: 'Error al crear asignaciones en rango' });
  }
};

export const deleteAsignacion = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const asignacion = await prisma.asignacion.findUnique({ where: { id } });

    if (!asignacion) {
      return res.status(404).json({ error: 'Asignación no encontrada' });
    }

    if (!canEditPast(req, asignacion.fecha)) {
      return res.status(403).json({ error: 'No tiene permisos para editar fechas pasadas' });
    }

    await prisma.asignacion.delete({ where: { id } });

    // Registrar en audit log
    await prisma.auditLog.create({
      data: {
        usuario: req.user?.username || 'sistema',
        accion: 'DELETE_ASIGNACION',
        detalle: JSON.stringify({ asignacionId: id }),
      },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar asignación:', error);
    res.status(500).json({ error: 'Error al eliminar asignación' });
  }
};

export const autoAsignar = async (req: AuthRequest, res: Response) => {
  try {
    const { fechaInicio, fechaFin } = req.body;

    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({ error: 'fechaInicio y fechaFin son requeridos' });
    }

    const resultado = await autoAsignarGuardias(
      new Date(fechaInicio),
      new Date(fechaFin)
    );

    // Registrar en audit log
    await prisma.auditLog.create({
      data: {
        usuario: req.user?.username || 'sistema',
        accion: 'AUTO_ASIGNAR_GUARDIAS',
        detalle: JSON.stringify(resultado),
      },
    });

    res.json(resultado);
  } catch (error) {
    console.error('Error en auto-asignación:', error);
    res.status(500).json({ error: 'Error en auto-asignación de guardias' });
  }
};

export const validar = async (req: AuthRequest, res: Response) => {
  try {
    const { fecha, fechaInicio, fechaFin } = req.query;

    if (fecha) {
      const validacion = await validarDia(new Date(fecha as string));
      return res.json(validacion);
    }

    if (fechaInicio && fechaFin) {
      const validaciones = await validarRango(
        new Date(fechaInicio as string),
        new Date(fechaFin as string)
      );
      return res.json(validaciones);
    }

    return res.status(400).json({
      error: 'Debe proporcionar fecha o fechaInicio+fechaFin',
    });
  } catch (error) {
    console.error('Error al validar:', error);
    res.status(500).json({ error: 'Error al validar' });
  }
};

export const permutarAsignaciones = async (req: AuthRequest, res: Response) => {
  try {
    const { asignacion1Id, asignacion2Id, nota } = req.body;

    if (!asignacion1Id || !asignacion2Id) {
      return res.status(400).json({
        error: 'Se requieren asignacion1Id y asignacion2Id',
      });
    }

    const asig1 = await prisma.asignacion.findUnique({
      where: { id: asignacion1Id },
      include: { persona: true },
    });

    const asig2 = await prisma.asignacion.findUnique({
      where: { id: asignacion2Id },
      include: { persona: true },
    });

    if (!asig1 || !asig2) {
      return res.status(404).json({ error: 'Asignaciones no encontradas' });
    }

    // Intercambiar personas
    const tempPersonaId = asig1.personaId;

    await prisma.asignacion.update({
      where: { id: asignacion1Id },
      data: {
        personaId: asig2.personaId,
        nota: nota || 'Permuta realizada',
        origen: Origen.manual,
      },
    });

    await prisma.asignacion.update({
      where: { id: asignacion2Id },
      data: {
        personaId: tempPersonaId,
        nota: nota || 'Permuta realizada',
        origen: Origen.manual,
      },
    });

    // Validar que no rompa reglas duras
    const validacion1 = await validarDia(asig1.fecha);
    const validacion2 = await validarDia(asig2.fecha);

    const errores = [...validacion1.errores, ...validacion2.errores];

    // Registrar en audit log
    await prisma.auditLog.create({
      data: {
        usuario: req.user?.username || 'sistema',
        accion: 'PERMUTA_ASIGNACIONES',
        detalle: JSON.stringify({
          asignacion1Id,
          asignacion2Id,
          nota,
          validacion: { errores },
        }),
      },
    });

    res.json({
      mensaje: 'Permuta realizada exitosamente',
      advertencias: errores.length > 0 ? errores : null,
    });
  } catch (error) {
    console.error('Error al permutar:', error);
    res.status(500).json({ error: 'Error al permutar asignaciones' });
  }
};

