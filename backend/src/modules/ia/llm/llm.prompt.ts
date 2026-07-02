import { SiteContext } from "../ai.types";

export const buildAiContentPrompt = (
  context: SiteContext,
  userPrompt: string
): string => {
  return `
You are generating structured website content for ReactBuilder.

ReactBuilder is a no-code website builder.
You must generate content only.
Do not generate React code.
Do not generate CSS.
Do not generate PageBlock objects.

User prompt:
${userPrompt}

Site context:
- Company name: ${context.companyName}
- Category: ${context.category}
- Tone: ${context.tone}
- Audience: ${context.audience.join(", ")}
- Services: ${context.services.join(", ")}
- CTA: ${context.cta}
- Pages: ${context.pages.join(", ")}
- Keywords: ${context.keywords.join(", ")}

Return ONLY valid JSON.
Do not return markdown.
Do not add explanations.
Do not wrap the JSON in triple backticks.

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
- Do not use placeholder text.
- Content must be specific to the user prompt.
- Keep the tone professional and aligned with the category.
- services must be an array of service names.
- services must contain between 4 and 6 items.
- features must contain exactly 4 items.
- features must use this format: "Title|Description|Learn More".
- testimonials must contain exactly 3 items.
- testimonials must use this format: "Quote|Author".
- faqs must contain exactly 4 items.
- faqs must use this format: "Question|Answer".
- stats must contain exactly 4 items.
- ctaTitle and ctaText must match the business goal.
`;
};