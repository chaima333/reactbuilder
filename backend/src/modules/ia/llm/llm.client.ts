import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Anthropic from "@anthropic-ai/sdk";

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

export const isLlmEnabled = () =>
  process.env.LLM_ENABLED === "true";

export const generateText = async (
  prompt: string
): Promise<string> => {
  if (!isLlmEnabled()) {
    throw new Error("LLM_DISABLED");
  }

  const provider =
    (process.env.AI_PROVIDER || "gemini") as AiProvider;

  switch (provider) {
    case "gemini": {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY_MISSING");
      }

      const gemini =
        new GoogleGenerativeAI(
          process.env.GEMINI_API_KEY
        );

      const model =
        gemini.getGenerativeModel({
          model:
            process.env.GEMINI_MODEL ||
            "gemini-2.0-flash"
        });

      const result =
        await withTimeout(
          model.generateContent(prompt)
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
        await withTimeout(openai.responses.create({
          model:
            process.env.OPENAI_MODEL ||
            "gpt-4.1-mini",
          input: prompt
        }));

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
        await withTimeout(anthropic.messages.create({
          model:
            process.env.ANTHROPIC_MODEL ||
            "claude-sonnet-5",
          max_tokens: 1200,
          messages: [
            {
              role: "user",
              content: prompt
            }
          ]
        }));

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

export const testLLM = async () => {
  const response =
    await generateText(
      "Say only: LLM connection successful."
    );

  console.log(
    "LLM_TEST:",
    response
  );
};
