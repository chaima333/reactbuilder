import { Router } from 'express';
import multer from 'multer';
import { authenticateJWT } from '../../shared/auth.util';
import * as MediaController from './media.controller';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(), // مهم لـ Cloudinary
  fileFilter: (req, file, cb) => {
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "application/pdf",
      "video/mp4",
    ];

    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Format non pris en charge !"));
    }

    cb(null, true);
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
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