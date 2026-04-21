import { Router } from 'express';
import { requirePermission } from '../../core/middleware/role.middleware';
import { PERMISSIONS } from '../../core/constants/permissions';
import { tenantResolver } from '../../core/middleware/tenantResolver';
import { 
  getPages, 
  createPage, 
  updatePage, 
  deletePage, 
  publishPageController,
  restorePageVersion,
  getPageHistory
} from './page.controller';

const router = Router({ mergeParams: true });

// 🛡️ كل الروابط هوني محمية بـ authenticateJWT (خاطر ناديناها في app.ts)
router.use(tenantResolver);

router.get('/', requirePermission(PERMISSIONS.SITE_READ), getPages);
router.post('/', requirePermission(PERMISSIONS.PAGE_CREATE), createPage);
router.put('/:pageId', requirePermission(PERMISSIONS.PAGE_UPDATE), updatePage);
router.delete('/:pageId', requirePermission(PERMISSIONS.PAGE_DELETE), deletePage);
router.post("/:pageId/publish", publishPageController);
router.get("/:pageId/versions", requirePermission(PERMISSIONS.PAGE_UPDATE), getPageHistory);
router.post("/:pageId/restore/:versionId", requirePermission(PERMISSIONS.PAGE_UPDATE), restorePageVersion);

export default router;