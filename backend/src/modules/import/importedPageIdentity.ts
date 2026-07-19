const RESERVED_SYSTEM_PAGE_SLUGS =
  new Set([
    "login",
    "register"
  ]);

export const normalizeImportedPageSlug = (
  rawSlug: string
) => {
  const normalized =
    String(rawSlug || "")
      .normalize("NFKD")
      .replace(
        /[\u0300-\u036f]/g,
        ""
      )
      .trim()
      .toLowerCase()
      .replace(
        /[^a-z0-9]+/g,
        "-"
      )
      .replace(
        /^-+|-+$/g,
        ""
      );

  return normalized || "page";
};

export const makeSafeImportedPageSlug = (
  rawSlug: string,
  usedSlugs: Set<string>
) => {
  const normalizedSlug =
    normalizeImportedPageSlug(
      rawSlug
    );

  const baseSlug =
    RESERVED_SYSTEM_PAGE_SLUGS.has(
      normalizedSlug
    )
      ? `${normalizedSlug}-imported`
      : normalizedSlug;

  let slug =
    baseSlug;

  let suffix =
    2;

  while (
    usedSlugs.has(slug)
  ) {
    slug =
      `${baseSlug}-${suffix}`;

    suffix +=
      1;
  }

  usedSlugs.add(
    slug
  );

  return slug;
};