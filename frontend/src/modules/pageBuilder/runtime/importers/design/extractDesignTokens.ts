import type {
  Block
} from "../../../types/page.types";

export type ExtractedDesignTokens = {
  colors: {
    primary: string;
    accent: string;
    surface: string;
    text: string;
  };
  typography: {
    hero: string;
    heading: string;
    body: string;
    caption: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  radius: {
    sm: string;
    md: string;
    lg: string;
  };
  shadows: string[];
  maxContentWidths: string[];
};

type TextRole =
  | "heroTitle"
  | "sectionTitle"
  | "bodyText"
  | "caption"
  | "label";

type RankedValue = {
  value: string;
  count: number;
};

const isVisibleElement = (
  element: HTMLElement
) => {
  const style =
    (
      element.ownerDocument.defaultView || window
    ).getComputedStyle(
      element
    );

  return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    style.opacity !== "0"
  );
};

const normalizeRgb = (
  value: string
) => {
  if (
    !value ||
    value === "transparent" ||
    value.includes("rgba") &&
      value.includes(", 0)")
  ) {
    return "";
  }

  const match =
    value.match(/\d+/g);

  if (
    !match ||
    match.length < 3
  ) {
    return value;
  }

  const [r, g, b] =
    match.slice(0, 3)
      .map(Number);

  return `#${[
    r,
    g,
    b
  ]
    .map(channel =>
      channel
        .toString(16)
        .padStart(2, "0")
    )
    .join("")}`;
};

const addValue = (
  map: Map<string, number>,
  value: string
) => {
  if (!value) {
    return;
  }

  map.set(
    value,
    (map.get(value) || 0) + 1
  );
};

const ranked = (
  map: Map<string, number>
): RankedValue[] =>
  Array.from(map.entries())
    .map(([value, count]) => ({
      value,
      count
    }))
    .sort((a, b) =>
      b.count - a.count
    );

const uniqueSortedNumbers = (
  values: string[]
) =>
  Array.from(
    new Set(
      values
        .map(value =>
          parseFloat(value)
        )
        .filter(value =>
          Number.isFinite(value) &&
          value > 0
        )
    )
  ).sort((a, b) => a - b);

const closest = (
  values: number[],
  fallback: string,
  index: number
) => {
  if (!values.length) {
    return fallback;
  }

  return `${values[
    Math.min(
      index,
      values.length - 1
    )
  ]}px`;
};

export const extractDesignTokens = (
  root: HTMLElement
): ExtractedDesignTokens => {
  const colors =
    new Map<string, number>();

  const backgrounds =
    new Map<string, number>();

  const fontSizes: string[] = [];
  const spacings: string[] = [];
  const radii: string[] = [];
  const shadows =
    new Map<string, number>();
  const widths: string[] = [];

  const elements =
    Array.from(
      root.querySelectorAll("*")
    ).filter(
      (element): element is HTMLElement =>
        element.nodeType === 1 &&
        typeof (element as HTMLElement).tagName === "string" &&
        isVisibleElement(element as HTMLElement)
    );

  elements.forEach(element => {
    const style =
      (
        element.ownerDocument.defaultView || window
      ).getComputedStyle(
        element
      );

    addValue(
      colors,
      normalizeRgb(
        style.color
      )
    );

    addValue(
      backgrounds,
      normalizeRgb(
        style.backgroundColor
      )
    );

    fontSizes.push(
      style.fontSize
    );

    [
      style.paddingTop,
      style.paddingRight,
      style.paddingBottom,
      style.paddingLeft,
      style.marginTop,
      style.marginBottom,
      style.gap
    ].forEach(value =>
      spacings.push(value)
    );

    radii.push(
      style.borderRadius
    );

    if (
      style.boxShadow &&
      style.boxShadow !== "none"
    ) {
      addValue(
        shadows,
        style.boxShadow
      );
    }

    if (
      style.maxWidth &&
      style.maxWidth !== "none"
    ) {
      widths.push(
        style.maxWidth
      );
    }
  });

  const sortedFontSizes =
    uniqueSortedNumbers(fontSizes);

  const sortedSpacing =
    uniqueSortedNumbers(spacings);

  const sortedRadii =
    uniqueSortedNumbers(radii);

  const rankedText =
    ranked(colors);

  const rankedSurfaces =
    ranked(backgrounds);

  console.log(
    "EXTRACT_DESIGN_TOKENS_TRACE",
    {
      elementCount:
        elements.length,
      sortedFontSizes,
      sortedSpacing,
      sortedRadii,
      rankedText:
        rankedText.slice(0, 6),
      rankedSurfaces:
        rankedSurfaces.slice(0, 6),
      widths:
        Array.from(new Set(widths))
          .slice(0, 6)
    }
  );

  return {
    colors: {
      primary:
        rankedText[1]?.value ||
        rankedText[0]?.value ||
        "#0f172a",
      accent:
        rankedText[2]?.value ||
        rankedText[1]?.value ||
        "#2563eb",
      surface:
        rankedSurfaces[0]?.value ||
        "#ffffff",
      text:
        rankedText[0]?.value ||
        "#0f172a"
    },
    typography: {
     hero:
  `${Math.min(
    parseFloat(
      closest(
        sortedFontSizes,
        "64px",
        sortedFontSizes.length - 1
      )
    ),
    72
  )}px`,
     heading:
  `${Math.min(
    parseFloat(
      closest(
        sortedFontSizes,
        "40px",
        Math.max(
          sortedFontSizes.length - 2,
          0
        )
      )
    ),
    48
  )}px`,
      body:
        closest(
          sortedFontSizes,
          "16px",
          Math.floor(
            sortedFontSizes.length / 2
          )
        ),
      caption:
        closest(
          sortedFontSizes,
          "13px",
          0
        )
    },
    spacing: {
      xs:
        closest(sortedSpacing, "4px", 0),
      sm:
        closest(sortedSpacing, "8px", 1),
      md:
        closest(sortedSpacing, "16px", 2),
      lg:
        closest(sortedSpacing, "24px", 3),
      xl:
        closest(
          sortedSpacing,
          "48px",
          sortedSpacing.length - 1
        )
    },
    radius: {
      sm:
        closest(sortedRadii, "6px", 0),
      md:
        closest(sortedRadii, "12px", 1),
      lg:
        closest(
          sortedRadii,
          "20px",
          sortedRadii.length - 1
        )
    },
    shadows:
      ranked(shadows)
        .slice(0, 4)
        .map(item => item.value),
    maxContentWidths:
      Array.from(new Set(widths))
        .slice(0, 6)
  };
};

