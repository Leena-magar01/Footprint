import { Router } from 'express';
import { getNotifications, markAsRead } from '../controllers/notificationController';
import { authenticateJWT } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';

const router = Router();

router.use(authenticateJWT as any);
router.use(apiLimiter);

router.get('/', getNotifications as any);
router.put('/read', markAsRead as any); // mark all as read
router.put('/:notificationId/read', markAsRead as any); // mark specific

export default router;
