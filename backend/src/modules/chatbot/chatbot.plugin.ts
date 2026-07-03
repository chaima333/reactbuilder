import type {
  ICmsPlugin
} from "../../core/plugins/plugin.types";
import {
  ensureDefaultChatbotConfig
} from "./services/chatbotConfig.service";

export const ChatbotPlugin: ICmsPlugin = {
  name: "chatbot-plugin",
  mode: "sync",
  priority: 15,
  isCritical: false,
  events: [],
  enabled: true,
  permissions: ["pages.read"],
  marketplace: {
    displayName: "AI Site Chatbot",
    description:
      "Answers visitor questions using the site's published content.",
    category: "AI",
    icon: "chat",
    version: "1.0.0",
    author: "ReactBuilder"
  },

  async onInstall(siteId: number) {
    await ensureDefaultChatbotConfig(siteId);
  },

  async onEnable(siteId: number) {
    await ensureDefaultChatbotConfig(siteId);
  },

  async execute() {
    // Retrieval is currently performed on demand by the public endpoint.
  }
};
