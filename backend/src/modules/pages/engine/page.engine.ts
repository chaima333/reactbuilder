export class PageEngine {

  static shouldCreateVersion(oldP: any, newP: any) {
    return (
      oldP.title !== newP.title ||
      oldP.content !== newP.content ||
      JSON.stringify(oldP.blocks) !== JSON.stringify(newP.blocks)
    );
  }

  static isSlugChanged(oldSlug: string, newSlug?: string) {
    return Boolean(newSlug && oldSlug !== newSlug);
  }

  static resolveActions(oldP: any, newP: any) {
    return {
      version: this.shouldCreateVersion(oldP, newP),
      slug: this.isSlugChanged(oldP.slug, newP.slug),
    };
  }
}