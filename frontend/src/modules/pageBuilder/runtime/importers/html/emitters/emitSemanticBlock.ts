import { ContactLayoutPayload } from "../semanticContracts/ContactLayoutPayload";
import { CtaSectionPayload } from "../semanticContracts/CtaSectionPayload";
import { FeaturePillarsPayload } from "../semanticContracts/FeaturePillarsPayload";
import { HeroPayload } from "../semanticContracts/HeroPayload";
import { InsightsSectionPayload } from "../semanticContracts/InsightsSectionPayload";
import { OfficeTablePayload } from "../semanticContracts/OfficeTablePayload";
import { RepeatedSemanticEntityPayload } from "../semanticContracts/RepeatedSemanticEntityPayload";
import { TrustLogoSectionPayload } from "../semanticContracts/TrustLogoSectionPayload";
import { ValuesGridPayload } from "../semanticContracts/ValuesGridPayload";
import { semanticEmitterRegistry } from "../semanticResolvers/registry/semanticEmitterRegistry";
import {
  extractLayoutStyles
} from "../../css/extractStyleProps";
import {
  getLocalVisualContext,
  resolveInheritedBackground,
  resolveInheritedContainerWidth,
  resolveInheritedSectionSpacing
} from "../../design/visualContext";
import {
  filterCardStyle,
  filterHeroSectionStyle,
  filterSectionStyle
} from "../../../../presets/styleFilters";
import { ContentListSectionPayload } from "../semanticResolvers/semanticContracts/ContentListSectionPayload";
import { InfoBannerPayload } from "../semanticResolvers/semanticContracts/InfoBannerPayload";
import { TwoColumnIntroPayload } from "../semanticResolvers/semanticContracts/TwoColumnIntroPayload";
import { CtaCardPayload } from "../semanticResolvers/semanticContracts/CtaCardPayload";
import { NavbarPayload } from "../semanticContracts/NavbarPayload";

export type SemanticPayload =
  | NavbarPayload
  | HeroPayload
  | OfficeTablePayload
  | ValuesGridPayload
  | ContactLayoutPayload
  | FeaturePillarsPayload
  | CtaSectionPayload
  | InsightsSectionPayload
  | TrustLogoSectionPayload
  | RepeatedSemanticEntityPayload
  | ContentListSectionPayload
  | InfoBannerPayload
  | TwoColumnIntroPayload
  | CtaCardPayload;

const getComputedDesignStyle = (
  element?: HTMLElement | null
) => {
  if (!element) {
    return null;
  }

  const computed =
    (
      element.ownerDocument.defaultView ||
      window
    ).getComputedStyle(element);

  return {
    background:
      computed.background,
    backgroundColor:
      computed.backgroundColor,
    backgroundImage:
      computed.backgroundImage,
    color:
      computed.color,
    padding:
      computed.padding,
    paddingTop:
      computed.paddingTop,
    paddingBottom:
      computed.paddingBottom,
    paddingLeft:
      computed.paddingLeft,
    paddingRight:
      computed.paddingRight,
    margin:
      computed.margin,
    marginTop:
      computed.marginTop,
    marginBottom:
      computed.marginBottom,
    border:
      computed.border,
    borderRadius:
      computed.borderRadius,
    boxShadow:
      computed.boxShadow,
    backdropFilter:
      computed.backdropFilter,
    width:
      computed.width,
    maxWidth:
      computed.maxWidth
  };
};

const getEmittedStyle = (
  block: any
) =>
  block?.data?.style ||
  block?.style ||
  null;

const desktopOf = (
  style: any
) =>
  style?.desktop || style || {};

const normalizePadding = (
  style: any
) =>
  style?.padding ||
  [
    style?.paddingTop,
    style?.paddingRight,
    style?.paddingBottom,
    style?.paddingLeft
  ]
    .filter(Boolean)
    .join(" ");

const querySource = (
  root: HTMLElement | undefined | null,
  selector: string
) =>
  root?.querySelector(
    selector
  ) as HTMLElement | null;

