import {
  importHtmlDocument
} from "../importHtmlDocument";

import {
  footerHtmlToBlock
} from "../footerToBlock";

import {
  validateTreeInvariants
} from "../../../validation/invariants";

import {
  applyVisitorAuthPresentationToBlock,
  extractVisitorAuthPresentation,
  findFirstVisitorAuthBlock,
  updateFirstVisitorAuthBlock
} from "../../../../components/blocks/data/visitorAuth/presentation";

import type {
  Block
} from "../../../../types/page.types";
import { normalizeCanonicalContainers } from "../../../normalize/normalizeCanonicalContainers";

// =====================================
// ID / HYDRATION
// =====================================

const generateUniqueId = () =>
  Math.random()
    .toString(36)
    .substring(2, 9);

const hydrateBlocks = (
  blocks: any[]
): any[] => {
  return blocks.map(
    block => {
      const meta =
        block.meta ||
        block.data?.meta ||
        {};

      return {
        ...block,

      id:
        block.id ||
        `block-${generateUniqueId()}`,

      meta,

      data: {
        ...(block.data || {}),
        meta
      },

      props:
        block.props ||
        block.data?.props ||
        {},

      style:
        block.style ||
        block.data?.style ||
        {},

      children:
        block.children
          ? hydrateBlocks(
              block.children
            )
          : []
      };
    }
  );
};

// =====================================
// CTA DETECTION IN FOOTER
// =====================================

const containsCtaSemantic = (
  block: any
): boolean => {
  const semanticType =
    block?.meta?.semanticType ||
    block?.data?.meta?.semanticType;

  if (
    semanticType === "CTA_SECTION" ||
    semanticType === "CTA_GROUP" ||
    semanticType === "CTA_CARD"
  ) {
    return true;
  }

  return (
    block?.children || []
  ).some(
    containsCtaSemantic
  );
};

// =====================================
// GLOBAL LAYOUT IMPORT
// Navbar only here.
// Footer is handled by footerHtmlToBlock.
// =====================================

const importGlobalLayoutBlock = async (
  html?: string,
  layout:
    | "navbar"
    | "footer" =
    "navbar"
) => {
  console.log(
    "ZIP_GLOBAL_LAYOUT_TRANSFORMER_CALLED",
    {
      layout,
      hasHtml:
        !!html?.trim()
    }
  );

  if (
    !html?.trim()
  ) {
    return null;
  }

  const imported =
    await importHtmlDocument(
      html,
      {
        layout
      }
    );

  if (
    layout === "footer" &&
    imported.blocks?.some(
      containsCtaSemantic
    )
  ) {
    console.warn(
      "ZIP_FOOTER_GENERIC_IMPORT_REJECTED",
      {
        reason:
          "CTA semantic block emitted in footer context",

        blockTypes:
          imported.blocks.map(
            (block: any) =>
              block?.meta?.semanticType ||
              block?.type
          )
      }
    );

    return null;
  }

  const hydrated =
    hydrateBlocks(
      (imported.blocks || []).map(
        (block: any) => ({
          ...block,

          props:
            block.data?.props || {},

          style:
            block.data?.style || {},

          children:
            block.children || []
        })
      )
    );

  return hydrated[0] || null;
};

// =====================================
// REMOVE NAVBAR / FOOTER FROM PAGE BODY
// =====================================

const isGlobalLayoutBlock = (
  block: any
): boolean => {
  const semanticType =
    block?.meta?.semanticType ||
    block?.data?.meta?.semanticType;

  return (
    block?.type === "navbar" ||
    block?.type === "footer" ||

    semanticType === "NAVBAR" ||
    semanticType === "FOOTER" ||
    semanticType === "FOOTER_SECTION" ||

    block?.id?.startsWith("navbar-") ||
    block?.id?.startsWith("footer-") ||
    block?.id?.startsWith("footer-section-")
  );
};

const removeGlobalLayoutBlocks = (
  blocks: any[] = []
): any[] => {
  return blocks
    .filter(
      (block: any) =>
        !isGlobalLayoutBlock(
          block
        )
    )
    .map(
      (block: any) => ({
        ...block,

        children:
          removeGlobalLayoutBlocks(
            block.children || []
          )
      })
    );
};

const flattenBlocks = (
  blocks: any[] = []
): any[] =>
  blocks.flatMap(
    block => [
      block,
      ...flattenBlocks(
        block.children || []
      )
    ]
  );

const getBlockText = (
  block: any
) =>
  String(
    block?.data?.props?.content ||
    block?.data?.props?.text ||
    block?.props?.content ||
    block?.props?.text ||
    ""
  ).trim();

const hasMeaningfulTitleBlock = (
  blocks: any[] = []
) =>
  flattenBlocks(blocks).some(
    block =>
      block?.type === "title" &&
      getBlockText(block).length >= 20
  );

const hasHeroSemanticBlock = (
  blocks: any[] = []
) =>
  flattenBlocks(blocks).some(
    block => {
      const semanticType =
        block?.meta?.semanticType ||
        block?.data?.meta?.semanticType;

      return (
        semanticType === "HERO_SECTION" ||
        semanticType === "HERO"
      );
    }
  );

const collectSemanticTypes = (
  blocks: any[] = []
): string[] => {
  const result: string[] = [];

  const walk = (
    items: any[]
  ) => {
    items.forEach(
      item => {
        const semanticType =
          item?.meta?.semanticType ||
          item?.data?.meta?.semanticType ||
          item?.data?.props?.semantic?.semanticIntent;

        if (semanticType) {
          result.push(
            String(semanticType)
          );
        }

        if (
          item?.children?.length
        ) {
          walk(
            item.children
          );
        }
      }
    );
  };

  walk(blocks);

  return Array.from(
    new Set(result)
  );
};

const hasQualityHeroBlock = (
  blocks: any[] = []
) => {
  const allBlocks = flattenBlocks(blocks);
  
  return allBlocks.some(block => {
    const semanticType =
      block?.meta?.semanticType ||
      block?.data?.meta?.semanticType;
    
    if (
      semanticType !== "HERO_SECTION" &&
      semanticType !== "HERO"
    ) {
      return false;
    }
    
    // تحقق من وجود title كبير
    const titleBlocks = flattenBlocks([block]).filter(
      child => child?.type === "title"
    );
    
    return titleBlocks.some(title =>
      getBlockText(title).length >= 20
    );
  });
};

const shouldUseStyledZipFallback = (
  blocks: any[] = []
) => {
  if (blocks.length === 0) {
    return true;
  }

  // ✅ استعمل fallback فقط إذا hero ضعيف
  if (hasQualityHeroBlock(blocks)) {
    return false;
  }

  return !hasMeaningfulTitleBlock(blocks);
};

const normalizeText = (
  value: string | null | undefined
) =>
  (value || "")
    .replace(/\s+/g, " ")
    .trim();

const responsiveStyle = (
  desktop: Record<string, any> = {},
  tablet: Record<string, any> = {},
  mobile: Record<string, any> = {}
) => ({
  desktop,
  tablet: {
    ...desktop,
    ...tablet
  },
  mobile: {
    ...desktop,
    ...mobile
  }
});

const waitForStyleApplication = () =>
  new Promise<void>(
    resolve =>
      requestAnimationFrame(
        () =>
          requestAnimationFrame(
            () => resolve()
          )
      )
  );

const readComputedStyle = (
  element: Element | null | undefined,
  properties: string[]
) => {
  if (!element) {
    return {};
  }

  const style =
    element.ownerDocument.defaultView
      ?.getComputedStyle(element);

  if (!style) {
    return {};
  }

  return properties.reduce(
    (
      output,
      property
    ) => {
      const value =
        style.getPropertyValue(property);

      if (
        value &&
        value !== "normal" &&
        value !== "none" &&
        value !== "auto"
      ) {
        const camelKey =
          property.replace(
            /-([a-z])/g,
            (_match, letter) =>
              letter.toUpperCase()
          );

        output[camelKey] =
          value.trim();
      }

      return output;
    },
    {} as Record<string, any>
  );
};

