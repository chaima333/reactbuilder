import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

const provider =
  process.env.AI_PROVIDER || "gemini";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const gemini = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || ""
);

export const generateText = async (
  prompt: string
): Promise<string> => {
  switch (provider) {
    case "gemini": {
      const model = gemini.getGenerativeModel({
        model: "gemini-2.0-flash"
      });

      const result = await model.generateContent(prompt);

      return result.response.text() || "";
    }

    case "openai": {
      const response = await openai.responses.create({
        model: "gpt-4.1-mini",
        input: prompt
      });

      return response.output_text || "";
    }

    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
};
export const testLLM = async () => {
  const response = await generateText(
    "Say only: Gemini connection successful."
  );

  console.log("LLM_TEST:", response);
};