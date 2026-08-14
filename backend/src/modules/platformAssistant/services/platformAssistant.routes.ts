import {
  Router
} from "express";

import {
  getPlatformAssistantArticle,
  getPlatformAssistantDocumentation,
  sendPlatformAssistantMessage
} from "./platformAssistant.controller";

import {
  validatePlatformAssistantMessage
} from "../platformAssistant.validation";

import {
  platformAssistantRateLimit
} from "../platformAssistant.rateLimit";

const router =
  Router();

router.post(
  "/message",
  validatePlatformAssistantMessage,
  platformAssistantRateLimit,
  sendPlatformAssistantMessage
);
router.get(
  "/docs",
  platformAssistantRateLimit,
  getPlatformAssistantDocumentation
);
router.get(
  "/docs/:slug",
  platformAssistantRateLimit,
  getPlatformAssistantArticle
);

export default router;