const boxStyle = (
  element: Element | null | undefined
) =>
  readComputedStyle(
    element,
    [
      "background",
      "background-color",
      "background-image",
      "background-size",
      "background-position",
      "background-repeat",
      "color",
      "padding",
      "padding-top",
      "padding-right",
      "padding-bottom",
      "padding-left",
      "margin",
      "margin-top",
      "margin-right",
      "margin-bottom",
      "margin-left",
      "max-width",
      "min-height",
      "border",
      "border-top",
      "border-right",
      "border-bottom",
      "border-left",
      "border-radius",
      "box-shadow",
      "display",
      "gap",
      "row-gap",
      "column-gap",
      "grid-template-columns",
      "align-items",
      "justify-content",
      "flex-direction",
      "font-family",
      "box-sizing",
      "overflow"
    ]
  );

const isTransparentPaint = (
  value: any
) => {
  const text =
    String(value || "")
      .trim()
      .toLowerCase();

  return (
    !text ||
    text === "transparent" ||
    text === "initial" ||
    text === "inherit" ||
    text === "none" ||
    text === "rgba(0, 0, 0, 0)" ||
    text === "rgba(0,0,0,0)" ||
    /rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*0\s*\)/i.test(text)
  );
};

const isDefaultWhitePaint = (
  value: any
) => {
  const text =
    String(value || "")
      .trim()
      .toLowerCase();

  return (
    text === "#fff" ||
    text === "#ffffff" ||
    text === "white" ||
    text === "rgb(255, 255, 255)" ||
    text === "rgba(255, 255, 255, 1)" ||
    /^rgb\(\s*255\s*,\s*255\s*,\s*255\s*\)/i.test(text) ||
    /^rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*1\s*\)/i.test(text)
  );
};

const hasVisibleBackground = (
  style: Record<string, any>
) => {
  const backgroundImage =
    String(
      style.backgroundImage || ""
    )
      .trim()
      .toLowerCase();

  if (
    backgroundImage &&
    backgroundImage !== "none"
  ) {
    return true;
  }

  return !(
    isTransparentPaint(style.background) &&
    isTransparentPaint(style.backgroundColor)
  );
};

const documentSurfaceProperties = [
  "background",
  "background-color",
  "background-image",
  "background-size",
  "background-position",
  "background-repeat",
  "color",
  "font-family"
];

const getDocumentSurfaceStyle = (
  document: Document
) => {
  const bodyStyle =
    readComputedStyle(
      document.body,
      documentSurfaceProperties
    );

  const htmlStyle =
    readComputedStyle(
      document.documentElement,
      documentSurfaceProperties
    );

  const bodyHasSurface =
    hasVisibleBackground(bodyStyle) &&
    !isDefaultWhitePaint(bodyStyle.background) &&
    !isDefaultWhitePaint(bodyStyle.backgroundColor);

  const surface =
    bodyHasSurface
      ? bodyStyle
      : {
          ...bodyStyle,
          ...htmlStyle,
          color:
            bodyStyle.color ||
            htmlStyle.color,
          fontFamily:
            bodyStyle.fontFamily ||
            htmlStyle.fontFamily
        };

  return Object.fromEntries(
    Object.entries(surface).filter(
      ([, value]) =>
        value !== undefined &&
        value !== ""
    )
  );
};

const withoutLayoutDisplay = (
  style: Record<string, any>
) => {
  const next = {
    ...style
  };

  delete next.display;
  delete next.flexDirection;
  delete next.alignItems;
  delete next.justifyContent;

  return next;
};

const usableMaxWidth = (
  value: any,
  fallback = "1180px"
) => {
  const text =
    String(value || "").trim();

  if (
    !text ||
    text === "none" ||
    text === "100%" ||
    text === "auto"
  ) {
    return fallback;
  }

  return text;
};

const textStyle = (
  element: Element | null | undefined
) =>
  readComputedStyle(
    element,
    [
      "color",
      "font-family",
      "font-size",
      "font-weight",
      "line-height",
      "letter-spacing",
      "text-align",
      "text-transform",
      "margin",
      "margin-top",
      "margin-bottom",
      "max-width",
      "width",
      "opacity"
    ]
  );

const heroTitleSegmentStyle = (
  element: Element | null | undefined
) =>
  readComputedStyle(
    element,
    [
      "color",
      "background",
      "background-image",
      "-webkit-background-clip",
      "-webkit-text-fill-color",
      "font-size",
      "font-weight",
      "line-height",
      "letter-spacing",
      "text-transform"
    ]
  );

const createFallbackBlock = (
  type: string,
  props: Record<string, any> = {},
  style: Record<string, any> = {},
  children: any[] = [],
  meta: Record<string, any> = {}
) => ({
  id:
    `${type}-fallback-${generateUniqueId()}`,
  type,
  data: {
    props,
    style,
    meta
  },
  meta,
  children
});

const createFallbackFlexItem = (
  children: any[],
  gap = "20px",
  importFallback =
    "html-zip-empty-semantic"
) =>
  createFallbackBlock(
    "flexItem",
    {},
    responsiveStyle({
      width: "100%",
      minWidth: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "stretch",
      gap,
      boxSizing: "border-box"
    }),
    children,
    {
      importFallback
    }
  );

const isMeaningfulElement = (
  element: Element
) => {
  const tag =
    element.tagName.toLowerCase();

  const id =
    element.getAttribute("id") || "";

  if (
    [
      "script",
      "style",
      "noscript",
      "link",
      "meta",
      "nav",
      "footer"
    ].includes(tag)
  ) {
    return false;
  }

  if (
    id === "site-nav" ||
    id === "site-footer"
  ) {
    return false;
  }

  return !!normalizeText(
    element.textContent
  );
};

const findFirstText = (
  root: Element,
  selector: string
) =>
  normalizeText(
    root.querySelector(selector)
      ?.textContent
  );

const isNestedInside = (
  element: Element,
  candidates: Element[]
) =>
  candidates.some(
    candidate =>
      candidate !== element &&
      candidate.contains(element)
  );

const collectCardElements = (
  root: Element
) => {
  const candidates =
    Array.from(
      root.querySelectorAll(
        "article, li, .card, [class*='card']"
      )
    ).filter(isMeaningfulElement);

  return candidates.filter(
    element =>
      !isNestedInside(
        element,
        candidates
      )
  );
};

const compileFallbackTextBlock = (
  text: string,
  role = "text",
  sourceElement?: Element | null
) =>
  createFallbackBlock(
    role === "title" ? "title" : "text",
    role === "title"
      ? { content: text }
      : { text, content: text },
    responsiveStyle({
      ...textStyle(sourceElement),
      width: "100%",
      maxWidth: "100%",
      overflowWrap: "break-word",
      wordBreak: "normal",
      whiteSpace: "normal"
    }),
    [],
    {
      importFallback:
        "html-zip-empty-semantic"
    }
  );

const compileFallbackStyledTitleBlock = (
  text: string,
  sourceElement: Element | null | undefined
) => {
  const sourceStyle = {
    ...textStyle(sourceElement),
    ...heroTitleSegmentStyle(sourceElement)
  };

  const backgroundImage =
    sourceStyle.backgroundImage ||
    sourceStyle.background;

  const hasTextGradient =
    !!backgroundImage &&
    String(backgroundImage).trim() !== "none" &&
    (
      String(sourceStyle.WebkitBackgroundClip || "")
        .toLowerCase() === "text" ||
      String(sourceStyle.backgroundClip || "")
        .toLowerCase() === "text" ||
      isTransparentPaint(
        sourceStyle.WebkitTextFillColor
      )
    );

  const outerStyle = {
    ...sourceStyle
  };

  if (hasTextGradient) {
    delete outerStyle.background;
    delete outerStyle.backgroundImage;
    delete outerStyle.backgroundClip;
    delete outerStyle.WebkitBackgroundClip;
    delete outerStyle.WebkitTextFillColor;
  }

  return createFallbackBlock(
    "title",
    hasTextGradient
      ? {
          content: text,
          segments: [
            {
              text,
              variant: "accent",
              style: {
                backgroundImage
              }
            }
          ]
        }
      : {
          content: text
        },
    responsiveStyle({
      ...outerStyle,
      width: "100%",
      maxWidth: "100%",
      overflowWrap: "break-word",
      wordBreak: "normal",
      whiteSpace: "normal"
    }),
    [],
    {
      importFallback:
        "html-zip-hero-title-segment"
    }
  );
};

