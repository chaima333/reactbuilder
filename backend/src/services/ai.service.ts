import OpenAI from "openai";
import { v4 as uuidv4 } from "uuid";

console.log("OPENAI KEY EXISTS:", !!process.env.OPENAI_API_KEY);

// 🚨 Stop immediately if key missing
if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is missing in environment variables");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const aiService = {
  async generatePage(topic: string, pageType: string) {
    try {
      const prompt = `
Génère une page web "${pageType}" sur "${topic}".

Réponds UNIQUEMENT en JSON valide (aucun texte avant/après):

{
  "title": "string",
  "seoTitle": "string",
  "seoDescription": "string",
  "blocks": [
    { "id": "${uuidv4()}", "type": "title", "content": "..." },
    { "id": "${uuidv4()}", "type": "text", "content": "..." },
    { "id": "${uuidv4()}", "type": "image", "content": "https://picsum.photos/800/400" },
    { "id": "${uuidv4()}", "type": "button", "content": "Click", "link": "/contact" }
  ]
}
`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini", // 🔥 plus stable que 3.5
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
      });

      const response = completion.choices[0]?.message?.content;

      if (!response) {
        throw new Error("Empty AI response");
      }

      // تنظيف قوي
      let clean = response
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      let parsed;

      try {
        parsed = JSON.parse(clean);
      } catch (err) {
        console.error("❌ RAW AI RESPONSE:", clean);
        throw new Error("AI returned invalid JSON");
      }

      // 🛡️ validation minimal
      if (!parsed.title || !parsed.blocks) {
        throw new Error("AI response missing required fields");
      }

      return parsed;
    } catch (error: any) {
      console.error("🔥 AI SERVICE ERROR:", error.message);
      throw new Error("AI generation failed safely");
    }
  },
};