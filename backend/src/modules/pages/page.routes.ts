import { Router } from 'express';
import { authenticateJWT } from '../../shared/auth.util';
import { requirePermission } from '../../core/middleware/role.middleware';
import { PERMISSIONS } from '../../core/constants/permissions';
import { getPages, createPage, updatePage, deletePage } from './page.controller';
import tenantResolver from '../../core/middleware/tenant.middleware';

const router = Router();
router.use(authenticateJWT);


// GET Pages (Read)
router.get('/', requirePermission(PERMISSIONS.SITE_READ), getPages);

// POST Page (Create)
router.post('/', tenantResolver, requirePermission(PERMISSIONS.PAGE_CREATE), createPage);

// PUT Page (Update)
router.put('/:pageId', requirePermission(PERMISSIONS.PAGE_UPDATE), updatePage);

// DELETE Page (Delete)
router.delete('/:pageId', requirePermission(PERMISSIONS.PAGE_DELETE), deletePage);

export default router;