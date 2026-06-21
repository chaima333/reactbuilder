import { ActivityLog } from "../../models/activityLog";
import { AiGeneration } from "../../models/AiGeneration";
import { Page } from "../../models/page";
import { Seo } from "../../models/Seo";
import { MediaService } from "../media/media.service";
import { PageService } from "../pages/services/page.service";
import {
  generateTemplate,
  generatePageBlocksByType
} from "./ai.builder";
import { CATEGORY_TEMPLATES } from "./ai.templates";
import { buildBusinessProfile } from "./business.profile";
import { generateAiContent } from "./content.generator";
import { generateSeo } from "./seo.generator";
import { generateSitePlan } from "./site.plan";

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
    "students",
    "education",
    "teacher",
    "teachers",
    "learning",
    "learners",
    "classroom",
    "classrooms",
    "certification",
    "instructor",
    "instructors"
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
    "platform",
    "automation",
    "machine learning",
    "api",
    "apis",
    "devops",
    "infrastructure",
    "workflow",
    "workflows"
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
console.log("FINAL_CATEGORY", category);
console.log("FINAL_PROMPT", prompt);

const businessProfile = buildBusinessProfile(category, prompt);

console.log("BUSINESS_PROFILE", businessProfile);

const sitePlan = generateSitePlan(category, prompt, businessProfile);
console.log( "SITE_PLAN_CATEGORY", category, sitePlan.map((p) => p.slug));
  
const aiContent = generateAiContent(category,prompt,businessProfile);
console.log("AI_CONTENT_TITLE", aiContent.title);

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

const selectedPages =
  sitePlan.slice(0, 6);

const generationId = Date.now();
const plannedPages = selectedPages.map((page) => ({
  ...page,
  finalSlug:
    page.type === "home"
      ? "home"
      : `${page.slug}-${generationId}`
}));
const navigationItems = plannedPages.map((page) => ({
  label: page.title,
  href:
    page.type === "home"
      ? `/site/${siteId}`
      : `/site/${siteId}/${page.finalSlug}`
}));

const generated = generateTemplate(
  category,
  prompt,
  aiContent,
  heroImageUrl,
  navigationItems
);

console.log("AI_GENERATED_TITLE", generated.title);
console.log(
  "AI_GENERATED_BLOCKS_COUNT",
  generated.blocks?.length || 0
);
console.log("HOME_BLOCKS_COUNT", generated.blocks?.length || 0);

console.log(
  "AI_WILL_CREATE_PAGES",
  plannedPages.map((page) => ({
    title: page.title,
    slug: page.finalSlug,
    type: page.type
  }))
);
const createdPages: any[] = [];
let homepagePageId: number | undefined;

for (const planPage of plannedPages) {

  const pageTitle =
    planPage.type === "home"
      ? `${generated.title || category} Home ${generationId}`
      : `${generated.title || category} ${planPage.title} ${generationId}`;

  const pageSlug = planPage.finalSlug;
  const pageBlocks = generatePageBlocksByType(
    planPage.type,
    category,
    aiContent,
    heroImageUrl,
    navigationItems,
    planPage.title,
    generated.blocks
  );

  console.log("PAGE_TYPE_ASSIGNED", {
    type: planPage.type,
    slug: pageSlug,
    blocksCount: pageBlocks.length,
    source:
      planPage.type === "home"
        ? "generated.blocks"
        : `generate${planPage.title}Blocks`
  });

  if (planPage.type === "about") {
    console.log("ABOUT_BLOCKS_COUNT", pageBlocks.length);
  }

  console.log("PAGE_BLOCK_TYPES_BEFORE_CREATE", {
    pageType: planPage.type,
    slug: pageSlug,
    blockTypes: pageBlocks.map((block) => block.type),
    blockIds: pageBlocks.map((block) => block.id)
  });
  console.log(
    "NAVBAR_BLOCK_COUNT",
    pageBlocks.filter((block) => block.type === "navbar").length
  );

  const result = await PageService.createPage(
    siteId,
    userId,
    {
      title: pageTitle,
      slug: pageSlug,
      blocks: pageBlocks,
      isHomepage: planPage.type === "home"
    }
  );

  if (planPage.type === "home") {
    homepagePageId = result.data.id;
    console.log("HOMEPAGE_PAGE_ID", result.data.id);
  }

  const publishedResult = await PageService.publishPage(
    siteId,
    result.data.id,
    "OWNER",
    userId
  );

  createdPages.push(publishedResult.data);

  await ActivityLog.create({
    userId,
    siteId,
    action: "ai_page_generated",
    entityType: "page",
    entityId: result.data.id,
    details: {
      category,
      prompt,
      pageTitle,
      pageType: planPage.type,
      slug: pageSlug
    }
  });

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
}

const publishedHomepage = await Page.findOne({
  where: {
    siteId,
    isHomepage: true,
    status: "published"
  }
});

console.log("PUBLISHED_HOMEPAGE_ID", {
  expectedId: homepagePageId,
  publishedId: publishedHomepage?.id,
  slug: publishedHomepage?.slug,
  blocksCount: publishedHomepage?.blocks?.length || 0
});

if (!publishedHomepage || publishedHomepage.id !== homepagePageId) {
  throw new Error("PUBLISHED_HOMEPAGE_MISMATCH");
}

console.log("AI_HISTORY_WILL_SAVE", {
  siteId,
  userId,
  category,
  pagesGenerated: plannedPages.length
});
console.log("AI_HISTORY_SAVED");
await AiGeneration.create({
  siteId,
  userId,
  prompt,
  category,
  pagesGenerated: plannedPages.length,
  status: "success"
});
return createdPages[0];
}};


export class AiHistoryService {
  static async getHistory(
    userId: number,
    siteId: number
  ) {
    return AiGeneration.findAll({
      where: {
        userId,
        siteId
      },
      order: [["createdAt", "DESC"]],
      limit: 20
    });
  }
}