import {
  AiProviderName,
  AiTaskName,
  AiTextResult
} from "./aiTelemetry.types";

import {
  buildAiTelemetry,
  detectFallbackReason,
  logAiTelemetry,
  normalizeAiError,
  nowMs
} from "./aiTelemetry.service";

const getConfiguredProvider = (): AiProviderName => {
  const provider =
    String(
      process.env.AI_PROVIDER ||
      process.env.LLM_PROVIDER ||
      "unknown"
    )
      .trim()
      .toLowerCase();

  if (
    provider === "claude" ||
    provider === "gemini" ||
    provider === "openai"
  ) {
    return provider;
  }

  return "unknown";
};

const getConfiguredModel = () =>
  process.env.ANTHROPIC_MODEL ||
  process.env.GEMINI_MODEL ||
  process.env.OPENAI_MODEL ||
  process.env.LLM_MODEL ||
  null;

export const runAiTaskWithTelemetry = async ({
  task,
  execute,
  fallbackText,
  provider,
  model
}: {
  task: AiTaskName;
  execute: () => Promise<string>;
  fallbackText?: string;
  provider?: AiProviderName;
  model?: string | null;
}): Promise<AiTextResult> => {
  const startedAt =
    nowMs();

  const resolvedProvider =
    provider || getConfiguredProvider();

  const resolvedModel =
    model || getConfiguredModel();

  try {
    const text =
      await execute();

    if (!text?.trim()) {
      throw new Error("EMPTY_RESPONSE");
    }

    const telemetry =
      buildAiTelemetry({
        task,
        provider: resolvedProvider,
        model: resolvedModel,
        success: true,
        usedFallback: false,
        fallbackReason: null,
        startedAt
      });

    logAiTelemetry(
      telemetry
    );

    return {
      text,
      telemetry
    };
  } catch (error) {
    const errorMessage =
      normalizeAiError(error);

    const fallbackReason =
      detectFallbackReason(
        errorMessage
      );

    const telemetry =
      buildAiTelemetry({
        task,
        provider: fallbackText
          ? "fallback"
          : resolvedProvider,
        model: resolvedModel,
        success: false,
        usedFallback:
          !!fallbackText,
        fallbackReason,
        startedAt,
        errorMessage
      });

    logAiTelemetry(
      telemetry
    );

    if (fallbackText) {
      return {
        text: fallbackText,
        telemetry
      };
    }

    throw error;
  }
};