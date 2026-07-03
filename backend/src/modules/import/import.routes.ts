import { Router } from "express";
import multer from "multer";

import { importHtmlZip } from "./import.controller";

import {
  requirePermission
} from "../../core/middleware/role.middleware";

import {
  PERMISSIONS
} from "../../core/constants/permissions";

const router = Router({
  mergeParams: true
});

const upload = multer({
  dest: "temp/"
});

router.post(
  "/html-zip",
  requirePermission(PERMISSIONS.PAGE_CREATE),
  requirePermission(PERMISSIONS.MEDIA_UPLOAD),
  upload.single("zip"),
  importHtmlZip
);

export default router;