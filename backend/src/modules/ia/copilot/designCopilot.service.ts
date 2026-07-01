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
  const text = JSON.stringify({
    category: request.category,
    pageType: request.pageType,
    pageTitle: request.pageTitle,
    slug: request.slug,
    message: request.message,
    blocks: request.blocks
  }).toLowerCase();

  if (
    text.includes("restaurant") ||
    text.includes("menu") ||
    text.includes("reservation") ||
    text.includes("table")
  ) {
    return "Restaurant";
  }

  if (
    text.includes("medical") ||
    text.includes("clinic") ||
    text.includes("doctor") ||
    text.includes("appointment")
  ) {
    return "Medical";
  }

  if (
    text.includes("finance") ||
    text.includes("investment") ||
    text.includes("bank")
  ) {
    return "Finance";
  }

  if (
    text.includes("portfolio") ||
    text.includes("gallery") ||
    text.includes("creative")
  ) {
    return "Portfolio";
  }

  if (
    text.includes("real estate") ||
    text.includes("property") ||
    text.includes("rent")
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

export const createDesignCopilotResponse = (
  request: DesignCopilotRequest
): DesignCopilotResponse => {
  const message =
    request.message.toLowerCase();

  const category =
    inferCategory(request);

  const profile =
    resolveDesignProfile(category);

  const suggestions: DesignSuggestion[] = [];

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
          {
            type: "IMPROVE_SPACING",
            target: "page"
          },
          {
            type: "IMPROVE_CARDS",
            target: "page"
          },
          {
            type: "IMPROVE_BUTTONS",
            target: "page"
          }
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
          {
            type: "CENTER_LAYOUT",
            target: "faq"
          },
          {
            type: "CENTER_LAYOUT",
            target: "contact"
          },
          {
            type: "CENTER_LAYOUT",
            target: "reservation"
          }
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
          {
            type: "IMPROVE_FORMS",
            target: "page"
          },
          {
            type: "IMPROVE_BUTTONS",
            target: "page"
          }
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
          {
            type: "IMPROVE_IMAGES",
            target: "page"
          },
          {
            type: "IMPROVE_CARDS",
            target: "page"
          },
          {
            type: "IMPROVE_SPACING",
            target: "page"
          }
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
          {
            type: "IMPROVE_SPACING",
            target: "page"
          },
          {
            type: "IMPROVE_CARDS",
            target: "page"
          },
          {
            type: "IMPROVE_BUTTONS",
            target: "page"
          }
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