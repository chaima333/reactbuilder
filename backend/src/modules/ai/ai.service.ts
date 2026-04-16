import OpenAI from "openai";
import { v4 as uuidv4 } from "uuid";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generatePage = async (topic: string, pageType: string) => {
  try {
    const prompt = `Génère une page web "${pageType}" sur "${topic}"...`; // Prompt متاعك
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) throw new Error("Empty AI response");

    let clean = response.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(clean);
  } catch (error) {
    throw new Error("AI generation failed safely");
  }
};