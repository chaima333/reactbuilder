import { NextFunction, Request, Response } from "express";

const MAX_AI_PAYLOAD_BYTES = 2 * 1024 * 1024;

const isAiRequest = (path: string) =>
  /^\/api\/sites\/[^/]+\/ia(?:\/|$)/.test(path) ||
  /^\/api\/ai\/assistant(?:\/|$)/.test(path);

const payloadTooLarge = (res: Response) =>
  res.status(413).json({
    success: false,
    message: "AI request payload is too large",
    code: "AI_PAYLOAD_TOO_LARGE"
  });

export const rejectOversizedAiContentLength = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!isAiRequest(req.path)) return next();

  const contentLength = Number(req.headers["content-length"] || 0);
  if (contentLength > MAX_AI_PAYLOAD_BYTES) return payloadTooLarge(res);

  return next();
};

export const enforceAiPayloadLimit = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const bytes = Buffer.byteLength(JSON.stringify(req.body || {}), "utf8");
  if (bytes > MAX_AI_PAYLOAD_BYTES) return payloadTooLarge(res);

  return next();
};
