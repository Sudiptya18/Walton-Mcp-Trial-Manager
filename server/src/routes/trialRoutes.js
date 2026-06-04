import { Router } from 'express';
import { listTrials, getTrial, createTrial } from '../controllers/trialController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.get('/', listTrials);
router.get('/:id', getTrial);
router.post('/', createTrial);

export default router;