const tokenWithFallback = (
  token: string,
  fallback?: string
) =>
  fallback
    ? `var(${token}, ${fallback})`
    : `var(${token})`;

const inferTypographyRole = (
  block: Block,
  parentSemanticType?: string
): {
  semanticRole: TextRole;
  typographyToken: string;
} | null => {
  const style =
    block.data?.style?.desktop || {};

  const size =
    parseFloat(
      style.fontSize || "0"
    );

  const weight =
    parseFloat(
      style.fontWeight || "400"
    );

  if (
    block.type === "title" &&
    parentSemanticType === "HERO_SECTION"
  ) {
    return {
      semanticRole: "heroTitle",
      typographyToken: "display-xl"
    };
  }

  if (
    block.type === "title" ||
    size >= 32 ||
    weight >= 700
  ) {
    return {
      semanticRole: "sectionTitle",
      typographyToken: "heading-lg"
    };
  }

  if (
    size > 0 &&
    size <= 14
  ) {
    return {
      semanticRole: "caption",
      typographyToken: "caption"
    };
  }

  if (
    weight >= 600 &&
    size <= 18
  ) {
    return {
      semanticRole: "label",
      typographyToken: "label"
    };
  }

  if (
    block.type === "text"
  ) {
    return {
      semanticRole: "bodyText",
      typographyToken: "body-md"
    };
  }

  return null;
};

export const applyDesignTokensToBlocks = (
  blocks: Block[],
  tokens: ExtractedDesignTokens
): Block[] => {
  const visit = (
    block: Block,
    inheritedSemanticType?: string
  ): Block => {
    const semanticType =
      (block.meta as any)?.semanticType ||
      inheritedSemanticType;

    const next: Block = {
      ...block,
      data: {
        ...block.data,
        props: {
          ...(block.data?.props || {})
        },
        style: {
          ...(block.data?.style || {}),
          desktop: {
            ...(block.data?.style?.desktop || {})
          }
        }
      }
    };

    if (
      block.type === "section" &&
      semanticType
    ) {
      const style =
        next.data.style.desktop;

      if (
        semanticType === "HERO_SECTION"
      ) {
        style.paddingTop =
          tokenWithFallback(
            "--spacing-hero",
            style.paddingTop ||
              tokens.spacing.xl
          );
        style.paddingBottom =
          tokenWithFallback(
            "--spacing-hero",
            style.paddingBottom ||
              tokens.spacing.xl
          );
      }
    }
console.log(
  "BEFORE TOKEN",
  block.data?.props?.content,
  block.data?.style?.desktop
);
console.log(
  "AFTER TOKEN",
  next.data?.props?.content,
  next.data?.style?.desktop
);
    if (
      block.type === "title" ||
      block.type === "text"
    )
  {
  const inferred =
    inferTypographyRole(
      block,
      semanticType
    );

  if (inferred) {

    next.data.props = {
      ...next.data.props,
      semanticRole:
        inferred.semanticRole,
      typographyToken:
        inferred.typographyToken
    };

    // =====================================
    // HERO TITLE
    // =====================================

    if (
      inferred.typographyToken ===
        "display-xl" &&

      !next.data.style.desktop
        .fontSize
    ) {

      next.data.style.desktop.fontSize =
        tokenWithFallback(
          "--display-xl",
          tokens.typography.hero
        );
    }

    // =====================================
    // SECTION TITLE
    // =====================================

    if (
      inferred.typographyToken ===
        "heading-lg" &&

      !next.data.style.desktop
        .fontSize
    ) {

      next.data.style.desktop.fontSize =
        tokenWithFallback(
          "--heading-lg",
          tokens.typography.heading
        );
    }
  }
}

    next.children =
      (block.children || []).map(child =>
        visit(
          child,
          semanticType
        )
      );

    return next;
  };

  return blocks.map(block =>
    visit(block)
  );
};
