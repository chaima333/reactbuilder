import { Router } from 'express';
import multer from 'multer';
import { authenticateJWT } from '../../shared/auth.util';
import * as MediaController from './media.controller';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Format non supporté !'));
    }
  }
});

router.use(authenticateJWT);

router.post(
  '/upload', 
  upload.single('file'), 
  MediaController.handleUpload
);

router.get('/', MediaController.handleGetAll);

router.delete('/:id', MediaController.handleDelete);

router.put('/:id/alt', MediaController.handleUpdateAlt);

export default router;