type AssistantSuggestion = {
  id: string;
  title: string;
  description: string;
  action: "IMPROVE_HERO" | "ADD_SERVICES" | "ADD_FAQ" | "ADD_CTA" | "ADD_TESTIMONIALS" | "ADD_PRICING";
};

export const askAssistant = async (
  prompt: string
) => {
  const text = prompt.toLowerCase();

  const suggestions: AssistantSuggestion[] = [];

  if (text.includes("restaurant")) {
    suggestions.push(
      {
        id: "restaurant-hero",
        title: "Improve Hero",
        description: "Use a stronger food-focused headline and CTA.",
        action: "IMPROVE_HERO"
      },
      {
        id: "restaurant-menu",
        title: "Add Menu Section",
        description: "Show popular dishes, categories and dining highlights.",
        action: "ADD_SERVICES"
      },
      {
        id: "restaurant-reservation",
        title: "Add Reservation CTA",
        description: "Encourage visitors to book a table.",
        action: "ADD_CTA"
      },
      {
        id: "restaurant-testimonials",
        title: "Add Guest Testimonials",
        description: "Add reviews from satisfied guests.",
        action: "ADD_TESTIMONIALS"
      }
    );
  }

  if (text.includes("cybersecurity")) {
    suggestions.push(
      {
        id: "cyber-hero",
        title: "Improve Hero",
        description: "Position the page around cyber defense and hands-on labs.",
        action: "IMPROVE_HERO"
      },
      {
        id: "cyber-services",
        title: "Add Threat Detection Services",
        description: "Add SOC labs, detection training and incident response.",
        action: "ADD_SERVICES"
      },
      {
        id: "cyber-faq",
        title: "Add Compliance FAQ",
        description: "Answer questions about certification, labs and compliance.",
        action: "ADD_FAQ"
      },
      {
        id: "cyber-cta",
        title: "Add Enterprise CTA",
        description: "Invite enterprises to request a demo.",
        action: "ADD_CTA"
      }
    );
  }

  if (suggestions.length === 0) {
    suggestions.push(
      {
        id: "generic-hero",
        title: "Improve Hero",
        description: "Make the headline clearer and more conversion-focused.",
        action: "IMPROVE_HERO"
      },
      {
        id: "generic-pricing",
        title: "Add Pricing Section",
        description: "Add pricing plans to improve conversion.",
        action: "ADD_PRICING"
      },
      {
        id: "generic-faq",
        title: "Improve FAQ",
        description: "Add answers to common customer questions.",
        action: "ADD_FAQ"
      }
    );
  }

  return {
    reply: `I analyzed your request and found ${suggestions.length} possible improvements.`,
    suggestions
  };
};