// src/modules/auth/auth.controller.ts
import { Response } from "express";
import * as AuthService from "./auth.service";
import * as AuthValidator from "./auth.validation";
import { uploadStream } from "../../core/config/cloudinary";
import { User } from "../../models/User";

export const registerController = async (req: any, res: Response) => {
  try {
    const parsedData = AuthValidator.registerSchema.parse(req.body);
    const user = await AuthService.registerUser(parsedData);
    return res.status(201).json({ success: true, user });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const loginController = async (req: any, res: Response) => {
  try {
    const parsedData = AuthValidator.loginSchema.parse(req.body);
    const result = await AuthService.loginUser(parsedData.email, parsedData.password);
    return res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    return res.status(401).json({ success: false, message: error.message });
  }
};

export const refreshTokenController = async (req: any, res: Response) => {
  try {
    const { refreshToken } = AuthValidator.refreshTokenSchema.parse(req.body);
    const result = await AuthService.refreshUserToken(refreshToken);
    return res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    return res.status(401).json({ success: false, message: error.message });
  }
};

export const googleAuthController = async (req: any, res: Response) => {
  try {
    const result = await AuthService.handleGoogleAuth(req.body);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ state: "ERROR", message: error.message });
  }
};

export const forgotPassword = async (req: any, res: Response) => {
  try {
    const { email } = req.body;
    const result = await AuthService.processForgotPassword(email);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req: any, res: Response) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    await AuthService.processResetPassword(token, password);
    return res.json({ success: true, message: "Password updated successfully" });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const logoutController = async (req: any, res: Response) => {
  try {
    const { refreshToken } = req.body;
    await AuthService.logoutUser(refreshToken);
    return res.status(200).json({ success: true, message: "Logged out successfully." });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

//2FA
export const setupTwoFactorController = async (
  req: any,
  res: Response
) => {
  try {
    const result = await AuthService.setupTwoFactor(req.user.id);
    return res.json({ success: true, data: result });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const verifyTwoFactorSetupController = async (
  req: any,
  res: Response
) => {
  try {
    const { token } = req.body;
    const result = await AuthService.verifyTwoFactorSetup(
      req.user.id,
      token
    );

    return res.json({ success: true, data: result });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const verifyTwoFactorLoginController = async (
  req: any,
  res: Response
) => {
  try {
    const userId = Number(req.body.userId);
    const token = String(req.body.token || "").trim();

    if (!userId || Number.isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId",
      });
    }

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "2FA token is required",
      });
    }

    const result = await AuthService.verifyTwoFactorLogin(
      userId,
      token
    );

    return res.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

export const disableTwoFactorController = async (
  req: any,
  res: Response
) => {
  try {
    const result = await AuthService.disableTwoFactor(req.user.id);
    return res.json({ success: true, data: result });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const updateProfileController = async (
  req: any,
  res: Response
) => {
  try {
    const userId =
      Number(req.user?.id);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Utilisateur non authentifié"
      });
    }

    const name =
      String(req.body?.name || "").trim();

    const email =
      String(req.body?.email || "")
        .trim()
        .toLowerCase();

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Le nom est obligatoire"
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "L'email est obligatoire"
      });
    }

    const user =
      await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur introuvable"
      });
    }

    const existingUser =
      await User.findOne({
        where: {
          email
        }
      });

    if (
      existingUser &&
      Number(existingUser.id) !== userId
    ) {
      return res.status(409).json({
        success: false,
        message: "Cet email est déjà utilisé"
      });
    }

    await user.update({
      name,
      email
    });

    return res.json({
      success: true,
      user: user.toJSON()
    });
  } catch (error: any) {
    console.error(
      "Update profile error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Erreur lors de la mise à jour du profil"
    });
  }
};

export const uploadProfileAvatarController =
  async (
    req: any,
    res: Response
  ) => {
    try {
      const userId =
        Number(req.user?.id);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "Utilisateur non authentifié"
        });
      }

      if (!req.file?.buffer) {
        return res.status(400).json({
          success: false,
          message:
            "Aucune image sélectionnée"
        });
      }

      const user =
        await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "Utilisateur introuvable"
        });
      }

      const uploaded: any =
        await uploadStream(
          req.file.buffer,
          `reactbuilder/profile-avatars/${userId}`
        );

      const avatarUrl =
        uploaded?.secure_url ||
        uploaded?.url;

      if (!avatarUrl) {
        return res.status(500).json({
          success: false,
          message:
            "Cloudinary n'a pas retourné d'URL"
        });
      }

      await user.update({
        avatar: avatarUrl
      });

      return res.json({
        success: true,
        user: user.toJSON()
      });
    } catch (error: any) {
      console.error(
        "Upload profile avatar error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error?.message ||
          "Erreur lors de l'upload de l'image"
      });
    }
  };