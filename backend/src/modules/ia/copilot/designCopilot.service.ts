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
        {
          type: "IMPROVE_NAVBAR",
          target: "navbar"
        }
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
        {
          type: "IMPROVE_FOOTER",
          target: "footer"
        }
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
  message.includes("stats") ||
  message.includes("impact") ||
  message.includes("numbers") ||
  message.includes("metrics") ||
  message.includes("kpi") ||
  message.includes("chiffres") ||
  message.includes("statistiques")
) {
  suggestions.unshift(
    makeSuggestion(
      "improve-stats-section",
      "Improve stats / impact section",
      "Make numbers more visible with premium stat cards, better alignment, stronger spacing, and clearer hierarchy.",
      [
        {
          type: "IMPROVE_STATS",
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