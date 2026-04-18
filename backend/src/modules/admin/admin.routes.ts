
import { Router } from 'express';
import { authenticateJWT } from '../../shared/auth.util';
import { authorizeRoles } from '../../core/middleware/role.middleware';
import { getPendingUsers, approveUser, rejectUser } from './admin.controller';

const router = Router();

router.use(authenticateJWT);
router.use(authorizeRoles('ADMIN'));

router.get('/pending-users', getPendingUsers);
router.post('/approve-user/:id', approveUser);
router.delete('/reject-user/:id', rejectUser);

export default router;