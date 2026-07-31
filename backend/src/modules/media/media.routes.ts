import {
  Router
} from "express";

import multer from "multer";

import * as MediaController from "./media.controller";

import {
  requirePermission
} from "../../core/middleware/role.middleware";

import {
  PERMISSIONS
} from "../../core/constants/permissions";

import {
  createSingleFileUploadHandler,
  MEDIA_UPLOAD_MAX_BYTES
} from "../../core/middleware/uploadSizeLimit";

const router =
  Router({
    mergeParams: true
  });

const upload =
  multer({
    storage:
      multer.memoryStorage(),

    limits: {
      fileSize:
        MEDIA_UPLOAD_MAX_BYTES,

      files: 1
    },

    fileFilter:
      (
        _req,
        file,
        callback
      ) => {
        console.log(
          "🔥 FILE OBJECT:",
          file
        );

        console.log(
          "🔥 MIME RECEIVED:",
          file.mimetype
        );

        callback(
          null,
          true
        );
      }
  });

const uploadMediaFile =
  createSingleFileUploadHandler({
    upload,

    fieldName:
      "file",

    tooLargeCode:
      "MEDIA_FILE_TOO_LARGE",

    tooLargeMessage:
      "Media file exceeds the 10 MB limit.",

    invalidUploadCode:
      "MEDIA_UPLOAD_INVALID"
  });

router.get(
  "/",
  requirePermission(
    PERMISSIONS.MEDIA_READ
  ),
  MediaController.handleGetAll
);

router.post(
  "/upload",
  requirePermission(
    PERMISSIONS.MEDIA_UPLOAD
  ),
  uploadMediaFile,
  MediaController.handleUpload
);

router.delete(
  "/:id",
  requirePermission(
    PERMISSIONS.MEDIA_DELETE
  ),
  MediaController.handleDelete
);

router.put(
  "/:id/alt",
  requirePermission(
    PERMISSIONS.MEDIA_UPDATE
  ),
  MediaController.handleUpdateAlt
);

export default router;