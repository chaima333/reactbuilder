
export class SEOBuilder {

  static build(page: any) {
    return {
      title: page.meta_title || page.title,
      description: page.meta_description || "",
      keywords: page.meta_keywords || [],
      canonical: `/pages/${page.slug}`,

      openGraph: {
        title: page.title,
        description: page.meta_description || "",
        image: page.featured_image || null,
        type: "article"
      }
    };
  }
}
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