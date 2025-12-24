import { Router } from 'express';
import { getPeriodos, createPeriodo, publicarPeriodo } from '../controllers/periodoController';
import { authMiddleware, adminMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getPeriodos);
router.post('/', adminMiddleware, createPeriodo);
router.put('/:id/publicar', adminMiddleware, publicarPeriodo);

export default router;

