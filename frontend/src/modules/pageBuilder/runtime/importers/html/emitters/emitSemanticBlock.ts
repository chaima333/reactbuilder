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
import { FooterPayload } from "../semanticContracts/FooterPayload";
import type {
  ServicePageSectionPayload
} from "../semanticResolvers/semanticContracts/ServicePageSectionPayload";

export type SemanticPayload =
  | NavbarPayload
  | FooterPayload
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
  | CtaCardPayload
  | ServicePageSectionPayload;

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
          element.matches(
            ".feat-grid, .profiles-grid, [class*='feat-grid'], [class*='profiles-grid']"
          )
            ? element.children
            : element.querySelectorAll(
                "article.pillar, .pillar, .pillar-card, .feature-card, .value-card, .profile-card, .s-card, [class*='pillar'], [class*='feature'], [class*='value'], [class*='profile']"
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

const collectGridItems = (
  block: any
): any[] =>
  !block
    ? []
    : [
        ...(block.type === "gridItem"
          ? [block]
          : []),
        ...(block.children || []).flatMap(
          collectGridItems
        )
      ];

export const emitSemanticBlock = (
  semanticResult: SemanticPayload
) => {
  if (
    !semanticResult
  ) {
    return null;
  }
  const emitter =
    semanticEmitterRegistry[
      semanticResult.type
    ];

  if (
    !emitter
  ) {
    return null;
  }

  if (
    semanticResult.type === "CTA_SECTION" ||
    semanticResult.type === "CTA_GROUP" ||
    semanticResult.type === "CTA_CARD"
  ) {
    const payload =
      semanticResult as any;

    const hasContent =
      !!payload.title ||
      !!payload.text ||
      !!payload.description;

    if (
      !hasContent
    ) {
      return null;
    }
  }

  const emitted =
    emitter(
      semanticResult
    );

  if (
    !emitted
  ) {
    return null;
  }

  return emitted;
};
