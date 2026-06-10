import { Router } from 'express';
import multer from 'multer';
import { getPersonalizedInsights, runEcoLensAnalysis } from '../controllers/aiController';
import { authenticateJWT } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';

const router = Router();

// Configure multer memory storage with 5MB file limit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

router.use(authenticateJWT as any);
router.use(apiLimiter);

router.get('/insights', getPersonalizedInsights as any);
router.post('/ecolens', upload.single('image'), runEcoLensAnalysis as any);

export default router;
