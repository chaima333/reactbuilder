import { extractComputedStyles } from "../css/extractComputedStyles";

export const withDesktopFallback = (
  style: Record<string, any> = {},
  desktopFallback: Record<string, any>
) => ({
  ...style,
  desktop: {
    ...desktopFallback,
    ...(style.desktop || {})
  },
  tablet: {
    ...(style.tablet || {})
  },
  mobile: {
    ...(style.mobile || {})
  }
});

export const sanitizeSectionLayoutStyle = (
  id: string,
  style: Record<string, any> = {}
) => {
  const nextStyle = {
    ...style,
    desktop: {
      ...(style.desktop || {})
    },
    tablet: {
      ...(style.tablet || {})
    },
    mobile: {
      ...(style.mobile || {})
    }
  };

  delete nextStyle.desktop.height;
  delete nextStyle.desktop.maxHeight;
  delete nextStyle.desktop.minHeight;

  delete nextStyle.desktop.paddingTop;
  delete nextStyle.desktop.paddingBottom;

  return nextStyle;
};

export const normalizeDiagnosticText = (value = "") =>
  value.replace(/\s+/g, " ").trim();

export const normalizeTextForCoverage = (value = "") =>
  normalizeDiagnosticText(value).toLowerCase();

export const parseCssNumericValue = (value?: string | number | null) => {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value !== "string") {
    return 0;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return 0;
  }

  const parsed = Number.parseFloat(trimmed);

  return Number.isNaN(parsed) ? 0 : parsed;
};

export const splitGridTrackList = (value: string) =>
  value.split(/\s+/).filter(Boolean);

export const makeGridTracksShrinkSafe = (value: string) => {
  const tracks = splitGridTrackList(value);

  if (!tracks.length) {
    return "";
  }

  return tracks
    .map(track => {
      if (
        /^(minmax|repeat|fit-content|subgrid)\(/i.test(track) ||
        track === "auto"
      ) {
        return track;
      }

      return `minmax(0, ${track})`;
    })
    .join(" ");
};

const normalizeCssPaint = (value?: string) =>
  (value || "").replace(/\s+/g, "").toLowerCase();

const isTransparentColor = (value?: string) => {
  const normalized = normalizeCssPaint(value);

  if (
    normalized.includes("url(") ||
    normalized.includes("gradient(")
  ) {
    return false;
  }

  return (
    !normalized ||
    normalized === "transparent" ||
    normalized === "none" ||
    normalized === "rgba(0,0,0,0)" ||
    normalized === "rgb(0,0,0,0)"
  );
};

export const hasRealPaint = (styles: ReturnType<typeof extractComputedStyles>) => {
  const background = styles.background || "";
  const backgroundColor = styles.backgroundColor || "";

  return (
    !isTransparentColor(backgroundColor) ||
    (!isTransparentColor(background) &&
      (background.includes("rgb") ||
        background.includes("#") ||
        background.includes("gradient") ||
        background.includes("url(")))
  );
};

const findNearestPaintSource = (start: HTMLElement | null) => {
  let current = start;

  while (current && current.tagName.toLowerCase() !== "html") {
    const styles = extractComputedStyles(current);

    if (hasRealPaint(styles)) {
      return styles;
    }

    current = current.parentElement;
  }

  return null;
};

export const resolvePaintSource = (
  element: HTMLElement,
  computed: ReturnType<typeof extractComputedStyles>
) =>
  hasRealPaint(computed)
    ? computed
    : findNearestPaintSource(element.parentElement);

export const getPreservedWrapperDesktopStyle = (
  computed: ReturnType<typeof extractComputedStyles>,
  layoutDesktop: Record<string, any> = {},
  element?: HTMLElement
) => {
  const paintSource = element
    ? resolvePaintSource(element, computed)
    : hasRealPaint(computed)
      ? computed
      : null;

  return {
    ...layoutDesktop,

    background: paintSource?.background || layoutDesktop.background,

    backgroundColor:
      paintSource?.backgroundColor || layoutDesktop.backgroundColor,

    backgroundImage:
      paintSource?.backgroundImage || layoutDesktop.backgroundImage,

    backgroundSize:
      paintSource?.backgroundSize || layoutDesktop.backgroundSize,

    backgroundPosition:
      paintSource?.backgroundPosition || layoutDesktop.backgroundPosition,

    backgroundRepeat:
      paintSource?.backgroundRepeat || layoutDesktop.backgroundRepeat,

    border: computed.border || layoutDesktop.border,
    borderRadius: computed.borderRadius || layoutDesktop.borderRadius,
    color: computed.color || layoutDesktop.color,
    padding: computed.padding || layoutDesktop.padding,
    gap: computed.gap || layoutDesktop.gap,
    alignItems: computed.alignItems || layoutDesktop.alignItems,
    boxShadow: computed.boxShadow || layoutDesktop.boxShadow,
    width: computed.width || layoutDesktop.width,
    maxWidth:
      computed.maxWidth && computed.maxWidth !== "none"
        ? computed.maxWidth
        : layoutDesktop.maxWidth
  };
};