const inlineTitleTags = new Set([
  "span",
  "strong",
  "em",
  "b",
  "i",
  "mark",
  "small",
  "a"
]);

const compileFallbackHeroTitleBlocks = (
  titleElement: Element | null | undefined
) => {
  if (!titleElement) {
    return [];
  }

  const hasInlineChildren =
    Array.from(
      titleElement.children
    ).some(child =>
      inlineTitleTags.has(
        child.tagName.toLowerCase()
      ) &&
      !!normalizeText(
        child.textContent
      )
    );

  if (!hasInlineChildren) {
    const title =
      normalizeText(
        titleElement.textContent
      );

    return title
      ? [
          compileFallbackTextBlock(
            title,
            "title",
            titleElement
          )
        ]
      : [];
  }

  const segments =
    Array.from(
      titleElement.childNodes
    )
      .map(node => {
        if (
          node.nodeType ===
          Node.TEXT_NODE
        ) {
          const text =
            normalizeText(
              node.textContent
            );

          return text
            ? {
                text,
                element:
                  titleElement
              }
            : null;
        }

        if (
          node.nodeType !==
          Node.ELEMENT_NODE
        ) {
          return null;
        }

        const element =
          node as Element;

        if (
          !inlineTitleTags.has(
            element.tagName.toLowerCase()
          )
        ) {
          return null;
        }

        const text =
          normalizeText(
            element.textContent
          );

        return text
          ? {
              text,
              element
            }
          : null;
      })
      .filter(Boolean) as Array<{
        text: string;
        element: Element;
      }>;

  console.log(
    "ZIP_FALLBACK_HERO_TITLE_SEGMENTS",
    segments.map(segment => ({
      text:
        segment.text,
      styleKeys:
        Object.keys(
          heroTitleSegmentStyle(
            segment.element
          )
        )
    }))
  );

  if (!segments.length) {
    const title =
      normalizeText(
        titleElement.textContent
      );

    return title
      ? [
          compileFallbackTextBlock(
            title,
            "title",
            titleElement
          )
        ]
      : [];
  }

  return segments.map(segment =>
    compileFallbackStyledTitleBlock(
      segment.text,
      segment.element
    )
  );
};

const compileFallbackCard = (
  card: Element
) => {
  const tagElement =
    card.querySelector(
      ".tag, .badge, .eyebrow, [class*='tag'], [class*='badge']"
    );

  const tag =
    normalizeText(
      tagElement?.textContent
    );

  const titleElement =
    card.querySelector(
      "h1, h2, h3, h4, h5, h6"
    );

  const title =
    normalizeText(
      titleElement?.textContent
    );

  const paragraphElements =
    Array.from(
      card.querySelectorAll("p")
    );

  const paragraphs =
    paragraphElements
      .map(element => ({
        element,
        text:
          normalizeText(
            element.textContent
          )
      }))
      .filter(item => item.text);

  const chipText =
    Array.from(
      card.querySelectorAll(
        ".topics span, .chips span, [class*='topic'] span, [class*='chip'] span"
      )
    )
      .map(element =>
        normalizeText(
          element.textContent
        )
      )
      .filter(Boolean)
      .join(" · ");

  const children = [
    tag &&
      compileFallbackTextBlock(
        tag,
        "text",
        tagElement
      ),
    title &&
      compileFallbackTextBlock(
        title,
        "title",
        titleElement
      ),
    ...paragraphs.map(item =>
      compileFallbackTextBlock(
        item.text,
        "text",
        item.element
      )
    ),
    chipText &&
      compileFallbackTextBlock(
        chipText,
        "text",
        card.querySelector(".topics, .chips, [class*='topic'], [class*='chip']")
      )
  ].filter(Boolean);

  return createFallbackBlock(
    "gridItem",
    {},
    responsiveStyle({
      ...withoutLayoutDisplay(
        boxStyle(card)
      ),
      width: "100%",
      minWidth: 0,
      padding:
        boxStyle(card).padding ||
        "24px",
      display: "block",
      boxSizing: "border-box"
    }),
    children,
    {
      importFallback:
        "html-zip-empty-semantic"
    }
  );
};

const isHeroLikeSection = (
  section: Element
) => {
  const marker =
    `${section.id || ""} ${section.className || ""}`
      .toLowerCase();

  return (
    marker.includes("hero") ||
    marker.includes("masthead") ||
    !!section.querySelector("h1")
  );
};

// =====================================
// COMPILE FALLBACK HERO SECTION
// =====================================

const compileFallbackHeroSection = (
  section: Element,
  documentSurface: Record<string, any> = {}
) => {
  const eyebrowElement =
    section.querySelector(
      ".eyebrow, .tag, .badge, [class*='eyebrow'], [class*='tag'], [class*='badge']"
    );

  const titleElement =
    section.querySelector(
      "h1"
    );

  const leadElement =
    section.querySelector(
      ".lead, [class*='lead'], p"
    );

  const titleBlocks =
    compileFallbackHeroTitleBlocks(
      titleElement
    );

  const children = [
    eyebrowElement &&
      compileFallbackTextBlock(
        normalizeText(
          eyebrowElement.textContent
        ),
        "text",
        eyebrowElement
      ),

    ...titleBlocks,

    leadElement &&
      compileFallbackTextBlock(
        normalizeText(
          leadElement.textContent
        ),
        "text",
        leadElement
      )
  ].filter(Boolean);

  if (
    !children.length
  ) {
    return null;
  }

  const container =
    section.querySelector(
      ".container, [class*='container']"
    ) || section;

  // ✅ إنشاء flexItem يحتوي على children
  const heroFlexItem =
    createFallbackFlexItem(
      children,
      boxStyle(container).gap ||
        "24px",
      "html-zip-hero-fallback"
    );

  // ✅ flex يحتوي على flexItem واحد
  const flex =
    createFallbackBlock(
      "flex",
      {},
      responsiveStyle({
        ...withoutLayoutDisplay(
          boxStyle(container)
        ),
        display: "flex",
        flexDirection: "column",
        gap:
          boxStyle(container).gap ||
          "24px",
        width: "100%",
        maxWidth:
          usableMaxWidth(
            boxStyle(container).maxWidth,
            "1180px"
          ),
        marginLeft: "auto",
        marginRight: "auto",
        boxSizing: "border-box"
      }),
      [
        heroFlexItem
      ],
      {
        importFallback:
          "html-zip-hero-fallback"
      }
    );

  const rawHeroSectionStyle =
    withoutLayoutDisplay(
      boxStyle(section)
    );

  const heroNeedsDocumentSurface =
    !hasVisibleBackground(
      rawHeroSectionStyle
    ) ||
    isTransparentPaint(
      rawHeroSectionStyle.background
    ) ||
    isTransparentPaint(
      rawHeroSectionStyle.backgroundColor
    ) ||
    isDefaultWhitePaint(
      rawHeroSectionStyle.background
    ) ||
    isDefaultWhitePaint(
      rawHeroSectionStyle.backgroundColor
    );

  const heroSectionBaseStyle =
    heroNeedsDocumentSurface
      ? {
          ...rawHeroSectionStyle,
          background:
            documentSurface.background ||
            rawHeroSectionStyle.background,
          backgroundColor:
            documentSurface.backgroundColor ||
            documentSurface.background ||
            rawHeroSectionStyle.backgroundColor,
          backgroundImage:
            documentSurface.backgroundImage ||
            rawHeroSectionStyle.backgroundImage,
          backgroundSize:
            documentSurface.backgroundSize ||
            rawHeroSectionStyle.backgroundSize,
          backgroundPosition:
            documentSurface.backgroundPosition ||
            rawHeroSectionStyle.backgroundPosition,
          backgroundRepeat:
            documentSurface.backgroundRepeat ||
            rawHeroSectionStyle.backgroundRepeat,
          color:
            documentSurface.color ||
            rawHeroSectionStyle.color
        }
      : rawHeroSectionStyle;

  return createFallbackBlock(
    "section",
    {},
    responsiveStyle({
      ...heroSectionBaseStyle,
      width: "100%",
      maxWidth: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "stretch",
      padding:
        boxStyle(section).padding ||
        "96px 24px 72px",
      boxSizing: "border-box",
      overflow: "visible"
    }),
    [flex],
    {
      importFallback:
        "html-zip-hero-fallback"
    }
  );
};

