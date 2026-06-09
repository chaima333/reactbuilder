import type {
  Block
} from "../../../types/page.types";

export type LayoutDensityAnalysis = {
  sectionSpacingRhythm:
    | "compact"
    | "balanced"
    | "cinematic";
  contentWidthStrategy:
    | "narrow"
    | "contained"
    | "full-bleed";
  visualDensity:
    | "airy"
    | "balanced"
    | "dense";
  asymmetricLayouts: boolean;
  premiumHeroSpacing: boolean;
};

export type SectionVisualProfile = {
  semanticType: string;
  visualProfile: {
    theme:
      | "dark-fintech"
      | "light-editorial"
      | "neutral-saas";
    spacing:
      | "compact"
      | "balanced"
      | "cinematic";
    typography:
      | "display-heavy"
      | "structured"
      | "body-led";
    contrast:
      | "high"
      | "medium"
      | "low";
  };
};

const numeric = (
  value: unknown
) => {
  if (
    typeof value === "number"
  ) {
    return value;
  }

  if (
    typeof value !== "string"
  ) {
    return 0;
  }

  const parsed =
    parseFloat(value);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
};

const collectSections = (
  blocks: Block[]
): Block[] => {
  const sections: Block[] = [];

  const visit = (
    block: Block
  ) => {
    if (
      block.type === "section"
    ) {
      sections.push(block);
    }

    (block.children || []).forEach(
      visit
    );
  };

  blocks.forEach(visit);

  return sections;
};

const average = (
  values: number[]
) => {
  if (!values.length) {
    return 0;
  }

  return values.reduce(
    (sum, value) => sum + value,
    0
  ) / values.length;
};

const inferSpacing = (
  value: number
) => {
  if (value >= 96) {
    return "cinematic" as const;
  }

  if (value >= 48) {
    return "balanced" as const;
  }

  return "compact" as const;
};

const inferDensity = (
  childCounts: number[],
  spacing: number
) => {
  const childAverage =
    average(childCounts);

  if (
    spacing >= 80 &&
    childAverage <= 3
  ) {
    return "airy" as const;
  }

  if (
    spacing < 48 ||
    childAverage >= 6
  ) {
    return "dense" as const;
  }

  return "balanced" as const;
};

export const analyzeLayoutDensity = (
  blocks: Block[]
): LayoutDensityAnalysis => {
  const sections =
    collectSections(blocks);

  const sectionSpacing =
    sections.map(section => {
      const style =
        section.data?.style?.desktop || {};

      return Math.max(
        numeric(style.paddingTop),
        numeric(style.paddingBottom),
        numeric(style.padding)
      );
    });

  const widths =
    sections.map(section =>
      numeric(
        section.data?.style?.desktop
          ?.maxWidth
      )
    ).filter(Boolean);

  const hasFullBleed =
    sections.some(section =>
      section.data?.style?.desktop
        ?.width === "100vw"
    );

  const hasAsymmetry =
    sections.some(section =>
      JSON.stringify(
        section.data?.style?.desktop || {}
      ).includes("40%") ||
      JSON.stringify(
        section.data?.style?.desktop || {}
      ).includes("60%")
    );

  const avgSpacing =
    average(sectionSpacing);

  const childCounts =
    sections.map(section =>
      section.children?.length || 0
    );

  return {
    sectionSpacingRhythm:
      inferSpacing(avgSpacing),
    contentWidthStrategy:
      hasFullBleed
        ? "full-bleed"
        : average(widths) &&
          average(widths) < 900
        ? "narrow"
        : "contained",
    visualDensity:
      inferDensity(
        childCounts,
        avgSpacing
      ),
    asymmetricLayouts:
      hasAsymmetry,
    premiumHeroSpacing:
      sections.some(section => {
        const semanticType =
          (section.meta as any)
            ?.semanticType;

        const style =
          section.data?.style?.desktop ||
          {};

        return (
          semanticType ===
            "HERO_SECTION" &&
          Math.max(
            numeric(style.paddingTop),
            numeric(style.paddingBottom)
          ) >= 96
        );
      })
  };
};

const hasDarkSurface = (
  block: Block
) => {
  const value =
    block.data?.style?.desktop
      ?.backgroundColor;

  return (
    typeof value === "string" &&
    (
      value.startsWith("#0") ||
      value.startsWith("#1") ||
      value.includes("rgb(0") ||
      value.includes("rgba(0")
    )
  );
};

const inferTypographyProfile = (
  block: Block
) => {
  const text =
    JSON.stringify(
      block
    );

  if (
    text.includes("display-xl") ||
    text.includes("fontWeight\":\"800") ||
    text.includes("fontWeight\":\"700")
  ) {
    return "display-heavy" as const;
  }

  if (
    text.includes("title")
  ) {
    return "structured" as const;
  }

  return "body-led" as const;
};

export const applySectionVisualProfiles = (
  blocks: Block[],
  density: LayoutDensityAnalysis
): Block[] => {
  const visit = (
    block: Block
  ): Block => {
    const semanticType =
      (block.meta as any)?.semanticType;

    const next: Block = {
      ...block,
      meta: block.meta
        ? {
            ...block.meta
          }
        : block.meta,
      children:
        (block.children || []).map(visit)
    };

    if (
      semanticType
    ) {
      const profile: SectionVisualProfile =
        {
          semanticType,
          visualProfile: {
            theme:
              hasDarkSurface(block)
                ? "dark-fintech"
                : semanticType ===
                  "HERO_SECTION"
                ? "neutral-saas"
                : "light-editorial",
            spacing:
              density.sectionSpacingRhythm,
            typography:
              inferTypographyProfile(block),
            contrast:
              hasDarkSurface(block)
                ? "high"
                : "medium"
          }
        };

      next.meta = {
        ...(next.meta || {}),
        visualProfile:
          profile.visualProfile
      } as any;
    }

    return next;
  };

  return blocks.map(visit);
};
