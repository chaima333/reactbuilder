// mapper/page.mapper.ts

const normalizePage = (page: any) => {
  if (!page) {
    return null;
  }

  if (typeof page.toJSON === "function") {
    return page.toJSON();
  }

  return page;
};

const mapSeo = (seo: any) => {
  if (!seo) {
    return null;
  }

  return {
    id: seo.id,
    pageId: seo.pageId,
    siteId: seo.siteId,

    metaTitle: seo.metaTitle || "",
    metaDescription: seo.metaDescription || "",
    metaKeywords: seo.metaKeywords || "",
    metaRobots: seo.metaRobots || "index,follow",

    canonicalUrl: seo.canonicalUrl || "",

    ogTitle: seo.ogTitle || "",
    ogDescription: seo.ogDescription || "",
    ogImage: seo.ogImage || "",
    ogType: seo.ogType || "website",

    twitterCard: seo.twitterCard || "summary_large_image",
    twitterTitle: seo.twitterTitle || "",
    twitterDescription: seo.twitterDescription || "",
    twitterImage: seo.twitterImage || "",
  };
};

export const PageMapper = {
  toDTO: (page: any) => {
    const raw = normalizePage(page);

    if (!raw) {
      return null;
    }

    return {
      id: raw.id,
      title: raw.title,
      slug: raw.slug,
      content: raw.content,
      blocks: raw.blocks,
      status: raw.status,
      siteId: raw.siteId,
      userId: raw.userId,
      isHomepage: raw.isHomepage,
      publishedAt: raw.publishedAt,
      metaData: raw.metaData,
      views: raw.views,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      theme: raw.theme || null,
      seo: mapSeo(raw.seo),
    };
  },

  toListDTO: (pages: any[]) =>
    pages.map((p) => PageMapper.toDTO(p)),
};