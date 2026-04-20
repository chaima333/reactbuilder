import { Router } from 'express';
import { authenticateJWT } from '../../shared/auth.util';
import { requirePermission } from '../../core/middleware/role.middleware';
import { PERMISSIONS } from '../../core/constants/permissions';
import { 
  getPages, 
  createPage, 
  updatePage, 
  deletePage, 
  getPublicPage, 
  publishPage // 👈 1. زيد هذي هنا (تأكد إنك عملتلها export في controller)
} from './page.controller';
import { tenantResolver } from '../../core/middleware/tenantResolver';

const router = Router({ mergeParams: true});

// 🌍 المسار العام (Public) لازم يكون الفوق قبل الـ Middleware متاع الـ Auth
// باش الزوار ينجمو يشوفو الصفحة من غير ما يطلبو منهم Login
router.get('/public/:siteId/:slug', getPublicPage);

// 🛡️ Middlewares لحماية مسارات الـ Admin
router.use(authenticateJWT);
router.use(tenantResolver);

router.get('/', requirePermission(PERMISSIONS.SITE_READ), getPages);
router.post('/', requirePermission(PERMISSIONS.PAGE_CREATE), createPage);
router.put('/:pageId', requirePermission(PERMISSIONS.PAGE_UPDATE), updatePage);
router.delete('/:pageId', requirePermission(PERMISSIONS.PAGE_DELETE), deletePage);
// داخل page.routes.ts
router.patch("/:pageId/publish", publishPage);

export default router;