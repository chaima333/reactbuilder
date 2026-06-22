export const askAssistant = async (prompt: string) => {
  const text = prompt.toLowerCase();

  const suggestions: string[] = [];

  if (text.includes("restaurant")) {
    suggestions.push(
      "Improve hero with food-focused headline",
      "Add menu section",
      "Add reservation CTA",
      "Add customer testimonials"
    );
  }

  if (text.includes("cybersecurity")) {
    suggestions.push(
      "Improve hero with cybersecurity positioning",
      "Add threat detection services",
      "Add compliance FAQ",
      "Add enterprise CTA"
    );
  }

  if (suggestions.length === 0) {
    suggestions.push(
      "Improve Hero",
      "Add Pricing Section",
      "Improve FAQ"
    );
  }

  return {
    reply: `I analyzed your request: ${prompt}`,
    suggestions
  };
};