import { Page } from "../../../models";
import PageSlug from "../../../models/pageSlug";
import { SlugResolveResult } from "../types/page.types";

export class SlugResolver {

static async resolve(siteId: number, slug: string): Promise<SlugResolveResult> {

  if (!slug) {
    return {
      type: "not_found",
      reason: "missing_slug"
    };
  }

  const page = await Page.findOne({
    where: { siteId, slug, status: "published" }
  });

  if (page) {
    return {
      type: "page",
      data: page
    };
  }

  const history = await PageSlug.findOne({
    where: { siteId, slug }
  });

  if (history) {
    return {
      type: "redirect",
      to: "some-slug"
    };
  }

  return {
    type: "not_found",
    reason: "no_match"
  };
}
}