// =====================================
// COMPILE FALLBACK SECTION
// =====================================

const compileFallbackSection = (
  section: Element,
  documentSurface: Record<string, any>
) => {
  if (isHeroLikeSection(section)) {
    return compileFallbackHeroSection(section, documentSurface);
  }

  const cards =
    collectCardElements(
      section
    );

  const titleElement =
  Array.from(
    section.querySelectorAll(
      "h1, h2, h3"
    )
  ).find(
    heading =>
      !cards.some(
        card =>
          card.contains(
            heading
          )
      )
  ) || null;

  const title =
    normalizeText(
      titleElement?.textContent
    );

  const gridElement =
    section.querySelector(
      ".grid, [class*='grid']"
    ) ||
    (
      cards.length
        ? cards[0].parentElement
        : null
    );

  const sectionContainer =
    section.querySelector(
      ".container, [class*='container']"
    );

  const cardSet =
    new Set(cards);

  const sectionComputedStyle =
    withoutLayoutDisplay(
      boxStyle(section)
    );

  const sectionNeedsDocumentSurface =
    !hasVisibleBackground(
      sectionComputedStyle
    ) ||
    isDefaultWhitePaint(
      sectionComputedStyle.background
    ) ||
    isDefaultWhitePaint(
      sectionComputedStyle.backgroundColor
    );

  const sectionBaseStyle =
    sectionNeedsDocumentSurface
      ? {
          ...sectionComputedStyle,
          background:
            documentSurface.background ||
            sectionComputedStyle.background,
          backgroundColor:
            documentSurface.backgroundColor ||
            sectionComputedStyle.backgroundColor,
          backgroundImage:
            documentSurface.backgroundImage ||
            sectionComputedStyle.backgroundImage,
          backgroundSize:
            documentSurface.backgroundSize ||
            sectionComputedStyle.backgroundSize,
          backgroundPosition:
            documentSurface.backgroundPosition ||
            sectionComputedStyle.backgroundPosition,
          backgroundRepeat:
            documentSurface.backgroundRepeat ||
            sectionComputedStyle.backgroundRepeat,
          color:
            documentSurface.color ||
            sectionComputedStyle.color,
          fontFamily:
            documentSurface.fontFamily ||
            sectionComputedStyle.fontFamily
        }
      : sectionComputedStyle;

  const paragraphs =
    Array.from(
      section.querySelectorAll("p")
    )
      .filter(
        paragraph =>
          !cards.some(card =>
            card.contains(paragraph)
          )
      )
      .map(paragraph =>
        normalizeText(
          paragraph.textContent
        )
      )
      .filter(Boolean)
      .slice(0, 3);
















const contentChildren: any[] = [];

if (title) {
  contentChildren.push(
    compileFallbackTextBlock(
      title,
      "title",
      titleElement
    )
  );
}

contentChildren.push(
  ...paragraphs.map(text =>
    compileFallbackTextBlock(
      text
    )
  )
);

let cardsGridBlock:
  any | null = null;

if (cards.length >= 2) {
  cardsGridBlock =
    createFallbackBlock(
      "grid",
      {},
      responsiveStyle(
        {
          ...withoutLayoutDisplay(
            boxStyle(
              gridElement ||
              section
            )
          ),

          display:
            "grid",

          gridTemplateColumns:
            boxStyle(
              gridElement ||
              section
            ).gridTemplateColumns ||
            "repeat(2, minmax(0, 1fr))",

          gap:
            boxStyle(
              gridElement ||
              section
            ).gap ||
            "24px",

          width:
            "100%",

          boxSizing:
            "border-box"
        },

        {
          gridTemplateColumns:
            "repeat(2, minmax(0, 1fr))"
        },

        {
          gridTemplateColumns:
            "1fr"
        }
      ),

      cards.map(
        compileFallbackCard
      ),

      {
        importFallback:
          "html-zip-empty-semantic"
      }
    );
} else if (
  !contentChildren.length
) {
  const text =
    normalizeText(
      section.textContent
    );

  if (text) {
    contentChildren.push(
      compileFallbackTextBlock(
        text
      )
    );
  }
}

const sectionChildren:
  any[] = [];

if (
  contentChildren.length > 0
) {
  const contentGap =
    boxStyle(
      sectionContainer ||
      section
    ).gap ||
    "20px";

  const contentFlexItem =
    createFallbackFlexItem(
      contentChildren,
      contentGap,
      "html-zip-empty-semantic"
    );

  const flex =
    createFallbackBlock(
      "flex",
      {},
      responsiveStyle({
        ...withoutLayoutDisplay(
          boxStyle(
            sectionContainer ||
            section
          )
        ),

        display:
          "flex",

        flexDirection:
          "column",

        gap:
          contentGap,

        width:
          "100%",

        maxWidth:
          usableMaxWidth(
            boxStyle(
              sectionContainer ||
              section
            ).maxWidth
          ),

        marginLeft:
          "auto",

        marginRight:
          "auto",

        boxSizing:
          "border-box"
      }),

      [
        contentFlexItem
      ],

      {
        importFallback:
          "html-zip-empty-semantic"
      }
    );

  sectionChildren.push(
    flex
  );
}

if (cardsGridBlock) {
  sectionChildren.push(
    cardsGridBlock
  );
}

if (
  sectionChildren.length === 0
) {
  return null;
}













  return createFallbackBlock(
    "section",
    {},
    responsiveStyle({
      ...sectionBaseStyle,
      width: "100%",
      maxWidth: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "stretch",
      padding:
        sectionComputedStyle.padding ||
        "72px 24px",
      boxSizing: "border-box",
      overflow: "visible"
    }),
    sectionChildren,
    {
      importFallback:
        "html-zip-empty-semantic"
    }
  );
};

const decodeBasicEntities = (
  value: string
) =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'");

const stripHtmlToText = (
  html: string
) =>
  decodeBasicEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );

const pickFirstHtmlText = (
  html: string,
  pattern: RegExp
) => {
  const match =
    html.match(pattern);

  return match?.[1]
    ? stripHtmlToText(match[1])
    : "";
};

