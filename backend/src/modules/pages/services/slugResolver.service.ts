import { Page } from "../../../models";
import PageSlug from "../../../models/pageSlug";

export class SlugResolver {
  static async resolve(siteId: number, slug: string) {

  // 1. current page
  const page = await Page.findOne({
    where: { siteId, slug, status: "published" }
  });

  if (page) {
    return { type: "page", data: page,canonical: page.slug };
  }

  // 2. history
  const history = await PageSlug.findOne({
    where: { siteId, slug }
  });

  if (!history) {
    return { type: "not_found" };
  }

  // 3. redirect target check (IMPORTANT)
  const target = await Page.findByPk(history.pageId);

  if (!target || target.status !== "published") {
    return { type: "not_found" };
  }

  return {
  type: "redirect",
  to: target.slug,
  reason: "slug_moved",
  trace: {
    inputSlug: slug,
    foundHistory: true,
    targetPageId: target.id,
    targetStatus: target.status
  }
};
}
}