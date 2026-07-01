import { PageBlock } from "../pages/types/page.types";

export type AiDesignProfile =
  | "form-focused"
  | "card-heavy-modern"
  | "image-rich-gallery";

export interface AiDesignSystem {
  source: string;
  profile: AiDesignProfile;
  animationPreset:
    | "soft-fade-up"
    | "card-stagger-up"
    | "staggered-gallery";

  sectionPadding: string;
  tabletSectionPadding: string;
  mobileSectionPadding: string;

  cardRadius: string;
  cardShadow: string;
  gridGap: string;
  buttonRadius: string;
  imageRadius: string;

  inputRadius: string;
  inputShadow: string;

  cardPadding: string;
  sectionMaxWidth: string;
}

const normalizeCategory = (
  category: string
): string =>
  category
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");

const resolveProfile = (
  category: string
): AiDesignProfile => {
  const normalized =
    normalizeCategory(category);

  if (
    [
      "medical",
      "health",
      "healthcare"
    ].includes(normalized)
  ) {
    return "form-focused";
  }

  if (
    [
      "restaurant",
      "foodhospitality",
      "food",
      "realestate",
      "portfolio",
      "travel"
    ].includes(normalized)
  ) {
    return "image-rich-gallery";
  }

  return "card-heavy-modern";
};

const PROFILE_PRESETS: Record<
  AiDesignProfile,
  Omit<AiDesignSystem, "profile">
> = {
  "form-focused": {
    source: "WebSight 5000 HTML sample",
    animationPreset: "soft-fade-up",

    sectionPadding: "92px 40px",
    tabletSectionPadding: "72px 28px",
    mobileSectionPadding: "56px 18px",

    cardRadius: "20px",
    cardShadow: "0 18px 45px rgba(15, 23, 42, 0.10)",
    gridGap: "28px",
    buttonRadius: "14px",
    imageRadius: "20px",

    inputRadius: "14px",
    inputShadow: "0 8px 22px rgba(15, 23, 42, 0.06)",

    cardPadding: "32px",
    sectionMaxWidth: "1180px"
  },

  "card-heavy-modern": {
    source: "WebSight 5000 HTML sample",
    animationPreset: "card-stagger-up",

    sectionPadding: "96px 40px",
    tabletSectionPadding: "76px 28px",
    mobileSectionPadding: "58px 18px",

    cardRadius: "22px",
    cardShadow: "0 22px 55px rgba(15, 23, 42, 0.13)",
    gridGap: "30px",
    buttonRadius: "14px",
    imageRadius: "22px",

    inputRadius: "14px",
    inputShadow: "0 8px 22px rgba(15, 23, 42, 0.06)",

    cardPadding: "34px",
    sectionMaxWidth: "1200px"
  },

  "image-rich-gallery": {
    source: "WebSight 5000 HTML sample",
    animationPreset: "staggered-gallery",

    sectionPadding: "100px 40px",
    tabletSectionPadding: "78px 28px",
    mobileSectionPadding: "58px 18px",

    cardRadius: "24px",
    cardShadow: "0 20px 50px rgba(15, 23, 42, 0.11)",
    gridGap: "32px",
    buttonRadius: "16px",
    imageRadius: "26px",

    inputRadius: "14px",
    inputShadow: "0 8px 22px rgba(15, 23, 42, 0.06)",

    cardPadding: "34px",
    sectionMaxWidth: "1220px"
  }
};

export const generateDesignSystem = (
  category: string
): AiDesignSystem => {
  const profile =
    resolveProfile(category);

  return {
    profile,
    ...PROFILE_PRESETS[profile]
  };
};

const isResponsiveStyle = (
  style: any
): boolean =>
  !!style &&
  typeof style === "object" &&
  (
    style.desktop ||
    style.tablet ||
    style.mobile
  );

