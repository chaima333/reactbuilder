import type {
  Request
} from "express";

import {
  ipKeyGenerator,
  rateLimit
} from "express-rate-limit";

const partnerApplicationWindowMs =
  60 * 60 * 1000;

const resolveClientIp = (
  req: Request
) =>
  ipKeyGenerator(
    req.ip ||
    req.socket.remoteAddress ||
    "unknown"
  );

export const createPublicPartnerApplicationLimiter = () =>
  rateLimit({
    windowMs:
      partnerApplicationWindowMs,

    max: 5,

    standardHeaders: true,
    legacyHeaders: false,

    skipSuccessfulRequests: false,
    skipFailedRequests: false,

    keyGenerator: req => {
      const siteId =
        String(
          req.params.siteId ||
          "unknown-site"
        );

      return [
        resolveClientIp(req),
        siteId
      ].join(":");
    },

    handler: (_req, res) => {
      return res.status(429).json({
        success: false,
        message:
          "Too many partner applications. Please try again later.",
        code:
          "PARTNER_APPLICATION_RATE_LIMITED"
      });
    }
  });

export const publicPartnerApplicationLimiter =
  createPublicPartnerApplicationLimiter();