const fallbackBlocksFromRawHtml = (
  html: string
) => {
  const title =
    pickFirstHtmlText(
      html,
      /<h1\b[^>]*>([\s\S]*?)<\/h1>/i
    ) ||
    pickFirstHtmlText(
      html,
      /<title\b[^>]*>([\s\S]*?)<\/title>/i
    ) ||
    "Imported page";

  const paragraphs =
    Array.from(
      html.matchAll(
        /<(?:p|li|h2|h3)\b[^>]*>([\s\S]*?)<\/(?:p|li|h2|h3)>/gi
      )
    )
      .map(match =>
        stripHtmlToText(
          match[1] || ""
        )
      )
      .filter(Boolean);

  const text =
    paragraphs.length
      ? paragraphs.join("\n\n")
      : stripHtmlToText(html);

  const links =
    Array.from(
      html.matchAll(
        /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi
      )
    )
      .map(match => ({
        href:
          match[1] || "#",
        label:
          stripHtmlToText(
            match[2] || ""
          )
      }))
      .filter(link =>
        link.label
      )
      .slice(0, 3);

  return [
    {
      id:
        "zip-raw-fallback-section",
      type:
        "section",
      meta: {
        semanticType:
          "HTML_ZIP_RAW_FALLBACK"
      },
      data: {
        props: {},
        style: responsiveStyle({
          padding: "80px 24px",
          backgroundColor: "#020b18",
          color: "#f8fafc"
        })
      },
      children: [
        {
          id:
            "zip-raw-fallback-flex",
          type:
            "flex",
          data: {
            props: {},
            style: responsiveStyle({
              maxWidth: "1120px",
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              gap: "24px"
            })
          },
          children: [
            {
              id:
                "zip-raw-fallback-item",
              type:
                "flexItem",
              data: {
                props: {},
                style: responsiveStyle({
                  display: "flex",
                  flexDirection: "column",
                  gap: "18px"
                })
              },
              children: [
                {
                  id:
                    "zip-raw-fallback-title",
                  type:
                    "title",
                  data: {
                    props: {
                      content:
                        title
                    },
                    style: responsiveStyle({
                      color: "#f8fafc",
                      fontSize: "clamp(32px, 5vw, 64px)",
                      lineHeight: "1.08",
                      fontWeight: 800
                    })
                  },
                  children: []
                },
                {
                  id:
                    "zip-raw-fallback-text",
                  type:
                    "text",
                  data: {
                    props: {
                      content:
                        text
                    },
                    style: responsiveStyle({
                      color: "#9fb7d2",
                      fontSize: "16px",
                      lineHeight: "1.75",
                      whiteSpace: "pre-line"
                    })
                  },
                  children: []
                },
                ...links.map(
                  (link, index) => ({
                    id:
                      `zip-raw-fallback-link-${index}`,
                    type:
                      "link",
                    data: {
                      props: {
                        href:
                          link.href,
                        label:
                          link.label
                      },
                      style: responsiveStyle({
                        color: "#f77f00",
                        fontWeight: 700
                      })
                    },
                    children: []
                  })
                )
              ]
            }
          ]
        }
      ]
    }
  ];
};

const fallbackBlocksFromHtml = async (
  html: string
) => {
  if (
    typeof window === "undefined" ||
    !window.document
  ) {
    return fallbackBlocksFromRawHtml(
      html
    );
  }

  const frame =
    window.document.createElement(
      "iframe"
    );

  frame.setAttribute(
    "aria-hidden",
    "true"
  );

  Object.assign(
    frame.style,
    {
      position: "absolute",
      left: "-99999px",
      top: "-99999px",
      width: "1440px",
      height: "2400px",
      border: "0",
      visibility: "hidden"
    }
  );

  window.document.body.appendChild(
    frame
  );

  const document =
    frame.contentDocument;

  if (!document) {
    frame.remove();
    return [];
  }

  document.open();
  document.write(html);
  document.close();

  await waitForStyleApplication();

  document
    .querySelectorAll(
      "script, noscript, link, meta, #site-nav, #site-footer"
    )
    .forEach(element =>
      element.remove()
    );

  const body =
    document.body;

  const documentSurface =
    getDocumentSurfaceStyle(
      document
    );

  const roots =
    Array.from(
      body.children
    ).filter(isMeaningfulElement);

  const sectionRoots =
    roots.length
      ? roots
      : [
          body
        ];

  const blocks =
    sectionRoots
    .map(section =>
      compileFallbackSection(
        section,
        documentSurface
      )
    )
    .filter(Boolean);

  frame.remove();

  return blocks.length
    ? blocks
    : fallbackBlocksFromRawHtml(
        html
      );
};

const readFirstHeroSurfaceFromHtml = async (
  html: string
) => {
  if (
    typeof window === "undefined" ||
    !window.document
  ) {
    return null;
  }

  const frame =
    window.document.createElement(
      "iframe"
    );

  frame.setAttribute(
    "aria-hidden",
    "true"
  );

  Object.assign(
    frame.style,
    {
      position: "absolute",
      left: "-99999px",
      top: "-99999px",
      width: "1440px",
      height: "1600px",
      border: "0",
      visibility: "hidden"
    }
  );

  window.document.body.appendChild(
    frame
  );

  const document =
    frame.contentDocument;

  if (!document) {
    frame.remove();
    return null;
  }

  document.open();
  document.write(html);
  document.close();

  await waitForStyleApplication();

  const hero =
    document.querySelector(
      "header.page-hero, section.page-hero, header.hero, section.hero, .hero, [class*='hero']"
    ) ||
    Array.from(
      document.body.children
    ).find(element =>
      !!element.querySelector?.("h1")
    );

  const heroStyle =
    hero
      ? withoutLayoutDisplay(
          boxStyle(hero)
        )
      : null;

  const documentSurface =
    getDocumentSurfaceStyle(
      document
    );

  frame.remove();

  if (
    !heroStyle &&
    !hasVisibleBackground(
      documentSurface
    )
  ) {
    return null;
  }

  return {
    ...(documentSurface || {}),
    ...(heroStyle || {})
  };
};

// =====================================
// TYPES
// =====================================
const normalizePaintValue = (
  value: unknown
) =>
  String(value || "")
    .replace(/\s+/g, "")
    .toLowerCase();

const isWhiteOrMissingPaint = (
  value: unknown
) => {
  const normalized =
    normalizePaintValue(value);

  return (
    !normalized ||
    normalized === "transparent" ||
    normalized === "none" ||
    normalized === "white" ||
    normalized === "#fff" ||
    normalized === "#ffffff" ||
    normalized === "rgb(255,255,255)" ||
    normalized === "rgba(255,255,255,1)" ||
    normalized.includes("rgb(255,255,255)")
  );
};

const blockHasLightText = (
  block: any
): boolean => {
  const desktop =
    block?.data?.style?.desktop ||
    block?.style?.desktop ||
    {};

  const color =
    normalizePaintValue(desktop.color);

  return (
    color.includes("rgb(240,246,255)") ||
    color.includes("rgb(248,250,252)") ||
    color === "#f0f6ff" ||
    color === "#f8fafc" ||
    color === "white" ||
    color === "#fff" ||
    (block?.children || []).some(blockHasLightText)
  );
};

const blockHasLargeTitle = (
  block: any
): boolean => {
  const text =
    getBlockText(block);

  return (
    (block?.type === "title" && text.length >= 20) ||
    (block?.children || []).some(blockHasLargeTitle)
  );
};

const findDarkSurfaceFromSections = (
  blocks: any[]
) => {
  for (const block of blocks) {
    if (block?.type !== "section") {
      continue;
    }

    const desktop =
      block?.data?.style?.desktop ||
      block?.style?.desktop ||
      {};

    const paint =
      desktop.backgroundColor ||
      desktop.background ||
      desktop.backgroundImage;

    if (
      paint &&
      !isWhiteOrMissingPaint(paint)
    ) {
      return {
        background:
          desktop.background || paint,

        backgroundColor:
          desktop.backgroundColor || paint,

        backgroundImage:
          desktop.backgroundImage,

        backgroundSize:
          desktop.backgroundSize,

        backgroundPosition:
          desktop.backgroundPosition,

        backgroundRepeat:
          desktop.backgroundRepeat,

        color:
          desktop.color || "#f8fafc"
      };
    }
  }

  return null;
};

