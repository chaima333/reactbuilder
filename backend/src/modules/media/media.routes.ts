import { Router } from 'express';
import multer from 'multer';
import { authenticateJWT } from '../../shared/auth.util';
import * as MediaController from './media.controller';

const router = Router();

/**
 * 🛡️ Multer Configuration (In-Memory)
 * نحدد الحجم الأقصى (مثلاً 5MB) ونوع الملفات المسموحة
 */
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

// كل الـ Routes هذي محمية بـ JWT
router.use(authenticateJWT);

/**
 * POST /api/media/upload
 * Pipeline: Auth -> Multer (Memory) -> Controller -> Service -> Cloudinary
 */
router.post(
  '/upload', 
  upload.single('file'), 
  MediaController.handleUpload
);

/**
 * GET /api/media
 * يرجع قائمة الصور الخاصة بالموقع (Site Context)
 */
router.get('/', MediaController.handleGetAll);

/**
 * DELETE /api/media/:id
 * فسخ ملف من الـ DB ومن Cloudinary
 */
router.delete('/:id', MediaController.handleDelete);

/**
 * PUT /api/media/:id/alt
 * تحديث الـ Alt text لتحسين الـ SEO
 */
router.put('/:id/alt', MediaController.handleUpdateAlt);

export default router;