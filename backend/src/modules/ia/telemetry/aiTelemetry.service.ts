import {
  AiFallbackReason,
  AiProviderName,
  AiTaskName,
  AiTelemetry
} from "./aiTelemetry.types";

export const nowMs = () =>
  Date.now();

export const buildAiTelemetry = ({
  task,
  provider,
  model,
  success,
  usedFallback,
  fallbackReason,
  startedAt,
  errorMessage
}: {
  task: AiTaskName;
  provider: AiProviderName;
  model?: string | null;
  success: boolean;
  usedFallback: boolean;
  fallbackReason?: AiFallbackReason | null;
  startedAt: number;
  errorMessage?: string | null;
}): AiTelemetry => ({
  task,
  provider,
  model:
    model || null,
  success,
  usedFallback,
  fallbackReason:
    fallbackReason || null,
  durationMs:
    Date.now() - startedAt,
  errorMessage:
    errorMessage || null,
  createdAt:
    new Date().toISOString()
});

export const logAiTelemetry = (
  telemetry: AiTelemetry
) => {
  console.log(
    "AI_TELEMETRY",
    {
      task: telemetry.task,
      provider: telemetry.provider,
      model: telemetry.model,
      success: telemetry.success,
      usedFallback: telemetry.usedFallback,
      fallbackReason: telemetry.fallbackReason,
      durationMs: telemetry.durationMs
    }
  );
};

export const normalizeAiError = (
  error: unknown
) => {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error || "UNKNOWN_ERROR");
};

export const detectFallbackReason = (
  errorMessage: string
): AiFallbackReason => {
  const value =
    errorMessage.toUpperCase();

  if (value.includes("LLM_DISABLED")) {
    return "LLM_DISABLED";
  }

  if (
    value.includes("API_KEY") ||
    value.includes("MISSING")
  ) {
    return "MISSING_API_KEY";
  }

  if (
    value.includes("TIMEOUT") ||
    value.includes("ABORT")
  ) {
    return "TIMEOUT";
  }

  if (
    value.includes("JSON") ||
    value.includes("PARSE")
  ) {
    return "INVALID_JSON";
  }

  if (
    value.includes("EMPTY") ||
    value.includes("NO_RESPONSE")
  ) {
    return "EMPTY_RESPONSE";
  }

  return "PROVIDER_ERROR";
};