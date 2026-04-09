// routes/site.routes.ts
import { Router } from 'express';
import { authenticateJWT } from '../shared/auth.util';
import {
  createSite,
  getSites,
  getSiteById,
  updateSite,
  deleteSite
} from '../controllers/site.controller';

const router = Router();

// ✅ Appliquer l'authentification à TOUTES les routes
router.use(authenticateJWT);

router.post('/', createSite);
router.get('/', getSites);
router.get('/:id', getSiteById);
router.put('/:id', updateSite);
router.delete('/:id', deleteSite);

export default router;