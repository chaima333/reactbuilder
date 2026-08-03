import {
  generateTextWithTelemetry
} from "../llm/llm.client";
import { isPlainObject, safeParseAiJson } from "../telemetry/aiJsonGuard";
import { buildDesignCopilotPrompt } from "./designCopilot.prompt";
import { DesignCopilotAiResponseSchema } from "./designCopilot.schema";
import {
  DesignAction,
  DesignCopilotRequest,
  DesignCopilotResponse,
  DesignSuggestion
} from "./designCopilot.types";

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/\s+/g, "");

const inferCategory = (
  request: DesignCopilotRequest
): string => {
  const pageText = JSON.stringify({
    category: request.category,
    pageType: request.pageType,
    pageTitle: request.pageTitle,
    slug: request.slug,
    blocks: request.blocks
  }).toLowerCase();

  if (
    pageText.includes("technova") ||
    pageText.includes("technology") ||
    pageText.includes("software") ||
    pageText.includes("saas") ||
    pageText.includes("ai automation") ||
    pageText.includes("cloud") ||
    pageText.includes("api")
  ) {
    return "Technology";
  }

  if (
    pageText.includes("restaurant") ||
    pageText.includes("menu") ||
    pageText.includes("reservation") ||
    pageText.includes("table")
  ) {
    return "Restaurant";
  }

  if (
    pageText.includes("medical") ||
    pageText.includes("clinic") ||
    pageText.includes("doctor") ||
    pageText.includes("appointment")
  ) {
    return "Medical";
  }

  if (
    pageText.includes("finance") ||
    pageText.includes("investment") ||
    pageText.includes("bank")
  ) {
    return "Finance";
  }

  if (
    pageText.includes("portfolio") ||
    pageText.includes("gallery") ||
    pageText.includes("creative")
  ) {
    return "Portfolio";
  }

  if (
    pageText.includes("real estate") ||
    pageText.includes("property") ||
    pageText.includes("rent")
  ) {
    return "RealEstate";
  }

  return request.category || "Corporate";
};
const resolveDesignProfile = (
  category: string
) => {
  const c = normalize(category);

  if (
    ["medical", "health", "healthcare"].includes(c)
  ) {
    return "form-focused";
  }

  if (
    [
      "restaurant",
      "food",
      "foodhospitality",
      "realestate",
      "portfolio",
      "travel"
    ].includes(c)
  ) {
    return "image-rich-gallery";
  }

  return "card-heavy-modern";
};

const makeSuggestion = (
  id: string,
  title: string,
  description: string,
  actions: DesignAction[]
): DesignSuggestion => ({
  id,
  title,
  description,
  actions
});

type CopilotBlock = {
  id?: string;
  type?: string;
  data?: {
    props?: Record<string, any>;
  };
  children?: CopilotBlock[];
};

const findFirstBlock = (
  blocks: CopilotBlock[],
  predicate: (
    block: CopilotBlock
  ) => boolean
): CopilotBlock | null => {
  for (const block of blocks || []) {
    if (predicate(block)) {
      return block;
    }

    const nested =
      findFirstBlock(
        Array.isArray(block.children)
          ? block.children
          : [],
        predicate
      );

    if (nested) {
      return nested;
    }
  }

  return null;
};

const ownBlockSignal = (
  block: CopilotBlock
): string =>
  JSON.stringify({
    id:
      block.id,
    type:
      block.type,
    props:
      block.data?.props || {}
  }).toLowerCase();

const isExactHeroButtonRequest = (
  message: string
): boolean => {
  const normalized =
    String(message || "")
      .toLowerCase()
      .replace(/[-_]/g, " ");

  const mentionsHero =
    /\bhero\b/.test(normalized) ||
    normalized.includes("banner");

  const mentionsButton =
    /\bbutton\b/.test(normalized) ||
    normalized.includes("bouton") ||
    normalized.includes("cta") ||
    normalized.includes(
      "call to action"
    );

  return (
    mentionsHero &&
    mentionsButton
  );
};