const repairHeroLikeSectionSurface = (
  blocks: any[],
  sourceSurface: Record<string, any> | null = null
) => {
  const darkSurface =
    sourceSurface &&
    hasVisibleBackground(sourceSurface) &&
    !isWhiteOrMissingPaint(
      sourceSurface.background ||
      sourceSurface.backgroundColor
    )
      ? {
          background:
            sourceSurface.background ||
            sourceSurface.backgroundColor,

          backgroundColor:
            sourceSurface.backgroundColor ||
            sourceSurface.background,

          backgroundImage:
            sourceSurface.backgroundImage,

          backgroundSize:
            sourceSurface.backgroundSize,

          backgroundPosition:
            sourceSurface.backgroundPosition,

          backgroundRepeat:
            sourceSurface.backgroundRepeat,

          color:
            sourceSurface.color || "#f8fafc"
        }
      : findDarkSurfaceFromSections(blocks);

  if (!darkSurface) {
    return {
      blocks,
      repaired:
        false,
      surface:
        null
    };
  }

  let repaired = false;

  const nextBlocks = blocks.map((block, index) => {
    if (block?.type !== "section") {
      return block;
    }

    const desktop =
      block?.data?.style?.desktop ||
      block?.style?.desktop ||
      {};

    const currentPaint =
      desktop.background ||
      desktop.backgroundColor ||
      desktop.backgroundImage;

    const looksLikeHero =
      index === 0 &&
      blockHasLargeTitle(block) &&
      blockHasLightText(block);

    if (
      !looksLikeHero ||
      !isWhiteOrMissingPaint(currentPaint)
    ) {
      return block;
    }

    repaired = true;

    return {
      ...block,
      data: {
        ...(block.data || {}),
        style: {
          ...(block.data?.style || {}),
          desktop: {
            ...desktop,
            ...darkSurface
          },
          tablet: {
            ...(block.data?.style?.tablet || {})
          },
          mobile: {
            ...(block.data?.style?.mobile || {})
          }
        }
      }
    };
  });

  return {
    blocks:
      nextBlocks,
    repaired,
    surface:
      darkSurface
  };
};

type ExecuteZipWebsiteImportParams = {
  zipFile: File;
  siteId: number;

  uploadHtmlZip: any;
  updateGlobalLayout: any;
  createPage: any;
  publishPage: any;
  getPages?: any;
  updatePage?: any;

  onHomepageImported?: (
    blocks: any[]
  ) => void;

  onProgress?: (
    message: string
  ) => void;
};

type ZipImportPageFailure = {
  title: string;
  slug: string;
  requestedSlug: string;
  sourceFile?: string;
  message: string;
  httpStatus?: unknown;
  backendCode?: string;
  backendMessage?: string;
  responseBody?: unknown;
};

type ZipImportCreatedPage = {
  title: string;
  slug: string;
  sourceFile?: string;
  pageId?: number | string;
};

export class ZipWebsiteImportError extends Error {
  result: {
    createdPages: ZipImportCreatedPage[];
    failedPages: ZipImportPageFailure[];
  };

  constructor(
    message: string,
    result: {
      createdPages: ZipImportCreatedPage[];
      failedPages: ZipImportPageFailure[];
    }
  ) {
    super(message);
    this.name = "ZipWebsiteImportError";
    this.result = result;
  }
}

const countBlockTypes = (
  blocks: any[] = []
) => {
  const counts = {
    visitorLogin: 0,
    visitorRegister: 0
  };

  const walk = (
    items: any[] = []
  ) => {
    items.forEach(block => {
      if (block?.type === "visitorLogin") {
        counts.visitorLogin += 1;
      }

      if (block?.type === "visitorRegister") {
        counts.visitorRegister += 1;
      }

      walk(block?.children || []);
    });
  };

  walk(blocks);

  return counts;
};

const getTopLevelBlockTypes = (
  blocks: any[] = []
) =>
  blocks.map(block =>
    String(block?.type || "unknown")
  );

const summarizeInvariantViolations = (
  blocks: any[] = []
) => {
  const report =
    validateTreeInvariants(
      blocks as any
    );

  return {
    valid:
      report.valid,
    violations:
      report.violations.map(
        violation => ({
          code:
            violation.code,
          path:
            violation.path,
          blockId:
            violation.blockId,
          parentId:
            violation.parentId,
          message:
            violation.message
        })
      )
  };
};

const getErrorResponseBody = (
  error: any
) =>
  error?.data ||
  error?.error ||
  error?.response?.data ||
  null;

const getErrorMessage = (
  error: any
) => {
  const body =
    getErrorResponseBody(error);

  return (
    body?.message ||
    body?.error ||
    error?.message ||
    String(error || "Unknown page import failure")
  );
};

const normalizeZipPageFailure = ({
  page,
  error,
  fallbackMessage
}: {
  page: any;
  error?: any;
  fallbackMessage?: string;
}): ZipImportPageFailure => {
  const body =
    getErrorResponseBody(error);

  return {
    title:
      page.title,
    slug:
      page.slug,
    requestedSlug:
      page.slug,
    sourceFile:
      page.sourceFile,
    message:
      fallbackMessage ||
      getErrorMessage(error),
    httpStatus:
      error?.status ||
      error?.response?.status,
    backendCode:
      body?.code ||
      body?.error,
    backendMessage:
      body?.message,
    responseBody:
      body
  };
};

const hasAuthBlockType = (
  blocks: Block[] = [],
  type: "visitorLogin" | "visitorRegister"
) =>
  Boolean(
    findFirstVisitorAuthBlock(
      blocks,
      type
    )
  );

const getPreferredLoginPath = (
  siteId: number,
  slug: string
) =>
  `/site/${siteId}/${slug}`;

const synchronizeSystemRegisterPresentation = async ({
  siteId,
  getPages,
  updatePage,
  presentationSource,
  preferredLoginPath
}: {
  siteId: number;
  getPages?: any;
  updatePage?: any;
  presentationSource: Block | null;
  preferredLoginPath: string | null;
}) => {
  if (
    !getPages ||
    !updatePage ||
    !presentationSource ||
    !preferredLoginPath
  ) {
    return {
      updated: false,
      reason:
        "missing-sync-input"
    };
  }

  const presentation =
    extractVisitorAuthPresentation(
      presentationSource
    );

  if (!presentation) {
    return {
      updated: false,
      reason:
        "missing-presentation"
    };
  }

  const pagesResponse =
    await getPages(siteId).unwrap();

  const pages =
    Array.isArray(pagesResponse?.data)
      ? pagesResponse.data
      : pagesResponse;

  const registerPage =
    (pages || []).find(
      (page: any) =>
        page?.systemType ===
          "visitor_register" ||
        (page?.slug === "register" &&
          page?.systemType !== null)
    );

  if (!registerPage) {
    return {
      updated: false,
      reason:
        "system-register-not-found"
    };
  }

  const registerBlocks =
    (registerPage.blocks || []) as Block[];

  if (
    !hasAuthBlockType(
      registerBlocks,
      "visitorRegister"
    )
  ) {
    return {
      updated: false,
      reason:
        "system-register-block-not-found"
    };
  }

  const updatedBlocks =
    updateFirstVisitorAuthBlock(
      registerBlocks,
      "visitorRegister",
      (block) =>
        applyVisitorAuthPresentationToBlock(
          block,
          presentation,
          {
            loginPath:
              preferredLoginPath
          }
        )
    );

  if (!updatedBlocks.updated) {
    return {
      updated: false,
      reason:
        "system-register-block-not-updated"
    };
  }

  await updatePage({
    siteId,
    pageId:
      registerPage.id,
    blocks:
      updatedBlocks.blocks
  }).unwrap();

  return {
    updated: true,
    pageId:
      registerPage.id
  };
};

// =====================================
// MAIN ZIP IMPORT EXECUTOR
// =====================================

