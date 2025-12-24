import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { Grupo } from '../types';

const prisma = new PrismaClient();

export const getPersonas = async (req: Request, res: Response) => {
  try {
    const { grupo, isConductor } = req.query;

    const where: any = {};

    if (grupo) {
      where.grupo = grupo;
    }

    if (isConductor !== undefined) {
      where.isConductor = isConductor === 'true';
    }

    const personas = await prisma.persona.findMany({
      where,
      orderBy: [{ grupo: 'asc' }, { nombre: 'asc' }],
    });

    res.json(personas);
  } catch (error) {
    console.error('Error al obtener personas:', error);
    res.status(500).json({ error: 'Error al obtener personas' });
  }
};

export const getPersona = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const persona = await prisma.persona.findUnique({
      where: { id },
      include: {
        asignaciones: {
          orderBy: { fecha: 'desc' },
          take: 10,
        },
      },
    });

    if (!persona) {
      return res.status(404).json({ error: 'Persona no encontrada' });
    }

    res.json(persona);
  } catch (error) {
    console.error('Error al obtener persona:', error);
    res.status(500).json({ error: 'Error al obtener persona' });
  }
};

export const createPersona = async (req: Request, res: Response) => {
  try {
    const { nombre, grupo, isConductor } = req.body;

    // Validación: Grupo A solo puede tener conductores
    if (grupo === Grupo.A && !isConductor) {
      return res.status(400).json({
        error: 'El Grupo A solo puede contener personas con isConductor = true',
      });
    }

    if (!nombre || !grupo) {
      return res.status(400).json({ error: 'Nombre y grupo son requeridos' });
    }

    const persona = await prisma.persona.create({
      data: {
        nombre,
        grupo,
        isConductor: isConductor ?? false,
      },
    });

    res.status(201).json(persona);
  } catch (error) {
    console.error('Error al crear persona:', error);
    res.status(500).json({ error: 'Error al crear persona' });
  }
};

export const updatePersona = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nombre, grupo, isConductor } = req.body;

    // Validación: Grupo A solo puede tener conductores
    if (grupo === Grupo.A && isConductor === false) {
      return res.status(400).json({
        error: 'El Grupo A solo puede contener personas con isConductor = true',
      });
    }

    const persona = await prisma.persona.update({
      where: { id },
      data: {
        ...(nombre && { nombre }),
        ...(grupo && { grupo }),
        ...(isConductor !== undefined && { isConductor }),
      },
    });

    res.json(persona);
  } catch (error) {
    console.error('Error al actualizar persona:', error);
    res.status(500).json({ error: 'Error al actualizar persona' });
  }
};

export const deletePersona = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.persona.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar persona:', error);
    res.status(500).json({ error: 'Error al eliminar persona' });
  }
};

