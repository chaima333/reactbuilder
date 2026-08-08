import {
  Router
} from "express";

import multer from "multer";

import * as AuthController
  from "./auth.controller";

import {
  authenticateJWT
} from "../../shared/auth.util";

import {
  createSingleFileUploadHandler
} from "../../core/middleware/uploadSizeLimit";

const router =
  Router();

const avatarUpload =
  multer({
    storage:
      multer.memoryStorage(),

    limits: {
      fileSize:
        5 * 1024 * 1024,

      files: 1
    },

    fileFilter: (
      _req,
      file,
      callback
    ) => {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
      ];

      if (
        !allowedTypes.includes(
          file.mimetype
        )
      ) {
        callback(
          new Error(
            "PROFILE_AVATAR_INVALID_TYPE"
          )
        );

        return;
      }

      callback(
        null,
        true
      );
    }
  });

const uploadProfileAvatar =
  createSingleFileUploadHandler({
    upload:
      avatarUpload,

    fieldName:
      "file",

    tooLargeCode:
      "PROFILE_AVATAR_TOO_LARGE",

    tooLargeMessage:
      "Profile image exceeds the 5 MB limit.",

    invalidUploadCode:
      "PROFILE_AVATAR_INVALID"
  });

router.post(
  "/register",
  AuthController.registerController
);

router.post(
  "/login",
  AuthController.loginController
);

router.post(
  "/refresh_token",
  AuthController.refreshTokenController
);

router.post(
  "/logout",
  AuthController.logoutController
);

router.post(
  "/google",
  AuthController.googleAuthController
);

router.post(
  "/forgot-password",
  AuthController.forgotPassword
);

router.post(
  "/reset-password/:token",
  AuthController.resetPassword
);

// =====================================
// PROFILE
// =====================================

router.get(
  "/profile",
  authenticateJWT,
  (
    req: any,
    res
  ) => {
    res.json({
      success: true,
      user: req.user
    });
  }
);

router.put(
  "/profile",
  authenticateJWT,
  AuthController.updateProfileController
);

router.post(
  "/profile/avatar",
  authenticateJWT,
  uploadProfileAvatar,
  AuthController.uploadProfileAvatarController
);

// =====================================
// 2FA
// =====================================

router.post(
  "/2fa/setup",
  authenticateJWT,
  AuthController.setupTwoFactorController
);

router.post(
  "/2fa/verify-setup",
  authenticateJWT,
  AuthController.verifyTwoFactorSetupController
);

router.post(
  "/2fa/disable",
  authenticateJWT,
  AuthController.disableTwoFactorController
);

router.post(
  "/2fa/verify-login",
  AuthController.verifyTwoFactorLoginController
);

export default router;