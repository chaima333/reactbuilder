export const PAGE_EVENTS = {
  UPDATED: "page.updated",
  RESTORED: "page.restored",
  VERSION_CREATE: "page.version.create",
  SLUG_CHANGED: "slug.changed",
  CREATED: "page.created",
  PUBLISHED: "page.published",
  DELETED: "page.deleted",
} as const;


import { z } from "zod";

export const PageUpdatedSchema = z.object({
  current: z.any(),
  previous: z.any().optional(),

  context: z.object({
    eventId: z.string(),
    timestamp: z.number(),
    action: z.enum([
      "update",
      "restore",
      "publish",
      "delete",
      "create",
      "slug_change"
    ]),
    userId: z.number(),
    siteId: z.number(),
  }),

  changes: z.array(z.string()).optional(),

  flags: z.object({
    shouldVersion: z.boolean(),
    shouldSEO: z.boolean(),
  }).optional(),
});

export type PageUpdatedPayload = z.infer<typeof PageUpdatedSchema>;