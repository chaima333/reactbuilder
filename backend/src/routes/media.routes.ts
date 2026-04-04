import { Router } from 'express';
import { authenticateJWT } from '../shared/auth.util';
import {
  upload,
  uploadImage,
  getMedia,
  deleteMedia,
  updateMediaAlt
} from '../controllers/media.controller';

const router = Router();

router.use(authenticateJWT);

router.post('/upload', upload.single('image'), uploadImage);
router.get('/', getMedia);
router.delete('/:id', deleteMedia);
router.put('/:id/alt', updateMediaAlt);

export default router;