import { Page, PageSlug } from "../../../models";

export class PageEngine {

  static needsVersion(oldData: any, newData: any): boolean {
    return (
      newData.content !== oldData.content ||
      newData.blocks !== oldData.blocks ||
      newData.title !== oldData.title
    );
  }

  static isSlugChanged(oldSlug: string, newSlug?: string): boolean {
    return !!(newSlug && oldSlug !== newSlug);
  }

  // ✅ FIX 1: function اللي ناقصة
  static async validateSlugAvailability(
    siteId: number,
    slug: string,
    pageId?: number
  ) {
    const existingPage = await Page.findOne({
      where: { siteId, slug }
    });

    if (existingPage && existingPage.id !== pageId) {
      throw new Error("SLUG_ALREADY_TAKEN");
    }

    const existingHistory = await PageSlug.findOne({
      where: { siteId, slug }
    });

    if (existingHistory && existingHistory.pageId !== pageId) {
      throw new Error("SLUG_RESERVED_IN_HISTORY");
    }
  }
}