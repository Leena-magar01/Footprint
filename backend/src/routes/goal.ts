import { Router } from 'express';
import { createGoal, getGoals } from '../controllers/goalController';
import { authenticateJWT } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';

const router = Router();

router.use(authenticateJWT as any);
router.use(apiLimiter);

router.post('/', createGoal as any);
router.get('/', getGoals as any);

export default router;
