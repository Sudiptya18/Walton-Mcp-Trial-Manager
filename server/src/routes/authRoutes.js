import { Router } from 'express';
import { login, logout, profile, forgotPassword } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.post('/logout', authenticate, logout);
router.get('/profile', authenticate, profile);
router.post('/forgot-password', forgotPassword);

export default router;
