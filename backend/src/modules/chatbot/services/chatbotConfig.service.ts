import { Op } from "sequelize";
import {
  Plugin,
  Site,
  SitePlugin
} from "../../../models";

export const CHATBOT_PLUGIN_ID =
  "chatbot-plugin";

export const DEFAULT_CHATBOT_CONFIG = {
  displayName: "Site Assistant",
  welcomeMessage:
    "Hi! Ask me anything about this website.",
  fallbackMessage:
    "I couldn't find that in this website.",
  primaryColor: "#00c7a7",
  historyEnabled: false
} as const;

export type PublicChatbotConfig =
  | {
      enabled: false;
    }
  | {
      enabled: true;
      displayName: string;
      welcomeMessage: string;
      fallbackMessage: string;
      primaryColor: string;
    };

const safeString = (
  value: unknown,
  fallback: string,
  maxLength: number
): string => {
  if (typeof value !== "string") {
    return fallback;
  }

  const normalized = value.trim();

  return normalized &&
    normalized.length <= maxLength
    ? normalized
    : fallback;
};

const safeColor = (
  value: unknown
): string =>
  typeof value === "string" &&
  /^#[0-9a-f]{6}$/i.test(value.trim())
    ? value.trim().toLowerCase()
    : DEFAULT_CHATBOT_CONFIG.primaryColor;

const findActiveChatbotPlugin = () =>
  Plugin.findOne({
    where: {
      [Op.or]: [
        { slug: CHATBOT_PLUGIN_ID },
        { name: CHATBOT_PLUGIN_ID }
      ],
      isActive: true,
      status: "published"
    }
  });

const requireActiveSite = async (
  siteId: number
) => {
  if (!Number.isInteger(siteId) || siteId <= 0) {
    throw new Error("INVALID_SITE_ID");
  }

  const site = await Site.findOne({
    where: {
      id: siteId,
      status: "active"
    },
    attributes: ["id"]
  });

  if (!site) {
    throw new Error("CHATBOT_SITE_NOT_AVAILABLE");
  }
};

export const ensureDefaultChatbotConfig = async (
  siteId: number
) => {
  const plugin =
    await findActiveChatbotPlugin();

  if (!plugin) {
    throw new Error("CHATBOT_PLUGIN_NOT_AVAILABLE");
  }

  const sitePlugin =
    await SitePlugin.findOne({
      where: {
        siteId,
        pluginId: plugin.id
      }
    });

  if (!sitePlugin) {
    return;
  }

  const current =
    sitePlugin.config &&
    typeof sitePlugin.config === "object" &&
    !Array.isArray(sitePlugin.config)
      ? sitePlugin.config
      : {};

  const {
    enabled: _ignoredEnabled,
    ...configWithoutEnabled
  } = current;

  sitePlugin.config = {
    ...DEFAULT_CHATBOT_CONFIG,
    ...configWithoutEnabled
  };

  await sitePlugin.save();
};

export const getPublicChatbotConfig = async (
  siteId: number
): Promise<PublicChatbotConfig> => {
  await requireActiveSite(siteId);

  const plugin =
    await findActiveChatbotPlugin();

  if (!plugin) {
    return { enabled: false };
  }

  const sitePlugin =
    await SitePlugin.findOne({
      where: {
        siteId,
        pluginId: plugin.id,
        isEnabled: true
      },
      attributes: ["config"]
    });

  if (!sitePlugin) {
    return { enabled: false };
  }

  const config =
    sitePlugin.config &&
    typeof sitePlugin.config === "object" &&
    !Array.isArray(sitePlugin.config)
      ? sitePlugin.config
      : {};

  return {
    enabled: true,
    displayName: safeString(
      config.displayName,
      DEFAULT_CHATBOT_CONFIG.displayName,
      80
    ),
    welcomeMessage: safeString(
      config.welcomeMessage,
      DEFAULT_CHATBOT_CONFIG.welcomeMessage,
      300
    ),
    fallbackMessage: safeString(
      config.fallbackMessage,
      DEFAULT_CHATBOT_CONFIG.fallbackMessage,
      300
    ),
    primaryColor: safeColor(
      config.primaryColor
    )
  };
};
