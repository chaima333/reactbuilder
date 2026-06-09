import type {
  Block
} from "../../types/page.types";

const getDesktopStyle = (
  block: Block
) =>
  (block.data?.style?.desktop || {}) as Record<string, any>;

const parsePx = (
  value: unknown
) => {
  if (
    typeof value !== "string" ||
    value.includes("%") ||
    value.includes("calc") ||
    value.includes("var(")
  ) {
    return null;
  }

  const parsed =
    parseFloat(value);

  return Number.isFinite(parsed)
    ? parsed
    : null;
};

const isMissingOrTooSmall = (
  value: unknown,
  min: number
) => {
  const parsed =
    parsePx(value);

  return parsed === null || parsed < min;
};

const setIfMissing = (
  style: Record<string, any>,
  key: string,
  value: string
) => {
  if (
    style[key] === undefined ||
    style[key] === "" ||
    style[key] === "normal"
  ) {
    style[key] = value;
  }
};

const clearTinyWidthConstraint = (
  style: Record<string, any>,
  minWidth = 640
) => {
  const width =
    parsePx(style.width);

  const maxWidth =
    parsePx(style.maxWidth);

  if (
    width !== null &&
    width < minWidth
  ) {
    delete style.width;
  }

  if (
    maxWidth !== null &&
    maxWidth < minWidth
  ) {
    delete style.maxWidth;
  }
};

const semanticName = (
  block: Block
) =>
  String(
    (block.meta as any)?.semanticType || ""
  );

const isDarkColor = (
  value: unknown
) => {
  if (
    typeof value !== "string"
  ) {
    return false;
  }

  const normalized =
    value.trim().toLowerCase();

  const hex =
    normalized.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);

  if (hex) {
    const raw =
      hex[1].length === 3
        ? hex[1].split("").map(char => char + char).join("")
        : hex[1];

    const r = parseInt(raw.slice(0, 2), 16);
    const g = parseInt(raw.slice(2, 4), 16);
    const b = parseInt(raw.slice(4, 6), 16);

    return (
      0.2126 * r +
      0.7152 * g +
      0.0722 * b
    ) < 96;
  }

  const rgb =
    normalized.match(/rgba?\(([^)]+)\)/);

  if (rgb) {
    const [r, g, b] =
      rgb[1]
        .split(",")
        .map(part => parseFloat(part.trim()));

    if (
      [r, g, b].every(Number.isFinite)
    ) {
      return (
        0.2126 * r +
        0.7152 * g +
        0.0722 * b
      ) < 96;
    }
  }

  return (
    normalized.includes("rgba(6,") ||
    normalized.includes("rgb(6,") ||
    normalized.includes("linear-gradient") ||
    normalized.includes("#0") ||
    normalized.includes("#111") ||
    normalized.includes("#061")
  );
};

const isReadableOnDark = (
  value: unknown
) => {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    return false;
  }

  return !isDarkColor(value);
};

const hasDarkBackground = (
  style: Record<string, any>
) =>
  isDarkColor(
    style.backgroundColor
  ) ||
  isDarkColor(
    style.background
  );

const applySectionDefaults = (
  block: Block,
  style: Record<string, any>
) => {
  const semanticType =
    semanticName(block);

  if (
    block.type !== "section" ||
    !semanticType
  ) {
    return;
  }

  clearTinyWidthConstraint(
    style
  );

  setIfMissing(style, "width", "100%");
  setIfMissing(style, "maxWidth", "1180px");
  setIfMissing(style, "marginLeft", "auto");
  setIfMissing(style, "marginRight", "auto");

  if (
    semanticType === "HERO_SECTION"
  ) {
    setIfMissing(style, "padding", "96px 24px");
    setIfMissing(style, "minHeight", "520px");
    setIfMissing(style, "maxWidth", "1180px");
  }

  if (
    [
      "FEATURES",
      "FEATURE_PILLARS",
      "VALUES",
      "VALUES_GRID",
      "INSIGHTS",
      "ARTICLES"
    ].includes(semanticType)
  ) {
    setIfMissing(style, "padding", "72px 24px");
  }

  if (
    [
      "CTA_SECTION",
      "CTA_GROUP"
    ].includes(semanticType)
  ) {
    setIfMissing(style, "padding", "88px 24px");
    style.textAlign =
      style.textAlign || "center";
  }
};

const applyTextDefaults = (
  block: Block,
  style: Record<string, any>,
  context: {
    semanticSection?: string;
    dark: boolean;
  }
) => {
  if (
    block.type !== "text" &&
    block.type !== "title"
  ) {
    return;
  }

  const isHero =
    context.semanticSection === "HERO_SECTION";

  const isCta =
    context.semanticSection === "CTA_SECTION" ||
    context.semanticSection === "CTA_GROUP";

  setIfMissing(style, "width", "100%");

  if (
    isHero
  ) {
    style.maxWidth =
      block.type === "title"
        ? "900px"
        : style.maxWidth || "720px";
  } else if (
    isCta
  ) {
    setIfMissing(style, "maxWidth", "900px");
    setIfMissing(style, "marginLeft", "auto");
    setIfMissing(style, "marginRight", "auto");
  } else if (
    parsePx(style.maxWidth) === null
  ) {
    setIfMissing(style, "maxWidth", "900px");
  }

  if (
    block.type === "text" &&
    isMissingOrTooSmall(style.fontSize, 14)
  ) {
    style.fontSize = "14px";
  }

  if (
    block.type === "title"
  ) {
    const minTitleSize =
      context.semanticSection === "HERO_SECTION"
        ? 48
        : 28;

    if (
      isMissingOrTooSmall(
        style.fontSize,
        minTitleSize
      )
    ) {
      style.fontSize = `${minTitleSize}px`;
    }
  }

  if (
    isCta
  ) {
    style.textAlign =
      style.textAlign || "center";

    if (
      block.type === "title"
    ) {
      const maxWidth =
        parsePx(style.maxWidth);

      if (
        maxWidth === null ||
        maxWidth > 820
      ) {
        style.maxWidth = "820px";
      }
    }
  }

  if (
    context.dark &&
    !isReadableOnDark(style.color)
  ) {
    style.color =
      block.type === "title"
        ? "#ffffff"
        : "rgba(255,255,255,.78)";
  }
};

