const RESERVED_SYSTEM_PAGE_SLUGS =
  new Set([
    "login",
    "register"
  ]);

export const makeSafeImportedPageSlug = (
  rawSlug: string,
  usedSlugs: Set<string>
) => {
  const baseSlug =
    RESERVED_SYSTEM_PAGE_SLUGS.has(rawSlug)
      ? `${rawSlug}-imported`
      : rawSlug;

  let slug = baseSlug;
  let suffix = 2;

  while (usedSlugs.has(slug)) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  usedSlugs.add(slug);

  return slug;
};
