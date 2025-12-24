import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuthRequest } from '../types';

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const decoded = jwt.verify(token, config.jwtSecret) as {
      id: string;
      username: string;
      rol: string;
    };

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

export const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.rol !== 'ADMIN') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
  }
  next();
};

export const canEditPast = (req: AuthRequest, fecha: Date): boolean => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  
  const fechaComparar = new Date(fecha);
  fechaComparar.setHours(0, 0, 0, 0);

  if (fechaComparar < hoy && req.user?.rol !== 'ADMIN') {
    return false;
  }
  
  return true;
};

