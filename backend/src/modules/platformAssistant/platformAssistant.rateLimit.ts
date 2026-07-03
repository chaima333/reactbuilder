import {
  Request,
  Response,
  NextFunction
} from "express";

type RateBucket = {
  count: number;
  resetAt: number;
};

const buckets =
  new Map<string, RateBucket>();

const WINDOW_MS =
  60 * 1000;

const MAX_MESSAGES_PER_WINDOW =
  30;

export const platformAssistantRateLimit = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId =
    (req as any).user?.id;

  const ip =
    req.ip ||
    req.headers["x-forwarded-for"]?.toString() ||
    "unknown";

  const key =
    userId
      ? `user:${userId}`
      : `ip:${ip}`;

  const now =
    Date.now();

  const current =
    buckets.get(key);

  if (
    !current ||
    current.resetAt <= now
  ) {
    buckets.set(key, {
      count: 1,
      resetAt: now + WINDOW_MS
    });

    return next();
  }

  if (
    current.count >= MAX_MESSAGES_PER_WINDOW
  ) {
    return res.status(429).json({
      success: false,
      message: "Too many assistant messages. Try again later.",
      code: "PLATFORM_ASSISTANT_RATE_LIMITED"
    });
  }

  current.count += 1;

  return next();
};