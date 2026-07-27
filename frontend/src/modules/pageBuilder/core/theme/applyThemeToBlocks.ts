import type {
  Block
} from "../../types/page.types";

type ThemeTokens = Record<string, any>;

const PAINT_KEYS = [
  "background",
  "backgroundColor",
  "color"
] as const;

const TYPOGRAPHY_KEYS = [
  "fontFamily",
  "color"
] as const;

const isResponsiveStyle = (
  style: Record<string, any>
) =>
  "desktop" in style ||
  "tablet" in style ||
  "mobile" in style;

const replaceStyleProperties = (
  input: Record<string, any> = {},
  keys: readonly string[],
  replacements: Record<string, any>
) => {
  const style = structuredClone(input || {});

  if (!isResponsiveStyle(style)) {
    keys.forEach((key) => delete style[key]);
    return {
      ...style,
      ...replacements
    };
  }

  (["desktop", "tablet", "mobile"] as const).forEach(
    (breakpoint) => {
      const breakpointStyle = {
        ...(style[breakpoint] || {})
      };

      keys.forEach(
        (key) => delete breakpointStyle[key]
      );

      style[breakpoint] = breakpointStyle;
    }
  );

  style.desktop = {
    ...(style.desktop || {}),
    ...replacements
  };

  return style;
};

const getDesktopPaint = (
  style: Record<string, any> = {}
) => {
  const source = isResponsiveStyle(style)
    ? style.desktop || {}
    : style;

  return source.backgroundColor ?? source.background;
};

const parseColor = (
  value: unknown
): [number, number, number] | null => {
  if (typeof value !== "string") {
    return null;
  }

  const color = value.trim().toLowerCase();

  if (color === "white") {
    return [255, 255, 255];
  }

  const shortHex = color.match(/^#([0-9a-f]{3})$/i);
  if (shortHex) {
    return shortHex[1]
      .split("")
      .map((part) => parseInt(part + part, 16)) as [number, number, number];
  }

  const hex = color.match(/^#([0-9a-f]{6})(?:[0-9a-f]{2})?$/i);
  if (hex) {
    return [
      parseInt(hex[1].slice(0, 2), 16),
      parseInt(hex[1].slice(2, 4), 16),
      parseInt(hex[1].slice(4, 6), 16)
    ];
  }

  const rgb = color.match(
    /^rgba?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)/
  );

  return rgb
    ? [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])]
    : null;
};

const isLightColor = (
  value: unknown
) => {
  const rgb = parseColor(value);
  if (!rgb) {
    return false;
  }

  const [red, green, blue] = rgb.map(
    (channel) => channel / 255
  );

  return (
    0.2126 * red +
    0.7152 * green +
    0.0722 * blue
  ) >= 0.72;
};

const hasVisualProfile = (
  block: Block
) =>
  !!(
    (block.meta as any)?.visualProfile ||
    (block.data as any)?.meta?.visualProfile
  );

const transformBlock = (
  block: Block,
  tokens: ThemeTokens
): Block => {
  const next = structuredClone(block);
  const type = String(next.type).toLowerCase();
  const style = next.data?.style || {};
  const fontFamily = tokens?.typography?.fontFamily;
  const textColor = tokens?.colors?.text;
  const titleColor =
    tokens?.colors?.brand?.secondary ||
    textColor;
  const surface =
    tokens?.colors?.background?.surface ||
    tokens?.colors?.surface;
  const pageBackground =
    tokens?.colors?.background?.default ||
    tokens?.colors?.muted;

  next.data = {
    ...(next.data || { props: {}, style: {} }),
    props: {
      ...(next.data?.props || {})
    },
    style
  };

  if (type === "button") {
    next.data.props.useTheme = true;
    next.data.style = replaceStyleProperties(
      style,
      PAINT_KEYS,
      {
        backgroundColor: "var(--rb-color-primary)",
        color: "var(--rb-color-on-primary)"
      }
    );
  } else if (type === "title") {
    next.data.style = replaceStyleProperties(
      style,
      TYPOGRAPHY_KEYS,
      {
        ...(fontFamily ? { fontFamily } : {}),
        ...(titleColor ? { color: titleColor } : {})
      }
    );
  } else if (type === "text") {
    next.data.style = replaceStyleProperties(
      style,
      TYPOGRAPHY_KEYS,
      {
        ...(fontFamily ? { fontFamily } : {}),
        ...(textColor ? { color: textColor } : {})
      }
    );
  } else if (!hasVisualProfile(next)) {
    const currentPaint = getDesktopPaint(style);
    const isRoot = type === "root";
    const isSection = type === "section";
    const isLayoutContainer =
      type === "flex" ||
      type === "grid" ||
      type === "griditem";

    const replacement = isRoot
      ? pageBackground
      : surface;

    const shouldApplyBackground =
      !!replacement &&
      (
        isRoot ||
        (isSection && !currentPaint) ||
        ((isSection || isLayoutContainer) && isLightColor(currentPaint))
      );

    if (shouldApplyBackground) {
      next.data.style = replaceStyleProperties(
        style,
        ["background", "backgroundColor"],
        { backgroundColor: replacement }
      );
    }
  }

  next.children = (next.children || []).map(
    (child) => transformBlock(child, tokens)
  );

  return next;
};

export const applyThemeToBlocks = (
  blocks: Block[],
  tokens: ThemeTokens
): Block[] =>
  (blocks || []).map(
    (block) => transformBlock(block, tokens || {})
  );
