import { Request, Response, NextFunction } from "express";

const MAX_CHATBOT_BODY_BYTES = 50 * 1024;

export const rejectOversizedChatbotContentLength = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const path =
    req.originalUrl || req.url || "";

  const isChatbotRequest =
    /^\/api\/public\/sites\/[^/]+\/chatbot(?:\/|$)/.test(path);

  if (!isChatbotRequest) {
    return next();
  }

  const contentLength =
    Number(req.headers["content-length"] || 0);

  if (
    contentLength &&
    contentLength > MAX_CHATBOT_BODY_BYTES
  ) {
    return res.status(413).json({
      success: false,
      message: "Chatbot request too large",
      code: "CHATBOT_PAYLOAD_TOO_LARGE"
    });
  }

  return next();
};