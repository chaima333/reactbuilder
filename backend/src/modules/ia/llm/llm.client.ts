import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Anthropic from "@anthropic-ai/sdk";
import {
  getAiRuntimeConfig
} from "./aiRuntimeConfig.service";

import {
  AiTaskName,
  AiTextResult
} from "../telemetry/aiTelemetry.types";

import {
  runAiTaskWithTelemetry
} from "../telemetry/aiProvider.service";

type AiProvider =
  | "gemini"
  | "openai"
  | "claude";

const LLM_TIMEOUT_MS = 30_000;

const withTimeout = async <T>(
  operation: Promise<T>
): Promise<T> => {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      operation,
      new Promise<never>((_, reject) => {
        timeout = setTimeout(
          () => reject(new Error("LLM_REQUEST_TIMEOUT")),
          LLM_TIMEOUT_MS
        );
      })
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
};
export const getActiveAiConfig =
  async () => {
    return getAiRuntimeConfig();
  };

export const generateTextForProvider = async ({
  prompt,
  provider,
  model
}: {
  prompt: string;
  provider: AiProvider;
  model: string;
}): Promise<string> => {
  switch (provider) {
    case "gemini": {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY_MISSING");
      }

      const gemini =
        new GoogleGenerativeAI(
          process.env.GEMINI_API_KEY
        );

      const geminiModel =
        gemini.getGenerativeModel({
          model
        });

      const result =
        await withTimeout(
          geminiModel.generateContent(prompt)
        );

      return result.response.text();
    }

    case "openai": {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY_MISSING");
      }

      const openai =
        new OpenAI({
          apiKey:
            process.env.OPENAI_API_KEY
        });

      const response =
        await withTimeout(
          openai.responses.create({
            model,
            input: prompt
          })
        );

      return response.output_text;
    }

    case "claude": {
      if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error("ANTHROPIC_API_KEY_MISSING");
      }

      const anthropic =
        new Anthropic({
          apiKey:
            process.env.ANTHROPIC_API_KEY
        });

      const response =
        await withTimeout(
          anthropic.messages.create({
            model,
            max_tokens: 1200,
            messages: [
              {
                role: "user",
                content: prompt
              }
            ]
          })
        );

      return response.content
        .map((block) =>
          block.type === "text"
            ? block.text
            : ""
        )
        .join("\n")
        .trim();
    }

    default:
      throw new Error(
        `Unsupported AI provider: ${provider}`
      );
  }
};
export const testProviderConnection = async ({
  provider,
  model,
}: {
  provider: AiProvider;
  model: string;
}) => {
  const startedAt = Date.now();

  const text = await generateTextForProvider({
    provider,
    model,
    prompt: "Say only: LLM connection successful.",
  });

  return {
    success: true,
    provider,
    model,
    response: text,
    latencyMs: Date.now() - startedAt,
  };
};
export const generateText = async (
  prompt: string
): Promise<string> => {
  const config =
    await getAiRuntimeConfig();

  if (!config.enabled) {
    throw new Error("LLM_DISABLED");
  }

  if (!config.model) {
    throw new Error("LLM_MODEL_MISSING");
  }

  return generateTextForProvider({
    prompt,
    provider: config.provider,
    model: config.model,
  });
};
export const generateTextWithTelemetry = async ({
  prompt,
  task,
  fallbackText
}: {
  prompt: string;
  task: AiTaskName;
  fallbackText?: string;
}): Promise<AiTextResult> => {
  const config =
    await getAiRuntimeConfig();

  return runAiTaskWithTelemetry({
    task,
    provider: config.provider,
    model: config.model,
    fallbackText,
    execute: () =>
      generateText(prompt)
  });
};

export const testLLM = async () => {
  const response =
    await generateTextWithTelemetry({
      task: "UNKNOWN",
      prompt:
        "Say only: LLM connection successful."
    });

  console.log(
    "LLM_TEST:",
    response.text
  );

  return response;
};
