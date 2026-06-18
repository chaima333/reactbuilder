export const generateSeo = (
  category: string,
  pageTitle: string,
  heroImage?: string
) => ({
  metaTitle:
    `${pageTitle} | ${category}`,

  metaDescription:
    `Professional ${category.toLowerCase()} platform. ${pageTitle}.`,

  metaKeywords:
    `${category.toLowerCase()}, ${pageTitle.toLowerCase()}, website, business`,

  ogTitle:
    `${pageTitle} | ${category}`,

  ogDescription:
    `Professional ${category.toLowerCase()} platform.`,

  ogImage:
    heroImage || "",

  twitterTitle:
    `${pageTitle} | ${category}`,

  twitterDescription:
    `Professional ${category.toLowerCase()} platform.`,

  twitterImage:
    heroImage || ""
});