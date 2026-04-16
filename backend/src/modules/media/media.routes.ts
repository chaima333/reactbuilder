import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateJWT } from '../../shared/auth.util';
import * as MediaController from './media.controller';

const router = Router();

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../../uploads'); // تأكد من المسار
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage, 
  limits: { fileSize: 50 * 1024 * 1024 } 
});

router.use(authenticateJWT);

// Routes
router.post('/upload', upload.single('image'), MediaController.uploadMedia);
router.get('/', MediaController.getAllMedia);
router.delete('/:id', MediaController.deleteMedia);
router.put('/:id/alt', MediaController.updateMediaAlt);

export default router;