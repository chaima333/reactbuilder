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