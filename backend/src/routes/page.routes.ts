import { Router } from 'express';
import { authenticateJWT } from '../shared/auth.util';
import {
  getPages,
  getPageById,
  createPage,
  updatePage,
  deletePage,
} from '../controllers/page.controller';

const router = Router();

router.use(authenticateJWT);

// ✅ واضح وصريح بدون تعقيد
router.get('/sites/:siteId/pages', getPages);
router.get('/sites/:siteId/pages/:pageId', getPageById);
router.post('/sites/:siteId/pages', createPage);
router.put('/sites/:siteId/pages/:pageId', updatePage);
router.delete('/sites/:siteId/pages/:pageId', deletePage);

export default router;