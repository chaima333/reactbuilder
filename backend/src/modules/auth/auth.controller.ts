// src/modules/auth/auth.controller.ts
import { Response } from "express";
import * as AuthService from "./auth.service";
import * as AuthValidator from "./auth.validation";

// تأكد من وجود كلمة export قبل كل const
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