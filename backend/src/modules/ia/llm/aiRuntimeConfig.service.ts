import { PlatformSetting } from "../../../models";

export type AiRuntimeProvider =
  | "claude"
  | "openai"
  | "gemini";

export type AiRuntimeConfig = {
  enabled: boolean;
  provider: AiRuntimeProvider;
  model: string;
};

const DEFAULTS: Record<
  AiRuntimeProvider,
  string
> = {
  claude: "claude-sonnet-5",
  openai: "gpt-4.1-mini",
  gemini: "gemini-2.0-flash",
};

const normalizeProvider = (
  value: unknown
): AiRuntimeProvider => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();

  if (
    normalized === "claude" ||
    normalized === "openai" ||
    normalized === "gemini"
  ) {
    return normalized;
  }

  throw new Error("INVALID_AI_PROVIDER");
};

export const getAiRuntimeConfig =
  async (): Promise<AiRuntimeConfig> => {
    const setting =
      await PlatformSetting.findOne({
        where: {
          key: "platform_ai",
        },
      });

    const value =
      (setting?.value || {}) as Record<
        string,
        unknown
      >;

    const provider =
      normalizeProvider(value.provider);

    const model =
      typeof value.model === "string" &&
      value.model.trim()
        ? value.model.trim()
        : DEFAULTS[provider];

    return {
      enabled:
        value.enabled === undefined
          ? process.env.LLM_ENABLED === "true"
          : Boolean(value.enabled),

      provider,

      model,
    };
  };