const findHeroBlockForTargeting = (
  blocks: CopilotBlock[]
): CopilotBlock | null => {
  const explicitHero =
    findFirstBlock(
      blocks,
      (block) => {
        const type =
          String(block.type || "")
            .toLowerCase();

        return (
          type === "hero" ||
          ownBlockSignal(block)
            .includes("hero")
        );
      }
    );

  if (explicitHero) {
    return explicitHero;
  }

  return (
    (blocks || []).find(
      (block) =>
        block.type === "section"
    ) || null
  );
};

const createExactHeroButtonResponse = (
  request: DesignCopilotRequest,
  profile: string
): DesignCopilotResponse | null => {
  if (
    !isExactHeroButtonRequest(
      request.message
    )
  ) {
    return null;
  }

  const heroBlock =
    findHeroBlockForTargeting(
      request.blocks as CopilotBlock[]
    );

  const heroButton =
    heroBlock
      ? findFirstBlock(
          [heroBlock],
          (block) =>
            block.type === "button" &&
            !!String(block.id || "")
              .trim()
        )
      : null;

  const heroButtonId =
    String(heroButton?.id || "")
      .trim();

  if (!heroButtonId) {
    return {
      reply:
        "I could not find a button inside the hero section. No page-wide changes were suggested.",
      designProfile:
        profile,
      suggestions:
        []
    };
  }

  return {
    reply:
      "I found the hero button and limited the improvement to that exact block.",
    designProfile:
      profile,
    suggestions: [
      makeSuggestion(
        "improve-hero-button",
        "Improve hero button",
        "Improve only the hero call-to-action button without changing other buttons or page sections.",
        [
          {
            type:
              "IMPROVE_DESIGN",
            improvement:
              "IMPROVE_BUTTONS",
            target:
              heroButtonId,
            payload:
              {}
          }
        ]
      )
    ]
  };
};


const summarizeBlocksForAi = (
  blocks: any[]
) => {
  return JSON.stringify(
    blocks.map((block) => ({
      id: block.id,
      type: block.type,
      props: block.data?.props || {},
      styleKeys: Object.keys(block.data?.style?.desktop || {}),
      childrenCount: block.children?.length || 0
    }))
  ).slice(0, 6000);
};

const parseDesignCopilotAiOutput = (
  value: string
): Pick<
  DesignCopilotResponse,
  "reply" | "suggestions"
> | null => {
  const parsed =
    safeParseAiJson<unknown>(
      value
    );

  if (
    !parsed.success ||
    !isPlainObject(parsed.data)
  ) {
    console.warn(
      "DESIGN_COPILOT_JSON_PARSE_FAILED",
      {
        error:
          parsed.errorMessage ||
          "Response is not a JSON object"
      }
    );

    return null;
  }

  const validated =
    DesignCopilotAiResponseSchema.safeParse(
      parsed.data
    );

  if (!validated.success) {
    console.warn(
      "DESIGN_COPILOT_SCHEMA_INVALID",
      {
        issues:
          validated.error.issues
            .slice(0, 5)
            .map((issue) => ({
              path: issue.path.join("."),
              message: issue.message
            }))
      }
    );

    return null;
  }

  return {
    reply:
      validated.data.reply,

    suggestions:
      validated.data.suggestions.map(
        (suggestion, index) => ({
          id:
            suggestion.id ||
            `ai-design-${index}`,

          title:
            suggestion.title,

          description:
            suggestion.description ||
            "Improve this part of the page.",

          actions:
            suggestion.actions.map((action) => ({
              type:
                "IMPROVE_DESIGN",

              improvement:
                action.improvement,

              target:
                action.target || "page",

              payload:
                action.payload || {}
            }))
        })
      )
  };
};