const ensureResponsiveStyle = (
  style: any
) => {
  if (
    isResponsiveStyle(style)
  ) {
    return {
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
  }

  return {
    desktop: {
      ...(style || {})
    },
    tablet: {},
    mobile: {}
  };
};

const hasCardShape = (
  block: PageBlock,
  desktop: Record<string, any>
): boolean => {
  const id =
    String(block.id || "").toLowerCase();

  return (
    id.includes("card") ||
    id.includes("feature") ||
    id.includes("service") ||
    id.includes("pricing") ||
    id.includes("testimonial") ||
    id.includes("faq-item") ||
    id.includes("contact-info-item") ||
    !!desktop.boxShadow ||
    !!desktop.border ||
    !!desktop.borderRadius
  );
};

const animationFor = (
  block: PageBlock,
  design: AiDesignSystem,
  depth: number,
  index: number
) => {
  if (
    block.type !== "section" &&
    block.type !== "flex" &&
    block.type !== "gridItem"
  ) {
    return undefined;
  }

  const isSection =
    block.type === "section";

  const isCard =
    String(block.id || "")
      .toLowerCase()
      .includes("card") ||
    block.type === "gridItem";

  if (
    !isSection &&
    !isCard
  ) {
    return undefined;
  }

  return {
    name: design.animationPreset,
    duration: 600,
    delay: Math.min(
      index * 90 + depth * 30,
      480
    ),
    easing: "ease-out"
  };
};

const applyToBlock = (
  block: PageBlock,
  design: AiDesignSystem,
  depth: number,
  index: number
): PageBlock => {
  const style =
    ensureResponsiveStyle(
      block.data?.style || {}
    );

  const desktop =
    style.desktop;

  const tablet =
    style.tablet;

  const mobile =
    style.mobile;

  if (
    block.type === "section" ||
    block.type === "footer"
  ) {
    desktop.padding =
      design.sectionPadding;

    tablet.padding =
      design.tabletSectionPadding;

    mobile.padding =
      design.mobileSectionPadding;

    desktop.boxSizing =
      "border-box";

    desktop.width =
      desktop.width || "100%";
  }

  if (
    block.type === "grid"
  ) {
    desktop.gap =
      design.gridGap;

    tablet.gap =
      design.gridGap;

    mobile.gap =
      "20px";

    desktop.maxWidth =
      desktop.maxWidth || design.sectionMaxWidth;
  }

  if (
    block.type === "button"
  ) {
    desktop.borderRadius =
      design.buttonRadius;

    tablet.borderRadius =
      design.buttonRadius;

    mobile.borderRadius =
      design.buttonRadius;

    desktop.boxShadow =
      desktop.boxShadow ||
      "0 12px 28px rgba(37, 99, 235, 0.22)";
  }

  if (
    block.type === "image"
  ) {
    desktop.borderRadius =
      design.imageRadius;

    tablet.borderRadius =
      design.imageRadius;

    mobile.borderRadius =
      "18px";

    desktop.boxShadow =
      desktop.boxShadow ||
      "0 18px 45px rgba(15, 23, 42, 0.12)";
  }

  if (
    block.type === "input" ||
    block.type === "textarea"
  ) {
    desktop.borderRadius =
      design.inputRadius;

    tablet.borderRadius =
      design.inputRadius;

    mobile.borderRadius =
      design.inputRadius;

    desktop.boxShadow =
      desktop.boxShadow ||
      design.inputShadow;
  }

  if (
    hasCardShape(block, desktop) &&
    block.type !== "section" &&
    block.type !== "footer" &&
    block.type !== "button" &&
    block.type !== "image" &&
    block.type !== "input" &&
    block.type !== "textarea"
  ) {
    desktop.borderRadius =
      desktop.borderRadius ||
      design.cardRadius;

    tablet.borderRadius =
      tablet.borderRadius ||
      design.cardRadius;

    mobile.borderRadius =
      mobile.borderRadius ||
      "18px";

    desktop.boxShadow =
      desktop.boxShadow ||
      design.cardShadow;

    if (
      desktop.padding &&
      typeof desktop.padding === "string"
    ) {
      desktop.padding =
        design.cardPadding;
    }
  }

  const animation =
    animationFor(
      block,
      design,
      depth,
      index
    );

  return {
    ...block,
    data: {
      ...(block.data || {}),
      props: {
        ...(block.data?.props || {}),
        ...(animation
          ? {
              animation
            }
          : {})
      },
      style
    },
    children:
      block.children?.map(
        (
          child,
          childIndex
        ) =>
          applyToBlock(
            child,
            design,
            depth + 1,
            childIndex
          )
      ) || []
  };
};

export const applyDesignSystemToBlocks = (
  blocks: PageBlock[],
  design: AiDesignSystem
): PageBlock[] =>
  blocks.map(
    (
      block,
      index
    ) =>
      applyToBlock(
        block,
        design,
        0,
        index
      )
  );