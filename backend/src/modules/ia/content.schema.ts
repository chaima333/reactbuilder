import { z } from "zod";

const nonEmptyString =
  z.string().trim().min(1);

const shortString =
  nonEmptyString.max(180);

const longString =
  z.string().trim().min(1).max(700);

const stringList =
  z.array(shortString).min(1).max(12);

const faqItemSchema =
  z.union([
    longString,
    z.object({
      question: shortString.optional(),
      answer: longString.optional()
    }).passthrough()
  ]);

const testimonialItemSchema =
  z.union([
    longString,
    z.object({
      name: shortString.optional(),
      role: shortString.optional(),
      quote: longString.optional()
    }).passthrough()
  ]);

const statItemSchema =
  z.union([
    shortString,
    z.object({
      value: shortString.optional(),
      label: shortString.optional(),
      title: shortString.optional(),
      description: longString.optional()
    }).passthrough()
  ]);

export const AiGeneratedContentSchema =
  z.object({
    title: shortString.optional(),

    heroTitle: shortString.optional(),
    heroSubtitle: longString.optional(),
    heroText: longString.optional(),

    services: stringList.optional(),
    features: stringList.optional(),
    benefits: stringList.optional(),

    stats: z.array(statItemSchema).max(8).optional(),
    faqs: z.array(faqItemSchema).max(8).optional(),
    testimonials: z.array(testimonialItemSchema).max(8).optional(),

    ctaTitle: shortString.optional(),
    ctaText: longString.optional(),
    ctaLabel: shortString.optional()
  })
  .passthrough();