const getComputedDensity = (
  element?: HTMLElement | null
) => {
  if (!element) {
    return {};
  }

  const computed =
    (
      element.ownerDocument.defaultView ||
      window
    ).getComputedStyle(
      element
    );

  return {
    padding:
      computed.padding,
    width:
      computed.width,
    maxWidth:
      computed.maxWidth,
    fontSize:
      computed.fontSize,
    lineHeight:
      computed.lineHeight,
    gridTemplateColumns:
      computed.gridTemplateColumns,
    gap:
      computed.gap,
    minHeight:
      computed.minHeight,
    borderRadius:
      computed.borderRadius
  };
};

const findBlockByType = (
  block: any,
  type: string
): any => {
  if (!block) {
    return null;
  }

  if (block.type === type) {
    return block;
  }

  for (const child of block.children || []) {
    const found =
      findBlockByType(
        child,
        type
      );

    if (found) {
      return found;
    }
  }

  return null;
};

const findBlockWithChildTypes = (
  block: any,
  childTypes: string[]
): any => {
  if (!block) {
    return null;
  }

  const types =
    (block.children || []).map(
      (child: any) => child.type
    );

  if (
    childTypes.every(
      type => types.includes(type)
    )
  ) {
    return block;
  }

  for (const child of block.children || []) {
    const found =
      findBlockWithChildTypes(
        child,
        childTypes
      );

    if (found) {
      return found;
    }
  }

  return null;
};

const summarizeSectionDensity = (
  semanticType: string,
  claimedElement: HTMLElement | undefined,
  emittedBlock: any
) => {
  const sourceContainer =
    querySource(
      claimedElement,
      ".container, [class*='container'], .inner, [class*='inner'], .wrap, [class*='wrap']"
    ) || claimedElement || null;

  const sourceTitle =
    querySource(
      claimedElement,
      "h1,h2"
    );

  const sourceDescription =
    querySource(
      claimedElement,
      "p"
    );

  const sourceGrid =
    querySource(
      claimedElement,
      ".grid, [class*='grid'], .pillars, .insights-grid, [class*='logos'], [class*='partners']"
    );

  const sourceCard =
    querySource(
      claimedElement,
      "article, .card, [class*='card'], .pillar, .insight"
    );

  const emittedSection =
    desktopOf(
      getEmittedStyle(
        emittedBlock
      )
    );

  const emittedContainerBlock =
    emittedBlock?.children?.[0] || null;

  const emittedContainer =
    desktopOf(
      getEmittedStyle(
        emittedContainerBlock
      )
    );

  const emittedTitle =
    desktopOf(
      getEmittedStyle(
        findBlockByType(
          emittedBlock,
          "title"
        )
      )
    );

  const emittedDescription =
    desktopOf(
      getEmittedStyle(
        findBlockByType(
          emittedBlock,
          "text"
        )
      )
    );

  const emittedGrid =
    desktopOf(
      getEmittedStyle(
        findBlockByType(
          emittedBlock,
          "grid"
        ) ||
        findBlockWithChildTypes(
          emittedBlock,
          ["flexItem", "flexItem"]
        )
      )
    );

  const emittedCard =
    desktopOf(
      getEmittedStyle(
        findBlockByType(
          emittedBlock,
          "gridItem"
        ) ||
        findBlockWithChildTypes(
          emittedBlock,
          ["title", "text"]
        )
      )
    );

  const sourceSectionDensity =
    getComputedDensity(
      claimedElement
    );

  const sourceContainerDensity =
    getComputedDensity(
      sourceContainer
    );

  const sourceTitleDensity =
    getComputedDensity(
      sourceTitle
    );

  const sourceDescriptionDensity =
    getComputedDensity(
      sourceDescription
    );

  const sourceGridDensity =
    getComputedDensity(
      sourceGrid
    );

  const sourceCardDensity =
    getComputedDensity(
      sourceCard
    );

  return {
    semanticType,
    source: {
      sectionPadding:
        sourceSectionDensity.padding,
      containerWidth:
        sourceContainerDensity.width,
      containerMaxWidth:
        sourceContainerDensity.maxWidth,
      titleFontSize:
        sourceTitleDensity.fontSize,
      titleLineHeight:
        sourceTitleDensity.lineHeight,
      descriptionFontSize:
        sourceDescriptionDensity.fontSize,
      descriptionLineHeight:
        sourceDescriptionDensity.lineHeight,
      gridTemplateColumns:
        sourceGridDensity.gridTemplateColumns,
      gridGap:
        sourceGridDensity.gap,
      cardPadding:
        sourceCardDensity.padding,
      cardMinHeight:
        sourceCardDensity.minHeight,
      cardBorderRadius:
        sourceCardDensity.borderRadius
    },
    emitted: {
      sectionPadding:
        normalizePadding(
          emittedSection
        ),
      containerWidth:
        emittedContainer.width,
      containerMaxWidth:
        emittedContainer.maxWidth,
      titleFontSize:
        emittedTitle.fontSize,
      titleLineHeight:
        emittedTitle.lineHeight,
      descriptionFontSize:
        emittedDescription.fontSize,
      descriptionLineHeight:
        emittedDescription.lineHeight,
      gridTemplateColumns:
        emittedGrid.gridTemplateColumns,
      gridGap:
        emittedGrid.gap ||
        emittedGrid.columnGap ||
        emittedGrid.rowGap,
      cardPadding:
        normalizePadding(
          emittedCard
        ),
      cardMinHeight:
        emittedCard.minHeight,
      cardBorderRadius:
        emittedCard.borderRadius
    }
  };
};

