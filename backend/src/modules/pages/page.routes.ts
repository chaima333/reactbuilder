import { Router } from 'express';
import { authenticateJWT } from '../../shared/auth.util';
import { requirePermission } from '../../core/middleware/role.middleware';
import { PERMISSIONS } from '../../core/constants/permissions';
import { getPages, createPage, updatePage, deletePage } from './page.controller';
import { tenantResolver } from '../../core/middleware/tenantResolver';

const router = Router({ mergeParams: true});

router.use(authenticateJWT);
router.use(tenantResolver)

router.get('/', requirePermission(PERMISSIONS.SITE_READ), getPages);

router.post('/', requirePermission(PERMISSIONS.PAGE_CREATE), createPage);

router.put('/:pageId', requirePermission(PERMISSIONS.PAGE_UPDATE), updatePage);

router.delete('/:pageId', requirePermission(PERMISSIONS.PAGE_DELETE), deletePage);

export default router;