export const createFallbackDesignCopilotResponse = (
  request: DesignCopilotRequest
): DesignCopilotResponse => {
  const message =
    request.message.toLowerCase();

  const category =
    inferCategory(request);

  const profile =
    resolveDesignProfile(category);

  const exactHeroButtonResponse =
    createExactHeroButtonResponse(
      request,
      profile
    );

  if (exactHeroButtonResponse) {
    return exactHeroButtonResponse;
  }

  const suggestions: DesignSuggestion[] = [];

  type ImproveDesignAction =
    Extract<
      DesignAction,
      {
        type: "IMPROVE_DESIGN";
      }
    >;

  const improve = (
    improvement: ImproveDesignAction["improvement"],
    target: string = "page",
    payload: Record<string, any> = {}
  ): DesignAction => ({
    type: "IMPROVE_DESIGN",
    improvement,
    target,
    payload
  });

  const wantsNavbar =
    message.includes("navbar") ||
    message.includes("navigation") ||
    message.includes("nav ") ||
    message.includes("menu") ||
    message.includes("header");

  if (wantsNavbar) {
    suggestions.push(
      makeSuggestion(
        "improve-navbar-layout",
        "Improve navbar layout",
        "Align logo, navigation links, and CTA button in one clean horizontal SaaS navbar.",
        [
          improve(
            "IMPROVE_NAVBAR",
            "navbar"
          )
        ]
      )
    );

    return {
      reply:
        `I detected a navbar-specific request. ` +
        `I will only improve the navbar layout using the ${profile} design profile.`,
      designProfile: profile,
      suggestions
    };
  }

  const wantsFooter =
    message.includes("footer") ||
    message.includes("bottom") ||
    message.includes("copyright") ||
    message.includes("follow us") ||
    message.includes("social links");

  if (wantsFooter) {
    suggestions.push(
      makeSuggestion(
        "improve-footer-layout",
        "Improve footer layout",
        "Make the footer cleaner, premium, well-spaced, and aligned with a modern SaaS layout.",
        [
          improve(
            "IMPROVE_FOOTER",
            "footer"
          )
        ]
      )
    );

    return {
      reply:
        `I detected a footer-specific request. ` +
        `I will only improve the footer layout using the ${profile} design profile.`,
      designProfile: profile,
      suggestions
    };
  }

  if (
    message.includes("stats") ||
    message.includes("impact") ||
    message.includes("numbers") ||
    message.includes("metrics") ||
    message.includes("kpi") ||
    message.includes("chiffres") ||
    message.includes("statistiques")
  ) {
    suggestions.push(
      makeSuggestion(
        "improve-stats-section",
        "Improve stats / impact section",
        "Make numbers more visible with premium stat cards, better alignment, stronger spacing, and clearer hierarchy.",
        [
          improve(
            "IMPROVE_STATS",
            "page"
          )
        ]
      )
    );

    return {
      reply:
        `I detected a stats-specific request. ` +
        `I will only improve the stats / impact section using the ${profile} design profile.`,
      designProfile: profile,
      suggestions
    };
  }

  if (
    message.includes("premium") ||
    message.includes("modern") ||
    message.includes("better") ||
    message.includes("improve") ||
    message.includes("design") ||
    message.includes("a7sen") ||
    message.includes("bahi")
  ) {
    suggestions.push(
      makeSuggestion(
        "improve-global-design",
        "Improve global visual design",
        "Upgrade spacing, cards, buttons, and overall visual hierarchy.",
        [
          improve(
            "IMPROVE_SPACING",
            "page"
          ),
          improve(
            "IMPROVE_CARDS",
            "page"
          ),
          improve(
            "IMPROVE_BUTTONS",
            "page"
          )
        ]
      )
    );
  }

  if (
    message.includes("center") ||
    message.includes("left") ||
    message.includes("yissar") ||
    message.includes("contact") ||
    message.includes("faq") ||
    message.includes("reservation")
  ) {
    suggestions.push(
      makeSuggestion(
        "center-layouts",
        "Center important layouts",
        "Center FAQ, contact, and reservation sections inside the page.",
        [
          improve(
            "CENTER_LAYOUT",
            "faq"
          ),
          improve(
            "CENTER_LAYOUT",
            "contact"
          ),
          improve(
            "CENTER_LAYOUT",
            "reservation"
          )
        ]
      )
    );
  }

  if (
    message.includes("form") ||
    message.includes("booking") ||
    message.includes("reservation") ||
    message.includes("contact")
  ) {
    suggestions.push(
      makeSuggestion(
        "improve-forms",
        "Improve forms",
        "Make inputs, textarea, and form cards more spacious and professional.",
        [
          improve(
            "IMPROVE_FORMS",
            "page"
          ),
          improve(
            "IMPROVE_BUTTONS",
            "page"
          )
        ]
      )
    );
  }

  if (
    profile === "image-rich-gallery"
  ) {
    suggestions.push(
      makeSuggestion(
        "image-rich-profile",
        "Apply image-rich design profile",
        "Use stronger image radius, softer shadows, and gallery-friendly visual style.",
        [
          improve(
            "IMPROVE_IMAGES",
            "page"
          ),
          improve(
            "IMPROVE_CARDS",
            "page"
          ),
          improve(
            "IMPROVE_SPACING",
            "page"
          )
        ]
      )
    );
  }

  if (
    suggestions.length === 0
  ) {
    suggestions.push(
      makeSuggestion(
        "safe-design-upgrade",
        "Apply safe design upgrade",
        "Improve spacing, cards, and buttons without changing the page structure.",
        [
          improve(
            "IMPROVE_SPACING",
            "page"
          ),
          improve(
            "IMPROVE_CARDS",
            "page"
          ),
          improve(
            "IMPROVE_BUTTONS",
            "page"
          )
        ]
      )
    );
  }

  return {
    reply:
      `I analyzed this page as ${category} using the ${profile} design profile. ` +
      "Choose an improvement and I will apply it directly to the page blocks.",
    designProfile: profile,
    suggestions
  };
};

