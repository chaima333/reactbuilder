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
    const actions = [];

    if (this.shouldCreateVersion(oldP, newP)) {
      actions.push("VERSION");
    }

    if (this.isSlugChanged(oldP.slug, newP.slug)) {
      actions.push("SLUG");
    }

    return actions;
  }
}