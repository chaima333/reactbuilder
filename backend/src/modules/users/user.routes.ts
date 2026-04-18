import { Router } from 'express';
import { authenticateJWT } from '../../shared/auth.util';
import { authorizeRoles } from '../../core/middleware/role.middleware';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changeUserRole
} from '../users/user.controller';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateJWT);

// Routes accessibles uniquement aux admins
router.get('/', authorizeRoles('ADMIN'), getUsers);
router.get('/:id', authorizeRoles('ADMIN'), getUserById);
router.post('/', authorizeRoles('ADMIN'), createUser);
router.put('/:id', authorizeRoles('ADMIN'), updateUser);
router.delete('/:id', authorizeRoles('ADMIN'), deleteUser);
router.patch('/:id/role', authorizeRoles('ADMIN'), changeUserRole);

export default router;