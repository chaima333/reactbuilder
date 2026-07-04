export type AiProviderName =
  | "claude"
  | "gemini"
  | "openai"
  | "fallback"
  | "rule_based"
  | "unknown";

export type AiTaskName =
  | "PAGE_GENERATION"
  | "DESIGN_COPILOT_CHAT"
  | "DESIGN_COPILOT_APPLY"
  | "EDITOR_ASSISTANT"
  | "PUBLIC_SITE_CHATBOT"
  | "PLATFORM_ASSISTANT"
  | "UNKNOWN";

export type AiFallbackReason =
  | "LLM_DISABLED"
  | "MISSING_API_KEY"
  | "TIMEOUT"
  | "INVALID_JSON"
  | "PROVIDER_ERROR"
  | "EMPTY_RESPONSE"
  | "NOT_APPLICABLE"
  | "UNKNOWN";

export type AiTelemetry = {
  task: AiTaskName;
  provider: AiProviderName;
  model?: string | null;
  success: boolean;
  usedFallback: boolean;
  fallbackReason?: AiFallbackReason | null;
  durationMs: number;
  errorMessage?: string | null;
  createdAt: string;
};

export type AiTextResult = {
  text: string;
  telemetry: AiTelemetry;
};

export type AiJsonResult<T> = {
  data: T | null;
  rawText: string;
  telemetry: AiTelemetry;
};