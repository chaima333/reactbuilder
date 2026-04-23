import { Page } from "../../../models";
import PageSlug from "../../../models/pageSlug";
import { SlugMap } from "../../../models/slug_map";

export class SlugService {

  static async ensureAvailable(siteId: number, slug: string, pageId?: number) {
    const page = await Page.findOne({ where: { siteId, slug } });

    if (page && page.id !== pageId) {
      throw new Error("SLUG_TAKEN");
    }

    const history = await PageSlug.findOne({ where: { siteId, slug } });

    if (history && history.pageId !== pageId) {
      throw new Error("SLUG_RESERVED");
    }
  }

  static async archive(pageId, siteId, slug, transaction?) {

  const existing = await PageSlug.findOne({
    where: { siteId, slug }
  });

  if (existing) return; // 

  return PageSlug.create(
    { pageId, siteId, slug },
    { transaction }
  );
}

  static async isSlugTaken(siteId: number, slug: string) {
    const page = await Page.findOne({ where: { siteId, slug } });
    if (page) return true;

    const history = await PageSlug.findOne({ where: { siteId, slug } });
    return !!history;
  }


  static async changeSlug(siteId: number, pageId: number, newSlug: string) {

    const page = await Page.findByPk(pageId);
    if (!page) throw new Error("PAGE_NOT_FOUND");

    const oldSlug = page.slug;

    // deactivate old
    await SlugMap.update(
      { isActive: false },
      { where: { siteId, slug: oldSlug } }
    );

    // add redirect
    await SlugMap.create({
      siteId,
      slug: oldSlug,
      pageId,
      type: "redirect",
      isActive: false
    });

    // add new active slug
    await SlugMap.create({
      siteId,
      slug: newSlug,
      pageId,
      type: "page",
      isActive: true
    });

    // update page
    await page.update({ slug: newSlug });
  }

}