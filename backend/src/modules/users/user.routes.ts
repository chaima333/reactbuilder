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
router.get('/', authorizeRoles('Admin'), getUsers);
router.get('/:id', authorizeRoles('Admin'), getUserById);
router.post('/', authorizeRoles('Admin'), createUser);
router.put('/:id', authorizeRoles('Admin'), updateUser);
router.delete('/:id', authorizeRoles('Admin'), deleteUser);
router.patch('/:id/role', authorizeRoles('Admin'), changeUserRole);

export default router;