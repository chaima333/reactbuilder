import { Page, PageSlug } from "../../../models";

export class PageEngine {
  /*

  // ========================
  // CONTENT CHANGE DETECTION
  // ========================
  static needsVersion(oldData: any, newData: any): boolean {
    return (
      newData.content !== oldData.content ||
      JSON.stringify(newData.blocks) !== JSON.stringify(oldData.blocks) ||
      newData.title !== oldData.title
    );
  }

  // ========================
  // SLUG CHANGE DETECTION
  // ========================
  static isSlugChanged(oldSlug: string, newSlug?: string): boolean {
    return Boolean(newSlug && oldSlug !== newSlug);
  }

  // ========================
  // ENGINE EVENT: VERSION NEEDED
  // ========================
  static shouldCreateVersion(oldPage: any, newPage: any): boolean {
    return this.needsVersion(oldPage, newPage);
  }

  // ========================
  // ENGINE EVENT: SLUG CHANGE
  // ========================
  static handleSlugChange(oldSlug: string, newSlug: string | undefined) {
    if (!newSlug) return null;

    if (oldSlug === newSlug) return null;

    return {
      type: "slug_changed",
      from: oldSlug,
      to: newSlug
    };
  }/*/


  static needsVersion(oldP, newP) {
    return (
      oldP.title !== newP.title ||
      oldP.content !== newP.content ||
      JSON.stringify(oldP.blocks) !== JSON.stringify(newP.blocks)
    );
  }

  static slugChanged(oldSlug, newSlug) {
    return newSlug && oldSlug !== newSlug;
  }

}

    