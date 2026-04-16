import { Router } from 'express';
import { authenticateJWT } from '../../shared/auth.util';
import { requirePermission, PERMISSIONS } from '../../core/middleware/role.middleware';
import {
  getPages,
  getPageById,
  createPage,
  updatePage,
  deletePage,
} from './page.controller';

const router = Router();

router.use(authenticateJWT);

router.get('/sites/:siteId/pages', requirePermission(PERMISSIONS.SITE_READ), getPages);

router.get('/sites/:siteId/pages/:pageId', requirePermission(PERMISSIONS.SITE_READ), getPageById);

router.post('/sites/:siteId/pages', requirePermission(PERMISSIONS.SITE_EDIT), createPage);

router.put('/sites/:siteId/pages/:pageId', requirePermission(PERMISSIONS.SITE_EDIT), updatePage);

router.delete('/sites/:siteId/pages/:pageId', requirePermission(PERMISSIONS.SITE_DELETE), deletePage);

export default router;