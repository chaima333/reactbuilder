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

// Toutes les routes nécessitent une authentification
router.use(authenticateJWT);

// Routes pour les pages
router.get('/:siteId/pages', getPages);
router.get('/:siteId/pages/:pageId', getPageById);
router.post('/:siteId/pages', createPage);
router.put('/:siteId/pages/:pageId', updatePage);
router.delete('/:siteId/pages/:pageId', deletePage);

export default router;