import { sanitizeExtractedStyles } from "./sanitizeExtractedStyles";

export interface ExtractedStyle {
  desktop: Record<string, any>;
  tablet: Record<string, any>;
  mobile: Record<string, any>;
}

const VISUAL_STYLE_KEYS = [
  "display",
  "flex",
  "flexBasis",
  "flexGrow",
  "flexShrink",
  "flexDirection",
  "justifyContent",
  "alignItems",
  "flexWrap",
  "gap",
  "rowGap",
  "columnGap",
  "gridTemplateColumns",
  "gridTemplateRows",
  "gridAutoRows",
  "width",
  "maxWidth",
  "minWidth",
  "height",
  "minHeight",
  "maxHeight",
  "padding",
  "paddingTop",
  "paddingBottom",
  "paddingLeft",
  "paddingRight",
  "margin",
  "marginTop",
  "marginBottom",
  "marginLeft",
  "marginRight",
  "background",
  "backgroundColor",
  "color",
  "border",
  "borderRadius",
  "boxShadow",
  "fontFamily",
  "fontSize",
  "fontWeight",
  "lineHeight",
  "letterSpacing",
  "textAlign",
  "textTransform",
  "cursor", 
  "backgroundImage",
  "boxSizing",
];

function rgbToHex(rgbStr: string): string {
  if (!rgbStr || !rgbStr.startsWith("rgb")) {
    return rgbStr;
  }

  if (rgbStr.includes("rgba") && rgbStr.includes(", 0)")) {
    return "";
  }

  const match = rgbStr.match(/\d+/g);

  if (!match || match.length < 3) {
    return rgbStr;
  }

  const r = parseInt(match[0]);
  const g = parseInt(match[1]);
  const b = parseInt(match[2]);

  return (
    "#" +
    ((1 << 24) + (r << 16) + (g << 8) + b)
      .toString(16)
      .slice(1)
  );
}

const pickStyles = (
  styles: Record<string, string | undefined>,
  keys: string[]
) =>
  Object.fromEntries(
    Object.entries(styles).filter(
      ([key, value]) =>
        keys.includes(key) &&
        typeof value === "string" &&
        value.trim() !== ""
    )
  ) as Record<string, string>;

export const extractStyleProps = (
  element: HTMLElement
): ExtractedStyle => {
  const inlineStyle =
    element.getAttribute("style") || "";

  const computed =
    (
      element.ownerDocument.defaultView || window
    ).getComputedStyle(element);

  const getInlineValue = (
    property: string
  ) => {
    const regex =
      new RegExp(`${property}\\s*:\\s*([^;]+)`);

    return (
      inlineStyle.match(regex)?.[1]
        ?.trim() || ""
    );
  };

  const styles: Record<string, string | undefined> = {
    display: computed.display,
    flex: getInlineValue("flex"),
    flexBasis: getInlineValue("flex-basis"),
    flexGrow: getInlineValue("flex-grow"),
    flexShrink: getInlineValue("flex-shrink"),
    flexDirection: computed.flexDirection,
    justifyContent: computed.justifyContent,
    alignItems: computed.alignItems,
    flexWrap: computed.flexWrap,
    gap: computed.gap,
    rowGap: computed.rowGap,
    columnGap: computed.columnGap,
    gridTemplateColumns: computed.gridTemplateColumns,
    gridTemplateRows: computed.gridTemplateRows,
    gridAutoRows: computed.gridAutoRows,
    width: computed.width,
    maxWidth: computed.maxWidth,
    minWidth: computed.minWidth,
    height: computed.height,
    minHeight: computed.minHeight,
    maxHeight: computed.maxHeight,
    padding: computed.padding,
    paddingTop: computed.paddingTop,
    paddingBottom: computed.paddingBottom,
    paddingLeft: computed.paddingLeft,
    paddingRight: computed.paddingRight,
    margin: computed.margin,
    marginTop: computed.marginTop,
    marginBottom: computed.marginBottom,
    marginLeft: computed.marginLeft,
    marginRight: computed.marginRight,
    background:
      computed.background.includes("var(--")
        ? undefined
        : computed.background,
    backgroundImage:
    computed.backgroundImage.includes("var(--")
    ? undefined
    : computed.backgroundImage,
    backgroundColor:
  computed.backgroundColor.includes("var(--")
    ? undefined
    : computed.backgroundColor,
    color: rgbToHex(computed.color),
    border: computed.border,
    borderRadius: computed.borderRadius,
    boxShadow: computed.boxShadow,
    fontFamily: computed.fontFamily,
    fontSize: computed.fontSize,
    fontWeight: computed.fontWeight,
    lineHeight: computed.lineHeight,
    letterSpacing: computed.letterSpacing,
    textAlign: computed.textAlign,
    textTransform: computed.textTransform,
    cursor: computed.cursor,
    boxSizing: computed.boxSizing,

  };

  if (computed.display !== "flex") {
    delete styles.flexDirection;
    delete styles.justifyContent;
    delete styles.alignItems;
    delete styles.flexWrap;
  }

  if (computed.display !== "grid") {
    delete styles.gridTemplateColumns;
    delete styles.gridTemplateRows;
    delete styles.gridAutoRows;
  }

  return {
  desktop: styles as Record<string, string>,
  tablet: {},
  mobile: {}
};
};

export const extractLayoutStyles = (
  element: HTMLElement
): ExtractedStyle => {
  const styles =
    extractStyleProps(element).desktop;
    return {
  desktop:
    sanitizeExtractedStyles(
      pickStyles(styles, VISUAL_STYLE_KEYS)
    ),
  tablet: {},
  mobile: {}
};
};

export const extractTypographyStyles = (
  element: HTMLElement
): ExtractedStyle => {
  const styles =
    extractStyleProps(element).desktop;

return {
  desktop:
    sanitizeExtractedStyles(
      pickStyles(styles, VISUAL_STYLE_KEYS)
    ),
  tablet: {},
  mobile: {}
};
};
