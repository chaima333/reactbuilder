import { AiGeneratedContent } from "./ai.types";

export const sanitizeAiContent = (
  fallback: AiGeneratedContent,
  llm?: Partial<AiGeneratedContent>
): AiGeneratedContent => {

  if (!llm) {
    return fallback;
  }

  return {
    ...fallback,
    ...llm,

    services:
      llm.services?.length
        ? llm.services
        : fallback.services,

    features:
      llm.features?.length
        ? llm.features
        : fallback.features,

    faqs:
      llm.faqs?.length
        ? llm.faqs
        : fallback.faqs,

    testimonials:
      llm.testimonials?.length
        ? llm.testimonials
        : fallback.testimonials,

    stats:
      llm.stats?.length
        ? llm.stats
        : fallback.stats
  };
};