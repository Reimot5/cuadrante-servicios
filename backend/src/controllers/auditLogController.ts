import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';

const prisma = new PrismaClient();

export const getAuditLogs = async (req: AuthRequest, res: Response) => {
  try {
    const { fechaInicio, fechaFin, usuario, accion, limit = '50' } = req.query;

    const where: any = {};

    if (fechaInicio && fechaFin) {
      where.fecha = {
        gte: new Date(fechaInicio as string),
        lte: new Date(fechaFin as string),
      };
    }

    if (usuario) {
      where.usuario = usuario;
    }

    if (accion) {
      where.accion = accion;
    }

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { fecha: 'desc' },
      take: parseInt(limit as string, 10),
    });

    res.json(logs);
  } catch (error) {
    console.error('Error al obtener audit logs:', error);
    res.status(500).json({ error: 'Error al obtener audit logs' });
  }
};

