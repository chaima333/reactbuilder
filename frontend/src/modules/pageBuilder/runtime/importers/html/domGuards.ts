export const getElementClassName = (
  element: Element | null | undefined
): string => {
  if (!element) {
    return "";
  }

  const rawClassName =
    element.className;

  if (
    typeof rawClassName === "string"
  ) {
    return rawClassName;
  }

  return element.getAttribute("class") || "";
};

export const getElementClassNameLower = (
  element: Element | null | undefined
): string =>
  getElementClassName(element)
    .toLowerCase();

export const getClassTokens = (
  element: Element | null | undefined
): string[] =>
  getElementClassNameLower(element)
    .split(/\s+/)
    .filter(Boolean);

export const hasClassToken = (
  element: Element | null | undefined,
  token: string
): boolean =>
  getClassTokens(element).includes(
    token.toLowerCase()
  );

export const getTagNameLower = (
  element: Element
): string =>
  element.tagName.toLowerCase();

export const isHTMLElementLike = (
  element: Element | null | undefined
): element is HTMLElement =>
  !!element &&
  element.nodeType === 1 &&
  typeof (element as HTMLElement).tagName === "string";

export const getOwnerComputedStyle = (
  element: Element
): CSSStyleDeclaration =>
  (
    element.ownerDocument.defaultView || window
  ).getComputedStyle(
    element
  );

export const isSvgSubtree = (
  element: Element | null | undefined
): boolean => {
  if (!element) {
    return false;
  }

  return (
    element.namespaceURI ===
      "http://www.w3.org/2000/svg" ||
    getTagNameLower(element) === "svg" ||
    !!element.closest("svg")
  );
};

export const shouldSkipImportedElement = (
  element: Element | null | undefined
): boolean => {
  if (!element) {
    return true;
  }

  if (
    isSvgSubtree(element)
  ) {
    return true;
  }

  const decorativeTokens = [
    "mesh",
    "grid-lines",
    "gridlines",
    "grid-line",
    "decorative",
    "decoration"
  ];

  const hasDecorativeClass =
    getClassTokens(element).some(
      token =>
        decorativeTokens.includes(token)
    );

  if (
    hasDecorativeClass &&
    !(element.textContent || "").trim()
  ) {
    return true;
  }

  return [
    "head",
    "meta",
    "link",
    "style",
    "script",
    "noscript",
    "iframe"
  ].includes(
    getTagNameLower(element)
  );
};
