import { PlatformSetting } from "../../models";
import {
  testProviderConnection as testLlmProviderConnection,
} from "../ia/llm/llm.client";

export type PlatformAiProvider =
  | "claude"
  | "openai"
  | "gemini";

export type PlatformAiProviderStatus = Record<
  PlatformAiProvider,
  {
    configured: boolean;
    model: string;
  }
>;

export type PlatformAiSettingsValue = {
  enabled: boolean;
  provider: PlatformAiProvider;
  model: string;
  globalAssistantEnabled: boolean;
  builderAiEnabled: boolean;
  updatedBy: number | null;
};

export type PlatformAiSettingsResponse =
  PlatformAiSettingsValue & {
    providerStatus: PlatformAiProviderStatus;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  

const PLATFORM_AI_SETTINGS_KEY =
  "platform_ai";

const providerDefaults:
  Record<PlatformAiProvider, string> = {
    claude: "claude-sonnet-5",
    openai: "gpt-4.1-mini",
    gemini: "gemini-2.0-flash"
  };

const providerEnv:
  Record<
    PlatformAiProvider,
    {
      apiKey: string;
      model: string;
    }
  > = {
    claude: {
      apiKey: "ANTHROPIC_API_KEY",
      model: "ANTHROPIC_MODEL"
    },
    openai: {
      apiKey: "OPENAI_API_KEY",
      model: "OPENAI_MODEL"
    },
    gemini: {
      apiKey: "GEMINI_API_KEY",
      model: "GEMINI_MODEL"
    }
  };

export class PlatformAiSettingsError
  extends Error {
  status: number;

  constructor(
    message: string,
    status = 400
  ) {
    super(message);
    this.name =
      "PlatformAiSettingsError";
    this.status =
      status;
  }
}

const normalizeProvider = (
  value: unknown
): PlatformAiProvider => {
  const normalized =
    String(value || "")
      .trim()
      .toLowerCase();

  if (
    normalized === "claude" ||
    normalized === "openai" ||
    normalized === "gemini"
  ) {
    return normalized;
  }

  throw new PlatformAiSettingsError(
    "Unsupported AI provider"
  );
};

const getEnvModel = (
  provider: PlatformAiProvider
) =>
  process.env[
    providerEnv[provider].model
  ] ||
  providerDefaults[provider];

export const getProviderStatus =
  (): PlatformAiProviderStatus => ({
    claude: {
      configured:
        !!process.env.ANTHROPIC_API_KEY,
      model:
        getEnvModel("claude")
    },
    openai: {
      configured:
        !!process.env.OPENAI_API_KEY,
      model:
        getEnvModel("openai")
    },
    gemini: {
      configured:
        !!process.env.GEMINI_API_KEY,
      model:
        getEnvModel("gemini")
    }
  });

const getInitialProvider =
  (): PlatformAiProvider => {
    const configured =
      String(
        process.env.AI_PROVIDER ||
          process.env.LLM_PROVIDER ||
          "gemini"
      )
        .trim()
        .toLowerCase();

    if (
      configured === "claude" ||
      configured === "openai" ||
      configured === "gemini"
    ) {
      return configured;
    }

    return "gemini";
  };

export const getDefaultPlatformAiSettings =
  (): PlatformAiSettingsValue => {
    const provider =
      getInitialProvider();

    return {
      enabled:
        process.env.LLM_ENABLED === "true",
      provider,
      model:
        getEnvModel(provider),
      globalAssistantEnabled: true,
      builderAiEnabled: true,
      updatedBy: null
    };
  };

const normalizeSettings = (
  value: any
): PlatformAiSettingsValue => {
  const defaults =
    getDefaultPlatformAiSettings();

  let provider =
    defaults.provider;

  if (value?.provider !== undefined) {
    provider =
      normalizeProvider(value.provider);
  }

  return {
    enabled:
      value?.enabled === undefined
        ? defaults.enabled
        : Boolean(value.enabled),
    provider,
    model:
      typeof value?.model === "string" &&
      value.model.trim()
        ? value.model.trim()
        : getEnvModel(provider),
    globalAssistantEnabled:
      value?.globalAssistantEnabled === undefined
        ? defaults.globalAssistantEnabled
        : Boolean(value.globalAssistantEnabled),
    builderAiEnabled:
      value?.builderAiEnabled === undefined
        ? defaults.builderAiEnabled
        : Boolean(value.builderAiEnabled),
    updatedBy:
      value?.updatedBy === undefined
        ? defaults.updatedBy
        : value.updatedBy
  };
};

const toResponse = (
  value: PlatformAiSettingsValue,
  record?: PlatformSetting | null
): PlatformAiSettingsResponse => ({
  ...value,
  providerStatus:
    getProviderStatus(),
  createdAt:
    record?.createdAt || null,
  updatedAt:
    record?.updatedAt || null
});

export class AdminAiSettingsService {
  
  static async getSettings():
    Promise<PlatformAiSettingsResponse> {
    const setting =
      await PlatformSetting.findOne({
        where: {
          key: PLATFORM_AI_SETTINGS_KEY
        }
      });

    const value =
      normalizeSettings(
        setting?.value || {}
      );

    return toResponse(
      value,
      setting
    );
  }
  static async testProviderConnection(
    provider: PlatformAiProvider,
    model?: string
  ) {
    const normalizedProvider =
      normalizeProvider(provider);

    const status =
      getProviderStatus()[normalizedProvider];

    if (!status.configured) {
      throw new PlatformAiSettingsError(
        `${normalizedProvider} is not configured on the server`
      );
    }

    const selectedModel =
      model?.trim() || status.model;

    if (!selectedModel) {
      throw new PlatformAiSettingsError(
        `${normalizedProvider} model is not configured`
      );
    }

    try {
      return await testLlmProviderConnection({
        provider: normalizedProvider,
        model: selectedModel,
      });
    } catch (error: any) {
      throw new PlatformAiSettingsError(
        error?.message ||
          `${normalizedProvider} connection test failed`,
        400
      );
    }
  }
  static async saveSettings(
    payload: Partial<PlatformAiSettingsValue>,
    updatedBy: number | null
  ): Promise<PlatformAiSettingsResponse> {
    const current =
      await PlatformSetting.findOne({
        where: {
          key: PLATFORM_AI_SETTINGS_KEY
        }
      });

    const normalized =
      normalizeSettings({
        ...(current?.value || {}),
        ...payload,
        updatedBy
      });

    const status =
      getProviderStatus();

    if (
      normalized.enabled &&
      !status[normalized.provider].configured
    ) {
      throw new PlatformAiSettingsError(
        `${normalized.provider} is not configured on the server`
      );
    }

    if (current) {
      await current.update({
        value: normalized
      });

      return toResponse(
        normalized,
        current
      );
    }

    const created =
      await PlatformSetting.create({
        key: PLATFORM_AI_SETTINGS_KEY,
        value: normalized
      });

    return toResponse(
      normalized,
      created
    );
  }
}

export {
  PLATFORM_AI_SETTINGS_KEY,
  providerDefaults
};
