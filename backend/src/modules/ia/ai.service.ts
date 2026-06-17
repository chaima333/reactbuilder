import { PageService } from "../pages/services/page.service";
import { generateTemplate } from "./ai.builder";

const ML_SERVICE_URL =
  process.env.ML_SERVICE_URL || "http://localhost:5000";

export class AiService {
  private static fallbackCategory(prompt: string): string {
    const text = prompt.toLowerCase();

    if (
      [
        "doctor",
        "clinic",
        "medical",
        "healthcare",
        "hospital",
        "appointment",
        "telemedicine"
      ].some((keyword) => text.includes(keyword))
    ) {
      return "Medical";
    }

    if (
      [
        "shop",
        "store",
        "ecommerce",
        "product",
        "cart",
        "checkout"
      ].some((keyword) => text.includes(keyword))
    ) {
      return "Ecommerce";
    }

    if (
      [
        "restaurant",
        "menu",
        "booking",
        "reservation",
        "table"
      ].some((keyword) => text.includes(keyword))
    ) {
      return "Restaurant";
    }

    if (
      [
        "finance",
        "bank",
        "banking",
        "investment",
        "wealth",
        "trading",
        "loan"
      ].some((keyword) => text.includes(keyword))
    ) {
      return "Finance";
    }

    if (
      [
        "school",
        "university",
        "course",
        "courses",
        "academy",
        "training",
        "student",
        "learning"
      ].some((keyword) => text.includes(keyword))
    ) {
      return "Education";
    }

    if (
      [
        "portfolio",
        "designer",
        "photographer",
        "creative",
        "gallery",
        "projects"
      ].some((keyword) => text.includes(keyword))
    ) {
      return "Portfolio";
    }

    if (
      [
        "agency",
        "marketing",
        "branding",
        "campaign",
        "advertising"
      ].some((keyword) => text.includes(keyword))
    ) {
      return "Agency";
    }

    if (
      [
        "consulting",
        "consultant",
        "strategy",
        "advisory",
        "business development"
      ].some((keyword) => text.includes(keyword))
    ) {
      return "Consulting";
    }

    if (
      [
        "software",
        "technology",
        "tech",
        "ai",
        "cloud",
        "saas",
        "application",
        "platform"
      ].some((keyword) => text.includes(keyword))
    ) {
      return "Technology";
    }

    return "Corporate";
  }

  private static async predictCategory(prompt: string): Promise<string> {
    console.log("ML_SERVICE_URL_USED", ML_SERVICE_URL);

    try {
      const response = await fetch(`${ML_SERVICE_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt
        })
      });

      console.log("ML_RESPONSE_STATUS", response.status);

      if (!response.ok) {
        console.error(
          "ML service returned error status:",
          response.status
        );

        return this.fallbackCategory(prompt);
      }

      const result = await response.json();

      console.log("ML_RESPONSE_BODY", result);

      return result.category || this.fallbackCategory(prompt);
    } catch (error) {
      console.error("ML service error:", error);

      return this.fallbackCategory(prompt);
    }
  }

  static async generatePage(
    siteId: number,
    userId: number,
    prompt: string,
    title?: string
  ) {
    console.log("AI_SERVICE_VERSION", "CONFIG_BUILDER_V1");

    if (!prompt?.trim()) {
      throw new Error("PROMPT_REQUIRED");
    }

    const category = await this.predictCategory(prompt);

    console.log("AI_CATEGORY_USED", category);

    const generated = generateTemplate(
      category,
      prompt,
      title
    );

    console.log("AI_GENERATED_TITLE", generated.title);
    console.log(
      "AI_GENERATED_BLOCKS_COUNT",
      generated.blocks?.length || 0
    );

    const result = await PageService.createPage(
      siteId,
      userId,
      {
        title: generated.title,
        blocks: generated.blocks
      }
    );

    return result.data;
  }
}