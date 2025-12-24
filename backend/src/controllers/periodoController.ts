import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, EstadoPeriodo } from '../types';

const prisma = new PrismaClient();

export const getPeriodos = async (req: AuthRequest, res: Response) => {
  try {
    const periodos = await prisma.periodo.findMany({
      orderBy: { fechaInicio: 'desc' },
    });

    res.json(periodos);
  } catch (error) {
    console.error('Error al obtener períodos:', error);
    res.status(500).json({ error: 'Error al obtener períodos' });
  }
};

export const createPeriodo = async (req: AuthRequest, res: Response) => {
  try {
    const { fechaInicio, fechaFin } = req.body;

    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({ error: 'fechaInicio y fechaFin son requeridos' });
    }

    const periodo = await prisma.periodo.create({
      data: {
        fechaInicio: new Date(fechaInicio),
        fechaFin: new Date(fechaFin),
        estado: EstadoPeriodo.BORRADOR,
        createdBy: req.user?.username || 'admin',
      },
    });

    // Registrar en audit log
    await prisma.auditLog.create({
      data: {
        usuario: req.user?.username || 'sistema',
        accion: 'CREATE_PERIODO',
        detalle: JSON.stringify({ periodoId: periodo.id, fechaInicio, fechaFin }),
      },
    });

    res.status(201).json(periodo);
  } catch (error) {
    console.error('Error al crear período:', error);
    res.status(500).json({ error: 'Error al crear período' });
  }
};

export const publicarPeriodo = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const periodo = await prisma.periodo.update({
      where: { id },
      data: {
        estado: EstadoPeriodo.PUBLICADO,
        publishedAt: new Date(),
      },
    });

    // Registrar en audit log
    await prisma.auditLog.create({
      data: {
        usuario: req.user?.username || 'sistema',
        accion: 'PUBLICAR_PERIODO',
        detalle: JSON.stringify({ periodoId: id }),
      },
    });

    res.json(periodo);
  } catch (error) {
    console.error('Error al publicar período:', error);
    res.status(500).json({ error: 'Error al publicar período' });
  }
};