const getSectionFilteredStyle = (
  semanticType: string,
  extracted: any
) =>
  semanticType === "HERO_SECTION"
    ? filterHeroSectionStyle(
        extracted?.desktop || {}
      )
    : filterSectionStyle(
        extracted?.desktop || {}
      );

const isHTMLElementLike = (
  element: Element
): element is HTMLElement =>
  element.nodeType === 1 &&
  typeof (element as HTMLElement).tagName === "string";

const getFeatureCardElements = (
  element?: HTMLElement | null
) => {
  const matches =
    element
      ? Array.from(
          element.querySelectorAll(
            "article.pillar, .pillar, .pillar-card, .feature-card, [class*='pillar'], [class*='feature']"
          )
        )
      : [];

  const keptCards =
    matches.filter(
      (candidate): candidate is HTMLElement =>
        isHTMLElementLike(
          candidate
        ) &&
        candidate !== element &&
        !!candidate.querySelector(
          "h1,h2,h3,h4,h5,h6"
        )
    );

  console.log(
    "FEATURE_DESIGN_CARD_QUERY_DEBUG",
    {
      claimedClassName:
        element?.getAttribute(
          "class"
        ) || "",
      totalPillarMatches:
        matches.length,
      keptCards:
        keptCards.map(card => ({
          tag:
            card.tagName,
          className:
            card.getAttribute(
              "class"
            ) || ""
        }))
    }
  );

  return keptCards;
};

const collectFlexItems = (
  block: any
): any[] =>
  !block
    ? []
    : [
        ...(block.type === "flexItem"
          ? [block]
          : []),
        ...(block.children || []).flatMap(
          collectFlexItems
        )
      ];

