
import { PageService } from "../pages/services/page.service";
import { generateTemplate } from "./ai.builder";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:5000";

export class AiService {
  private static async predictCategory(prompt: string): Promise<string> {
    try {
      const response = await fetch(`${ML_SERVICE_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) return this.fallbackCategory(prompt);
      const result = await response.json();
      return result.category ?? "Corporate";
    } catch {
      return this.fallbackCategory(prompt);
    }
  }

  private static fallbackCategory(prompt: string): string {
    const t = prompt.toLowerCase();
    if (["doctor","clinic","medical","healthcare","hospital","appointment","telemedicine"].some(k => t.includes(k))) return "Medical";
    if (["shop","store","ecommerce","product","cart"].some(k => t.includes(k))) return "Ecommerce";
    if (["restaurant","menu","booking","reservation"].some(k => t.includes(k))) return "Restaurant";
    if (["finance","bank","investment","wealth","trading"].some(k => t.includes(k))) return "Finance";
    return "Corporate";
  }

  static async generatePage(siteId: number, userId: number, prompt: string, title?: string) {
    if (!prompt?.trim()) throw new Error("PROMPT_REQUIRED");

    const category = await this.predictCategory(prompt);
    const generated = generateTemplate(category, prompt, title);

    const result = await PageService.createPage(siteId, userId, {
      title: generated.title,
      blocks: generated.blocks
    });

    return result.data;
  }
}