import { Router } from 'express';
import { getAuditLogs } from '../controllers/auditLogController';
import { authMiddleware, adminMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/', getAuditLogs);

export default router;

