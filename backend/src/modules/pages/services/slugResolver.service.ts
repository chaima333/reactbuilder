
import { Page } from "../../../models";
import PageSlug from "../../../models/pageSlug";

export class SlugResolver {
 static async resolve(siteId: number, slug: string, depth = 0) {

  if (depth > 3) {
    return { type: "not_found" }; // 🛑 anti-loop
  }

  if (!slug) {
    return { type: "not_found" };
  }

  const history = await PageSlug.findOne({
    where: { siteId, slug }
  });

  if (history) {
    const current = await Page.findByPk(history.pageId);

    if (current && current.status === "published") {

      if (current.slug === slug) {
        return { type: "page", data: current }; // 🛑 stop loop
      }

      return {
        type: "redirect",
        to: current.slug
      };
    }
  }

  const page = await Page.findOne({
    where: { siteId, slug, status: "published" }
  });

  if (page) {
    return { type: "page", data: page };
  }

  return { type: "not_found" };
}
}