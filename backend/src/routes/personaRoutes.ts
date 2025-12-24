import { Router } from 'express';
import {
  getPersonas,
  getPersona,
  createPersona,
  updatePersona,
  deletePersona,
} from '../controllers/personaController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getPersonas);
router.get('/:id', getPersona);
router.post('/', createPersona);
router.put('/:id', updatePersona);
router.delete('/:id', deletePersona);

export default router;

