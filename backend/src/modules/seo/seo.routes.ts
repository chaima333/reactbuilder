import { Router } from 'express';
import { authenticateJWT } from '../../shared/auth.util';
import {
  getPageSeo,
  updatePageSeo,
  generateSitemap,
  getRobotsTxt,
} from './seo.controller';

const router = Router();

// Routes publiques (pas d'authentification)
router.get('/sites/:siteId/sitemap.xml', generateSitemap);
router.get('/sites/:siteId/robots.txt', getRobotsTxt);

// Routes protégées (authentification requise)
router.get('/pages/:pageId/seo', authenticateJWT, getPageSeo);
router.put('/pages/:pageId/seo', authenticateJWT, updatePageSeo);

export default router;