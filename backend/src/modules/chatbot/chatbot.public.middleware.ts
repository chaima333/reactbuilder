import { Request, Response, NextFunction } from "express";
import { Site } from "../../models";

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

    const site =
      await Site.findByPk(siteId);

    if (!site) {
      return res.status(404).json({
        success: false,
        message: "Site not found",
        code: "SITE_NOT_FOUND"
      });
    }

    return next();
  } catch (error) {
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