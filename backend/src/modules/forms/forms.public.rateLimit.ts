import type {
  Request
} from "express";

import {
  ipKeyGenerator,
  rateLimit
} from "express-rate-limit";

const formSubmissionWindowMs =
  15 * 60 * 1000;

const resolveClientIp = (
  req: Request
) =>
  ipKeyGenerator(
    req.ip ||
    req.socket.remoteAddress ||
    "unknown"
  );

export const createPublicFormSubmissionLimiter = () =>
  rateLimit({
    windowMs:
      formSubmissionWindowMs,

    max: 10,

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

      const formId =
        String(
          req.params.formId ||
          "unknown-form"
        );

      return [
        resolveClientIp(req),
        siteId,
        formId
      ].join(":");
    },

    handler: (_req, res) => {
      return res.status(429).json({
        success: false,
        message:
          "Too many form submissions. Please try again later.",
        code:
          "FORM_SUBMISSION_RATE_LIMITED"
      });
    }
  });

export const publicFormSubmissionLimiter =
  createPublicFormSubmissionLimiter();
