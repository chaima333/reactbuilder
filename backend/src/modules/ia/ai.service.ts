// backend/src/modules/ia/ai.service.ts

import { ActivityLog } from "../../models/activityLog";
import { AiGeneration } from "../../models/AiGeneration";
import { Form } from "../../models/Form.model";
import { Page } from "../../models/page";
import { Seo } from "../../models/Seo";
import { MediaService } from "../media/media.service";
import { PageService } from "../pages/services/page.service";
import { generatePageBlocksByType, generateHomeBlocks} from "./ai.builder";
import { repairAiPageBlocks } from "./ai.repair";
import { CATEGORY_TEMPLATES } from "./ai.templates";
import { validateAiPageBlocks } from "./ai.validator";
import { buildBusinessProfile, buildSiteContext } from "./business.profile";
import { generateAiContent } from "./content.generator";
import { generateSeo } from "./seo.generator";
import { generateSitePlan } from "./site.plan";

const ML_SERVICE_URL =
  process.env.ML_SERVICE_URL || "http://localhost:5000";

const MIN_ML_CONFIDENCE = 0.55;

type MlPrediction = {
  category: string;
  confidence: number;
  source: "ml" | "fallback";
  error?: string;
};

type CategoryDecision = {
  category: string;
  mlCategory: string;
  mlConfidence: number;
  usedFallback: boolean;
  reason: string;
};

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
        "cybersecurity",
        "cyber security",
        "threat detection",
        "compliance",
        "ethical hacking",
        "penetration testing",
        "incident response",
        "security awareness",
        "soc",
        "siem"
      ].some((keyword) => text.includes(keyword))
    ) {
      return "Cybersecurity";
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

    return "Technology";
  }
  
  private static async predictCategory(
    prompt: string
  ): Promise<MlPrediction> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8_000);

    try {
      const response = await fetch(`${ML_SERVICE_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        console.error(
          "ML service returned error status:",
          response.status
        );

        return {
          category: this.fallbackCategory(prompt),
          confidence: 0,
          source: "fallback",
          error: `ML_HTTP_${response.status}`
        };
      }

      const result = await response.json();

      const category =
        typeof result.category === "string" &&
        result.category.trim()
          ? result.category
          : this.fallbackCategory(prompt);

      const confidence =
        typeof result.confidence === "number"
          ? result.confidence
          : 0;

      return {
        category,
        confidence,
        source: "ml"
      };
    } catch (error) {
      console.error("ML service error:", error);

      return {
        category: this.fallbackCategory(prompt),
        confidence: 0,
        source: "fallback",
        error:
          error instanceof Error && error.name === "AbortError"
            ? "ML_SERVICE_TIMEOUT"
            : "ML_SERVICE_UNAVAILABLE"
      };
    } finally {
      clearTimeout(timeout);
    }
  }
  
  private static normalizeSupportedCategory(
    category: string
  ): string {
    if (CATEGORY_TEMPLATES[category]) {
      return category;
    }

    if (category === "Cybersecurity") {
      return CATEGORY_TEMPLATES["Cybersecurity"]
        ? "Cybersecurity"
        : "Technology";
    }

    return "Corporate";
  }

  private static resolveFinalCategory(
    prediction: MlPrediction,
    prompt: string
  ): CategoryDecision {
    const text = prompt.toLowerCase();

    const scores: Record<string, number> = {
      Technology: 0,
      RealEstate: 0,
      Education: 0,
      Medical: 0,
      Finance: 0,
      Ecommerce: 0,
      Restaurant: 0,
      Agency: 0,
      Consulting: 0,
      Portfolio: 0,
      Corporate: 0
    };

    const addScore = (
      category: string,
      keywords: string[],
      points = 1
    ) => {
      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          scores[category] += points;
        }
      }
    };

    addScore("Finance", [
      "fintech",
      "finance",
      "financial",
      "bank",
      "banking",
      "investment",
      "investor",
      "investors",
      "wealth",
      "trading",
      "loan",
      "portfolio",
      "robo-advisor",
      "advisory"
    ]);

    addScore("Medical", [
      "clinic",
      "doctor",
      "medical",
      "healthcare",
      "hospital",
      "appointment",
      "telemedicine"
    ]);

    addScore("Ecommerce", [
      "shop",
      "store",
      "ecommerce",
      "product",
      "cart",
      "checkout"
    ]);

    addScore("Restaurant", [
      "restaurant",
      "menu",
      "reservation",
      "food",
      "table"
    ]);

    addScore("RealEstate", [
      "real estate",
      "property",
      "properties",
      "rent",
      "rental",
      "buying",
      "selling",
      "homes",
      "agents",
      "valuation",
      "villa",
      "apartment"
    ]);

    addScore("Technology", [
      "saas",
      "software",
      "workflow",
      "automation",
      "api",
      "apis",
      "integration",
      "analytics",
      "dashboard",
      "cloud",
      "platform",
      "ai",
      "machine learning",
      "cybersecurity",
      "cyber security",
      "penetration testing",
      "soc",
      "siem"
    ]);

    addScore("Education", [
      "school",
      "academy",
      "course",
      "training",
      "student",
      "learning",
      "certification",
      "university"
    ]);

    addScore("Agency", [
      "agency",
      "marketing",
      "branding",
      "campaign",
      "advertising"
    ]);

    addScore("Consulting", [
      "consulting",
      "consultant",
      "strategy",
      "business development"
    ]);

    addScore("Portfolio", [
      "portfolio",
      "designer",
      "photographer",
      "creative",
      "gallery",
      "projects"
    ]);

    const [ruleCategory, ruleScore] =
      Object.entries(scores).sort(
        (a, b) => b[1] - a[1]
      )[0];

    const mlCategory =
      this.normalizeSupportedCategory(
        prediction.category
      );

    const mlConfidence =
      prediction.confidence;

    if (
      prediction.source === "fallback" ||
      mlConfidence < MIN_ML_CONFIDENCE
    ) {
      const fallbackCategory =
        ruleScore >= 1
          ? this.normalizeSupportedCategory(ruleCategory)
          : this.fallbackCategory(prompt);

      return {
        category: fallbackCategory,
        mlCategory,
        mlConfidence,
        usedFallback: true,
        reason:
          prediction.source === "fallback"
            ? "ML_SERVICE_FALLBACK"
            : "LOW_ML_CONFIDENCE"
      };
    }

    if (
      ruleScore >= 2 &&
      ruleCategory !== mlCategory &&
      mlConfidence < 0.75
    ) {
      return {
        category: this.normalizeSupportedCategory(ruleCategory),
        mlCategory,
        mlConfidence,
        usedFallback: true,
        reason: "RULE_OVERRIDE"
      };
    }

    return {
      category: mlCategory,
      mlCategory,
      mlConfidence,
      usedFallback: false,
      reason: "ML_CONFIDENT"
    };
  }

  static async generatePage(
    siteId: number,
    userId: number,
    prompt: string,
    title: string | undefined,
    siteRole: string
  ) {
    if (!prompt?.trim()) {
      throw new Error("PROMPT_REQUIRED");
    }

    const prediction =
      await this.predictCategory(prompt);

    const categoryDecision =
      this.resolveFinalCategory(
        prediction,
        prompt
      );

    const category =
      categoryDecision.category;

    console.log("AI_CATEGORY_DECISION", {
      mlCategory: categoryDecision.mlCategory,
      mlConfidence: categoryDecision.mlConfidence,
      finalCategory: category,
      usedFallback: categoryDecision.usedFallback,
      reason: categoryDecision.reason
    });

    const businessProfile =
      buildBusinessProfile(
        category,
        prompt
      );

    const siteContext =
      buildSiteContext(
        category,
        prompt,
        businessProfile
      );

    const sitePlan = siteContext.pages.map((page) => ({
      type: page,
      title:
        page === "home"
          ? "Home"
          : page.charAt(0).toUpperCase() + page.slice(1),
      slug: page
    }));

    const aiContent =
      await generateAiContent(
        siteContext,
        prompt
      );

    const aiTelemetry =
      (aiContent as any)?.aiTelemetry || null;

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
      } catch (error) {
        console.error("AI_IMAGE_UPLOAD_FAILED", error);
      }
    }

    const selectedPages =
      sitePlan.slice(0, 6);

    const plannedPages = selectedPages.map((page) => ({
      ...page,
      finalSlug:
        page.type === "home"
          ? "home"
          : page.slug
    }));
    
    const navigationItems = plannedPages.map((page) => ({
      label: page.title,
      href:
        page.type === "home"
          ? `/site/${siteId}`
          : `/site/${siteId}/${page.finalSlug}`
    }));

    const normalizedPrompt = prompt.toLowerCase();
    const requestedPageType =
      normalizedPrompt.includes("contact")
        ? "contact"
        : normalizedPrompt.includes("about")
        ? "about"
        : normalizedPrompt.includes("services")
        ? "services"
        : normalizedPrompt.includes("solutions")
        ? "solutions"
        : normalizedPrompt.includes("pricing")
        ? "pricing"
        : "home";
const activeForm =
  await Form.findOne({
    where: {
      siteId,
      isActive: true
    },
    order: [
      ["createdAt", "DESC"]
    ]
  });

const activeFormId =
  activeForm?.id
    ? String(activeForm.id)
    : "";



    const generated = {
      title: aiContent.title,
      blocks: generateHomeBlocks(
        category,
        aiContent,
        heroImageUrl,
        navigationItems
      )
    };

    const createdPages: any[] = [];
    let homepagePageId: number | undefined;

    for (const planPage of plannedPages) {
      const pageTitle =
        planPage.type === "home"
          ? `${generated.title || category} Home`
          : `${generated.title || category} ${planPage.title}`;

      const pageSlug = planPage.finalSlug;
      let pageBlocks = generatePageBlocksByType(
        planPage.type,
        category,
        aiContent,
        heroImageUrl,
        navigationItems,
        planPage.title,
        generated.blocks
      );
if (
  planPage.type === "contact" &&
  activeFormId
) {
  const applyFormId = (
    blocks: any[]
  ): any[] =>
    blocks.map((block) => ({
      ...block,

      data: block.data
        ? {
            ...block.data,
            props:
              block.type === "form"
                ? {
                    ...(block.data.props || {}),
                    formId: activeFormId
                  }
                : block.data.props
          }
        : block.data,

      children: Array.isArray(
        block.children
      )
        ? applyFormId(block.children)
        : block.children
    }));

  pageBlocks = applyFormId(
    pageBlocks
  );
}
      const validationBeforeRepair =
        validateAiPageBlocks(
          planPage.type,
          pageBlocks,
          prompt
        );

      pageBlocks =
        repairAiPageBlocks(
          planPage.type,
          pageBlocks,
          validationBeforeRepair.issues
        );

      const validation =
        validateAiPageBlocks(
          planPage.type,
          pageBlocks,
          prompt
        );

      const shouldPublish = validation.valid;

      if (!validation.valid) {
        console.warn("AI_PAGE_VALIDATION_FAILED", {
          pageType: planPage.type,
          slug: pageSlug,
          score: validation.score,
          issues: validation.issues,
          validationErrors: validation.issues
        });
      }

      const existingPage =
        await Page.findOne({
          where: {
            siteId,
            slug: pageSlug
          }
        });

     if (existingPage) {
  console.warn("AI_PAGE_ALREADY_EXISTS", {
    siteId,
    slug: pageSlug,
    pageId: existingPage.id
  });

  if (planPage.type === "home") {
    homepagePageId = existingPage.id;
  }

  if (planPage.type === requestedPageType) {
    const updatedResult = await PageService.updatePage(
      siteId,
      existingPage.id,
      userId,
      {
        blocks: pageBlocks
      }
    );

    createdPages.push(
      updatedResult.data
    );
  }

  continue;
}

      const result = await PageService.createPage(
        siteId,
        userId,
        {
          title: pageTitle,
          slug: pageSlug,
          blocks: pageBlocks,
          isHomepage: planPage.type === "home",
          status: "draft"
        }
      );

      if (planPage.type === "home") {
        homepagePageId = result.data.id;
      }

      if (shouldPublish) {
        const publishedResult = await PageService.publishPage(
          siteId,
          result.data.id,
          siteRole,
          userId
        );
        createdPages.push(publishedResult.data);
      } else {
        console.warn("AI_PAGE_SAVED_AS_DRAFT", {
          pageId: result.data.id,
          slug: pageSlug,
          issues: validation.issues
        });
        createdPages.push(result.data);
      }

      // ✅ تسجيل النشاط
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
          slug: pageSlug,
          mlCategory: categoryDecision.mlCategory,
          mlConfidence: categoryDecision.mlConfidence,
          usedFallback: categoryDecision.usedFallback,
          categoryDecisionReason: categoryDecision.reason,
          validationScore: validation.score,
          validationValid: validation.valid,
          validationIssues: validation.issues,
          aiTelemetry,
        }
      });

      // ✅ SEO
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

    const finalHomepage =
      publishedHomepage ||
      createdPages.find(
      (page) => page.isHomepage
      ) ||
      createdPages[0];

     if (!finalHomepage) {
     throw new Error("AI_GENERATION_EMPTY");
     }

    if (
      homepagePageId &&
      publishedHomepage.id !== homepagePageId
    ) {
      console.warn("PUBLISHED_HOMEPAGE_DIFFERENT", {
        expectedId: homepagePageId,
        publishedId: publishedHomepage.id
      });
    }

    await AiGeneration.create({
      siteId,
      userId,
      prompt,
      category,
      pagesGenerated: createdPages.length,
      status: "success"
    });

    console.log("AI_HISTORY_SAVED", {
      siteId,
      userId,
      category,
      pagesGenerated: createdPages.length
    });

    const firstCreatedPage = createdPages[0] || publishedHomepage;

    if (firstCreatedPage) {
      (firstCreatedPage as any).aiCategory = category;
      (firstCreatedPage as any).aiTelemetry = aiTelemetry;
      (firstCreatedPage as any).aiGenerationMeta = {
        mlCategory: categoryDecision.mlCategory,
        mlConfidence: categoryDecision.mlConfidence,
        usedCategoryFallback: categoryDecision.usedFallback,
        categoryDecisionReason: categoryDecision.reason,
        pagesGenerated: createdPages.length
      };
    }

    const requestedPage =
      createdPages.find(
        (page: any) =>
          page.slug === requestedPageType
            ) || firstCreatedPage;
              console.log(
      "AI_RETURN_DEBUG",
      {
        requestedPageType,
        createdPages: createdPages.map(
          (page: any) => ({
            id: page.id,
            slug: page.slug,
            title: page.title,
            hasForm: JSON.stringify(
              page.blocks || []
            ).includes('"type":"form"')
          })
        ),
        returnedPage: requestedPage
          ? {
              id: requestedPage.id,
              slug: requestedPage.slug,
              title: requestedPage.title,
              hasForm: JSON.stringify(
                requestedPage.blocks || []
              ).includes('"type":"form"')
            }
          : null
      }
    );
    return requestedPage;
  }
}

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