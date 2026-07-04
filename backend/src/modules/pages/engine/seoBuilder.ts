export class SEOBuilder {
  static build(page: any) {
    const seo = page?.seo || {};

    const title =
      seo.metaTitle ||
      page?.title ||
      "Untitled page";

    const description =
      seo.metaDescription ||
      "";

   const canonical =
  seo.canonicalUrl ||
  "";

    const robots =
      seo.metaRobots ||
      "index,follow";

    const ogTitle =
      seo.ogTitle ||
      title;

    const ogDescription =
      seo.ogDescription ||
      description;

    const ogImage =
      seo.ogImage ||
      null;

    const twitterTitle =
      seo.twitterTitle ||
      ogTitle;

    const twitterDescription =
      seo.twitterDescription ||
      ogDescription;

    const twitterImage =
      seo.twitterImage ||
      ogImage;

    return {
      title,
      description,
      canonical,
      robots,

      openGraph: {
        title: ogTitle,
        description: ogDescription,
        image: ogImage,
        type: seo.ogType || "website",
      },

      twitter: {
        card: seo.twitterCard || "summary_large_image",
        title: twitterTitle,
        description: twitterDescription,
        image: twitterImage,
      },
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
    return Boolean(
      newSlug &&
      oldSlug !== newSlug
    );
  }

  static resolveActions(oldP: any, newP: any) {
    return {
      version: this.shouldCreateVersion(
        oldP,
        newP
      ),
      slug: this.isSlugChanged(
        oldP.slug,
        newP.slug
      ),
    };
  }
}