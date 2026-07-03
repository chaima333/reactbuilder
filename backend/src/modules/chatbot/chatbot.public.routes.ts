import { Router } from "express";

import {
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

router.post(
  "/message",
  publicChatbotRateLimit,
  publicChatbotGuard,
  sendPublicChatbotMessage
);

export default router;