export const createDesignCopilotResponse = async (
  request: DesignCopilotRequest
): Promise<DesignCopilotResponse> => {
  const category =
    inferCategory(request);

  const profile =
    resolveDesignProfile(category);

  const fallback =
    createFallbackDesignCopilotResponse(
      request
    );

  if (
    isExactHeroButtonRequest(
      request.message
    )
  ) {
    return fallback;
  }

  try {
const prompt =
  buildDesignCopilotPrompt({
    category,
    profile,
    pageTitle:
      request.pageTitle,
    slug:
      request.slug,
    message:
      request.message,
    blocksSummary:
      summarizeBlocksForAi(
        request.blocks
      )
  });

    const fallbackJson =
      JSON.stringify({
        reply:
          fallback.reply,
        suggestions:
          fallback.suggestions
      });

    const llmResult =
      await generateTextWithTelemetry({
        prompt,
        task: "DESIGN_COPILOT_CHAT",
        fallbackText:
          fallbackJson
      });

    const aiText =
      llmResult.text;

    const parsed =
      parseDesignCopilotAiOutput(
        aiText
      );

    if (!parsed) {
      console.warn(
        "DESIGN_COPILOT_INVALID_AI_OUTPUT",
        {
          provider:
            llmResult.telemetry.provider,
          model:
            llmResult.telemetry.model,
          durationMs:
            llmResult.telemetry.durationMs
        }
      );

      return {
        ...fallback,
        aiTelemetry: {
          ...llmResult.telemetry,
          success: false,
          usedFallback: true,
          fallbackReason: "INVALID_JSON"
        }
      };
    }

    return {
      reply:
        parsed.reply,
      designProfile:
        profile,
      suggestions:
        parsed.suggestions,
      aiTelemetry:
        llmResult.telemetry
    };
  } catch (error) {
    console.error(
      "DESIGN_COPILOT_LLM_FAILED",
      error
    );

    return fallback;
  }
};