export const executeZipWebsiteImport = async ({
  zipFile,
  siteId,
  uploadHtmlZip,
  updateGlobalLayout,
  createPage,
  publishPage,
  getPages,
  updatePage,
  onHomepageImported,
  onProgress
}: ExecuteZipWebsiteImportParams) => {
  // =====================================
  // 1. UPLOAD ZIP
  // =====================================

  onProgress?.(
    "Uploading ZIP..."
  );

  const result =
    await uploadHtmlZip({
      siteId,

      file:
        zipFile
    }).unwrap();

  if (
    !result.success ||
    !result.pages?.length
  ) {
    console.error(
      "ZIP import failed",
      result
    );

    throw new Error(
      "ZIP import failed"
    );
  }

  // =====================================
  // 2. IMPORT NAVBAR
  // =====================================

  onProgress?.(
    "Importing navbar..."
  );

  const navbarBlock =
    await importGlobalLayoutBlock(
      result.globalLayout?.navHtml,
      "navbar"
    );

  // =====================================
  // 3. IMPORT FOOTER
  // Footer is generic and isolated in footerToBlock.ts
  // =====================================

  onProgress?.(
    "Importing footer..."
  );

  const footerHtml =
    result.globalLayout?.footerHtml || "";

  const footerContextHtml =
    result.pages?.find(
      (page: any) =>
        page.isHomepage
    )?.processedHtml ||
    result.pages?.[0]?.processedHtml ||
    "";

  const footerBlock =
    await footerHtmlToBlock(
      footerHtml,
      footerContextHtml
    );

  // =====================================
  // 4. SAVE GLOBAL LAYOUT
  // =====================================

  await updateGlobalLayout({
    siteId,

    globalLayout: {
      navbar:
        navbarBlock,

      footer:
        footerBlock
    }
  }).unwrap();

  // =====================================
  // 5. IMPORT PAGES
  // =====================================

  const failedPages:
    ZipImportPageFailure[] = [];

  const createdPages:
    ZipImportCreatedPage[] = [];

  let importedLoginPresentationSource:
    Block | null = null;

  let preferredImportedLoginPath:
    string | null = null;

  let importedRegisterPageDetected =
    false;

  for (
    const [index, page] of result.pages.entries()
  ) {
    onProgress?.(
      `Importing page ${index + 1}/${result.pages.length}: ${page.title}`
    );

    console.log(
      "ZIP_PAGE_START",
      {
        sourceFile:
          page.sourceFile,
        inferredTitle:
          page.title,
        originalSlug:
          page.originalSlug ||
          page.rawSlug ||
          page.slug,
        resolvedSlug:
          page.slug
      }
    );

    try {
      let importError:
        unknown = null;

      const imported =
        await importHtmlDocument(
          page.processedHtml,
          {
            sourceFile:
              page.sourceFile,
            slug:
              page.slug
          }
        ).catch((error) => {
          importError =
            error;

          console.error(
            "ZIP_PAGE_IMPORT_FAILED",
            {
              sourceFile:
                page.sourceFile,
              slug:
                page.slug,
              errorName:
                error?.name,
              errorMessage:
                error?.message,
              violations:
                error?.violations
            }
          );

          return {
            blocks: [],
            warnings: [
              {
                type:
                  "IMPORT_HTML_DOCUMENT_THROWN",
                message:
                  error?.message ||
                  String(error),
                path:
                  "root"
              }
            ],
            matcherHits: []
          };
        });

      let pageOnlyBlocks =
        removeGlobalLayoutBlocks(
          imported.blocks || []
        );

      const firstSectionBeforeFallback =
        pageOnlyBlocks.find(
          (block: any) =>
            block?.type === "section"
        );

    console.log(
      "ZIP_PAGE_IMPORT_BEFORE_FALLBACK",
      {
        sourceFile:
          page.sourceFile,
        slug:
          page.slug,
        hasExplicitHeroMarkup:
          /(?:class=["'][^"']*hero|<header\b[^>]*class=["'][^"']*page-hero)/i.test(
            String(page.processedHtml || "")
          ),
        importedBlockCount:
          imported.blocks?.length || 0,
        pageOnlyBlockCount:
          pageOnlyBlocks.length,
        semanticBlockTypes:
          collectSemanticTypes(
            pageOnlyBlocks
          ),
        firstSectionDesktopBackground:
          firstSectionBeforeFallback?.data?.style?.desktop?.background ||
          firstSectionBeforeFallback?.style?.desktop?.background,
        firstSectionDesktopBackgroundColor:
          firstSectionBeforeFallback?.data?.style?.desktop?.backgroundColor ||
          firstSectionBeforeFallback?.style?.desktop?.backgroundColor
      }
    );

    // تحقق من جودة الـblocks
    let useFallback =
      Boolean(importError) ||
      shouldUseStyledZipFallback(
        pageOnlyBlocks
      );

    console.log(
      "ZIP_PAGE_FALLBACK_CHECK",
      {
        page: page.slug,
        blocksCount: pageOnlyBlocks.length,
        useFallback,
        hasHero: hasHeroSemanticBlock(pageOnlyBlocks),
        hasTitle: hasMeaningfulTitleBlock(pageOnlyBlocks)
      }
    );

    if (useFallback) {
      pageOnlyBlocks =
        await fallbackBlocksFromHtml(
          page.processedHtml
        ) as any[];

      console.warn(
        "ZIP_PAGE_STYLED_FALLBACK_USED",
        {
          page: page.slug,
          fallbackBlocks: pageOnlyBlocks.length,
          reason: "semantic import missing quality hero/title"
        }
      );
    }

    console.log(
      "ZIP_PAGE_BLOCKS_FILTERED",
      {
        page:
          page.slug,

        before:
          imported.blocks?.length || 0,

        after:
          pageOnlyBlocks.length,

        removed:
          (imported.blocks?.length || 0) -
          pageOnlyBlocks.length
      }
    );

    const sourceHeroSurface =
      await readFirstHeroSurfaceFromHtml(
        page.processedHtml
      );

    const repairResult =
      repairHeroLikeSectionSurface(
        pageOnlyBlocks,
        sourceHeroSurface
      );

    pageOnlyBlocks =
      repairResult.blocks;

    const firstSectionBeforeCreate =
      pageOnlyBlocks.find(
        (block: any) =>
          block?.type === "section"
      );

    console.log(
      "ZIP_PAGE_BEFORE_CREATE_PAYLOAD",
      {
        sourceFile:
          page.sourceFile,
        slug:
          page.slug,
        fallbackUsed:
          useFallback,
        heroSurfaceRepairUsed:
          repairResult.repaired,
        semanticBlockTypes:
          collectSemanticTypes(
            pageOnlyBlocks
          ),
        firstSectionType:
          firstSectionBeforeCreate?.type,
        firstSectionSemanticType:
          firstSectionBeforeCreate?.meta?.semanticType ||
          firstSectionBeforeCreate?.data?.meta?.semanticType ||
          "",
        firstSectionDesktop:
          firstSectionBeforeCreate?.data?.style?.desktop ||
          firstSectionBeforeCreate?.style?.desktop ||
          {},
        sourceHeroSurface:
          repairResult.surface
      }
    );

      let hydrated =
        hydrateBlocks(
          pageOnlyBlocks.map(
            (block: any) => ({
              ...block,

              props:
                block.data?.props || {},

              style:
                block.data?.style || {},

              meta:
                block.meta ||
                block.data?.meta ||
                {},

              children:
                block.children || []
            })
          )
        );
hydrated =
  normalizeCanonicalContainers(
    hydrated
  ) as any[];
      let canonicalValidation =
        summarizeInvariantViolations(
          hydrated
        );

      console.log(
        "ZIP_PAGE_CANONICAL_VALIDATION",
        {
          sourceFile:
            page.sourceFile,
          slug:
            page.slug,
          valid:
            canonicalValidation.valid,
          violations:
            canonicalValidation.violations
        }
      );

if (
  !canonicalValidation.valid &&
  !useFallback
) {
  console.warn(
    "ZIP_PAGE_CANONICAL_FALLBACK_USED",
    {
      sourceFile:
        page.sourceFile,

      slug:
        page.slug,

      violations:
        canonicalValidation.violations
    }
  );

  pageOnlyBlocks =
    await fallbackBlocksFromHtml(
      page.processedHtml
    ) as any[];

  useFallback =
    true;

  hydrated =
    hydrateBlocks(
      pageOnlyBlocks.map(
        (block: any) => ({
          ...block,

          props:
            block.data?.props || {},

          style:
            block.data?.style || {},

          meta:
            block.meta ||
            block.data?.meta ||
            {},

          children:
            block.children || []
        })
      )
    );

  hydrated =
    normalizeCanonicalContainers(
      hydrated
    ) as any[];

  canonicalValidation =
    summarizeInvariantViolations(
      hydrated
    );

  console.log(
    "ZIP_PAGE_CANONICAL_VALIDATION",
    {
      sourceFile:
        page.sourceFile,

      slug:
        page.slug,

      fallbackUsed:
        true,

      valid:
        canonicalValidation.valid,

      violations:
        canonicalValidation.violations
    }
  );
}

if (
  !canonicalValidation.valid
) {
  console.warn(
    "ZIP_PAGE_RAW_CANONICAL_FALLBACK_USED",
    {
      sourceFile:
        page.sourceFile,

      slug:
        page.slug,

      previousViolations:
        canonicalValidation.violations
    }
  );

  pageOnlyBlocks =
    fallbackBlocksFromRawHtml(
      page.processedHtml
    ) as any[];

  useFallback =
    true;

  hydrated =
    hydrateBlocks(
      pageOnlyBlocks.map(
        (block: any) => ({
          ...block,

          props:
            block.data?.props || {},

          style:
            block.data?.style || {},

          meta:
            block.meta ||
            block.data?.meta ||
            {},

          children:
            block.children || []
        })
      )
    );

  hydrated =
    normalizeCanonicalContainers(
      hydrated
    ) as any[];

  canonicalValidation =
    summarizeInvariantViolations(
      hydrated
    );

  console.log(
    "ZIP_PAGE_CANONICAL_VALIDATION",
    {
      sourceFile:
        page.sourceFile,

      slug:
        page.slug,

      rawFallbackUsed:
        true,

      valid:
        canonicalValidation.valid,

      violations:
        canonicalValidation.violations
    }
  );
}

      const authCounts =
        countBlockTypes(hydrated);

      console.log(
        "ZIP_PAGE_BEFORE_CREATE_PAYLOAD",
        {
          sourceFile:
            page.sourceFile,
          title:
            page.title,
          slug:
            page.slug,
          status:
            "draft",
          systemType:
            null,
          topLevelBlockTypes:
            getTopLevelBlockTypes(
              hydrated
            ),
          importedBlockCount:
            imported.blocks?.length || 0,
          hydratedBlockCount:
            hydrated.length,
          canonicalValidation,
          visitorLoginCount:
            authCounts.visitorLogin,
          visitorRegisterCount:
            authCounts.visitorRegister
        }
      );

      if (
        hydrated.length === 0
      ) {
        const failure =
          normalizeZipPageFailure({
            page,
            fallbackMessage:
              "ZIP_PAGE_EMPTY_BLOCKS"
          });

        console.error(
          "ZIP_PAGE_SKIPPED_EMPTY_BLOCKS",
          {
            sourceFile:
              failure.sourceFile,
            requestedSlug:
              failure.requestedSlug,
            fallbackUsed:
              useFallback,
            message:
              failure.message
          }
        );

        console.error(
          "ZIP_PAGE_CREATE_FAILED",
          {
            sourceFile:
              failure.sourceFile,
            requestedSlug:
              failure.requestedSlug,
            httpStatus:
              failure.httpStatus,
            backendErrorCode:
              failure.backendCode,
            backendErrorMessage:
              failure.backendMessage,
            fullResponseBody:
              failure.responseBody,
            message:
              failure.message
          }
        );

        failedPages.push(
          failure
        );
        continue;
      }

      if (
        !canonicalValidation.valid
      ) {
        const failure =
          normalizeZipPageFailure({
            page,
            fallbackMessage:
              `ZIP_PAGE_INVALID_CANONICAL_TREE: ${canonicalValidation.violations
                .map(violation => violation.message)
                .join("; ")}`
          });

        console.error(
          "ZIP_PAGE_CREATE_FAILED",
          {
            sourceFile:
              failure.sourceFile,
            requestedSlug:
              failure.requestedSlug,
            httpStatus:
              failure.httpStatus,
            backendErrorCode:
              failure.backendCode,
            backendErrorMessage:
              failure.backendMessage,
            fullResponseBody:
              failure.responseBody,
            canonicalValidation
          }
        );

        failedPages.push(
          failure
        );
        continue;
      }

      console.log(
        "ZIP_PAGE_CREATE_ATTEMPT",
        {
          sourceFile:
            page.sourceFile,
          slug:
            page.slug,
          title:
            page.title,
          blocks:
            hydrated.length,
          semanticBlockTypes:
            collectSemanticTypes(
              hydrated
            ),
          firstSectionDesktop:
            hydrated.find(
              (block: any) =>
                block?.type === "section"
            )?.data?.style?.desktop ||
            hydrated.find(
              (block: any) =>
                block?.type === "section"
            )?.style?.desktop ||
            {}
        }
      );

      const createdResponse =
        await createPage({
          siteId,

          title:
            page.title,

          slug:
            page.slug,

          blocks:
            hydrated as any,

          isHomepage:
            page.isHomepage
        }).unwrap();

      const createdPage =
        (createdResponse as any).data ||
        createdResponse;

      const returnedBlocks =
        Array.isArray(createdPage?.blocks)
          ? createdPage.blocks
          : [];

      await publishPage({
        siteId,

        pageId:
          createdPage.id
      }).unwrap();

      createdPages.push({
        title:
          page.title,
        slug:
          createdPage?.slug ||
          page.slug,
        sourceFile:
          page.sourceFile,
        pageId:
          createdPage?.id
      });

      if (
        authCounts.visitorRegister > 0
      ) {
        importedRegisterPageDetected =
          true;
      }

      if (
        !importedLoginPresentationSource &&
        authCounts.visitorLogin > 0
      ) {
        const loginBlock =
          findFirstVisitorAuthBlock(
            hydrated as Block[],
            "visitorLogin"
          );

        const presentation =
          extractVisitorAuthPresentation(
            loginBlock
          );

        if (loginBlock && presentation) {
          importedLoginPresentationSource =
            loginBlock;
          preferredImportedLoginPath =
            getPreferredLoginPath(
              siteId,
              createdPage?.slug ||
                page.slug
            );
        }
      }

      if (
        page.isHomepage
      ) {
        onHomepageImported?.(
          hydrated
        );
      }

    } catch (error) {
      const failure =
        normalizeZipPageFailure({
          page,
          error
        });

      console.error(
        "ZIP_PAGE_CREATE_FAILED",
        {
          sourceFile:
            failure.sourceFile,
          requestedSlug:
            failure.requestedSlug,
          httpStatus:
            failure.httpStatus,
          backendErrorCode:
            failure.backendCode,
          backendErrorMessage:
            failure.backendMessage,
          fullResponseBody:
            failure.responseBody
        }
      );

      failedPages.push(
        failure
      );

      continue;
    }
  }

  if (failedPages.length > 0) {
    const failedList =
      failedPages
        .map(
          page =>
            `${page.sourceFile || page.slug}: ${page.message}`
        )
        .join("; ");

    throw new ZipWebsiteImportError(
      `ZIP import failed for ${failedPages.length} page(s): ${failedList}`,
      {
        createdPages,
        failedPages
      }
    );
  }

  if (!importedRegisterPageDetected) {
    try {
      const syncResult =
        await synchronizeSystemRegisterPresentation({
          siteId,
          getPages,
          updatePage,
          presentationSource:
            importedLoginPresentationSource,
          preferredLoginPath:
            preferredImportedLoginPath
        });


    } catch (error) {
      const failure:
        ZipImportPageFailure = {
          title:
            "System Register",
          slug:
            "register",
          requestedSlug:
            "register",
          sourceFile:
            "system:visitor_register",
          message:
            getErrorMessage(error),
          httpStatus:
            (error as any)?.status ||
            (error as any)?.response?.status,
          backendCode:
            getErrorResponseBody(error)?.code ||
            getErrorResponseBody(error)?.error,
          backendMessage:
            getErrorResponseBody(error)?.message,
          responseBody:
            getErrorResponseBody(error)
        };
      throw new ZipWebsiteImportError(
        `ZIP import failed while styling system register: ${failure.message}`,
        {
          createdPages,
          failedPages: [
            failure
          ]
        }
      );
    }
  }

  // =====================================
  // 6. DONE
  // =====================================

  onProgress?.(
    "Import completed."
  );

  return {
    success:
      true,

    pages:
      result.pages.length,

    createdPages,

    failedPages
  };
};