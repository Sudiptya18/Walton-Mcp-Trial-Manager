import { Router } from 'express';
import { getStats, getActivityLogs } from '../controllers/dashboardController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/stats', authenticate, requireRole('admin'), getStats);
router.get('/activity-logs', authenticate, requireRole('admin'), getActivityLogs);

export default router;
