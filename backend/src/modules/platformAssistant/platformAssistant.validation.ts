import {
  Request,
  Response,
  NextFunction
} from "express";

const MAX_MESSAGE_LENGTH = 1000;

export const validatePlatformAssistantMessage = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const message =
    String(req.body?.message || "")
      .trim();

  if (message.length < 3) {
    return res.status(400).json({
      success: false,
      message: "Message must be at least 3 characters",
      code: "MESSAGE_TOO_SHORT"
    });
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({
      success: false,
      message: "Message is too long",
      code: "MESSAGE_TOO_LONG"
    });
  }

  req.body.message = message;

  return next();
};