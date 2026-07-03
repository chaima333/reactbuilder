import { Router } from "express";

import {
  getPublicChatbotConfiguration,
  sendPublicChatbotMessage
} from "./chatbot.public.controller";

import {
  publicChatbotGuard
} from "./chatbot.public.middleware";

import {
  publicChatbotRateLimit
} from "./chatbot.rateLimit";

const router =
  Router({ mergeParams: true });

router.get(
  "/config",
  getPublicChatbotConfiguration
);

router.post(
  "/message",
  publicChatbotGuard,
  publicChatbotRateLimit,
  sendPublicChatbotMessage
);

export default router;
