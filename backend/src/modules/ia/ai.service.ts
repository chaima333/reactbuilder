import { Seo } from "../../models/Seo";
import { MediaService } from "../media/media.service";
import { PageService } from "../pages/services/page.service";
import { generateTemplate } from "./ai.builder";
import { CATEGORY_TEMPLATES } from "./ai.templates";
import { generateAiContent } from "./content.generator";
import { generateSeo } from "./seo.generator";

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

  
  const aiContent = generateAiContent(
  category,
  prompt
);

  const template =
    CATEGORY_TEMPLATES[category] ??
    CATEGORY_TEMPLATES["Corporate"];

  const heroSection =
    template.sections.find(
      (section) => section.kind === "hero"
    );

  let heroImageUrl: string | undefined;

  if (heroSection?.image) {
    try {
      const media =
        await MediaService.uploadImageFromUrl(
          heroSection.image,
          String(siteId),
          String(userId),
          `${category} hero image`
        );

      heroImageUrl = media.url;
console.log("MEDIA_AI_NOTIFICATION_DISPATCHED", {
  mediaId: media.id,
  siteId,
  userId,
  originalName: media.originalName
});
      console.log("AI_HERO_IMAGE_UPLOADED", heroImageUrl);
    } catch (error) {
      console.error("AI_IMAGE_UPLOAD_FAILED", error);
    }
  }

const generated = generateTemplate(
  category,
  prompt,
  aiContent,
  heroImageUrl
);

  console.log("AI_GENERATED_TITLE", generated.title);
  console.log(
    "AI_GENERATED_BLOCKS_COUNT",
    generated.blocks?.length || 0
  );

  const pageTitle =
    title?.trim() ||
    generated.title ||
    `${category} Website`;

  const result = await PageService.createPage(
    siteId,
    userId,
    {
      title: pageTitle,
      blocks: generated.blocks
    }
  );

  const seo = generateSeo(
  category,
  pageTitle,
  heroImageUrl
);

await Seo.create({
  pageId: result.data.id,
  siteId,

  metaTitle: seo.metaTitle,
  metaDescription: seo.metaDescription,
  metaKeywords: seo.metaKeywords,

  ogTitle: seo.ogTitle,
  ogDescription: seo.ogDescription,
  ogImage: seo.ogImage,

  twitterTitle: seo.twitterTitle,
  twitterDescription: seo.twitterDescription,
  twitterImage: seo.twitterImage
});

  return result.data;
}
}