const applyHeroTopologyDefaults = (
  block: Block,
  style: Record<string, any>,
  context: {
    semanticSection?: string;
    parentFlexDirection?: string;
  }
) => {
  if (
    context.semanticSection !== "HERO_SECTION"
  ) {
    return;
  }

  if (
    block.type === "flex"
  ) {
    setIfMissing(style, "width", "100%");
    setIfMissing(style, "maxWidth", "1180px");
    setIfMissing(style, "marginLeft", "auto");
    setIfMissing(style, "marginRight", "auto");
    setIfMissing(style, "flexDirection", "column");
    setIfMissing(style, "alignItems", "flex-start");
    setIfMissing(style, "justifyContent", "flex-start");
    setIfMissing(style, "gap", "24px");
  }

  if (
    block.type === "flexItem"
  ) {
    const parentFlexDirection =
      String(
        context.parentFlexDirection || ""
      );

    const isRowChild =
      parentFlexDirection.startsWith(
        "row"
      );

    if (isRowChild) {
      const before = {
        width:
          style.width,
        maxWidth:
          style.maxWidth,
        flex:
          style.flex,
        flexGrow:
          style.flexGrow,
        flexShrink:
          style.flexShrink,
        flexBasis:
          style.flexBasis
      };

      console.log(
        "VISUAL_RUNTIME_FLEXITEM_WIDTH_GUARD",
        {
          parentFlexDirection,
          childId:
            block.id,
          before,
          after:
            {
              width:
                style.width,
              maxWidth:
                style.maxWidth,
              flex:
                style.flex,
              flexGrow:
                style.flexGrow,
              flexShrink:
                style.flexShrink,
              flexBasis:
                style.flexBasis
            },
          skippedWidthInjection:
            true
        }
      );

      return;
    }

    style.width = "100%";
    style.maxWidth = "1180px";
    style.flexShrink = "0";
    style.flexBasis = "auto";
    delete style.flex;
  }
};

const applyContainerSafetyDefaults = (
  block: Block,
  style: Record<string, any>,
  context: {
    semanticSection?: string;
  }
) => {
  if (
    block.type !== "grid" &&
    block.type !== "flex"
  ) {
    return;
  }

  clearTinyWidthConstraint(
    style
  );

  setIfMissing(style, "width", "100%");
  setIfMissing(style, "minWidth", "0");

  if (
    block.type === "grid"
  ) {
    setIfMissing(style, "display", "grid");
  }

  if (
    block.type === "flex"
  ) {
    setIfMissing(style, "display", "flex");

    if (
      context.semanticSection === "FEATURE_PILLARS"
    ) {
      setIfMissing(style, "flexDirection", "row");
      setIfMissing(style, "flexWrap", "wrap");
      setIfMissing(style, "alignItems", "stretch");
      setIfMissing(style, "justifyContent", "center");
    }
  }
};

const withDesktopStyle = (
  block: Block
) => ({
  ...block,
  data: {
    ...block.data,
    style: {
      ...(block.data?.style || {}),
      desktop: {
        ...(block.data?.style?.desktop || {})
      },
      tablet: {
        ...(block.data?.style?.tablet || {})
      },
      mobile: {
        ...(block.data?.style?.mobile || {})
      }
    }
  }
});

export const reconstructVisualRuntime = (
  blocks: Block[]
): Block[] => {
  const visit = (
    block: Block,
    context: {
      semanticSection?: string;
      dark: boolean;
      parentFlexDirection?: string;
    } = {
      dark: false
    }
  ): Block => {
    const next =
    
      withDesktopStyle(block);

    const semanticType =
      (next.meta as any)?.semanticType;

    const visualProfile =
      (next.meta as any)?.visualProfile;

    const desktop =
      getDesktopStyle(next);

    const nextSemantic =
      semanticName(next);

    const semanticSection =
      next.type === "section" &&
      nextSemantic
        ? nextSemantic
        : context.semanticSection;

    applySectionDefaults(
      next,
      desktop
    );

    applyTextDefaults(
      next,
      desktop,
      {
        semanticSection,
        dark:
          context.dark ||
          hasDarkBackground(desktop)
      }
    );

    applyHeroTopologyDefaults(
      next,
      desktop,
      {
        semanticSection,
        parentFlexDirection:
          context.parentFlexDirection
      }
    );

    applyContainerSafetyDefaults(
      next,
      desktop,
      {
        semanticSection
      }
    );

    if (
      next.type === "grid" ||
      next.type === "flex"
    ) {
      desktop.gap =
        desktop.gap ||
        (
          visualProfile?.spacing ===
          "cinematic"
            ? "16px"
            : "24px"
        );
    }

    const childParentFlexDirection =
      next.type === "flex"
        ? String(
            desktop.flexDirection || ""
          )
        : undefined;

    next.children =
      (block.children || []).map(
        child =>
          visit(
            child,
            {
              semanticSection,
              dark:
                context.dark ||
                hasDarkBackground(desktop),
              parentFlexDirection:
                childParentFlexDirection
            }
          )
      );

    return next;
  };

  return blocks.map(visit);
};
