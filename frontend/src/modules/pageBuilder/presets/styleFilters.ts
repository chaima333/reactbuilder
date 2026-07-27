const desktopOf = (
  style: any
) =>
  style?.desktop || style || {};

const pxNumber = (
  value: unknown
) => {
  if (typeof value !== "string") {
    return null;
  }

  const parsed =
    parseFloat(value);

  return Number.isFinite(parsed)
    ? parsed
    : null;
};

const clampPx = (
  value: unknown,
  max: number
) => {
  const parsed =
    pxNumber(value);

  if (parsed === null) {
    return value;
  }

  return `${Math.min(parsed, max)}px`;
};

const pick = (
  source: Record<string, any>,
  keys: string[]
) =>
  Object.fromEntries(
    keys
      .filter(key =>
        source[key] !== undefined &&
        source[key] !== ""
      )
      .map(key => [
        key,
        source[key]
      ])
  );

const normalizeCssValue = (
  value: unknown
) =>
  String(value || "")
    .replace(/\s+/g, "")
    .toLowerCase();

const isZeroPx = (
  value: unknown
) =>
  normalizeCssValue(value) === "0px" ||
  normalizeCssValue(value) === "0" ||
  normalizeCssValue(value) === "0px0px" ||
  normalizeCssValue(value) === "0px0px0px0px";

const isTransparentBackground = (
  value: unknown
) => {
  const normalized =
    normalizeCssValue(value);

  return [
    "transparent",
    "rgba(0,0,0,0)",
    "rgb(0,0,0,0)",
    "initial",
    "inherit",
    "unset",
    "none",
    ""
  ].includes(normalized);
};

const isNoOpBorder = (
  value: unknown
) => {
  const normalized =
    normalizeCssValue(value);

  return (
    normalized === "0pxnone" ||
    normalized === "0pxnonecurrentcolor" ||
    normalized.startsWith("0pxnone") ||
    normalized === "none" ||
    normalized === "0"
  );
};

const dropNoOpVisualValues = (
  style: Record<string, any>
) => {
  const result = {
    ...style
  };

  [
    "padding",
    "paddingTop",
    "paddingRight",
    "paddingBottom",
    "paddingLeft",
    "borderRadius"
  ].forEach(key => {
    if (isZeroPx(result[key])) {
      delete result[key];
    }
  });

  [
    "gap",
    "rowGap",
    "columnGap"
  ].forEach(key => {
    if (
      normalizeCssValue(result[key]) ===
      "normal"
    ) {
      delete result[key];
    }
  });

  if (isNoOpBorder(result.border)) {
    delete result.border;
  }

  if (
    isTransparentBackground(
      result.background
    )
  ) {
    delete result.background;
  }

  if (
    isTransparentBackground(
      result.backgroundColor
    )
  ) {
    delete result.backgroundColor;
  }

  if (
    normalizeCssValue(result.fontFamily)
      .includes("timesnewroman")
  ) {
    delete result.fontFamily;
  }

  if (
    normalizeCssValue(result.display) ===
    "block"
  ) {
    delete result.display;
  }

  return result;
};

const filterReasonableMaxWidth = (
  value: unknown
) => {
  const parsed =
    pxNumber(value);

  if (
    parsed !== null &&
    parsed > 1200
  ) {
    return undefined;
  }

  return value;
};

export const mergePresetDesktopStyle = (
  fallback: Record<string, any>,
  extracted: any,
  filter: (
    desktop: Record<string, any>
  ) => Record<string, any>
) => ({
  desktop: {
    ...fallback,
    ...filter(
      desktopOf(extracted)
    )
  },
  tablet: {},
  mobile: {}
});

export const applySectionTitleScale = (
  style: any,
  extracted: any,
  _semanticType: string
) => {
  const desktop =
    style?.desktop || {};

  const source =
    desktopOf(
      extracted
    );

  const originalFontSize =
    source.fontSize;

  const originalPx =
    pxNumber(
      originalFontSize
    );

  const emittedBefore =
    desktop.fontSize;

  const emittedBeforePx =
    pxNumber(
      emittedBefore
    );

  const shouldApply =
    originalPx !== null &&
    (
      emittedBeforePx === null ||
      originalPx > emittedBeforePx
    );

  const emittedAfter =
    shouldApply
      ? `${Math.min(
          originalPx,
          96
        )}px`
      : emittedBefore;

  if (
    !shouldApply
  ) {
    return style;
  }

  return {
    ...style,
    desktop: {
      ...desktop,
      fontSize:
        emittedAfter,
      lineHeight:
        source.lineHeight ||
        desktop.lineHeight,
      fontWeight:
        source.fontWeight ||
        desktop.fontWeight
    }
  };
};

export const filterSectionStyle = (
  style: Record<string, any>,
  options?: {
    maxVerticalPadding?: number;
  }
) => {
  const result =
    pick(
      style,
      [
        "background",
        "backgroundColor",
        "backgroundImage",
        "backgroundSize",
        "backgroundPosition",
        "backgroundRepeat",
        "color",
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
        "textAlign",
        "border",
        "borderRadius",
        "boxShadow"
      ]
    );

  const maxVerticalPadding =
    options?.maxVerticalPadding;

  if (maxVerticalPadding) {
    if (result.paddingTop) {
      result.paddingTop =
        clampPx(
          result.paddingTop,
          maxVerticalPadding
        );
    }

    if (result.paddingBottom) {
      result.paddingBottom =
        clampPx(
          result.paddingBottom,
          maxVerticalPadding
        );
    }

    if (result.padding) {
      result.padding =
        String(result.padding)
          .split(" ")
          .map((part, index) =>
            index === 0 || index === 2
              ? clampPx(
                  part,
                  maxVerticalPadding
                )
              : part
          )
          .join(" ");
    }
  }

  return result;
};

export const filterHeroSectionStyle = (
  style: Record<string, any>
) =>
  filterSectionStyle(
    style,
    {
      maxVerticalPadding: 160
    }
  );

export const filterGridStyle = (
  style: Record<string, any>
) => {
  const result =
    pick(
      style,
      [
        "display",
        "gridTemplateColumns",
        "gap",
        "rowGap",
        "columnGap"
      ]
    );

  if (
    result.display &&
    result.display !== "grid"
  ) {
    delete result.display;
  }

  return result;
};

export const filterCardStyle = (
  style: Record<string, any>
) =>
  dropNoOpVisualValues(
    pick(
      style,
      [
        "background",
        "backgroundColor",
        "backgroundImage",
        "backgroundSize",
        "backgroundPosition",
        "backgroundRepeat",
        "color",
        "padding",
        "paddingTop",
        "paddingBottom",
        "paddingLeft",
        "paddingRight",
        "border",
        "borderRadius",
        "boxShadow",
        "display",
        "flexDirection",
        "gap",
        "rowGap",
        "columnGap"
      ]
    )
  );

export const filterTextStyle = (
  style: Record<string, any>
) => {
  const result =
    pick(
      style,
      [
        "fontSize",
        "fontWeight",
        "lineHeight",
        "letterSpacing",
        "textAlign",
        "color",
        "textTransform",
        "maxWidth"
      ]
    );

  const maxWidth =
    filterReasonableMaxWidth(
      result.maxWidth
    );

  if (maxWidth === undefined) {
    delete result.maxWidth;
  } else {
    result.maxWidth = maxWidth;
  }

  return result;
};
