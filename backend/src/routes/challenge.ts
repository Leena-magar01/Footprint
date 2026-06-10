import { Router } from 'express';
import { getChallenges, joinChallenge, completeChallenge } from '../controllers/challengeController';
import { authenticateJWT } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';

const router = Router();

router.use(authenticateJWT as any);
router.use(apiLimiter);

router.get('/', getChallenges as any);
router.post('/join', joinChallenge as any);
router.post('/complete', completeChallenge as any);

export default router;
