import { Router } from 'express';
import { login, register, me } from '../controllers/authController';
import { authMiddleware, adminMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.post('/login', login);
router.post('/register', authMiddleware, adminMiddleware, register);
router.get('/me', authMiddleware, me);

export default router;

