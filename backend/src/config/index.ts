import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: (process.env.JWT_SECRET || 'default-secret-change-in-production') as string,
  jwtExpiresIn: (process.env.JWT_EXPIRES_IN || '7d') as string,
  databaseUrl: (process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/cuadrante_dev?schema=public') as string,
  corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:5173') as string,
};

