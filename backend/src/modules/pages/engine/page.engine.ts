import { Page, PageSlug } from "../../../models";

export class PageEngine {
    
  static needsVersion(oldData: any, newData: any): boolean {
    return (
      newData.content !== oldData.content ||
      newData.blocks !== oldData.blocks ||
      newData.title !== oldData.title
    );
  }

static isSlugChanged(oldSlug: string, newSlug: string): boolean {
    return !!(newSlug && oldSlug !== newSlug);
  }


static async validateSlugAvailability(siteId: number, slug: string, pageId?: number) {
  // 1. ثبت في جدول الـ pages
  const { Page } = require("../../models"); // استدعاء الموديل
  const existingPage = await Page.findOne({ where: { siteId, slug } });

  // لو السلوغ محجوز لصفحة أخرى (موش صفتنا)
  if (existingPage && existingPage.id !== pageId) {
    throw new Error("SLUG_ALREADY_TAKEN");
  }

  // 2. ثبت في تاريخ السلوغات القديمة
  const { PageSlug } = require("../../models"); 
  const existingHistory = await PageSlug.findOne({ where: { siteId, slug } });

  if (existingHistory && existingHistory.pageId !== pageId) {
    throw new Error("SLUG_RESERVED_IN_HISTORY");
  }
}
}
