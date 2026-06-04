import { Router } from 'express';
import {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  resetPassword,
} from '../controllers/userController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, requireRole('admin'));

router.get('/', listUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.post('/:id/reset-password', resetPassword);

export default router;
