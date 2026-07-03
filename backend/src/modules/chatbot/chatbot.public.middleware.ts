import { Request, Response, NextFunction } from "express";
import {
  getPublicChatbotConfig
} from "./services/chatbotConfig.service";

export const publicChatbotGuard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const siteId =
      Number(req.params.siteId);

    const message =
      String(req.body?.message || "")
        .trim();

    if (
      !Number.isInteger(siteId) ||
      siteId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid site id",
        code: "INVALID_SITE_ID"
      });
    }

    if (message.length < 3) {
      return res.status(400).json({
        success: false,
        message: "Message must be at least 3 characters",
        code: "MESSAGE_TOO_SHORT"
      });
    }

    if (message.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Message is too long",
        code: "MESSAGE_TOO_LONG"
      });
    }

    const config =
      await getPublicChatbotConfig(siteId);

    if (!config.enabled) {
      return res.status(403).json({
        success: false,
        message: "Chatbot is not available for this site",
        code: "CHATBOT_NOT_ENABLED"
      });
    }

    return next();
  } catch (error) {
    const errorCode =
      error instanceof Error
        ? error.message
        : "";

    if (errorCode === "INVALID_SITE_ID") {
      return res.status(400).json({
        success: false,
        message: "Invalid site id",
        code: "INVALID_SITE_ID"
      });
    }

    if (
      errorCode ===
      "CHATBOT_SITE_NOT_AVAILABLE"
    ) {
      return res.status(404).json({
        success: false,
        message: "Chatbot is not available",
        code: "CHATBOT_NOT_AVAILABLE"
      });
    }

    console.error("PUBLIC_CHATBOT_GUARD_ERROR", {
      error:
        error instanceof Error
          ? error.message
          : String(error)
    });

    return res.status(500).json({
      success: false,
      message: "Chatbot guard failed",
      code: "CHATBOT_GUARD_FAILED"
    });
  }
};
