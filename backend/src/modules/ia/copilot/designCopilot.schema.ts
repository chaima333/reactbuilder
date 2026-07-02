import { z } from "zod";

export const ImprovementActionSchema =
  z.enum([
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

export const DesignActionSchema =
  z.object({
    type: z.literal("IMPROVE_DESIGN"),
    improvement: ImprovementActionSchema,
    target: z.string().trim().min(1).max(100).optional(),
    payload: z.record(z.string(), z.unknown()).optional()
  }).strict();

export const DesignSuggestionSchema = z.object({
  id: z.string().trim().min(1).max(200),
  title: z.string().trim().min(1).max(300),
  description: z.string().max(1000).optional(),
  actions: z.array(DesignActionSchema).min(1).max(10)
}).strict();

export const ApplyDesignCopilotSchema =
  z.object({
    siteId: z
      .union([
        z.number(),
        z.string()
      ])
      .optional(),

    pageId: z
      .union([
        z.number(),
        z.string()
      ])
      .optional(),

    blocks: z
      .array(z.unknown())
      .min(1)
      .max(5000),

    suggestion:
      DesignSuggestionSchema.optional(),

    actions:
      z.array(DesignActionSchema)
        .min(1)
        .max(10)
        .optional()
  })
    .strict()
    .refine(
      value =>
        !!value.suggestion ||
        !!value.actions,
      {
        message:
          "A suggestion or actions are required"
      }
    );
