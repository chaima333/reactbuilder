import { Page } from "../../../models";
import PageSlug from "../../../models/pageSlug";

type ResolveResult =
  | { type: "page"; data: any }
  | { type: "redirect"; to: string }
  | { type: "not_found" };

export class SlugResolver {

  static async resolve(siteId: number, slug: string): Promise<ResolveResult> {

    // 1. حاول نلقى الصفحة الحالية
    const page = await Page.findOne({
      where: { siteId, slug, status: "published" }
    });

    if (page) {
      return { type: "page", data: page };
    }

    // 2. نشوف history
    const history = await PageSlug.findOne({
      where: { siteId, slug }
    });

    if (history) {
      const current = await Page.findByPk(history.pageId);

      // ⚠️ حماية: نتأكد موش redirect لنفس slug
      if (current && current.status === "published" && current.slug !== slug) {
        return {
          type: "redirect",
          to: current.slug
        };
      }
    }

    return { type: "not_found" };
  }
}