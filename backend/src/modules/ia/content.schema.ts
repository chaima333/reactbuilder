import { z } from "zod";

const nonEmptyString =
  z.string().trim().min(1);

const shortString =
  nonEmptyString.max(180);

const stringList =
  z.array(shortString).min(1).max(12);

const faqSchema =
  z.object({
    question: shortString,
    answer: z.string().trim().min(1).max(500)
  }).passthrough();



export const AiGeneratedContentSchema =
  z.object({
    title: shortString.optional(),
    heroTitle: shortString.optional(),
    heroSubtitle: z.string().trim().max(500).optional(),
    heroText: z.string().trim().max(500).optional(),

    services: stringList.optional(),
    features: stringList.optional(),
    benefits: stringList.optional(),
stats: stringList.optional(),
faqs: z.array(faqSchema).max(8).optional(),
testimonials: stringList.optional(),

    ctaTitle: shortString.optional(),
    ctaText: z.string().trim().max(500).optional(),
    ctaLabel: shortString.optional()
  })
  .passthrough();