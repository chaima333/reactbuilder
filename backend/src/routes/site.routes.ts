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

// Toutes les routes nécessitent une authentification
router.use(authenticateJWT);

router.post('/', createSite);
router.get('/', getSites);
router.get('/:id', getSiteById);
router.put('/:id', updateSite);
router.delete('/:id', deleteSite);

export default router;