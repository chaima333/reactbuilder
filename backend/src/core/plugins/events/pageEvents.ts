export const PAGE_EVENTS = {
  UPDATED: "page.updated",
  RESTORED: "page.restored", // 👈 هذي تفرق في الـ Logic
  VERSION_CREATE: "page.version.create",
  SLUG_CHANGED: "slug.changed",
  CREATED: 'page.created',
  PUBLISHED: 'page.published',
  DELETED: 'page.deleted',
};

import { z } from "zod";

export const PageUpdatedSchema = z.object({
  page: z.any(), 
  oldPage: z.any(),
  shouldVersion: z.boolean().default(false),
  userId: z.number().int().positive(),
  siteId: z.number().int().positive(),
});

export type PageUpdatedPayload = z.infer<typeof PageUpdatedSchema>;