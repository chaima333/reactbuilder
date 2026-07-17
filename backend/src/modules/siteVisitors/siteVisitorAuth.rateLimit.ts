import {
  rateLimit
} from "express-rate-limit";

const windowMs =
  15 * 60 * 1000;

export const visitorRegisterLimiter =
  rateLimit({
    windowMs,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,

    handler: (_req, res) => {
      return res.status(429).json({
        success: false,
        message:
          "Too many registration attempts. Please try again later.",
        code:
          "VISITOR_REGISTER_RATE_LIMITED"
      });
    }
  });

export const visitorLoginLimiter =
  rateLimit({
    windowMs,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,

    handler: (_req, res) => {
      return res.status(429).json({
        success: false,
        message:
          "Too many login attempts. Please try again later.",
        code:
          "VISITOR_LOGIN_RATE_LIMITED"
      });
    }
  });

export const visitorRefreshLimiter =
  rateLimit({
    windowMs,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,

    handler: (_req, res) => {
      return res.status(429).json({
        success: false,
        message:
          "Too many token refresh attempts. Please try again later.",
        code:
          "VISITOR_REFRESH_RATE_LIMITED"
      });
    }
  });
