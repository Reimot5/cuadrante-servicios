import { Router } from 'express';
import {
  getAsignaciones,
  createAsignacion,
  createAsignacionRango,
  deleteAsignacion,
  autoAsignar,
  validar,
  permutarAsignaciones,
} from '../controllers/asignacionController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getAsignaciones);
router.post('/', createAsignacion);
router.post('/rango', createAsignacionRango);
router.delete('/:id', deleteAsignacion);
router.post('/auto-asignar', autoAsignar);
router.get('/validar', validar);
router.post('/permuta', permutarAsignaciones);

export default router;

