import { SiteContext } from "../ai.types";

export const buildAiContentPrompt = (
  context: SiteContext
): string => {
  return `
Generate professional website content for the following site.

Company name: ${context.companyName}
Category: ${context.category}
Tone: ${context.tone}
Audience: ${context.audience.join(", ")}
Services: ${context.services.join(", ")}
CTA: ${context.cta}
Pages: ${context.pages.join(", ")}
Keywords: ${context.keywords.join(", ")}

Return ONLY valid JSON.

The JSON must follow this exact structure:

{
  "title": "${context.companyName}",
  "heroTitle": "",
  "heroText": "",
  "missionTitle": "",
  "missionText": "",
  "services": [],
  "features": [],
  "stats": [
    { "value": "", "label": "" }
  ],
  "testimonials": [],
  "faqs": [],
  "ctaTitle": "",
  "ctaText": ""
}

Rules:
- Do not return markdown.
- Do not add explanations.
- Do not use placeholder text.
- Keep content professional and specific to the category.
- services must be an array of service names.
- features must use this format: "Title|Description|Learn More".
- testimonials must use this format: "Quote|Author".
- faqs must use this format: "Question|Answer".
- stats must contain exactly 4 items.
`;
};