export const emitSemanticBlock = (
  semanticResult: SemanticPayload
) => {

  // =====================================
  // NULL GUARD
  // =====================================

  if (!semanticResult) {

    console.log(
      "❌ EMIT FAILED : NO SEMANTIC RESULT"
    );

    return null;
  }

  console.log(
    "🔥 EMIT START",
    {
      type: semanticResult.type,
      payload: semanticResult
    }
  );

  const claimedElement =
    semanticResult.claimedNode?.element;

  const localVisualContext =
    getLocalVisualContext(
      claimedElement
    );

  const visualContextReport = {
    semanticType:
      semanticResult.type,
    localBackground:
      localVisualContext
        ? {
            background:
              localVisualContext.background,
            backgroundColor:
              localVisualContext.backgroundColor,
            backgroundImage:
              localVisualContext.backgroundImage
          }
        : null,
    inheritedBackground:
      resolveInheritedBackground(
        claimedElement
      ),
    localWidth:
      localVisualContext
        ? {
            width:
              localVisualContext.width,
            maxWidth:
              localVisualContext.maxWidth
          }
        : null,
    inheritedWidth:
      resolveInheritedContainerWidth(
        claimedElement
      ),
    localSpacing:
      localVisualContext?.spacing || null,
    inheritedSpacing:
      resolveInheritedSectionSpacing(
        claimedElement
      ),
    sourceElement:
      localVisualContext?.sourceElement || null
  };

  console.log(
    "VISUAL_CONTEXT_REPORT_JSON",
    JSON.stringify(
      visualContextReport,
      null,
      2
    )
  );

  const payloadForLog =
    Object.fromEntries(
      Object.entries(semanticResult as any)
        .filter(
          ([key]) =>
            key !== "claimedNode"
        )
    );

  const heroDiagnostics =
    semanticResult.type === "HERO_SECTION"
      ? {
          hasTitle:
            !!(semanticResult as any).title,
          hasSubtitle:
            !!(semanticResult as any).subtitle,
          hasCta:
            !!(semanticResult as any).ctaText,
          buttonCount:
            claimedElement
              ?.querySelectorAll("button,a")
              ?.length || 0,
          kpiRowCount:
            claimedElement
              ?.querySelectorAll(
                ".kpi,.stat,.metric,[class*='kpi'],[class*='stat'],[class*='metric']"
              )
              ?.length || 0,
          partnersRowCount:
            claimedElement
              ?.querySelectorAll(
                ".partner,.partners,[class*='partner'],[class*='logo']"
              )
              ?.length || 0
        }
      : undefined;

  if (
    [
      "HERO_SECTION",
      "FEATURE_PILLARS",
      "FEATURE_SECTION",
      "INSIGHTS_SECTION",
      "TRUST_LOGO_SECTION",
      "CTA_SECTION",
      "CTA_GROUP"
    ].includes(semanticResult.type)
  ) {
    console.log(
      "🧾 GENERATED PRESET PAYLOAD",
      {
        semanticType:
          semanticResult.type,
        payload:
          payloadForLog,
        claimedElement:
          claimedElement
            ? {
                tag:
                  claimedElement.tagName,
                className:
                  claimedElement.getAttribute("class") || "",
                childCount:
                  claimedElement.children.length
              }
            : null,
        heroDiagnostics
      }
    );
  }

  // =====================================
  // FIND EMITTER
  // =====================================

  const emitter =
    semanticEmitterRegistry[
      semanticResult.type
    ];

  console.log(
    "🧠 EMITTER LOOKUP",
    {
      semanticType:
        semanticResult.type,

      emitterFound:
        !!emitter
    }
  );

  // =====================================
  // NO EMITTER
  // =====================================

  if (!emitter) {

    console.log(
      "❌ NO EMITTER FOUND",
      {
        semanticType:
          semanticResult.type
      }
    );

    console.log(
      "🧠 SEMANTIC ENTITY ONLY",
      semanticResult
    );

    return null;
  }

  // =====================================
  // EXECUTE EMITTER
  // =====================================

  if (
    semanticResult.type === "CTA_SECTION" ||
    semanticResult.type === "CTA_GROUP"
  ) {
    console.log(
      "EMIT_CTA_PAYLOAD_IN",
      {
        title:
          (semanticResult as any).title,
        text:
          (semanticResult as any).text,
        actionsLength:
          (semanticResult as any).actions?.length || 0,
        keys:
          Object.keys(
            semanticResult as any
          )
      }
    );
  }

  const emitted =
    emitter(
      semanticResult
    );

  console.log(
    "🧠 EMITTER RESULT",
    emitted
  );

  console.log(
    "🧠 META CHECK",
    emitted?.meta
  );

  console.log(
    "🧠 BLOCK TYPE",
    emitted?.type
  );

  console.log(
    "🧠 BLOCK ID",
    emitted?.id
  );

  console.log(
    "🧠 BLOCK CHILDREN",
    emitted?.children?.length
  );

  console.log(
    "🚨 EMITTED FULL",
    JSON.stringify(
      emitted,
      null,
      2
    )
  );

  console.log(
    "🚨 SEMANTIC PRESET TREE",
    {
      type:
        semanticResult.type,

      payload:
        semanticResult,

      emitted
    }
  );

  // =====================================
  // INVALID RESULT
  // =====================================

  if (!emitted) {

    console.log(
      "❌ EMITTER RETURNED NULL"
    );

    return null;
  }

  if (
    [
      "FEATURE_PILLARS",
      "TRUST_LOGO_SECTION",
      "INSIGHTS_SECTION",
      "CTA_SECTION"
    ].includes(
      semanticResult.type
    )
  ) {
    const emittedBlock =
      Array.isArray(
        emitted
      )
        ? emitted[0]
        : emitted;

    console.log(
      "SECTION_DENSITY_REPORT",
      JSON.stringify(
        summarizeSectionDensity(
          semanticResult.type,
          claimedElement,
          emittedBlock
        ),
        null,
        2
      )
    );
  }

  if (
    [
      "HERO_SECTION",
      "FEATURE_PILLARS",
      "INSIGHTS_SECTION",
      "TRUST_LOGO_SECTION",
      "CTA_SECTION"
    ].includes(semanticResult.type)
  ) {
    const extractedStyle =
      claimedElement
        ? extractLayoutStyles(
            claimedElement
          )
        : null;
    const emittedBlock =
      Array.isArray(emitted)
        ? emitted[0]
        : emitted;
    const featureCards =
      semanticResult.type === "FEATURE_PILLARS"
        ? getFeatureCardElements(
            claimedElement
          )
        : [];
    const emittedCardBlocks =
      semanticResult.type === "FEATURE_PILLARS"
        ? collectFlexItems(
            emittedBlock
          )
        : [];

    console.log(
      "DESIGN_EXTRACTION_REPORT",
      {
        semanticType:
          semanticResult.type,
        section:
          {
            claimedElement:
              claimedElement
                ? {
                    tag:
                      claimedElement.tagName,
                    className:
                      claimedElement.getAttribute(
                        "class"
                      ) || ""
                  }
                : null,
            computedStyle:
              getComputedDesignStyle(
                claimedElement
              ),
            extractedStyle,
            filteredStyle:
              getSectionFilteredStyle(
                semanticResult.type,
                extractedStyle
              ),
            emittedStyle:
              getEmittedStyle(
                emittedBlock
              )
          },
        featureCards:
          featureCards.map(
            (
              card,
              index
            ) => {
              const cardExtracted =
                extractLayoutStyles(
                  card
                );

              return {
                index,
                claimedElement:
                  {
                    tag:
                      card.tagName,
                    className:
                      card.getAttribute(
                        "class"
                      ) || ""
                  },
                computedStyle:
                  getComputedDesignStyle(
                    card
                  ),
                extractedStyle:
                  cardExtracted,
                filteredStyle:
                  filterCardStyle(
                    cardExtracted.desktop || {}
                  ),
                emittedStyle:
                  getEmittedStyle(
                    emittedCardBlocks[index]
                  )
              };
            }
          )
      }
    );
  }

  // =====================================
  // RETURN
  // =====================================

  console.log(
    "✅ EMIT SUCCESS",
    {
      semanticType:
        semanticResult.type
    }
  );

  return emitted;
};
