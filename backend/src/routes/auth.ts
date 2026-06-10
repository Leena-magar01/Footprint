import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController';
import { authenticateJWT } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', authLimiter, register as any);
router.post('/login', authLimiter, login as any);
router.get('/me', authenticateJWT as any, getMe as any);

export default router;
