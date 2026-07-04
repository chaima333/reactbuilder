import {
  generateTextWithTelemetry
} from "../llm/llm.client";
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


const safeJsonParse = (value: string) => {
  try {
    const cleaned =
      value
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    return JSON.parse(cleaned);
  } catch {
    return null;
  }
};

const allowedImprovements = new Set([
  "CENTER_LAYOUT",
  "IMPROVE_SPACING",
  "IMPROVE_CARDS",
  "IMPROVE_BUTTONS",
  "IMPROVE_IMAGES",
  "IMPROVE_FORMS",
  "IMPROVE_STATS",
  "IMPROVE_NAVBAR",
  "IMPROVE_FOOTER"
]);

const sanitizeAiSuggestions = (
  value: any
): DesignSuggestion[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item, index) => ({
      id:
        String(item.id || `ai-design-${index}`),

      title:
        String(item.title || "AI design improvement"),

      description:
        String(
          item.description ||
          "Improve this part of the page."
        ),

      actions:
        Array.isArray(item.actions)
          ? item.actions
              .map((action: any) => {
                if (
                  action.type === "IMPROVE_DESIGN" &&
                  allowedImprovements.has(action.improvement)
                ) {
                  return {
                    type: "IMPROVE_DESIGN",
                    improvement: action.improvement,
                    target: action.target,
                    payload: action.payload || {}
                  };
                }

                return null;
              })
              .filter(Boolean)
          : []
    }))
    .filter((item) => item.actions.length > 0);
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

  try {
    const prompt = `
You are the AI Design Co-Pilot of ReactBuilder.

The user wants to improve the current page design.

You must understand the user's request and return ONLY valid JSON.

Page context:
- category: ${category}
- designProfile: ${profile}
- pageTitle: ${request.pageTitle || ""}
- slug: ${request.slug || ""}

User message:
${request.message}

Current page blocks summary:
${summarizeBlocksForAi(request.blocks)}

Allowed design improvements:
- CENTER_LAYOUT
- IMPROVE_SPACING
- IMPROVE_CARDS
- IMPROVE_BUTTONS
- IMPROVE_IMAGES
- IMPROVE_FORMS
- IMPROVE_STATS
- IMPROVE_NAVBAR
- IMPROVE_FOOTER

Important:
- Do NOT return APPLY_PROFILE.
- Do NOT return raw action strings.
- Every action must use this exact shape:
  {
    "type": "IMPROVE_DESIGN",
    "improvement": "ONE_OF_ALLOWED_IMPROVEMENTS",
    "target": "page",
    "payload": {}
  }

Rules:
- If the user mentions navbar, return only navbar actions.
- If the user mentions footer, return only footer actions.
- If the user mentions stats, numbers, impact, or KPI, return stats actions.
- If the user asks for general premium/modern design, return global design actions.
- Never modify content text.
- Never generate a new page.
- Return 1 to 3 suggestions maximum.
- Each suggestion must contain actions.
- Output JSON only.

JSON format:
{
  "reply": "short explanation",
  "suggestions": [
    {
      "id": "short-id",
      "title": "Suggestion title",
      "description": "What will be improved",
      "actions": [
        {
  "type": "IMPROVE_DESIGN",
  "improvement": "IMPROVE_NAVBAR",
  "target": "navbar",
  "payload": {}
}
      ]
    }
  ]
}
`;
const fallbackJson =
  JSON.stringify({
    reply: fallback.reply,
    suggestions: fallback.suggestions
  });

const llmResult =
  await generateTextWithTelemetry({
    prompt,
    task: "DESIGN_COPILOT_CHAT",
    fallbackText: fallbackJson
  });

const aiText =
  llmResult.text;

    const parsed =
      safeJsonParse(aiText);

    const suggestions =
      sanitizeAiSuggestions(
        parsed?.suggestions
      );

   if (
  !parsed ||
  suggestions.length === 0
) {
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
    String(
      parsed.reply ||
        "I understood your design request and prepared safe improvements."
    ),
  designProfile: profile,
  suggestions,
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


export const createFallbackDesignCopilotResponse = (
  request: DesignCopilotRequest
): DesignCopilotResponse => {
  const message =
    request.message.toLowerCase();

  const category =
    inferCategory(request);

  const profile =
    resolveDesignProfile(category);

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