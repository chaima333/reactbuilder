import {
  Router
} from "express";

import {
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

export default router;