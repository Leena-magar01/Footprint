import { Router } from 'express';
import { getLeaderboard } from '../controllers/leaderboardController';
import { authenticateJWT } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';

const router = Router();

router.use(authenticateJWT as any);
router.use(apiLimiter);

router.get('/', getLeaderboard as any);

export default router;
