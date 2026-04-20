import { Router } from 'express';
import multer from 'multer';
import { authenticateJWT } from '../../shared/auth.util';
import * as MediaController from './media.controller';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(), 
  
  fileFilter: (req, file, cb) => {
  console.log("🔥 FILE OBJECT:", file);
  console.log("🔥 MIME RECEIVED:", file.mimetype);
  cb(null, true); // نخلي كل شيء يعدي
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