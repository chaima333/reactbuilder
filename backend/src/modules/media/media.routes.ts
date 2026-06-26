import { Router } from "express";
import multer from "multer";

import * as MediaController from "./media.controller";

import { requirePermission } from "../../core/middleware/role.middleware";
import { PERMISSIONS } from "../../core/constants/permissions";

const router = Router({ mergeParams: true });

const upload = multer({
  storage: multer.memoryStorage(),

  fileFilter: (_req, file, cb) => {
    console.log("🔥 FILE OBJECT:", file);
    console.log("🔥 MIME RECEIVED:", file.mimetype);

    cb(null, true);
  }
});

router.get(
  "/",
  requirePermission(PERMISSIONS.MEDIA_READ),
  MediaController.handleGetAll
);

router.post(
  "/upload",
  requirePermission(PERMISSIONS.MEDIA_UPLOAD),
  upload.single("file"),
  MediaController.handleUpload
);

router.delete(
  "/:id",
  requirePermission(PERMISSIONS.MEDIA_DELETE),
  MediaController.handleDelete
);

router.put(
  "/:id/alt",
  requirePermission(PERMISSIONS.MEDIA_UPDATE),
  MediaController.handleUpdateAlt
);

export default router;