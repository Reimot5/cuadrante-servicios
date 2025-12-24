import express from 'express';
import cors from 'cors';
import { config } from './config';
import authRoutes from './routes/authRoutes';
import personaRoutes from './routes/personaRoutes';
import asignacionRoutes from './routes/asignacionRoutes';
import periodoRoutes from './routes/periodoRoutes';
import auditLogRoutes from './routes/auditLogRoutes';

const app = express();

// Middlewares
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/personas', personaRoutes);
app.use('/api/asignaciones', asignacionRoutes);
app.use('/api/periodos', periodoRoutes);
app.use('/api/audit-log', auditLogRoutes);

// Manejo de errores
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
  });
});

app.listen(config.port, () => {
  console.log(`🚀 Servidor corriendo en puerto ${config.port}`);
  console.log(`🌍 Ambiente: ${config.nodeEnv}`);
});

