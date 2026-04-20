import { Router } from 'express';
import multer from 'multer';
import { authenticateJWT } from '../../shared/auth.util';
import * as MediaController from './media.controller';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(), 
 
    fileFilter: (req, file, cb) => {
  console.log("🔥 MIME RECEIVED:", file.mimetype);

  // نقبلو الصور + pdf + video بطريقة flexible
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype === "application/pdf" ||
    file.mimetype.startsWith("video/")
  ) {
    return cb(null, true);
  }

  return cb(new Error("Format non pris en charge !"));
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