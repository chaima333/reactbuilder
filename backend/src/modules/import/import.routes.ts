import {
  Router
} from "express";

import multer from "multer";

import {
  importHtmlZip
} from "./import.controller";

import {
  createZipUploadTempDir
} from "./zipImportSecurity";

import {
  createSingleFileUploadHandler,
  HTML_ZIP_UPLOAD_MAX_BYTES
} from "../../core/middleware/uploadSizeLimit";

import {
  requirePermission
} from "../../core/middleware/role.middleware";

import {
  PERMISSIONS
} from "../../core/constants/permissions";

const router =
  Router({
    mergeParams: true
  });

const upload =
  multer({
    dest:
      createZipUploadTempDir(),

    limits: {
      fileSize:
        HTML_ZIP_UPLOAD_MAX_BYTES,

      files: 1
    }
  });

const uploadHtmlZip =
  createSingleFileUploadHandler({
    upload,

    fieldName:
      "zip",

    tooLargeCode:
      "HTML_ZIP_FILE_TOO_LARGE",

    tooLargeMessage:
      "HTML/ZIP import exceeds the 50 MB limit.",

    invalidUploadCode:
      "HTML_ZIP_UPLOAD_INVALID"
  });

router.post(
  "/html-zip",
  requirePermission(
    PERMISSIONS.PAGE_CREATE
  ),
  requirePermission(
    PERMISSIONS.MEDIA_UPLOAD
  ),
  uploadHtmlZip,
  importHtmlZip
);

export default router;
