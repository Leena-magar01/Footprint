import { Router } from 'express';
import { logFootprint, getFootprintHistory, getAnalytics, getForecast } from '../controllers/footprintController';
import { authenticateJWT } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';

const router = Router();

router.use(authenticateJWT as any);
router.use(apiLimiter);

router.post('/', logFootprint as any);
router.get('/history', getFootprintHistory as any);
router.get('/analytics', getAnalytics as any);
router.get('/predict', getForecast as any);

export default router;
