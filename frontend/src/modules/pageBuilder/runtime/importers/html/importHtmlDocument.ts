import { purgeEmptyBlocks } from "../../ai/purgeEmptyBlocks";
import { normalizeTree } from "../../normalize/NormalizeTree";
import { assertTreeInvariants } from "../../validation/invariants";
import { extractComputedStyles } from "../css/extractComputedStyles";
import { extractLayoutStyles, extractTypographyStyles } from "../css/extractStyleProps";
import {
  applyDesignTokensToBlocks,
  extractDesignTokens,
  type ExtractedDesignTokens
} from "../design/extractDesignTokens";
import {
  analyzeLayoutDensity,
  applySectionVisualProfiles,
  type LayoutDensityAnalysis
} from "../design/analyzeLayoutDensity";
import {
  reconstructVisualRuntime
} from "../../design/reconstructVisualRuntime";
import { runSemanticPipeline } from "../pipeline/runSemanticPipeline";
import {semanticMatchers,SerializedBlock} from "./semanticMatchers";
import type {
  OwnershipResult as SemanticOwnershipResult,
  StructuralCandidate
} from "./semantic/ownership/ownership.types";
import {
  getElementClassName,
  getTagNameLower,
  shouldSkipImportedElement
} from "./domGuards";
import {
  extractTitleSegments
} from "./typography/extractTitleSegments";

// =====================================================
// CANONICAL BLOCK TYPES
// =====================================================

const COMPILER_BLOCK_TYPES = {
  SECTION: "section",
  NAVBAR: "navbar",
  FLEX: "flex",
  FLEX_ITEM: "flexItem",
  GRID: "grid",
  GRID_ITEM: "gridItem",
  TITLE: "title",
  TEXT: "text",
  IMAGE: "image",
  BUTTON: "button",
  LINK: "link",
} as const;

// =====================================================
// IMPORT REPORT
// =====================================================

export type ImportWarning = {
  type: string;
  message: string;
  path: string;
};

export type ImportMatcherHit = {
  matcher: string;
  score: number;
  path: string;
};

export type ImportHtmlResult = {
  blocks: SerializedBlock[];
  warnings: ImportWarning[];
  matcherHits: ImportMatcherHit[];
  designTokens?: ExtractedDesignTokens;
  layoutDensity?: LayoutDensityAnalysis;
};

export type ImportHtmlContext = {
  layout?: "page" | "navbar" | "footer";
};

// =====================================================
// IMPORT LIMITS
// =====================================================

const MAX_IMPORT_DEPTH = 20;
const MAX_IMPORT_CHILDREN = 100;
const MAX_IMPORT_NODES = 5000;

// =====================================================
// STATE
// =====================================================

let totalImportedNodes = 0;

let elementIds =

  new WeakMap<
    HTMLElement,
    string
  >();

let activeSemanticReplacementMap =
  new WeakMap<
    HTMLElement,
    SerializedBlock
  >();

let activeSemanticReplacementDiagnostics:
  Array<Record<string, any>> = [];

  const getElementId = (
  element: HTMLElement
) => {

  if (
    !elementIds.has(element)
  ) {

    elementIds.set(

      element,

      crypto.randomUUID()
    );
  }

  return elementIds.get(
    element
  )!;
};

const getElementWindow = (
  element: Element
) =>
  element.ownerDocument.defaultView || window;

const isHtmlElementLike = (
  element: Element
): element is HTMLElement =>
  element.nodeType === 1 &&
  typeof (element as HTMLElement).tagName === "string";


// =====================================================
// DETERMINISTIC IDS
// =====================================================

const generateNodeId = (
  type: string,
  path: (string | number)[]
) => {
  return `${type}-${path.join("-")}`;
};

const collectDescendantsByTypeForBlock = (
  block: any,
  type: string
) => {
  const results: any[] = [];

  const walk = (
    node: any
  ) => {
    if (!node) {
      return;
    }

    if (node.type === type) {
      results.push(node);
    }

    for (const child of node.children || []) {
      walk(child);
    }
  };

  walk(block);

  return results;
};

const logEmptyTextBlocks = (
  stage: string,
  blocks: any[] = [],
  path = "blocks",
  parentType = "root"
) => {

  blocks.forEach((block, index) => {

    const blockPath =
      `${path}[${index}]`;

    const content =
      block?.data?.props?.content;

    if (
      block?.type === "text" &&
      !content?.trim()
    ) {

      console.log(
        "🚨 EMPTY TEXT BLOCK",
        {
          stage,
          id:
            block.id,
          type:
            block.type,
          content,
          path:
            blockPath,
          parentType,
          block
        }
      );
    }

    logEmptyTextBlocks(
      stage,
      block?.children || [],
      `${blockPath}.children`,
      block?.type || parentType
    );
  });
};

const SECTION_CHILD_LAYOUT_TYPES =
  new Set<string>([
    COMPILER_BLOCK_TYPES.FLEX,
    COMPILER_BLOCK_TYPES.GRID,
    COMPILER_BLOCK_TYPES.NAVBAR
  ]);

const isSectionChildLayoutBlock = (
  block: SerializedBlock
) =>
  SECTION_CHILD_LAYOUT_TYPES.has(
    block.type
  );

const isSemanticBlock = (
  block: any
) =>
  !!block?.meta?.semanticType;

const withDesktopFallback = (
  style: Record<string, any> = {},
  desktopFallback: Record<string, any>
) => ({
  ...style,
  desktop: {
    ...desktopFallback,
    ...(style.desktop || {})
  },
  tablet: {
    ...(style.tablet || {})
  },
  mobile: {
    ...(style.mobile || {})
  }
});

const sanitizeSectionLayoutStyle = (
  id: string,
  style: Record<string, any> = {}
) => {
  const nextStyle = {
    ...style,
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

  const beforeHeight =
    nextStyle.desktop.height;
  const beforeMinHeight =
    nextStyle.desktop.minHeight;

  delete nextStyle.desktop.height;
  delete nextStyle.desktop.maxHeight;

  if (
    nextStyle.desktop.minHeight === "0px" ||
    nextStyle.desktop.minHeight === "0" ||
    nextStyle.desktop.minHeight === "none"
  ) {
    delete nextStyle.desktop.minHeight;
  }

  console.log(
    "SECTION_HEIGHT_SANITIZED",
    {
      id,
      beforeHeight,
      beforeMinHeight,
      afterStyle:
        nextStyle.desktop
    }
  );

  return nextStyle;
};

const normalizeDiagnosticText = (
  value = ""
) =>
  value
    .replace(/\s+/g, " ")
    .trim();

const normalizeTextForCoverage = (
  value = ""
) =>
  normalizeDiagnosticText(
    value
  ).toLowerCase();

const isMeaningfulImportedText = (
  value = ""
) => {
  const text =
    normalizeDiagnosticText(
      value
    );

  return (
    text.length >= 2 &&
    !/^[\s|/\\\-–—•·.,:;()[\]{}]+$/.test(
      text
    )
  );
};

const shouldSkipTextCoverageElement = (
  element: Element | null
) =>
  !!element &&
  (
    shouldSkipImportedElement(
      element
    ) ||
    !!element.closest(
      "script,style,noscript,svg"
    )
  );

type ImportTextNodeDiagnostic = {
  text: string;
  tag: string;
  className: string;
  path: string;
  parentText: string;
};

const getElementDomPath = (
  element: Element | null
) => {
  const parts: string[] = [];
  let current:
    Element | null =
      element;

  while (
    current &&
    current.tagName &&
    current.tagName.toLowerCase() !==
      "html"
  ) {
    const parent =
      current.parentElement;
    const index =
      parent
        ? Array.from(
            parent.children
          ).indexOf(
            current
          )
        : 0;

    parts.unshift(
      `${current.tagName.toLowerCase()}[${index}]`
    );

    current = parent;
  }

  return parts.join(
    ">"
  );
};

const collectDomTextNodes = (
  root: HTMLElement
): ImportTextNodeDiagnostic[] => {
  const walker =
    root.ownerDocument.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT
    );

  const texts:
    ImportTextNodeDiagnostic[] = [];

  let node =
    walker.nextNode();

  while (node) {
    const parent =
      node.parentElement;
    const text =
      normalizeDiagnosticText(
        node.textContent || ""
      );

    if (
      parent &&
      isMeaningfulImportedText(
        text
      ) &&
      !shouldSkipTextCoverageElement(
        parent
      )
    ) {
      texts.push({
        text,
        tag:
          parent.tagName,
        className:
          getElementClassName(
            parent
          ),
        path:
          getElementDomPath(
            parent
          ),
        parentText:
          normalizeDiagnosticText(
            parent.textContent || ""
          ).slice(
            0,
            240
          )
      });
    }

    node =
      walker.nextNode();
  }

  return texts;
};

const collectTextProps = (
  blocks: any[] = []
) => {
  const props: Array<{
    blockId: string;
    blockType: string;
    propPath: string;
    text: string;
  }> = [];

  const walkValue = (
    value: any,
    propPath: string,
    block: any
  ) => {
    if (
      typeof value === "string" &&
      isMeaningfulImportedText(
        value
      )
    ) {
      props.push({
        blockId:
          block?.id || "",
        blockType:
          block?.type || "",
        propPath,
        text:
          normalizeDiagnosticText(
            value
          )
      });
      return;
    }

    if (
      Array.isArray(
        value
      )
    ) {
      value.forEach(
        (item, index) =>
          walkValue(
            item,
            `${propPath}[${index}]`,
            block
          )
      );
      return;
    }

    if (
      value &&
      typeof value === "object"
    ) {
      Object.entries(
        value
      ).forEach(
        ([key, nested]) =>
          walkValue(
            nested,
            propPath
              ? `${propPath}.${key}`
              : key,
            block
          )
      );
    }
  };

  const walkBlock = (
    block: any
  ) => {
    if (!block) {
      return;
    }

    walkValue(
      block.data?.props || {},
      "data.props",
      block
    );

    (block.children || []).forEach(
      walkBlock
    );
  };

  blocks.forEach(
    walkBlock
  );

  return props;
};

const textIsRepresented = (
  text: string,
  textProps: Array<{ text: string }>
) => {
  const normalized =
    normalizeTextForCoverage(
      text
    );

  if (!normalized) {
    return true;
  }

  return textProps.some(
    prop => {
      const propText =
        normalizeTextForCoverage(
          prop.text
        );

      return (
        propText.includes(
          normalized
        ) ||
        normalized.includes(
          propText
        )
      );
    }
  );
};

const collectDroppedDomTextNodes = (
  root: HTMLElement,
  blocks: any[] = []
) => {
  const textProps =
    collectTextProps(
      blocks
    );

  return collectDomTextNodes(
    root
  ).filter(
    textNode =>
      !textIsRepresented(
        textNode.text,
        textProps
      )
  );
};

const logSemanticDroppedText = (
  element: HTMLElement,
  emittedBlock: SerializedBlock
) => {
  const droppedTextNodes =
    collectDroppedDomTextNodes(
      element,
      [emittedBlock]
    );

  if (
    droppedTextNodes.length
  ) {
    console.warn(
      "SEMANTIC_DROPPED_DOM_TEXT",
      {
        semantic:
          emittedBlock.meta?.semanticType,
        resolver:
          emittedBlock.meta?.resolverName,
        tag:
          element.tagName,
        className:
          getElementClassName(
            element
          ),
        originalTextNodeCount:
          collectDomTextNodes(
            element
          ).length,
        emittedTextPropCount:
          collectTextProps(
            [emittedBlock]
          ).length,
        droppedTextNodes
      }
    );
  }

  return droppedTextNodes;
};

const textMatchesAcademyTraining = (
  value = ""
) =>
  /\b(academy|training|formation|formations|certification|certifie|certifi|duration|dur[eé]e|mode|cours|atelier|programme)\b/i.test(
    value
  );

const parseCssNumericValue = (
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

  const matches =
    value.match(
      /-?\d+(?:\.\d+)?/g
    );

  if (!matches) {
    return 0;
  }

  return Math.max(
    ...matches.map(Number)
  );
};

const collectLargeLayoutBlocks = (
  blocks: any[] = []
) => {
  const largeBlocks: any[] = [];

  const walk = (
    block: any,
    path = "blocks"
  ) => {
    if (!block) {
      return;
    }

    const desktop =
      block.data?.style?.desktop ||
      block.style?.desktop ||
      {};

    const measured = {
      height:
        desktop.height,
      minHeight:
        desktop.minHeight,
      padding:
        desktop.padding,
      paddingTop:
        desktop.paddingTop,
      paddingBottom:
        desktop.paddingBottom,
      margin:
        desktop.margin,
      marginTop:
        desktop.marginTop,
      marginBottom:
        desktop.marginBottom
    };

    const maxSpacing =
      Math.max(
        parseCssNumericValue(
          measured.height
        ),
        parseCssNumericValue(
          measured.minHeight
        ),
        parseCssNumericValue(
          measured.padding
        ),
        parseCssNumericValue(
          measured.paddingTop
        ),
        parseCssNumericValue(
          measured.paddingBottom
        ),
        parseCssNumericValue(
          measured.margin
        ),
        parseCssNumericValue(
          measured.marginTop
        ),
        parseCssNumericValue(
          measured.marginBottom
        )
      );

    if (
      maxSpacing >= 240
    ) {
      largeBlocks.push({
        id:
          block.id,
        type:
          block.type,
        semantic:
          block.meta?.semanticType ||
          block.data?.props?.semantic
            ?.semanticIntent ||
          null,
        path,
        maxSpacing,
        style:
          measured
      });
    }

    (block.children || []).forEach(
      (child: any, index: number) =>
        walk(
          child,
          `${path}[${index}].children`
        )
    );
  };

  blocks.forEach(
    (block, index) =>
      walk(
        block,
        `blocks[${index}]`
      )
  );

  return largeBlocks;
};

const logLargeLayoutBlocks = (
  stage: string,
  blocks: any[] = []
) => {
  const largeBlocks =
    collectLargeLayoutBlocks(
      blocks
    );

  if (
    largeBlocks.length
  ) {
    console.warn(
      "IMPORT_LARGE_LAYOUT_BLOCKS",
      {
        stage,
        count:
          largeBlocks.length,
        largeBlocks
      }
    );
  }
};

type StyleSanitizerIssue = {
  path: string;
  reason: string;
  valueType: string;
  preview?: string;
};

const MAX_SERIALIZED_STYLE_STRING_LENGTH =
  2000;

const isPlainSerializableObject = (
  value: unknown
) =>
  !!value &&
  typeof value === "object" &&
  (
    Object.getPrototypeOf(value) ===
      Object.prototype ||
    Object.getPrototypeOf(value) ===
      null
  );

const previewSanitizedValue = (
  value: unknown
) => {
  try {
    return String(value).slice(
      0,
      160
    );
  } catch {
    return "[unprintable]";
  }
};

const sanitizeSerializableStyle = (
  value: unknown,
  path: string,
  issues: StyleSanitizerIssue[]
): any => {
  if (
    value === undefined
  ) {
    issues.push({
      path,
      reason:
        "removed undefined style value",
      valueType:
        "undefined"
    });
    return undefined;
  }

  if (
    value === null ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (
    typeof value === "string"
  ) {
    if (
      value.length >
      MAX_SERIALIZED_STYLE_STRING_LENGTH
    ) {
      issues.push({
        path,
        reason:
          "truncated long style string",
        valueType:
          "string",
        preview:
          value.slice(
            0,
            160
          )
      });

      return value.slice(
        0,
        MAX_SERIALIZED_STYLE_STRING_LENGTH
      );
    }

    return value;
  }

  if (
    typeof value === "number"
  ) {
    if (
      Number.isFinite(
        value
      )
    ) {
      return value;
    }

    issues.push({
      path,
      reason:
        "removed non-finite number",
      valueType:
        "number",
      preview:
        previewSanitizedValue(
          value
        )
    });
    return undefined;
  }

  if (
    typeof value === "function" ||
    typeof value === "symbol" ||
    typeof value === "bigint"
  ) {
    issues.push({
      path,
      reason:
        "removed non-serializable style value",
      valueType:
        typeof value,
      preview:
        previewSanitizedValue(
          value
        )
    });
    return undefined;
  }

  if (
    Array.isArray(
      value
    )
  ) {
    issues.push({
      path,
      reason:
        "removed array from style object",
      valueType:
        "array"
    });
    return undefined;
  }

  if (
    !isPlainSerializableObject(
      value
    )
  ) {
    issues.push({
      path,
      reason:
        "removed non-plain object from style object",
      valueType:
        value?.constructor?.name ||
        typeof value,
      preview:
        previewSanitizedValue(
          value
        )
    });
    return undefined;
  }

  const sanitized:
    Record<string, any> = {};

  Object.entries(
    value as Record<string, unknown>
  ).forEach(
    ([key, nested]) => {
      const next =
        sanitizeSerializableStyle(
          nested,
          `${path}.${key}`,
          issues
        );

      if (
        next !== undefined
      ) {
        sanitized[key] =
          next;
      }
    }
  );

  return sanitized;
};

const sanitizeBlockTreeStyles = (
  blocks: any[] = [],
  context = "html-import"
) => {
  const issues:
    StyleSanitizerIssue[] = [];

  const walk = (
    block: any,
    path: string
  ): any => {
    if (
      !block ||
      typeof block !== "object"
    ) {
      return block;
    }

    const next = {
      ...block,
      data: {
        ...(block.data || {})
      },
      children:
        Array.isArray(
          block.children
        )
          ? block.children.map(
              (child: any, index: number) =>
                walk(
                  child,
                  `${path}.children[${index}]`
                )
            )
          : []
    };

    if (
      block.data?.style
    ) {
      next.data.style =
        sanitizeSerializableStyle(
          block.data.style,
          `${path}.data.style`,
          issues
        ) || {};
    }

    if (
      block.style
    ) {
      next.style =
        sanitizeSerializableStyle(
          block.style,
          `${path}.style`,
          issues
        ) || {};
    }

    return next;
  };

  const sanitized =
    blocks.map(
      (block, index) =>
        walk(
          block,
          `blocks[${index}]`
        )
    );

  if (
    issues.length
  ) {
    console.warn(
      "IMPORT_STYLE_SERIALIZATION_SANITIZER",
      {
        context,
        issueCount:
          issues.length,
        issues
      }
    );
  }

  return sanitized;
};

const findTrustLikeSections = (
  body: HTMLElement
) =>
  getSafeChildren(body)
    .filter(
      child => {
        const className =
          getElementClassName(
            child
          ).toLowerCase();

        const text =
          normalizeDiagnosticText(
            child.textContent || ""
          ).toLowerCase();

        return (
          text.includes(
            "ils nous font confiance"
          ) ||
          [
            "trust",
            "partners",
            "logos",
            "clients",
            "references"
          ].some(token =>
            className.includes(
              token
            )
          )
        );
      }
    );

const summarizeTrustSectionDom = (
  section: HTMLElement,
  semanticBlocks: any[]
) => {
  const selector =
    ".partners, .partners-row, .logos, .logo-cloud, .trust, .trust-logos, .clients, .references, [class*='partner'], [class*='logo'], [class*='trust'], [class*='client'], [class*='reference']";

  const possibleLogoContainer =
    section.matches(selector)
      ? section
      : section.querySelector(
          selector
        );

  const repeatedShortTextItems =
    Array.from(
      section.querySelectorAll(
        "span, div, a, li"
      )
    )
      .map(element => ({
        tag:
          element.tagName,
        className:
          getElementClassName(
            element as HTMLElement
          ),
        text:
          normalizeDiagnosticText(
            element.textContent || ""
          )
      }))
      .filter(
        item =>
          item.text.length > 0 &&
          item.text.length <= 80
      );

  const claimedBy =
    semanticBlocks
      .filter(
        (entry: any) =>
          entry?.claimedNode?.element ===
          section
      )
      .map((entry: any) => ({
        semantic:
          entry.emitted?.meta?.semanticType,
        emittedType:
          entry.emitted?.type
      }));

  const descendantClaimedBy =
    semanticBlocks
      .filter((entry: any) => {
        const claimedElement =
          entry?.claimedNode?.element;

        return (
          claimedElement &&
          claimedElement !== section &&
          section.contains(
            claimedElement
          )
        );
      })
      .map((entry: any) => ({
        semantic:
          entry.emitted?.meta?.semanticType,
        tag:
          entry.claimedNode?.element?.tagName,
        className:
          getElementClassName(
            entry.claimedNode?.element
          )
      }));

  const heading =
    section.querySelector(
      "h1, h2, h3"
    );
  const paragraph =
    section.querySelector(
      "p"
    );

  return {
    tag:
      section.tagName,
    className:
      getElementClassName(
        section
      ),
    path:
      Array.from(
        section.parentElement?.children || []
      ).indexOf(section),
    directChildren:
      getSafeChildren(section).map(child => ({
        tag:
          child.tagName,
        className:
          getElementClassName(
            child
          ),
        text:
          normalizeDiagnosticText(
            child.textContent || ""
          ).slice(0, 120)
      })),
    headingText:
      normalizeDiagnosticText(
        heading?.textContent || ""
      ),
    paragraphText:
      normalizeDiagnosticText(
        paragraph?.textContent || ""
      ),
    repeatedShortTextItems,
    possibleLogoContainerSelector:
      selector,
    possibleLogoContainer:
      possibleLogoContainer
        ? {
            tag:
              possibleLogoContainer.tagName,
            className:
              getElementClassName(
                possibleLogoContainer as HTMLElement
              ),
            text:
              normalizeDiagnosticText(
                possibleLogoContainer.textContent || ""
              ).slice(0, 160)
          }
        : null,
    logoCandidateCount:
      possibleLogoContainer
        ? getSafeChildren(
            possibleLogoContainer as HTMLElement
          ).length
        : 0,
    claimedBy,
    descendantClaimedBy,
    whyNoSemanticResolverClaimedIt:
      claimedBy.length
        ? null
        : "No registered resolver returned a semantic block for this top-level section."
  };
};

const summarizeDiagnosticBlockTree = (
  block: any,
  depth = 0
): any => {
  if (!block) {
    return null;
  }

  if (depth > 5) {
    return {
      id:
        block.id,
      type:
        block.type,
      truncated:
        true
    };
  }

  return {
    id:
      block.id,
    type:
      block.type,
    semantic:
      block.meta?.semanticType,
    childTypes:
      (block.children || []).map(
        (child: any) => child?.type
      ),
    children:
      (block.children || [])
        .filter(Boolean)
        .map((child: any) =>
          summarizeDiagnosticBlockTree(
            child,
            depth + 1
          )
        )
  };
};

const logTrustSectionAnalysis = (
  label: string,
  body: HTMLElement,
  semanticBlocks: any[],
  finalBlocks: any[] = []
) => {
  const sections =
    findTrustLikeSections(
      body
    );

  console.log(
    "TRUST_SECTION_ANALYSIS",
    JSON.stringify(
      {
        label,
        count:
          sections.length,
        sections:
          sections.map((section) => {
            const domSummary =
              summarizeTrustSectionDom(
                section,
                semanticBlocks
              );

            return {
              ...domSummary,
              finalFallbackBlockShape:
                finalBlocks[domSummary.path]
                  ? summarizeDiagnosticBlockTree(
                      finalBlocks[domSummary.path]
                    )
                  : null
            };
          })
      },
      null,
      2
    )
  );
};

const createFallbackFlexWrapper = (
  path: (string | number)[],
  children: SerializedBlock[],
  style: Record<string, any> = {}
): SerializedBlock => ({
  id:
    generateNodeId(
      COMPILER_BLOCK_TYPES.FLEX,
      path
    ),

  type:
    COMPILER_BLOCK_TYPES.FLEX,

  data: {
    props: {},
    style:
      withDesktopFallback(
        style,
        {
          display: "flex",
          flexDirection: "column"
        }
      )
  },

  children: [
    {
      id:
        generateNodeId(
          COMPILER_BLOCK_TYPES.FLEX_ITEM,
          [...path, "item"]
        ),

      type:
        COMPILER_BLOCK_TYPES.FLEX_ITEM,

      data: {
        props: {},
        style:
          withDesktopFallback(
            style,
            {
              width: "100%"
            }
          )
      },

      children
    }
  ]
});

const flattenSectionBoundaryBlocks = (
  blocks: SerializedBlock[]
): SerializedBlock[] =>
  blocks.flatMap(
    block =>
      block.type === COMPILER_BLOCK_TYPES.SECTION &&
      !isSemanticBlock(block)
        ? flattenSectionBoundaryBlocks(
            block.children || []
          )
        : [block]
  );

const parseDomToItemChildren = (
  element: HTMLElement,
  path: (string | number)[],
  ownership: OwnershipBuckets,
  warnings: ImportWarning[],
  matcherHits: ImportMatcherHit[]
): SerializedBlock[] => {
  console.log(
    "JOB_CHILD_PARSE_IN",
    {
      tag: element.tagName,
      className: getElementClassName(element),
      text: element.textContent?.trim()?.slice(0, 120)
    }
  );

  const parsed =
    parseDomToBlocks(
      element,
      path,
      ownership,
      warnings,
      matcherHits
    );

  const flattened =
    flattenSectionBoundaryBlocks(parsed);

  console.log(
    "JOB_CHILD_PARSE_OUT",
    {
      className: getElementClassName(element),
      parsedCount: parsed.length,
      flattenedCount: flattened.length,
      types: flattened.map(block => block.type)
    }
  );

  return flattened;
};

const wrapSectionChildBlocks = (
  child: HTMLElement,
  childPath: (string | number)[],
  blocks: SerializedBlock[]
): SerializedBlock[] => {
  const flattenedBlocks =
    flattenSectionBoundaryBlocks(
      blocks
    );

  if (!flattenedBlocks.length) {
    return [];
  }

  if (
    flattenedBlocks.every(
      isSectionChildLayoutBlock
    )
  ) {
    return flattenedBlocks;
  }

  const wrappedChildren: SerializedBlock[] = [];
  let pendingInline: SerializedBlock[] = [];

  const flushPendingInline = () => {
    if (!pendingInline.length) {
      return;
    }

    wrappedChildren.push(
      createFallbackFlexWrapper(
        [
          ...childPath,
          "sectionWrap",
          wrappedChildren.length
        ],
        pendingInline,
        extractLayoutStyles(
          child
        )
      )
    );

    pendingInline = [];
  };

  flattenedBlocks.forEach(
    block => {
      if (
        isSemanticBlock(
          block
        ) ||
        isSectionChildLayoutBlock(
          block
        )
      ) {
        flushPendingInline();
        wrappedChildren.push(
          block
        );
        return;
      }

      pendingInline.push(
        block
      );
    }
  );

  flushPendingInline();

  return wrappedChildren;
};

const compileSectionChildren = (
  element: HTMLElement,
  path: (string | number)[],
  ownership: OwnershipBuckets,
  warnings: ImportWarning[],
  matcherHits: ImportMatcherHit[]
): SerializedBlock[] =>
  getSafeChildren(element)
    .flatMap(
      (
        child,
        index
      ) => {
        const childPath = [
          ...path,
          index
        ];

        const blocks =
          parseDomToBlocks(
            child,
            childPath,
            ownership,
            warnings,
            matcherHits
          );

        return wrapSectionChildBlocks(
          child,
          childPath,
          blocks
        );
      }
    );

// =====================================================
// SAFE CHILDREN EXTRACTION
// =====================================================

const getSafeChildren = (
  element: HTMLElement
): HTMLElement[] => {

  const children =
    Array.from(element.children)
      .filter(
        (child): child is HTMLElement =>
          isHtmlElementLike(child) &&
          !shouldSkipImportedElement(
            child
          )
      );

  return children.slice(
    0,
    MAX_IMPORT_CHILDREN
  );
};

const createFallbackTextBlock = (
  element: HTMLElement,
  path: (string | number)[],
  content: string
): SerializedBlock => ({
  id:
    generateNodeId(
      COMPILER_BLOCK_TYPES.TEXT,
      path
    ),
  type:
    COMPILER_BLOCK_TYPES.TEXT,
  data: {
    props: {
      content
    },
    style:
      extractTypographyStyles(
        element
      )
  },
  children: []
});

const getMeaningfulDirectTextNodes = (
  element: HTMLElement
) =>
  Array.from(
    element.childNodes
  ).filter(
    node =>
      node.nodeType === 3 &&
      isMeaningfulImportedText(
        node.textContent || ""
      )
  );

const hasMeaningfulElementContent = (
  element: HTMLElement
) =>
  isMeaningfulImportedText(
    element.textContent || ""
  ) ||
  !!element.querySelector(
    "img,svg,video,audio,input,button,a"
  );

const splitGridTrackList = (
  value: string
) => {
  const tracks: string[] = [];
  let current = "";
  let depth = 0;

  for (const character of value) {
    if (
      character === "("
    ) {
      depth++;
    } else if (
      character === ")"
    ) {
      depth =
        Math.max(
          0,
          depth - 1
        );
    }

    if (
      /\s/.test(
        character
      ) &&
      depth === 0
    ) {
      if (current.trim()) {
        tracks.push(
          current.trim()
        );
        current = "";
      }
      continue;
    }

    current += character;
  }

  if (current.trim()) {
    tracks.push(
      current.trim()
    );
  }

  return tracks;
};

const makeGridTracksShrinkSafe = (
  value: string
) => {
  const tracks =
    splitGridTrackList(
      value
    );

  if (!tracks.length) {
    return "";
  }

  return tracks
    .map(
      track => {
        if (
          /^(minmax|repeat|fit-content|subgrid)\(/i.test(
            track
          ) ||
          track === "auto"
        ) {
          return track;
        }

        return `minmax(0, ${track})`;
      }
    )
    .join(" ");
};

const getPreservedWrapperDesktopStyle = (
  computed: ReturnType<
    typeof extractComputedStyles
  >,
  layoutDesktop:
    Record<string, any> = {}
) => ({
  ...layoutDesktop,
  background:
    computed.background ||
    layoutDesktop.background,
  backgroundColor:
    computed.backgroundColor ||
    layoutDesktop.backgroundColor,
  border:
    computed.border ||
    layoutDesktop.border,
  borderRadius:
    computed.borderRadius ||
    layoutDesktop.borderRadius,
  color:
    computed.color ||
    layoutDesktop.color,
  padding:
    computed.padding ||
    layoutDesktop.padding,
  gap:
    computed.gap ||
    layoutDesktop.gap,
  alignItems:
    computed.alignItems ||
    layoutDesktop.alignItems,
  boxShadow:
    computed.boxShadow ||
    layoutDesktop.boxShadow,
  width:
    computed.width ||
    layoutDesktop.width,
  maxWidth:
    computed.maxWidth &&
    computed.maxWidth !== "none"
      ? computed.maxWidth
      : layoutDesktop.maxWidth
});

const compileDirectChildNodes = (
  element: HTMLElement,
  path: (string | number)[],
  ownership: OwnershipBuckets,
  warnings: ImportWarning[],
  matcherHits: ImportMatcherHit[]
): SerializedBlock[] =>
  Array.from(
    element.childNodes
  ).flatMap(
    (node, index) => {
      const nodePath = [
        ...path,
        "content",
        index
      ];

      if (
        node.nodeType === 3
      ) {
        const content =
          normalizeDiagnosticText(
            node.textContent || ""
          );

        return isMeaningfulImportedText(
          content
        )
          ? [
              createFallbackTextBlock(
                element,
                nodePath,
                content
              )
            ]
          : [];
      }

      if (
        !isHtmlElementLike(
          node as Element
        ) ||
        shouldSkipImportedElement(
          node as Element
        )
      ) {
        return [];
      }

      return parseDomToBlocks(
        node as HTMLElement,
        nodePath,
        ownership,
        warnings,
        matcherHits
      );
    }
  );

const emitFallbackStructuredContainer = (
  element: HTMLElement,
  path: (string | number)[],
  ownership: OwnershipBuckets,
  warnings: ImportWarning[],
  matcherHits: ImportMatcherHit[]
): SerializedBlock[] => {
  const computed =
    extractComputedStyles(
      element
    );

  const layoutStyle =
    extractLayoutStyles(
      element
    );

  const sourceGridColumns =
    computed.gridTemplateColumns &&
    computed.gridTemplateColumns !== "none"
      ? makeGridTracksShrinkSafe(
          computed.gridTemplateColumns
        )
      : "";

  const sourceMaxWidth =
    computed.maxWidth &&
    computed.maxWidth !== "none"
      ? computed.maxWidth
      : "100%";

  const preservedWrapperStyle =
    getPreservedWrapperDesktopStyle(
      computed,
      layoutStyle.desktop || {}
    );

  if (
    computed.display === "grid" &&
    sourceGridColumns
  ) {
    const gridChildren =
      getSafeChildren(
        element
      )
        .filter(
          hasMeaningfulElementContent
        )
        .map(
          (child, index) => ({
            id:
              generateNodeId(
                COMPILER_BLOCK_TYPES.GRID_ITEM,
                [...path, index]
              ),
            type:
              COMPILER_BLOCK_TYPES.GRID_ITEM,
            data: {
              props: {},
              style:
                withDesktopFallback(
                  extractLayoutStyles(
                    child
                  ),
                  {
                    width: "100%",
                    maxWidth: "100%",
                    minWidth: "0",
                    overflow: "visible"
                  }
                )
            },
            children:
              parseDomToBlocks(
                child,
                [...path, index],
                ownership,
                warnings,
                matcherHits
              )
          })
        )
        .filter(
          item =>
            item.children.length > 0
        );

    if (
      gridChildren.length >= 2
    ) {
      const containerDesktopStyle = {
        ...preservedWrapperStyle,
        display: "grid",
        gridTemplateColumns:
          sourceGridColumns,
        gap:
          computed.gap ||
          layoutStyle.desktop?.gap ||
          "0px",
        padding:
          computed.padding ||
          layoutStyle.desktop?.padding,
        border:
          computed.border ||
          layoutStyle.desktop?.border,
        borderRadius:
          computed.borderRadius ||
          layoutStyle.desktop?.borderRadius,
        background:
          computed.background ||
          layoutStyle.desktop?.background,
        backgroundColor:
          computed.backgroundColor ||
          layoutStyle.desktop?.backgroundColor,
        color:
          computed.color ||
          layoutStyle.desktop?.color,
        alignItems:
          computed.alignItems ||
          layoutStyle.desktop?.alignItems ||
          "stretch",
        boxShadow:
          computed.boxShadow ||
          layoutStyle.desktop?.boxShadow,
        width: "100%",
        maxWidth:
          sourceMaxWidth,
        minWidth: "0",
        boxSizing:
          "border-box",
        overflow: "visible"
      };

      console.log(
        "FALLBACK_PRESERVED_CONTAINER_STYLE",
        {
          tag:
            element.tagName,
          className:
            getElementClassName(
              element
            ),
          containerType:
            COMPILER_BLOCK_TYPES.GRID,
          sourceComputed:
            computed,
          containerDesktopStyle,
          itemDesktopStyles:
            gridChildren.map(
              item =>
                item.data?.style?.desktop
            )
        }
      );

      return [
        {
          id:
            generateNodeId(
              COMPILER_BLOCK_TYPES.GRID,
              path
            ),
          type:
            COMPILER_BLOCK_TYPES.GRID,
          data: {
            props: {},
            style: {
              ...layoutStyle,
              desktop:
                containerDesktopStyle,
              tablet: {
                ...(layoutStyle.tablet || {}),
                width: "100%",
                maxWidth: "100%",
                minWidth: "0"
              },
              mobile: {
                ...(layoutStyle.mobile || {}),
                display: "grid",
                gridTemplateColumns:
                  "minmax(0, 1fr)",
                width: "100%",
                maxWidth: "100%",
                minWidth: "0"
              }
            }
          },
          children:
            gridChildren
        }
      ];
    }
  }

  const {
    gridTemplateColumns: _gridTemplateColumns,
    gridTemplateRows: _gridTemplateRows,
    gridAutoRows: _gridAutoRows,
    ...desktopStyle
  } = layoutStyle.desktop || {};

  const children =
    getSafeChildren(
      element
    )
      .filter(
        hasMeaningfulElementContent
      )
      .map(
        (child, index) => ({
          id:
            generateNodeId(
              COMPILER_BLOCK_TYPES.FLEX_ITEM,
              [...path, index]
            ),
          type:
            COMPILER_BLOCK_TYPES.FLEX_ITEM,
          data: {
            props: {},
            style:
              withDesktopFallback(
                extractLayoutStyles(
                  child
                ),
                {
                  minWidth: "0"
                }
              )
          },
          children:
            parseDomToBlocks(
              child,
              [...path, index],
              ownership,
              warnings,
              matcherHits
            )
        })
      )
      .filter(
        item =>
          item.children.length > 0
      );

  if (
    children.length < 2
  ) {
    return [];
  }

  return [
    {
      id:
        generateNodeId(
          COMPILER_BLOCK_TYPES.FLEX,
          path
        ),
      type:
        COMPILER_BLOCK_TYPES.FLEX,
      data: {
        props: {},
        style: {
          ...layoutStyle,
          desktop: {
            ...desktopStyle,
            display: "flex",
            flexDirection:
              computed.display === "grid"
                ? "row"
                : computed.display === "flex"
                  ? (
                      computed.flexDirection === "column"
                        ? "column"
                        : "row"
                    )
                  : "column",
            flexWrap:
              computed.flexWrap === "wrap"
                ? "wrap"
                : "nowrap",
            alignItems:
              computed.alignItems ||
              "center",
            gap:
              computed.gap ||
              "12px"
          },
          tablet: {
            ...(layoutStyle.tablet || {})
          },
          mobile: {
            ...(layoutStyle.mobile || {}),
            flexWrap: "wrap"
          }
        }
      },
      children
    }
  ];
};

// =====================================================
// FALLBACK COMPILER
// =====================================================

function fallbackCompileElement(
  element: HTMLElement,
  path: (string | number)[],
  ownership: OwnershipBuckets,
  warnings: ImportWarning[],
  matcherHits: ImportMatcherHit[]
): SerializedBlock[] {

  if (
    shouldSkipImportedElement(
      element
    )
  ) {

    return [];
  }

  totalImportedNodes++;

  if (
    totalImportedNodes >
    MAX_IMPORT_NODES
  ) {

    warnings.push({
      type: "MAX_IMPORT_NODES",
      message:
        "Maximum import node limit reached.",
      path: path.join(".")
    });

    return [];
  }

  if (
    path.length >
    MAX_IMPORT_DEPTH
  ) {


    warnings.push({
      type: "MAX_IMPORT_DEPTH",
      message:
        "Maximum import depth reached.",
      path: path.join(".")
    });

    return [];
  }

  const tagName =
    getTagNameLower(
      element
    );
    console.log(
  "🚨 FALLBACK",
  tagName,
  getElementClassName(
    element
  ),
  path
);


  // =========================================
  // IGNORE NON-VISUAL NODES
  // =========================================

  if (
    [
      "script",
      "style",
      "iframe",
      "head",
      "meta",
      "link",
      "noscript"
    ].includes(tagName)
  ) {

    return [];
  }

  // =========================================
  // SECTION
  // =========================================

if (
  [
    "section",
    "header",
    "main",
    "article"
  ].includes(tagName)
) {
console.log(
  "🚨 COMPILING SECTION",
    {
      path,
    className:
      getElementClassName(
        element
      )
  }
);
  const compiledChildren =
    compileSectionChildren(
      element,
      path,
      ownership,
      warnings,
      matcherHits
    );
  const sectionId =
    generateNodeId(
      COMPILER_BLOCK_TYPES.SECTION,
      path
    );

  const sectionStyle =
    sanitizeSectionLayoutStyle(
      sectionId,
      extractLayoutStyles(
        element
      )
    );

console.log(
  "🚨 SECTION CHILDREN RESULT",
  compiledChildren.map(
    b => ({
      type: b.type
    })
  )
);
  return [
    {
      id:
        sectionId,

      type:
        COMPILER_BLOCK_TYPES.SECTION,

      data: {

        props: {},

        style:
          sectionStyle
      },

      children:
        compiledChildren
    }
  ];
}

  // =========================================
  // TITLES
  // =========================================

 if (
  [
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6"
  ].includes(tagName)
) {

  const titleBlock = {

    id:
      generateNodeId(
        COMPILER_BLOCK_TYPES.TITLE,
        path
      ),

    type:
      COMPILER_BLOCK_TYPES.TITLE,

    data: {

      props: {

        content:
          element.textContent
            ?.trim() || "",

        level:
          tagName,

        segments:
          extractTitleSegments(
            element
          )
      },

      style:
        extractTypographyStyles(
          element
        )
    },

    children: []
  };

  // =====================================
  // ROOT NORMALIZATION
  // =====================================

  if (
    path.length === 0
  ) {

    return [

      {

        id:
          "auto-section",

        type:
          COMPILER_BLOCK_TYPES.SECTION,

        data: {

          props: {},

          style: {
            desktop: {},
            tablet: {},
            mobile: {}
          }
        },

        children: [
          createFallbackFlexWrapper(
            [
              ...path,
              "rootTitle"
            ],
            [
              titleBlock
            ]
          )
        ]
      }
    ];
  }

  return [
    titleBlock
  ];
}

  // =========================================
  // TEXT
  // =========================================

const hasOnlyText =

  element.children.length === 0 &&

  element.textContent?.trim();

  const hasSemanticChild =

  element.querySelector(
    "a, button"
  );

const semanticTags = [
  "a",
  "button",
  "nav"
];

if (
  hasOnlyText &&

  !hasSemanticChild &&

  !semanticTags.includes(
    tagName
  ) &&

  ![
    "img",
    "input",
    "textarea",
    "select",
    "option"
  ].includes(
    tagName
  )

) 

{

  return [
    {
      id:
        generateNodeId(
          COMPILER_BLOCK_TYPES.TEXT,
          path
        ),

      type:
        COMPILER_BLOCK_TYPES.TEXT,

      data: {

        props: {

          content:
            element.textContent?.trim() || ""
        },

        style:
          extractTypographyStyles(
            element
          )
      },

      children: []
    }
  ];
}

  // =========================================
  // IMAGE
  // =========================================

  if (tagName === "img") {

    const extractedSrc =
      element.getAttribute("src") ||
      element.getAttribute("data-src") ||
      "";

    const extractedAlt =
      element.getAttribute("alt") ||
      "";

    return [
      {
        id:
          generateNodeId(
            COMPILER_BLOCK_TYPES.IMAGE,
            path
          ),

        type:
          COMPILER_BLOCK_TYPES.IMAGE,

        data: {

          props: {

            url:
              extractedSrc.trim(),

            alt:
              extractedAlt
          },

          style:
  extractLayoutStyles(
    element
  )
        },

        children: []
      }
    ];
  }


// =====================================
// LINK
// =====================================

if (tagName === "a") {
  return [
    {
      id:
        generateNodeId(
          COMPILER_BLOCK_TYPES.LINK,
          path
        ),

      type:
        COMPILER_BLOCK_TYPES.LINK,

      data: {

        props: {

          label:
            element.textContent?.trim() || "",

          href:
            element.getAttribute(
              "href"
            ) || "#"
        },

        style:
          extractTypographyStyles(
            element
          )
      },

      children: []
    }
  ];
}

// =====================================
// BUTTON
// =====================================

if (tagName === "button") {

  return [
    {
      id:
        generateNodeId(
          COMPILER_BLOCK_TYPES.BUTTON,
          path
        ),

      type:
        COMPILER_BLOCK_TYPES.BUTTON,

      data: {

        props: {

          label:
            element.textContent?.trim() || ""
        },

        style:
          extractTypographyStyles(
            element
          )
      },

      children: []
    }
  ];
}

const safeChildren =
  getSafeChildren(
    element
  );

const meaningfulDirectChildren =
  safeChildren.filter(
    hasMeaningfulElementContent
  );

if (
  meaningfulDirectChildren.length >= 2
) {
  const structured =
    emitFallbackStructuredContainer(
      element,
      path,
      ownership,
      warnings,
      matcherHits
    );

  if (structured.length) {
    return structured;
  }
}

const directTextNodes =
  getMeaningfulDirectTextNodes(
    element
  );

if (
  directTextNodes.length > 0 &&
  safeChildren.length > 0
) {
  const mixedChildren =
    compileDirectChildNodes(
      element,
      path,
      ownership,
      warnings,
      matcherHits
    );

  if (mixedChildren.length) {
    return [
      createFallbackFlexWrapper(
        [...path, "mixed"],
        mixedChildren,
        extractLayoutStyles(
          element
        )
      )
    ];
  }
}

warnings.push({
  type: "WRAPPER_FLATTENED",
  message:
    `Flattened unsupported wrapper <${tagName}>`,
  path: path.join(".")
});

const compiledChildren =

  getSafeChildren(element)

    .flatMap(
      (
        child,
        index
      ) =>

        parseDomToBlocks(

          child,

          [...path, index],

          ownership,

          warnings,

          matcherHits
        )
    );

return compiledChildren;
  }

// =====================================================
// MAIN PARSER
// =====================================================
type OwnershipBuckets = {

  grids: StructuralCandidate[];
  
  navbars: StructuralCandidate[];

  flexGroups: StructuralCandidate[];

  cards: StructuralCandidate[];
};

const getOwnershipCandidates = (
  ownership: SemanticOwnershipResult
): StructuralCandidate[] => {

  const seen =
    new Set<string>();

  return [

    ...(ownership.resolvedOwners || []),

    ...(ownership.unassigned || [])
  ].filter(
    candidate => {

      if (
        seen.has(
          candidate.elementId
        )
      ) {

        return false;
      }

      seen.add(
        candidate.elementId
      );

      return true;
    }
  );
};

const toOwnershipBuckets = (
  ownership: SemanticOwnershipResult
): OwnershipBuckets => {

  const candidates =
    getOwnershipCandidates(
      ownership
    );

  return {

    grids:
      candidates.filter(
        candidate =>
          candidate.type === "GRID"
      ),

    navbars:
      candidates.filter(
        candidate =>
          candidate.type === "NAVBAR" ||
          candidate.metadata?.semanticIntent ===
            "NAVBAR"
      ),

    flexGroups:
      candidates.filter(
        candidate =>
          candidate.type === "FLEX_GROUP" &&
          candidate.metadata?.semanticIntent !==
            "NAVBAR"
      ),

    cards:
      candidates.filter(
        candidate =>
          candidate.type === "CARD"
      )
  };
};

function emitFlexContainer(
  element: HTMLElement,
  path: (string | number)[],
  ownership: OwnershipBuckets,
  warnings: ImportWarning[],
  matcherHits: ImportMatcherHit[],
  style: Record<string, any>,
  semanticMetadata?: any,
  blockType: string =
    COMPILER_BLOCK_TYPES.FLEX
): SerializedBlock[] {

  return [

    {

      id:
        generateNodeId(
          blockType,
          path
        ),

      type:
        blockType,

      data: {

       props: {

  ...(semanticMetadata
    ? {
        semantic:
          semanticMetadata
      }
    : {})
},

        style
      },

     children:

  getSafeChildren(element)

    .flatMap(
      (
        child,
        index
      ) => {

        const childPath = [
          ...path,
          index
        ];

        const childElementId =
          getElementId(
            child
          );

        const isNavbarContainer =
          blockType ===
          COMPILER_BLOCK_TYPES.NAVBAR;

        const childClassName =
          getElementClassName(
            child
          );

        const isNavbarLogoChild =
          isNavbarContainer &&
          (
            childClassName.includes("logo") ||
            !!child.querySelector(".logo, [class*='logo']")
          );

        const isNavbarDropdownChild =
  isNavbarContainer &&
  (
    childClassName.includes("dropdown") ||
    childClassName.includes("submenu") ||
    childClassName.includes("has-sub") ||
    !!child.querySelector("ul")
  );

const isNavbarLinksChild =
  isNavbarContainer &&
  !isNavbarDropdownChild &&
  (
    childClassName.includes("nav-links") ||
    childClassName.includes("menu")
  );

        const childOwnedByNestedFlex =

          ownership.flexGroups.some(
            flex =>

              flex.elementId ===
              childElementId
          );

        if (
          childOwnedByNestedFlex
        ) {

          return parseDomToBlocks(

            child,

            childPath,

            ownership,

            warnings,

            matcherHits
          );
        }

        return [{

          id:
            generateNodeId(
              COMPILER_BLOCK_TYPES.FLEX_ITEM,
              childPath
            ),

          type:
            COMPILER_BLOCK_TYPES.FLEX_ITEM,

          data: {

            props: {},

            style: {

              desktop:
                isNavbarContainer
                  ? {
                      flex:
                        isNavbarLinksChild
                          ? "1 1 auto"
                          : "0 0 auto",
                      flexGrow:
                        isNavbarLinksChild
                          ? 1
                          : 0,
                      flexShrink:
                        isNavbarLogoChild
                          ? 0
                          : 1,
                      minWidth:
                        isNavbarLogoChild
                          ? "max-content"
                          : "0",
                      whiteSpace:
                        "nowrap"
                    }
                  : {
                      flexGrow: 1,
                      minWidth: "0"
                    },
              tablet: {},
              mobile:
                isNavbarContainer
                  ? {
                      width: "100%",
                      minWidth: "0"
                    }
                  : {}
            }
          },

          children:

            parseDomToItemChildren(

              child,

              childPath,

              ownership,

              warnings,

              matcherHits
            )

        }];

      }
    )
    }
  ];
}

function emitContainer(
  element: HTMLElement,
  path: (string | number)[],
  ownership: OwnershipBuckets,
  warnings: ImportWarning[],
  matcherHits: ImportMatcherHit[],
  centered: boolean
): SerializedBlock[] {
  const computed =
    extractComputedStyles(
      element
    );

  const extracted =
    extractLayoutStyles(
      element
    );

  const {
    margin: _margin,
    ...desktopStyle
  } = extracted.desktop || {};

  const children =
    getSafeChildren(
      element
    ).flatMap(
      (child, index) =>
        parseDomToBlocks(
          child,
          [...path, index],
          ownership,
          warnings,
          matcherHits
        )
    );

  if (!children.length) {
    return [];
  }

  const constrainedMaxWidth =
    computed.maxWidth &&
    computed.maxWidth !== "none"
      ? computed.maxWidth
      : desktopStyle.maxWidth;

  const containerStyle = {
    ...extracted,
    desktop: {
      ...desktopStyle,
      display: "flex",
      flexDirection: "column",
      width:
        centered
          ? "100%"
          : computed.width ||
            desktopStyle.width ||
            "100%",
      maxWidth:
        constrainedMaxWidth ||
        "100%",
      marginLeft:
        centered
          ? "auto"
          : computed.marginLeft ||
            desktopStyle.marginLeft,
      marginRight:
        centered
          ? "auto"
          : computed.marginRight ||
            desktopStyle.marginRight,
      paddingLeft:
        computed.paddingLeft ||
        desktopStyle.paddingLeft,
      paddingRight:
        computed.paddingRight ||
        desktopStyle.paddingRight,
      boxSizing:
        computed.boxSizing ||
        desktopStyle.boxSizing ||
        "border-box",
      minWidth: "0"
    },
    tablet: {
      ...(extracted.tablet || {}),
      width: "100%",
      maxWidth: "100%",
      marginLeft: "auto",
      marginRight: "auto",
      boxSizing: "border-box",
      minWidth: "0"
    },
    mobile: {
      ...(extracted.mobile || {}),
      width: "100%",
      maxWidth: "100%",
      marginLeft: "auto",
      marginRight: "auto",
      boxSizing: "border-box",
      minWidth: "0"
    }
  };

  console.log(
    "PRESERVED_LAYOUT_CONTAINER",
    {
      tag:
        element.tagName,
      className:
        getElementClassName(
          element
        ),
      centered,
      computed,
      emittedDesktop:
        containerStyle.desktop
    }
  );

  return [
    {
      id:
        generateNodeId(
          COMPILER_BLOCK_TYPES.FLEX,
          [...path, "container"]
        ),
      type:
        COMPILER_BLOCK_TYPES.FLEX,
      data: {
        props: {},
        style:
          containerStyle
      },
      children: [
        {
          id:
            generateNodeId(
              COMPILER_BLOCK_TYPES.FLEX_ITEM,
              [
                ...path,
                "container",
                "item"
              ]
            ),
          type:
            COMPILER_BLOCK_TYPES.FLEX_ITEM,
          data: {
            props: {},
            style: {
              desktop: {
                width: "100%",
                maxWidth: "100%",
                minWidth: "0"
              },
              tablet: {
                width: "100%",
                maxWidth: "100%",
                minWidth: "0"
              },
              mobile: {
                width: "100%",
                maxWidth: "100%",
                minWidth: "0"
              }
            }
          },
          children
        }
      ]
    }
  ];
}

function emitGridContainer(
  element: HTMLElement,
  path: (string | number)[],
  ownership: OwnershipBuckets,
  warnings: ImportWarning[],
  matcherHits: ImportMatcherHit[],
  style: Record<string, any>,
  semanticMetadata?: any
): SerializedBlock[] {

  // =====================================
  // COMPUTED STYLES
  // =====================================

  const computedStyles =

    extractComputedStyles(
      element
    );

  // =====================================
  // DEBUG
  // =====================================

  console.log(

    "🔥 GRID STYLE",

    {

      className:
        getElementClassName(
          element
        ),

      display:
        computedStyles.display,

      gridTemplateColumns:
        computedStyles.gridTemplateColumns
    }
  );

  // =====================================
  // NORMALIZE COLUMNS
  // =====================================

  const rawColumns =

    computedStyles
      .gridTemplateColumns ||

    "";

 const semanticColumns =

  semanticMetadata
    ?.columnCount;

const computedColumnCount =

  rawColumns
    .split(" ")
    .filter(Boolean)
    .length;

const columnCount =

  semanticColumns ||

  computedColumnCount ||

  2;


const semanticColumnCount =

  semanticMetadata
    ?.columnCount;

const finalColumnCount =
  computedColumnCount > 0
    ? computedColumnCount
    : semanticColumnCount || 2;

const normalizedColumns =

  `repeat(${
    finalColumnCount
  }, minmax(0,1fr))`;

  // =====================================
  // NORMALIZED STYLE
  // =====================================

  const normalizedStyle = {

    desktop: {

      display:
        "grid",

      gridTemplateColumns:
        normalizedColumns,

      gridTemplateRows:
        style?.desktop
          ?.gridTemplateRows ||

        style?.gridTemplateRows,

      gap:
        style?.desktop
          ?.gap ||

        style?.gap ||

        computedStyles.gap ||

        "24px",

      padding:
        style?.desktop
          ?.padding ||

        style?.padding ||

        computedStyles.padding,

      margin:
        style?.desktop
          ?.margin ||

        style?.margin ||

        computedStyles.margin,

      width:
        style?.desktop
          ?.width ||

        style?.width ||

        computedStyles.width ||

        "100%",

      backgroundColor:
        style?.desktop
          ?.backgroundColor ||

        style?.backgroundColor ||

        computedStyles.backgroundColor,

      borderRadius:
        style?.desktop
          ?.borderRadius ||

        style?.borderRadius ||

        computedStyles.borderRadius
    },

    tablet: {

      display:
        "grid",

      gridTemplateColumns:

        columnCount >= 2

          ? "repeat(2, 1fr)"

          : "1fr",

      gap:
        computedStyles.gap ||

        "16px"
    },

    mobile: {

      display:
        "grid",

      gridTemplateColumns:
        "1fr",

      gap:
        computedStyles.gap ||

        "12px"
    }
  };
  return [ {
      id:
        generateNodeId(
          COMPILER_BLOCK_TYPES.GRID,
          path
        ),

      type:
        COMPILER_BLOCK_TYPES.GRID,

      data: {

        props: {

          ...(semanticMetadata
            ? {
                semantic:
                  semanticMetadata
              }
            : {})
        },

        style:
          normalizedStyle
      },

      children:

        getSafeChildren(element)
.map((child, index) => {
  const childLayoutStyle =
    extractLayoutStyles(child);

  const parsedChildren =
    parseDomToItemChildren(
      child,
      [...path, index],
      ownership,
      warnings,
      matcherHits
    );

  const fallbackChildren =
    parsedChildren.length > 0
      ? parsedChildren
      : fallbackCompileElement(
          child,
          [...path, index],
          ownership,
          warnings,
          matcherHits
        );
         console.log(
  "GRID_COLUMN_DEBUG",
  {
    className: getElementClassName(element),
    semanticColumnCount,
    computedColumnCount,
    finalColumnCount,
    childCount: getSafeChildren(element).length,
    rawColumns
  }
);

  return {
    id: generateNodeId(
      COMPILER_BLOCK_TYPES.GRID_ITEM,
      [...path, index]
    ),

    type: COMPILER_BLOCK_TYPES.GRID_ITEM,

    data: {
      props: {},
      style: {
        desktop: {
          ...(childLayoutStyle.desktop ||
            childLayoutStyle ||
            {}),
          width: "100%"
        },
        tablet: {},
        mobile: {}
      }
    },

    children: fallbackChildren
  };
})
    }
  ];
}
function parseDomToBlocks(
  element: HTMLElement,
  path: (string | number)[],
  ownership: OwnershipBuckets,
  warnings: ImportWarning[],
  matcherHits: ImportMatcherHit[]
): SerializedBlock[] {

  const semanticReplacement =
    activeSemanticReplacementMap.get(
      element
    );
if (semanticReplacement) {
  if (
    semanticReplacement.meta
      ?.semanticType === "FOOTER" &&
    semanticReplacement.meta
      ?.preserveGenericSubtree
  ) {
    activeSemanticReplacementMap.delete(
      element
    );

    const preservedBlocks =
      parseDomToBlocks(
        element,
        path,
        ownership,
        warnings,
        matcherHits
      ).map(
        block => ({
          ...block,
          meta: {
            ...(block.meta || {}),
            semanticType:
              "FOOTER",
            resolverName:
              semanticReplacement.meta
                ?.resolverName ||
              "resolveFooter"
          }
        })
      );

    activeSemanticReplacementMap.set(
      element,
      semanticReplacement
    );

    console.log(
      "FOOTER_GENERIC_SUBTREE_PRESERVED",
      {
        tag:
          element.tagName,
        className:
          getElementClassName(
            element
          ),
        emitted:
          preservedBlocks.map(
            block => ({
              type:
                block.type,
              semanticType:
                block.meta?.semanticType,
              desktopStyle:
                block.data?.style?.desktop
            })
          )
      }
    );

    return preservedBlocks;
  }

  const hasChildren =
    Array.isArray(semanticReplacement.children) &&
    semanticReplacement.children.length > 0;

  const propsText =
    JSON.stringify(semanticReplacement.data?.props || {});

  const hasUsefulProps =
    propsText.replace(/\s+/g, "").length > 2;

  if (!hasChildren && !hasUsefulProps) {
    console.warn(
      "🚨 EMPTY_SEMANTIC_REPLACEMENT_SKIPPED",
      {
        semantic:
          semanticReplacement.meta?.semanticType,
        type:
          semanticReplacement.type,
        tag:
          element.tagName,
        className:
          getElementClassName(element)
      }
    );
  } else {
    const returnedBlocks =
      [semanticReplacement];

    logSemanticDroppedText(
      element,
      semanticReplacement
    );

    console.log(
      "SEMANTIC SUBTREE REPLACED",
      {
        path,
        tag: element.tagName,
        className: getElementClassName(element),
        semantic: semanticReplacement.meta?.semanticType,
        emittedType: semanticReplacement.type
      }
    );

    return returnedBlocks;
  }
}
  if (
    shouldSkipImportedElement(
      element
    )
  ) {

    return [];
  }

  let bestMatcher = null;

  let highestScore = 0;

const elementId =

  getElementId(
    element
  );

if (

  [
    "P",
    "SPAN",
    "SMALL",
    "LABEL"
  ].includes(
    element.tagName
  ))
  {

  const text =

    (
      element.textContent || ""
    ).trim();

  if (!text) {
    console.log(
      "🚨 INLINE EMPTY TEXT SKIPPED",
      {
        tag:
          element.tagName,
        className:
          getElementClassName(
            element
          ),
        path
      }
    );

    console.log(
  "🔵 PARSE",
  element.tagName,
  getElementClassName(
    element
  )
);

    return [];
  }

  return [

    {

      id:
        generateNodeId(
          COMPILER_BLOCK_TYPES.TEXT,
          path
        ),

      type:
        COMPILER_BLOCK_TYPES.TEXT,

      data: {

        props: {
  content: text
},
style:
  extractTypographyStyles(
    element
  )
      },

      children: []
    }
  ];
}
  // =====================================
// OWNERSHIP LOOKUP
// =====================================
const ownedGrid =

  ownership.grids.find(
    grid => {

      const match =

        grid.elementId ===
        getElementId(
          element
        );

      if (match) {

        console.log(
          "🔥 MATCHED GRID",
          {
            element:
              element.tagName,

            path,

            grid
          }
        );
      }

      return match;
    }
  );


const ownedFlexGroup =

  ownership.flexGroups?.find(
    flex =>

      flex.elementId ===
      elementId
  );

  const ownedNavbar = ownership.navbars?.find( navbar => navbar.elementId === elementId);
if (ownedNavbar) {

  console.log(
    "🔥 NAVBAR PRESET",
    ownedNavbar.metadata
  );
}

// =========================================
// SEMANTIC OWNERSHIP
// =========================================

const semanticMetadata = {

  semanticIntent:

    ownedNavbar
      ?.metadata
      ?.semanticIntent ||

    ownedGrid
      ?.metadata
      ?.semanticIntent,

  semanticRegions:

    ownedNavbar
      ?.metadata
      ?.semanticRegions,

  columnCount:

    ownedGrid
      ?.metadata
      ?.columnCount
};
  // =====================================
// GRID EMISSION
// =====================================

if (ownedGrid) {

  return emitGridContainer(

    element,

    path,

    ownership,

    warnings,

    matcherHits,

    extractLayoutStyles(
      element
    ),

    semanticMetadata
  );
}
if (

  ownedNavbar
) {

  return emitFlexContainer(

    element,

    path,

    ownership,

    warnings,

    matcherHits,

    extractLayoutStyles(
      element
    ),

    semanticMetadata,

    COMPILER_BLOCK_TYPES.NAVBAR
  );
}
if (

  ownedFlexGroup &&

  ownership.flexGroups.some(
    candidate =>

      candidate.elementId ===
      elementId
  )
) {

  return emitFlexContainer(

  element,

  path,

  ownership,

  warnings,

  matcherHits,

  extractLayoutStyles(
    element
  ),

  semanticMetadata
);
}

// =========================================
// TRANSPARENT CONTAINER FLATTENING
// =========================================

const children =
  getSafeChildren(
    element
  );
  if (element.tagName === "SECTION") {
  console.log(
    "🚨 SECTION ENTER",
    {
      path,
      children: children.map(c => ({
        tag: c.tagName,
        className:
          getElementClassName(c)
      }))
    }
  );
}
const hasTextContent =

  (
    element.textContent || ""
  )

    .trim()

    .length > 0;

const hasSemanticContent =

  hasTextContent ||

  children.some(
    child =>

      [
        "IMG",
        "H1",
        "H2",
        "H3",
        "H4",
        "H5",
        "H6",
        "P",
        "BUTTON",
        "A"
      ].includes(
        child.tagName
      )
  );

const computed =

  getElementWindow(element).getComputedStyle(
    element
  );

const hasNavbarSemantics =

  element.tagName === "NAV";

const alreadyOwned =

  ownedFlexGroup ||

  ownedNavbar ||

  ownedGrid;

const isFlex =

  computed.display ===
    "flex" ||

  element.tagName ===
    "NAV";

const isGrid =

  computed.display ===
    "grid";

const shouldPreserveFlex =

  element.tagName === "NAV" ||

  (
    getSafeChildren(element)
      .length >= 2 &&

    isFlex
  );

const isLayoutContainer =

  isFlex || isGrid;

const className =
  getElementClassName(element).toLowerCase();

const hasContainerRole =
  /container|wrapper|wrap|inner|content|shell/.test(
    className
  );

const hasLayoutConstraint =
  (
    computed.maxWidth &&
    computed.maxWidth !== "none"
  ) ||
  computed.marginLeft === "auto" ||
  computed.marginRight === "auto" ||
  parseFloat(computed.paddingLeft || "0") > 0 ||
  parseFloat(computed.paddingRight || "0") > 0;

const viewportWidth =
  getElementWindow(
    element
  ).innerWidth;

const numericMaxWidth =
  parseFloat(
    computed.maxWidth || ""
  );

const hasConstrainedMaxWidth =
  Number.isFinite(
    numericMaxWidth
  ) &&
  numericMaxWidth > 0 &&
  viewportWidth > 0 &&
  numericMaxWidth < viewportWidth;

const hasAutoSideMargins =
  computed.marginLeft === "auto" ||
  computed.marginRight === "auto";

const hasCenteredLayoutConstraint =
  hasAutoSideMargins ||
  hasConstrainedMaxWidth;

if (
  !alreadyOwned &&
  (
    hasContainerRole ||
    hasCenteredLayoutConstraint
  )
) {
  const preservedContainer =
    emitContainer(
      element,
      path,
      ownership,
      warnings,
      matcherHits,
      hasCenteredLayoutConstraint ||
      (
        hasContainerRole &&
        !!computed.maxWidth &&
        computed.maxWidth !== "none"
      )
    );

  if (
    preservedContainer.length
  ) {
    return preservedContainer;
  }
}

const isTransparentContainer =
  element.tagName === "DIV" &&
  !hasSemanticContent &&
  !isLayoutContainer &&
  !ownedGrid &&
  !ownedFlexGroup &&
  !hasContainerRole &&
  !hasLayoutConstraint;
  

if (
  isTransparentContainer
) {

  return children.flatMap(
    (
      child,
      index
    ) =>

      parseDomToBlocks(

        child,

        [...path, index],

        ownership,

        warnings,

        matcherHits
      )
  );
}

  // =========================================
  // SEMANTIC MATCHING
  // =========================================

if (

  isFlex &&

  !alreadyOwned &&

  shouldPreserveFlex
)

{
  console.log(
  "🚨 EMIT FLEX",
  {
    tag: element.tagName,
    elementId,
    path
  }
);
console.log(
  "🚨 EMIT FLEX",
  {
    tag: element.tagName,
    elementId,
    path
  }
);

  return emitFlexContainer(

    element,

    path,

    ownership,

    warnings,

    matcherHits,

    extractLayoutStyles(
      element
    )
  );
}
  for (const matcher of semanticMatchers) {

    const score =
      matcher.getScore(
        element
      );

    if (
      score >= matcher.threshold &&
      score > highestScore
    ) {

      highestScore =
        score;

      bestMatcher =
        matcher;
    }
  }

  // =========================================
  // SEMANTIC MATCH FOUND
  // =========================================

  if (bestMatcher) {

    matcherHits.push({
      matcher:
        bestMatcher.name,

      score:
        highestScore,

      path:
        path.join(".")
    });

    const compiled =
      bestMatcher.compile(
        element,
        (
          child: HTMLElement,
          childIndex = 0
        ) =>

          
          parseDomToBlocks(
            child,
            [...path, childIndex],
            ownership,
            warnings,
            matcherHits
          )
      );

    return [
      {
        ...compiled,

        id:
          generateNodeId(
            compiled.type,
            path
          )
      }
    ];
  }

  // =========================================
  // FALLBACK
  // =========================================

  return fallbackCompileElement(
    element,
    path,
    ownership,
    warnings,
    matcherHits
  );
}
// =====================================================
// PUBLIC IMPORTER
// =====================================================
const stylesheetCache = new Map<string, string>();
const IMPORT_SANDBOX_CLASS = "__html_import_sandbox";

export async function importHtmlDocument(
  htmlString: string,
  context: ImportHtmlContext = {}
): Promise<ImportHtmlResult> {
  totalImportedNodes = 0;
  elementIds = new WeakMap();
  const warnings: ImportWarning[] = [];
  const matcherHits: ImportMatcherHit[] = [];

  if (!htmlString || !htmlString.trim()) {
    return { blocks: [], warnings, matcherHits };
  }

  const normalizeImportedHtml = (
    rawHtml: string
  ) => {
    let normalized =
      rawHtml.trim();

    const hadTruncatedHead =
      /^ad\s*>/i.test(
        normalized
      );

    if (hadTruncatedHead) {
      normalized =
        normalized.replace(
          /^ad\s*>/i,
          "<head>"
        );
    }

    const hasHtml =
      /<html[\s>]/i.test(
        normalized
      );

    const hasBody =
      /<body[\s>]/i.test(
        normalized
      );

    const hasHead =
      /<head[\s>]/i.test(
        normalized
      );

    if (
      !hasHtml
    ) {
      const headContent =
        hasHead
          ? ""
          : "";

      normalized =
        `<!doctype html><html>${headContent}${hasBody ? normalized : `<body>${normalized}</body>`}</html>`;
    }

    const isStillCorrupted =
      /^ad\s*>/i.test(
        normalized
      ) ||
      (
        /<meta[\s>]/i.test(normalized) &&
        !/<head[\s>]/i.test(normalized) &&
        /<html[\s>]/i.test(normalized)
      );

    console.log(
      "HTML_NORMALIZE_CHECK",
      {
        hadTruncatedHead,
        hasHtml:
          /<html[\s>]/i.test(normalized),
        hasHead:
          /<head[\s>]/i.test(normalized),
        hasBody:
          /<body[\s>]/i.test(normalized),
        isStillCorrupted,
        startsWith:
          normalized.slice(0, 80)
      }
    );

    if (
      isStillCorrupted
    ) {
      throw new Error(
        "CSS_SCOPE_FAILED: corrupted HTML head/body prevents reliable CSS application"
      );
    }

    return normalized;
  };

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

  const resolveStylesheetCandidates = (
    href: string,
    parsedDocument: Document
  ) => {
    const baseHref =
      parsedDocument.querySelector("base[href]")
        ?.getAttribute("href") || "";

    const candidates: string[] = [];

    try {
      candidates.push(
        new URL(href)
          .toString()
      );
    } catch {}

    if (baseHref) {
      try {
        candidates.push(
          new URL(href, baseHref)
            .toString()
        );
      } catch {}
    }

    try {
      candidates.push(
        new URL(href, `${window.location.origin}/`)
          .toString()
      );
    } catch {}

    try {
      candidates.push(
        new URL(href, window.location.href)
          .toString()
      );
    } catch {}

    candidates.push(
      href
    );

    return Array.from(
      new Set(candidates)
    );
  };

  const escapeRegExp = (
    value: string
  ) =>
    value.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

  const getDocumentClassNames = (
    parsedDocument: Document
  ) =>
    Array.from(
      parsedDocument.querySelectorAll("[class]")
    )
      .flatMap(element =>
        Array.from(
          element.classList || []
        )
      )
      .filter(Boolean)
      .filter(
        (
          className,
          index,
          list
        ) =>
          list.indexOf(className) === index
      );

  const scoreStylesheetForDocument = (
    css: string,
    classNames: string[]
  ) => {
    const matchedClasses =
      classNames.filter(className =>
        new RegExp(
          `\\.${escapeRegExp(className)}([\\s,.#:[>{+~]|$)`
        ).test(css)
      );

    return {
      classHitCount:
        matchedClasses.length,
      matchedClasses:
        matchedClasses.slice(
          0,
          30
        ),
      containsPillar:
        css.includes(".pillar"),
      containsPillars:
        css.includes(".pillars"),
      containsHero:
        css.includes(".hero")
    };
  };

  const extractExternalCSS = async (
    parsedDocument: Document
  ) => {
    const links =
      Array.from(
        parsedDocument.querySelectorAll(
          'link[rel~="stylesheet"][href]'
        )
      );

    let css = "";
    const loadReport: Array<Record<string, any>> = [];
    const documentClassNames =
      getDocumentClassNames(
        parsedDocument
      );

    for (const link of links) {
      const href =
        link.getAttribute("href");

      if (!href) {
        continue;
      }

      const candidates =
        resolveStylesheetCandidates(
          href,
          parsedDocument
        );

      let loaded = false;
      let bestCandidate:
        | Record<string, any>
        | null = null;

      for (const candidate of candidates) {
        try {
          let content =
            stylesheetCache.get(candidate) || "";
          let status:
            number | "cache" = "cache";
          let contentType = "cache";

          if (!content) {
            const response =
              await fetch(candidate);
            status =
              response.status;
            contentType =
              response.headers.get("content-type") || "";

            if (!response.ok) {
              loadReport.push({
                href,
                loaded: false,
                candidate,
                status,
                contentType
              });
              continue;
            }

            content =
              await response.text();

            stylesheetCache.set(
              candidate,
              content
            );
          }

          const score =
            scoreStylesheetForDocument(
              content,
              documentClassNames
            );

          loadReport.push({
            href,
            loaded: true,
            candidate,
            status,
            contentType,
            bytes:
              content.length,
            first300:
              content.slice(0, 300),
            ...score
          });

          const candidateReport = {
            href,
            candidate,
            content,
            status,
            contentType,
            bytes:
              content.length,
            first300:
              content.slice(0, 300),
            ...score
          };

          if (
            !bestCandidate ||
            candidateReport.classHitCount >
              bestCandidate.classHitCount ||
            (
              candidateReport.classHitCount ===
                bestCandidate.classHitCount &&
              candidateReport.bytes >
                bestCandidate.bytes
            )
          ) {
            bestCandidate =
              candidateReport;
          }
        } catch {}
      }

      if (
        bestCandidate
      ) {
        css += `\n${bestCandidate.content}`;
        loaded = true;

        console.log(
          "IMPORT_CSS_FINAL_RESOLUTION",
          {
            href,
            finalResolvedCssUrl:
              bestCandidate.candidate,
            status:
              bestCandidate.status,
            contentType:
              bestCandidate.contentType,
            bytes:
              bestCandidate.bytes,
            first300:
              bestCandidate.first300,
            containsPillar:
              bestCandidate.containsPillar,
            containsPillars:
              bestCandidate.containsPillars,
            containsHero:
              bestCandidate.containsHero,
            classHitCount:
              bestCandidate.classHitCount,
            matchedClasses:
              bestCandidate.matchedClasses
          }
        );
      }

      if (!loaded) {
        loadReport.push({
          href,
          loaded: false,
          candidates
        });

        console.warn(
          "CSS LOAD FAILED",
          href,
          candidates
        );
      }
    }

  console.log(
  "IMPORT_EXTERNAL_CSS_LOAD_REPORT",
  {
    linkCount: links.length,
    links: links.map(link => ({
      href: link.getAttribute("href"),
      rel: link.getAttribute("rel")
    })),
    totalBytes: css.length,
    loadReport
  }
);

console.log(
  "CSS RULE PRESENCE CHECK",
  {
    hasNavRule: css.includes(".nav"),
    hasBtnRule: css.includes(".btn"),
    hasBtnPrimaryRule: css.includes(".btn-primary"),
    hasLogoRule: css.includes(".logo"),
    hasContainerRule: css.includes(".container"),
    hasRootVars: css.includes(":root"),
    cssFirst1000: css.slice(0, 1000)
  }
);

return css;
  };

  const logImportSandboxCssDiagnostics = (
  iframeDocument: Document,
  sandbox: HTMLElement,
  importedCSS: string
) => {
  const collectStyleRules = (
    rules: CSSRuleList
  ): CSSStyleRule[] =>
    Array.from(rules)
      .flatMap(rule => {
        if ("cssRules" in rule) {
          try {
            return collectStyleRules(
              (rule as CSSGroupingRule).cssRules
            );
          } catch {
            return [];
          }
        }

        return "selectorText" in rule
          ? [rule as CSSStyleRule]
          : [];
      });

  const matchingRules =
    Array.from(iframeDocument.styleSheets)
      .flatMap(sheet => {
        try {
          return collectStyleRules(sheet.cssRules);
        } catch {
          return [];
        }
      })
      .filter(rule =>
        /(\.pillar|\.pillars|\.tags|\.hero|\.s-card|\.other-svc|\.section-tag|\.more)([\s,.#:[>{+~]|$)/i
          .test(rule.selectorText)
      )
      .map(rule => ({
        selector: rule.selectorText,
        cssText: rule.style.cssText
      }));

  const card =
    sandbox.querySelector(
      ".s-card"
    ) as HTMLElement | null;

  const cardStyle =
    card
      ? getElementWindow(card)
          .getComputedStyle(card)
      : null;

  console.log(
    "IMPORT_SANDBOX_CSS_DIAGNOSTICS",
    JSON.stringify(
      {
        importedCssBytes: importedCSS.length,
        styleSheetsLength: iframeDocument.styleSheets.length,

        headHasImportStyle:
          !!iframeDocument.head.querySelector(
            "style[data-html-import-css]"
          ),

        headContainsPillarRule:
          iframeDocument.head.innerHTML.includes(".pillar"),

        headContainsHeroRule:
          iframeDocument.head.innerHTML.includes(".hero"),

        headContainsSCardRule:
          iframeDocument.head.innerHTML.includes(".s-card"),

        headContainsOtherSvcRule:
          iframeDocument.head.innerHTML.includes(".other-svc"),

        matchingRuleCount:
          matchingRules.length,

        matchingRules,

        sCardComputedStyle:
          cardStyle
            ? {
                tag: card?.tagName,
                className: getElementClassName(card),
                display: cardStyle.display,
                padding: cardStyle.padding,
                border: cardStyle.border,
                borderRadius: cardStyle.borderRadius,
                background: cardStyle.background,
                backgroundColor: cardStyle.backgroundColor,
                color: cardStyle.color,
                fontFamily: cardStyle.fontFamily,
                boxShadow: cardStyle.boxShadow
              }
            : null
      },
      null,
      2
    )
  );
};

  const assertImportedCSSApplied = (
    sandbox: HTMLElement,
    css: string
  ) => {
    const collectStyleRules = (
      rules: CSSRuleList
    ): CSSStyleRule[] =>
      Array.from(rules)
        .flatMap(rule => {
          if (
            "cssRules" in rule
          ) {
            try {
              return collectStyleRules(
                (rule as CSSGroupingRule).cssRules
              );
            } catch {
              return [];
            }
          }

          return "selectorText" in rule
            ? [rule as CSSStyleRule]
            : [];
        });

    const getMatchedRules = (
      element: HTMLElement
    ) =>
      Array.from(
        element.ownerDocument.styleSheets
      ).flatMap(sheet => {
        try {
          return collectStyleRules(
            sheet.cssRules
          );
        } catch {
          return [];
        }
      }).filter(rule => {
        try {
          return element.matches(
            rule.selectorText
          );
        } catch {
          return false;
        }
      }).map(rule => ({
        selector:
          rule.selectorText,
        display:
          rule.style.display,
        minHeight:
          rule.style.minHeight,
        padding:
          rule.style.padding,
        paddingTop:
          rule.style.paddingTop,
        cssText:
          rule.style.cssText
      }));

    const hero =
      sandbox.querySelector(
        "header.hero, .hero"
      ) as HTMLElement | null;

    const heroTitle =
      sandbox.querySelector(
        ".hero-title, .hero h1, h1"
      ) as HTMLElement | null;

    if (!hero) {
      return;
    }

    const heroStyle =
      getElementWindow(hero)
        .getComputedStyle(hero);

    const titleStyle =
      heroTitle
        ? getElementWindow(heroTitle)
            .getComputedStyle(heroTitle)
        : null;

    const cssDeclaresHeroFlex =
      /\.hero[^{]*\{[^}]*display\s*:\s*flex/i
        .test(css);

    console.log(
      "CSS_SCOPE_CHECK",
      {
        heroDisplay:
          heroStyle.display,
        heroMinHeight:
          heroStyle.minHeight,
        heroPadding:
          heroStyle.padding,
        heroTitleFontSize:
          titleStyle?.fontSize,
        cssDeclaresHeroFlex,
        matchedRules:
          getMatchedRules(hero)
      }
    );

    if (
      cssDeclaresHeroFlex &&
      (
        heroStyle.display !== "flex" ||
        heroStyle.paddingTop === "0px" ||
        heroStyle.minHeight === "0px"
      )
    ) {
      console.error(
        "CSS_SCOPE_FAILED",
        {
          selector: ".hero",
          expectedDisplay: "flex",
          actualDisplay:
            heroStyle.display,
          minHeight:
            heroStyle.minHeight,
          paddingTop:
            heroStyle.paddingTop,
          className:
            getElementClassName(hero),
          matchedRules:
            getMatchedRules(hero)
        }
      );

      throw new Error(
        "CSS_SCOPE_FAILED: .hero styles were not applied before semantic analysis"
      );
    }
  };

  let sandboxFrame: HTMLIFrameElement | null = null;
  let sandbox: HTMLElement | null = null;

  try {
    console.log("🔥 RAW HTML", htmlString);

    activeSemanticReplacementMap =
      new WeakMap();
    activeSemanticReplacementDiagnostics =
      [];

    const normalizedHtml =
      normalizeImportedHtml(
        htmlString
      );

    const parser = new DOMParser();
    const parsedDocument = parser.parseFromString(normalizedHtml, "text/html");
    const externalCSS = await extractExternalCSS(parsedDocument);
    const inlineCSS =
      Array.from(
        parsedDocument.querySelectorAll("style")
      )
        .map(style => style.textContent || "")
        .join("\n");

    sandboxFrame = document.createElement("iframe");
    sandboxFrame.setAttribute("aria-hidden", "true");
    sandboxFrame.style.position = "absolute";
    sandboxFrame.style.left = "-99999px";
    sandboxFrame.style.top = "-99999px";
    sandboxFrame.style.width = "1440px";
    sandboxFrame.style.height = "2400px";
    sandboxFrame.style.border = "0";
    sandboxFrame.style.visibility = "hidden";
    document.body.appendChild(sandboxFrame);

    const iframeDocument =
      sandboxFrame.contentDocument;

    if (!iframeDocument) {
      throw new Error(
        "CSS_SCOPE_FAILED: import iframe document could not be created"
      );
    }

    iframeDocument.open();
    iframeDocument.write(
      normalizedHtml
    );
    iframeDocument.close();

    sandbox = iframeDocument.body;

    const importedCSS =
      `${externalCSS}\n${inlineCSS}`;

    if (importedCSS.trim()) {
      const style = iframeDocument.createElement("style");
      style.setAttribute(
        "data-html-import-css",
        "true"
      );
      style.textContent = importedCSS;
      iframeDocument.head.appendChild(
        style
      );
    }

    sandbox.classList.add(
      IMPORT_SANDBOX_CLASS
    );

    console.log(
      "IFRAME_IMPORT_CHECK",
      {
        usesIframe:
          true,
        hasHeaderHero:
          !!sandbox.querySelector("header.hero"),
        headContainsHeroRule:
          iframeDocument.head.innerHTML.includes(".hero"),
        headPreview:
          iframeDocument.head.innerHTML.slice(0, 1200)
      }
    );

    await waitForStyleApplication();
    logImportSandboxCssDiagnostics(
      iframeDocument,
      sandbox,
      importedCSS
    );
    console.log("NAV CSS MATCH CHECK", {
  cssHasNavRule:
    importedCSS.includes(".nav"),
  cssHasRootVars:
    importedCSS.includes(":root"),
  navComputed:
    (() => {
      const nav = sandbox.querySelector("nav") as HTMLElement | null;
      const s = nav ? getElementWindow(nav).getComputedStyle(nav) : null;

      return s
        ? {
            background: s.background,
            backgroundColor: s.backgroundColor,
            color: s.color,
            display: s.display,
            padding: s.padding
          }
        : null;
    })()
});

    assertImportedCSSApplied(
      sandbox,
      importedCSS
    );
    const body = sandbox;

    const originalDomTextNodes =
      collectDomTextNodes(
        body
      );

    console.log(
      "IMPORT_TEXT_COVERAGE_ORIGINAL_DOM",
      {
        textNodeCount:
          originalDomTextNodes.length,
        textNodes:
          originalDomTextNodes
      }
    );

    const designTokens = extractDesignTokens(body);
    console.log("🎨 EXTRACTED DESIGN TOKENS", designTokens);

    const {
      ownership,
      semanticBlocks
    } = runSemanticPipeline(
      body,
      getElementId,
      context
    );
console.log(
  "SEMANTIC CLAIMED",
  semanticBlocks.map((b:any) => ({
    semantic:
      b.emitted?.meta?.semanticType,
    resolver:
      b.resolverName ||
      b.emitted?.meta?.resolverName,

    tag:
      b.claimedNode?.element?.tagName,

    className:
      getElementClassName(
        b.claimedNode?.element
      )
  }))
);

console.log(
  "ACADEMY_TRAINING_SEMANTIC_CLAIMS",
  semanticBlocks
    .filter((entry: any) =>
      textMatchesAcademyTraining(
        entry.claimedNode?.element?.textContent || ""
      ) ||
      textMatchesAcademyTraining(
        getElementClassName(
          entry.claimedNode?.element
        )
      )
    )
    .map((entry: any) => ({
      semantic:
        entry.emitted?.meta?.semanticType,
      resolver:
        entry.resolverName ||
        entry.emitted?.meta?.resolverName,
      tag:
        entry.claimedNode?.element?.tagName,
      className:
        getElementClassName(
          entry.claimedNode?.element
        ),
      text:
        normalizeDiagnosticText(
          entry.claimedNode?.element?.textContent || ""
        ).slice(
          0,
          500
        ),
      emittedTextProps:
        collectTextProps(
          [entry.emitted]
        )
    }))
);

logTrustSectionAnalysis(
  "after-semantic-pipeline",
  body,
  semanticBlocks
);

getSafeChildren(body).forEach((child) => {
  console.log(
    "BODY ELEMENT",
    child.tagName,
    getElementClassName(
      child
    )
  );
});

console.log(
  "🚨 SEMANTIC TYPES JSON",
  JSON.stringify(
    semanticBlocks.map((b:any) => ({
      semantic:
        b.emitted?.meta?.semanticType,

      tag:
        b.claimedNode?.element?.tagName,

      className:
        getElementClassName(
          b.claimedNode?.element
        )
    })),
    null,
    2
  )
);

console.log(
  JSON.stringify(
    semanticBlocks.map((b: any) => ({
      semantic: b.emitted?.meta?.semanticType
    })),
    null,
    2
  )
);

console.log(
  "FEATURE_PILLARS EMITTED TREE",
  JSON.stringify(
    semanticBlocks
      .filter(
        (entry: any) =>
          entry.emitted?.meta?.semanticType ===
          "FEATURE_PILLARS"
      )
      .map((entry: any) => ({
        semantic:
          entry.emitted?.meta?.semanticType,
        claimed:
          describeClaimedElement(
            entry.claimedNode?.element,
            body
          ),
        tree:
          summarizeImportBlockTree(
            entry.emitted
          ),
        flexItems:
          collectDescendantsByType(
            [entry.emitted],
            "flexItem"
          ).map((block: any) => ({
            id: block.id,
            childTypes:
              (block.children || []).map(
                (child: any) => child.type
              ),
            desktop:
              block.data?.style?.desktop || {}
          }))
      })),
    null,
    2
  )
);
    console.log(
  "SEMANTIC CLAIMED",
  semanticBlocks.map((b: any) => ({
    type:
      b.emitted?.meta?.semanticType,
    className:
      getElementClassName(
        b.claimedNode?.element
      ),
    emittedType:
      b.emitted?.type,
    hasStyle:
      !!b.emitted?.data?.style?.desktop
  }))
);
    const ownershipBuckets = toOwnershipBuckets(ownership);
    console.log("🔥 OWNERSHIP BUCKETS", ownershipBuckets);
    const finalBlocks: SerializedBlock[] = [];
    activeSemanticReplacementMap =
      createSemanticReplacementMap(
        semanticBlocks
      );



console.log(
  "GRIDITEM FINALBLOCKS",
  findGridItems(finalBlocks).map((b) => ({
    style: b.data?.style?.desktop
  }))
);




    getSafeChildren(body).forEach((child, index) => {
      const matchedSemantic = semanticBlocks.find((b: any) => {
        const claimed = b.claimedNode?.element;
        return claimed === child ;
      });
console.log(
  "BODY CHILD",
  getElementClassName(
    child
  ) || child.tagName,
  matchedSemantic?.emitted?.meta?.semanticType
);
console.log(
  "BODY CHILD SEMANTIC MERGE CHECK",
  {
    index,
    bodyChild:
      describeClaimedElement(
        child,
        body
      ),
    directMatch:
      matchedSemantic?.emitted?.meta?.semanticType || null,
    nestedSemanticMatches:
      semanticBlocks
        .filter((entry: any) => {
          const claimed =
            entry.claimedNode?.element;

          return (
            claimed &&
            claimed !== child &&
            child.contains(claimed)
          );
        })
        .map((entry: any) => ({
          semantic:
            entry.emitted?.meta?.semanticType,
          claimed:
            describeClaimedElement(
              entry.claimedNode?.element,
              body
            )
        }))
  }
);
  if (matchedSemantic) {
  finalBlocks.push(
    matchedSemantic.emitted
  );

  logSemanticDroppedText(
    child,
    matchedSemantic.emitted
  );
} else {
  const nestedSemanticMatches =
    semanticBlocks.filter((entry: any) => {
      const claimed =
        entry.claimedNode?.element;

      return (
        claimed &&
        claimed !== child &&
        child.contains(claimed)
      );
    });

  if (nestedSemanticMatches.length > 0) {
    nestedSemanticMatches.forEach((entry: any) => {
      if (entry.emitted) {
        finalBlocks.push(
          entry.emitted
        );

        if (
          entry.claimedNode?.element
        ) {
          logSemanticDroppedText(
            entry.claimedNode.element,
            entry.emitted
          );
        }
      }
    });

    return;
  }

  const compiled = parseDomToBlocks(
    child,
    [index],
    ownershipBuckets,
    warnings,
    matcherHits
  );

  finalBlocks.push(
    ...splitNestedSemanticSectionsForRoot(
      compiled
    )
  );
}
    });

preserveMissingSemanticBlocks(
  "finalBlocks",
  finalBlocks,
  semanticBlocks
);

assertFeaturePillarsPreservedAfterMerge(
  "finalBlocks",
  finalBlocks,
  semanticBlocks
);

const semanticMergedBlocks =
  purgeEmptyBlocks(
    finalBlocks as any
  );

logLargeLayoutBlocks(
  "semanticMergedBlocks",
  semanticMergedBlocks
);

logFeaturePillarsStageTransition(
  "purgeEmptyBlocks.semanticMergedBlocks",
  finalBlocks,
  semanticMergedBlocks,
  "purgeEmptyBlocks(finalBlocks)"
);

assertFeaturePillarsPreservedAfterMerge(
  "semanticMergedBlocks",
  semanticMergedBlocks,
  semanticBlocks
);

assertNoNullChildren(
  semanticMergedBlocks,
  "FINAL_BLOCKS_AFTER_SEMANTIC_MERGE"
);

console.log(
  "FINAL BLOCKS",
  semanticMergedBlocks.map((b: any) => ({
    type: b.type,
    semantic:
      b.meta?.semanticType,
    hasStyle:
      !!b.data?.style?.desktop
  }))
);

console.log(
  "FINAL BLOCKS TOP LEVEL SEMANTICS",
  {
    beforePurge:
      finalBlocks.map((b: any) => ({
        id:
          b.id,
        type:
          b.type,
        semantic:
          b.meta?.semanticType,
        childTypes:
          (b.children || []).map(
            (child: any) => child?.type
          )
      })),
    afterPurge:
      semanticMergedBlocks.map((b: any) => ({
        id:
          b.id,
        type:
          b.type,
        semantic:
          b.meta?.semanticType,
        childTypes:
          (b.children || []).map(
            (child: any) => child?.type
          )
      }))
  }
);

console.log(
  "FEATURE_PILLARS FINAL LOCATION CHECK",
  JSON.stringify(
    getFeaturePillarsLocationReport(
      finalBlocks,
      semanticMergedBlocks
    ),
    null,
    2
  )
);

console.log(
  "FINAL BLOCKS TREE",
  JSON.stringify(
    semanticMergedBlocks.map(
      summarizeImportBlockTree
    ),
    null,
    2
  )
);

logTrustSectionAnalysis(
  "after-final-blocks",
  body,
  semanticBlocks,
  semanticMergedBlocks
);

console.log(
  "FEATURE_PILLARS FINAL PRESENCE",
  JSON.stringify(
    {
      exists:
        collectFeaturePillarsBlocks(
          semanticMergedBlocks
        ).length > 0,
      sections:
        collectFeaturePillarsBlocks(
          semanticMergedBlocks
        ).map((block: any) => ({
          id: block.id,
          type: block.type,
          semantic:
            block.meta?.semanticType,
          childTypes:
            (block.children || []).map(
              (child: any) => child.type
            ),
          flexItems:
            collectDescendantsByType(
              [block],
              "flexItem"
            ).map((item: any) => ({
              id: item.id,
              childTypes:
                (item.children || []).map(
                  (child: any) => child.type
                ),
              desktop:
                item.data?.style?.desktop || {}
            }))
        }))
    },
    null,
    2
  )
);

logFeatureFlexItemStyles(
  "FINALBLOCKS",
  semanticMergedBlocks
);
   // =========================================================
// PIPELINE
// =========================================================

const cleanedBlocks =
  purgeEmptyBlocks(
    semanticMergedBlocks as any
  );

logLargeLayoutBlocks(
  "cleanedBlocks",
  cleanedBlocks
);

const heroBlockAfterPurge =
  cleanedBlocks[0];
const kpiSectionAfterPurge =
  heroBlockAfterPurge?.children?.[0]?.children?.[0]?.children?.find(
    (child: any) =>
      child.children?.length >= 3
  );
console.log(
  "KPI AFTER PURGE",
  kpiSectionAfterPurge?.children?.length
);

logFeaturePillarsStageTransition(
  "cleanedBlocks",
  semanticMergedBlocks,
  cleanedBlocks,
  "purgeEmptyBlocks(semanticMergedBlocks)"
);

assertFeaturePillarsPreservedAfterMerge(
  "cleanedBlocks",
  cleanedBlocks,
  semanticBlocks
);

assertNoNullChildren(
  cleanedBlocks,
  "CLEANED_BLOCKS"
);


console.log(
  "GRIDITEM CLEANED",
  findGridItems(cleanedBlocks).map((b) => ({
    style: b.data?.style?.desktop
  }))
);

logFeatureFlexItemStyles(
  "CLEANED",
  cleanedBlocks
);
// helper 

const ROOT_ALLOWED_TYPES =

  new Set([

    "section",

    "navbar"

  ]);
  
const wrapInvalidRootBlocks = (
  blocks: SerializedBlock[]
): SerializedBlock[] => {
  const fixed: SerializedBlock[] = [];
  let pending: SerializedBlock[] = [];

  const flush = () => {
    if (!pending.length) return;

    fixed.push(
      createFallbackFlexWrapper(
        [
          "autoRoot",
          fixed.length
        ],
        pending
      ) as any
    );

    pending = [];
  };

  blocks.forEach((block) => {
    if (ROOT_ALLOWED_TYPES.has(block.type)) {
      flush();
      fixed.push(block);
      return;
    }

    pending.push(block);
  });

  flush();

  return fixed.map((block, index) => {
    if (block.type === "flex") {
      return {
        id: `auto-root-section-${index}`,
        type: "section",
        data: {
          props: {},
          style: {
            desktop: {},
            tablet: {},
            mobile: {}
          }
        },
        children: [block]
      } as SerializedBlock;
    }

    return block;
  });
};


const normalized =
  wrapInvalidRootBlocks(
    normalizeTree(
      cleanedBlocks
    ) as any
  );

logLargeLayoutBlocks(
  "normalizedBlocks",
  normalized
);


logFeaturePillarsStageTransition(
  "normalizedBlocks",
  cleanedBlocks,
  normalized,
  "normalizeTree(cleanedBlocks)"
);

assertFeaturePillarsPreservedAfterMerge(
  "normalizedBlocks",
  normalized,
  semanticBlocks
);

assertNoNullChildren(
  normalized,
  "NORMALIZED_BLOCKS"
);


console.log(
  "GRIDITEM NORMALIZED",
  JSON.stringify(
    findGridItems(normalized).map((b) => ({
      id: b.id,
      style: b.data?.style?.desktop
    })),
    null,
    2
  )
);

logFeatureFlexItemStyles(
  "NORMALIZED",
  normalized
);

console.log(
  "ROOT CHILDREN BEFORE INVARIANT",
  normalized.map((child: any) => ({
    id: child.id,
    type: child.type,
    semantic: child.meta?.semanticType,
    childTypes: (child.children || []).map(
      (c: any) => c.type
    )
  }))
);


assertTreeInvariants(
  normalized as any
);

const normalizedWithTokens =
  applyDesignTokensToBlocks(
    normalized as any,
    designTokens
  );

logFeaturePillarsStageTransition(
  "tokenizedBlocks",
  normalized,
  normalizedWithTokens,
  "applyDesignTokensToBlocks(normalized)"
);

assertFeaturePillarsPreservedAfterMerge(
  "tokenizedBlocks",
  normalizedWithTokens,
  semanticBlocks
);

assertNoNullChildren(
  normalizedWithTokens,
  "TOKENIZED_BLOCKS"
);

  console.log(
  "GRIDITEM TOKENS",
  findGridItems(normalizedWithTokens).map((b) => ({
    style: b.data?.style?.desktop
  }))
);

logFeatureFlexItemStyles(
  "TOKENS",
  normalizedWithTokens
);


const layoutDensity =
  analyzeLayoutDensity(
    normalizedWithTokens as any
  );

const sectionProfiled =
  applySectionVisualProfiles(
    normalizedWithTokens as any,
    layoutDensity
  );

logFeaturePillarsStageTransition(
  "profiledBlocks",
  normalizedWithTokens,
  sectionProfiled,
  "applySectionVisualProfiles(normalizedWithTokens)"
);

assertFeaturePillarsPreservedAfterMerge(
  "profiledBlocks",
  sectionProfiled,
  semanticBlocks
);

assertNoNullChildren(
  sectionProfiled,
  "SECTION_PROFILED_BLOCKS"
);


  console.log(
  "GRIDITEM PROFILED",
  findGridItems(sectionProfiled).map((b) => ({
    style: b.data?.style?.desktop
  }))
);

logFeatureFlexItemStyles(
  "PROFILED",
  sectionProfiled
);

assertTreeInvariants(
  sectionProfiled as any
);


const visualBlocks =
  reconstructVisualRuntime(
    sectionProfiled as any
  );

logLargeLayoutBlocks(
  "visualBlocks",
  visualBlocks as any
);

console.log(
  "GLOBAL_SCALE_REPORT_REACHED"
);

console.log(
  "GLOBAL_SCALE_REPORT",
  {
    visualBlocksCount:
      visualBlocks?.length,
    firstTypes:
      visualBlocks
        ?.slice(0, 5)
        .map((block: any) => ({
          type:
            block.type,
          semantic:
            block.meta?.semanticType
        }))
  }
);

console.log(
  "KPI ROW AFTER VISUAL",
  JSON.stringify(
    visualBlocks[0]?.children?.[0]?.children?.[0]?.children,
    null,
    2
  )
);

const blockContainsText = (
  block: any,
  text: string
): boolean => {
  if (!block) {
    return false;
  }

  const props =
    block.data?.props || {};

  const content =
    [
      props.content,
      props.label,
      props.text
    ]
      .filter(Boolean)
      .join(" ");

  if (
    content
      .toLowerCase()
      .includes(
        text.toLowerCase()
      )
  ) {
    return true;
  }

  return (block.children || []).some(
    (child: any) =>
      blockContainsText(
        child,
        text
      )
  );
};

const collectSectionsContainingText = (
  blocks: any[],
  text: string
) =>
  blocks
    .filter(
      block =>
        block?.type === "section" &&
        blockContainsText(
          block,
          text
        )
    )
    .map(
      summarizeImportBlockTree
    );

const summarizeStyleBox = (
  block: any
) => {
  const style =
    getDesktopStyle(
      block
    );

  return {
    id:
      block?.id,
    type:
      block?.type,
    width:
      style?.width,
    maxWidth:
      style?.maxWidth,
    fontSize:
      style?.fontSize,
    lineHeight:
      style?.lineHeight,
    textAlign:
      style?.textAlign
  };
};

const collectTitleParentChains = (
  blocks: any[],
  text: string
) => {
  const chains: any[] = [];

  const walk = (
    block: any,
    parents: any[] = []
  ) => {
    if (!block) {
      return;
    }

    const content =
      [
        block?.data?.props?.content,
        block?.props?.content
      ]
        .filter(Boolean)
        .join(" ");

    if (
      block.type === "title" &&
      content
        .toLowerCase()
        .includes(
          text.toLowerCase()
        )
    ) {
      chains.push({
        title:
          content,
        parentChain:
          [
            ...parents,
            block
          ].map(
            summarizeStyleBox
          )
      });
    }

    (block.children || []).forEach(
      (child: any) =>
        walk(
          child,
          [
            ...parents,
            block
          ]
        )
    );
  };

  blocks.forEach(
    block =>
      walk(
        block
      )
  );

  return chains;
};

console.log(
  "TRUST_SECTION_TREE",
  JSON.stringify(
    collectSectionsContainingText(
      visualBlocks as any,
      "Ils nous font confiance"
    ),
    null,
    2
  )
);

console.log(
  "CTA_SECTION_TREE",
  JSON.stringify(
    {
      sections:
        collectSectionsContainingText(
          visualBlocks as any,
          "Prêt à passer"
        ),
      titleParentChains:
        collectTitleParentChains(
          visualBlocks as any,
          "Prêt à passer"
        )
    },
    null,
    2
  )
);

logFeaturePillarsStageTransition(
  "visualBlocks",
  sectionProfiled,
  visualBlocks,
  "reconstructVisualRuntime(sectionProfiled)"
);

assertFeaturePillarsPreservedAfterMerge(
  "visualBlocks",
  visualBlocks,
  semanticBlocks
);

assertNoNullChildren(
  visualBlocks,
  "VISUAL_BLOCKS"
);


  console.log(
  "GRIDITEM VISUAL",
  findGridItems(visualBlocks).map((b) => ({
    style: b.data?.style?.desktop
  }))
);

logFeatureFlexItemStyles(
  "VISUAL",
  visualBlocks
);

const finalTextProps =
  collectTextProps(
    visualBlocks as any
  );

const finalDroppedDomTextNodes =
  originalDomTextNodes.filter(
    textNode =>
      !textIsRepresented(
        textNode.text,
        finalTextProps
      )
  );

console.log(
  "IMPORT_TEXT_COVERAGE_FINAL_BLOCKS",
  {
    originalDomTextNodeCount:
      originalDomTextNodes.length,
    finalTextPropCount:
      finalTextProps.length,
    finalTextProps,
    droppedDomTextNodeCount:
      finalDroppedDomTextNodes.length,
    droppedDomTextNodes:
      finalDroppedDomTextNodes
  }
);

if (
  sandboxFrame?.parentNode
) {
  sandboxFrame.parentNode.removeChild(
    sandboxFrame
  );
}

activeSemanticReplacementMap =
  new WeakMap();
activeSemanticReplacementDiagnostics =
  [];

assertTreeInvariants(
  visualBlocks as any
);

const serializableVisualBlocks =
  sanitizeBlockTreeStyles(
    visualBlocks as any,
    "importHtmlDocument.finalBlocks"
  );

return {
  blocks:
    serializableVisualBlocks as any,

  warnings,

  matcherHits,

  designTokens,

  layoutDensity,
};

  } catch (error) {
    activeSemanticReplacementMap =
      new WeakMap();
    activeSemanticReplacementDiagnostics =
      [];

    if (
      sandboxFrame?.parentNode
    ) {
      sandboxFrame.parentNode.removeChild(
        sandboxFrame
      );
  }

    console.error("Critical import pipeline error:", error);

    if (
      error instanceof Error &&
      error.name === "InvariantViolationException"
    ) {
      throw error;
    }

    warnings.push({
      type: "CRITICAL_IMPORT_FAILURE",
      message: error instanceof Error ? error.message : "Unknown import failure",
      path: "root",
    });
    return { blocks: [], warnings, matcherHits };
  }




  /////////////////////////////////////////
  function findGridItems(blocks: any[]): any[] {
  const result: any[] = [];

  const walk = (items: any[]) => {
    items.forEach((item) => {
      if (item.type === "gridItem") {
        result.push(item);
      }

      if (item.children?.length) {
        walk(item.children);
      }
    });
  };

  walk(blocks);

  return result;
}

function logFeatureFlexItemStyles(
  label: string,
  blocks: any[]
) {
  const result: any[] = [];

  const walk = (
    items: any[],
    semanticSection?: string
  ) => {
    items.forEach((item) => {
      const nextSemantic =
        item?.meta?.semanticType ||
        semanticSection;

      if (
        nextSemantic === "FEATURE_PILLARS" &&
        item.type === "flexItem"
      ) {
        result.push({
          id: item.id,
          type: item.type,
          childTypes:
            (item.children || []).map(
              (child: any) => child.type
            ),
          desktop:
            item.data?.style?.desktop || {}
        });
      }

      if (item.children?.length) {
        walk(
          item.children,
          nextSemantic
        );
      }
    });
  };

  walk(blocks);

  console.log(
    `FEATURE_PILLARS FLEXITEM ${label}`,
    JSON.stringify(
      result,
      null,
      2
    )
  );
}

function collectDescendantsByType(
  blocks: any[],
  type: string
) {
  const result: any[] = [];

  const walk = (
    items: any[]
  ) => {
    items.forEach((item) => {
      if (item?.type === type) {
        result.push(item);
      }

      if (item?.children?.length) {
        walk(item.children);
      }
    });
  };

  walk(blocks || []);

  return result;
}

function createSemanticReplacementMap(
  semanticBlocks: any[]
) {
  const map =
    new WeakMap<
      HTMLElement,
      SerializedBlock
    >();

  const body =
    semanticBlocks.find(
      (entry: any) =>
        entry.claimedNode?.element
          ?.ownerDocument?.body
    )?.claimedNode?.element
      ?.ownerDocument?.body as HTMLElement | undefined;

  const registered =
    semanticBlocks
      .map((entry: any) => {
        const element =
          entry.claimedNode
            ?.element as HTMLElement | undefined;

        const emitted =
          entry.emitted as SerializedBlock | undefined;

        if (
          !element ||
          !emitted
        ) {
          return null;
        }

        map.set(
          element,
          emitted
        );

        return {
          semantic:
            emitted.meta?.semanticType,
          resolver:
            entry.resolverName ||
            emitted.meta?.resolverName,
          emittedType:
            emitted.type,
          emittedBlockType:
            emitted.type,
          emittedChildTypes:
            (emitted.children || []).map(
              (child: any) => child?.type
            ),
          tag:
            element.tagName,
          id:
            element.id || "",
          className:
            getElementClassName(
              element
            ),
          structuralPath:
            entry.claimedNode?.path,
          bodyDirectIndex:
            body
              ? getSafeChildren(body)
                  .findIndex(
                    child => child === element
                  )
              : -1
        };
      })
      .filter(Boolean);

  activeSemanticReplacementDiagnostics =
    registered as Array<Record<string, any>>;

  console.log(
    "SEMANTIC REPLACEMENT MAP",
    {
      size:
        registered.length,
      replacements:
        registered
    }
  );

  return map;
}

function collectFeaturePillarsBlocks(
  blocks: any[]
) {
  const result: any[] = [];

  const walk = (
    items: any[]
  ) => {
    items.forEach((item) => {
      if (
        item?.meta?.semanticType ===
        "FEATURE_PILLARS"
      ) {
        result.push(item);
      }

      if (item?.children?.length) {
        walk(item.children);
      }
    });
  };

  walk(blocks || []);

  return result;
}

function collectSemanticBlocks(
  blocks: any[]
) {
  const result: any[] = [];

  const walk = (
    items: any[]
  ) => {
    items.forEach((item: any) => {
      if (item?.meta?.semanticType) {
        result.push(item);
      }

      if (item?.children?.length) {
        walk(item.children);
      }
    });
  };

  walk(blocks || []);

  return result;
}

function collectAllBlocks(
  blocks: any[]
) {
  const result: any[] = [];

  const walk = (
    items: any[]
  ) => {
    items.forEach((item: any) => {
      if (!item) {
        return;
      }

      result.push(item);

      if (item.children?.length) {
        walk(item.children);
      }
    });
  };

  walk(blocks || []);

  return result;
}

function splitNestedSemanticSectionsForRoot(
  blocks: SerializedBlock[]
): SerializedBlock[] {
  const result: SerializedBlock[] = [];

  const pushSectionSegment = (
    section: SerializedBlock,
    children: SerializedBlock[],
    index: number
  ) => {
    if (!children.length) {
      return;
    }

    result.push({
      ...section,
      id:
        `${section.id}-segment-${index}`,
      children
    });
  };

  blocks.forEach((block: SerializedBlock) => {
    if (
      isSemanticBlock(block) ||
      block.type !== COMPILER_BLOCK_TYPES.SECTION
    ) {
      result.push(block);
      return;
    }

    const children =
      block.children || [];

    if (
      !children.some(
        isSemanticBlock
      )
    ) {
      result.push(block);
      return;
    }

    let pendingChildren: SerializedBlock[] = [];
    let segmentIndex = 0;

    children.forEach((child: SerializedBlock) => {
      if (
        isSemanticBlock(child)
      ) {
        pushSectionSegment(
          block,
          pendingChildren,
          segmentIndex
        );
        segmentIndex += 1;
        pendingChildren = [];
        result.push(child);
        return;
      }

      pendingChildren.push(child);
    });

    pushSectionSegment(
      block,
      pendingChildren,
      segmentIndex
    );
  });

  return result;
}

function preserveMissingSemanticBlocks(
  stage: string,
  blocks: any[],
  semanticBlocks: any[]
) {
  const existingIds =
    new Set(
      collectAllBlocks(
        blocks || []
      ).map((block: any) => block?.id)
    );

  semanticBlocks.forEach((entry: any) => {
    const emitted =
      entry?.emitted;
    const semanticType =
      emitted?.meta?.semanticType;

    if (
      !emitted ||
      !semanticType ||
      existingIds.has(
        emitted.id
      )
    ) {
      return;
    }

    const emittedSubtreeIds =
      collectAllBlocks(
        [emitted]
      )
        .map((block: any) => block?.id)
        .filter(Boolean);

    const overlappingIds =
      emittedSubtreeIds.filter(
        (id: string) =>
          existingIds.has(
            id
          )
      );

    if (
      overlappingIds.length
    ) {
      console.warn(
        "SEMANTIC_RESTORE_SKIPPED_DUPLICATE_SUBTREE",
        {
          stage,
          semanticType,
          id:
            emitted.id,
          overlappingIds
        }
      );

      return;
    }

    

    console.log(
      "SEMANTIC_BLOCK_RESTORED_AFTER_MERGE",
      {
        stage,
        semanticType,
        id:
          emitted.id,
        type:
          emitted.type,
        childrenCount:
          (emitted.children || []).length
      }
    );

    blocks.push(
      emitted
    );
    existingIds.add(
      emitted.id
    );
  });
}

function assertFeaturePillarsPreservedAfterMerge(
  stage: string,
  blocks: any[],
  semanticBlocks: any[]
) {
  const expectedFeaturePillars =
    semanticBlocks.filter(
      (entry: any) =>
        entry?.emitted?.meta?.semanticType ===
        "FEATURE_PILLARS"
    );

  if (!expectedFeaturePillars.length) {
    return;
  }

  const actualFeaturePillars =
    collectFeaturePillarsBlocks(
      blocks || []
    );

  if (actualFeaturePillars.length > 0) {
    return;
  }

  console.error(
    "FEATURE_PILLARS_LOST_AFTER_MERGE",
    {
      stage,
      expected:
        expectedFeaturePillars.map((entry: any) => ({
          id:
            entry.emitted?.id,
          type:
            entry.emitted?.type,
          childrenCount:
            (entry.emitted?.children || []).length,
          style:
            entry.emitted?.data?.style ||
            entry.emitted?.style ||
            null
        })),
      topLevelSemanticTypes:
        summarizeTopLevelSemanticTypes(
          blocks || []
        )
    }
  );

  throw new Error(
    "FEATURE_PILLARS_LOST_AFTER_MERGE"
  );
}

function summarizeTopLevelSemanticTypes(
  blocks: any[]
) {
  return (blocks || []).map((block: any) => ({
    id:
      block?.id,
    type:
      block?.type,
    semantic:
      block?.meta?.semanticType || null,
    childTypes:
      (block?.children || []).map(
        (child: any) => child?.type
      )
  }));
}

function summarizeFeaturePillarsStage(
  blocks: any[]
) {
  const featureBlocks =
    collectFeaturePillarsBlocks(
      blocks || []
    );

  return {
    exists:
      featureBlocks.length > 0,
    count:
      featureBlocks.length,
    topLevelSemanticTypes:
      summarizeTopLevelSemanticTypes(
        blocks || []
      ),
    featureBlocks:
      featureBlocks.map((block: any) => ({
        id:
          block?.id,
        type:
          block?.type,
        childrenCount:
          (block?.children || []).length,
        childTypes:
          (block?.children || []).map(
            (child: any) => child?.type
          ),
        style:
          block?.data?.style ||
          block?.style ||
          null
      }))
  };
}

function logFeaturePillarsStageTransition(
  stage: string,
  beforeBlocks: any[],
  afterBlocks: any[],
  reason?: string
) {
  const beforeFeatureBlocks =
    collectFeaturePillarsBlocks(
      beforeBlocks || []
    );
  const afterFeatureBlocks =
    collectFeaturePillarsBlocks(
      afterBlocks || []
    );
  const afterIds =
    new Set(
      afterFeatureBlocks.map(
        (block: any) => block?.id
      )
    );

  console.log(
    "FEATURE_PILLARS_STAGE_DIAGNOSTIC",
    {
      stage,
      before:
        summarizeFeaturePillarsStage(
          beforeBlocks || []
        ),
      after:
        summarizeFeaturePillarsStage(
          afterBlocks || []
        )
    }
  );

  beforeFeatureBlocks
    .filter(
      (block: any) =>
        !afterIds.has(
          block?.id
        )
    )
    .forEach((block: any) => {
      console.log(
        "BLOCK_REMOVED_FEATURE_PILLARS",
        {
          stage,
          id:
            block?.id,
          type:
            block?.type,
          childrenCount:
            (block?.children || []).length,
          style:
            block?.data?.style ||
            block?.style ||
            null,
          reason:
            reason || "unknown"
        }
      );
    });
}

function getFeaturePillarsLocationReport(
  beforePurge: any[],
  afterPurge: any[]
) {
  const summarizeMatches = (
    blocks: any[]
  ) => {
    const topLevelSections =
      blocks
        .filter(
          block =>
            block?.type === "section" &&
            block?.meta?.semanticType ===
              "FEATURE_PILLARS"
        )
        .map(summarizeImportBlockTree);

    const nestedSections =
      collectFeaturePillarsBlocks(
        blocks
      )
        .filter(
          block =>
            !topLevelSections.some(
              (summary: any) =>
                summary?.id === block?.id
            )
        )
        .map(summarizeImportBlockTree);

    const nestedFlexOnly =
      collectDescendantsByType(
        blocks,
        "flex"
      )
        .filter(
          flex =>
            flex?.meta?.semanticType ===
              "FEATURE_PILLARS" ||
            flex?.data?.props?.semantic
              ?.semanticIntent ===
              "FEATURE_PILLARS" ||
            (flex.children || []).some(
              (child: any) =>
                child?.meta?.semanticType ===
                  "FEATURE_PILLARS"
            )
        )
        .map((flex: any) => ({
          id:
            flex.id,
          type:
            flex.type,
          semantic:
            flex.meta?.semanticType,
          childTypes:
            (flex.children || []).map(
              (child: any) => child?.type
            )
        }));

    return {
      topLevelSectionCount:
        topLevelSections.length,
      topLevelSections,
      nestedSectionCount:
        nestedSections.length,
      nestedSections,
      nestedFlexOnlyCount:
        nestedFlexOnly.length,
      nestedFlexOnly
    };
  };

  return {
    beforePurge:
      summarizeMatches(
        beforePurge
      ),
    afterPurge:
      summarizeMatches(
        afterPurge
      )
  };
}

function summarizeImportBlockTree(
  block: any,
  depth = 0
): any {
  if (!block) {
    return {
      invalid:
        "NULL_BLOCK_SUMMARY"
    };
  }

  if (depth > 8) {
    return {
      id:
        block.id,
      type:
        block.type,
      truncated:
        true
    };
  }

  return {
    id:
      block.id,
    type:
      block.type,
    semantic:
      block.meta?.semanticType,
    childTypes:
      (block.children || []).map(
        (child: any) => child.type
      ),
    desktop:
      block.type === "flexItem"
        ? block.data?.style?.desktop || {}
        : undefined,
    children:
      (block.children || [])
        .filter(Boolean)
        .map(
          (child: any) =>
            summarizeImportBlockTree(
              child,
              depth + 1
            )
        )
  };
}

function getDesktopStyle(
  block: any
) {
  return (
    block?.data?.style?.desktop ||
    block?.style?.desktop ||
    block?.data?.style ||
    block?.style ||
    {}
  );
}

function collectBlocksByType(
  block: any,
  type: string
) {
  const results: any[] = [];

  const walk = (
    node: any
  ) => {
    if (!node) {
      return;
    }

    if (node.type === type) {
      results.push(node);
    }

    (node.children || []).forEach(
      walk
    );
  };

  walk(block);

  return results;
}

function getFirstBlockByType(
  block: any,
  type: string
) {
  return collectBlocksByType(
    block,
    type
  )[0];
}

function parsePixelValue(
  value: unknown
) {
  if (
    typeof value !== "string"
  ) {
    return null;
  }

  const match =
    value.match(
      /(-?\d+(?:\.\d+)?)px/
    );

  return match
    ? Number(
        match[1]
      )
    : null;
}

function findSemanticEntryForBlock(
  block: any,
  semanticBlocks: any[]
) {
  const semanticType =
    block?.meta?.semanticType;

  if (!semanticType) {
    return null;
  }

  return (
    semanticBlocks.find(
      (entry: any) =>
        entry?.emitted?.id ===
          block.id ||
        entry?.emitted?.meta?.semanticType ===
          semanticType
    ) || null
  );
}

function getOriginalTitleStyle(
  sectionElement?: HTMLElement | null
) {
  const titleElement =
    sectionElement?.querySelector(
      "h1,h2,h3"
    ) as HTMLElement | null;

  if (!titleElement) {
    return null;
  }

  const computed =
    (
      titleElement.ownerDocument.defaultView ||
      window
    ).getComputedStyle(
      titleElement
    );

  return {
    text:
      titleElement.textContent
        ?.replace(/\s+/g, " ")
        .trim() || "",
    fontSize:
      computed.fontSize,
    lineHeight:
      computed.lineHeight,
    fontWeight:
      computed.fontWeight
  };
}

function summarizeGlobalScaleSection(
  block: any,
  semanticBlocks: any[]
) {
  const semanticType =
    block?.meta?.semanticType || null;
  const sectionStyle =
    getDesktopStyle(
      block
    );
  const flexBlock =
    getFirstBlockByType(
      block,
      "flex"
    );
  const innerStyle =
    getDesktopStyle(
      flexBlock
    );
  const titleBlock =
    getFirstBlockByType(
      block,
      "title"
    );
  const textBlock =
    getFirstBlockByType(
      block,
      "text"
    );
  const titleStyle =
    getDesktopStyle(
      titleBlock
    );
  const bodyStyle =
    getDesktopStyle(
      textBlock
    );
  const cardBlocks =
    [
      ...collectBlocksByType(
        block,
        "gridItem"
      ),
      ...collectBlocksByType(
        block,
        "flexItem"
      ).filter(
        (item: any) =>
          (item.children || []).some(
            (child: any) =>
              child?.type === "title"
          ) &&
          (item.children || []).some(
            (child: any) =>
              child?.type === "text"
          )
      )
    ];
  const firstCardStyle =
    getDesktopStyle(
      cardBlocks[0]
    );
  const semanticEntry =
    findSemanticEntryForBlock(
      block,
      semanticBlocks
    );
  const originalTitleStyle =
    getOriginalTitleStyle(
      semanticEntry?.claimedNode?.element
    );
  const emittedTitlePx =
    parsePixelValue(
      titleStyle.fontSize
    );
  const originalTitlePx =
    parsePixelValue(
      originalTitleStyle?.fontSize
    );

  return {
    id:
      block?.id,
    semanticType,
    sectionPadding: {
      padding:
        sectionStyle.padding,
      paddingTop:
        sectionStyle.paddingTop,
      paddingBottom:
        sectionStyle.paddingBottom,
      paddingLeft:
        sectionStyle.paddingLeft,
      paddingRight:
        sectionStyle.paddingRight
    },
    innerMaxWidth:
      innerStyle.maxWidth,
    title: {
      content:
        titleBlock?.data?.props?.content,
      fontSize:
        titleStyle.fontSize,
      lineHeight:
        titleStyle.lineHeight,
      fontWeight:
        titleStyle.fontWeight
    },
    body: {
      content:
        textBlock?.data?.props?.content,
      fontSize:
        bodyStyle.fontSize,
      lineHeight:
        bodyStyle.lineHeight
    },
    cards: {
      count:
        cardBlocks.length,
      firstPadding:
        firstCardStyle.padding ||
        [
          firstCardStyle.paddingTop,
          firstCardStyle.paddingRight,
          firstCardStyle.paddingBottom,
          firstCardStyle.paddingLeft
        ].filter(Boolean).join(" "),
      firstGap:
        firstCardStyle.gap
    },
    originalComputedTitle:
      originalTitleStyle,
    emittedTitleFontSize:
      titleStyle.fontSize,
    emittedToOriginalTitleRatio:
      emittedTitlePx &&
      originalTitlePx
        ? Number(
            (
              emittedTitlePx /
              originalTitlePx
            ).toFixed(3)
          )
        : null
  };
}

function logGlobalScaleReport(
  blocks: any[],
  semanticBlocks: any[]
) {
  console.log(
    "GLOBAL_SCALE_REPORT",
    JSON.stringify(
      (blocks || [])
        .filter(
          block =>
            block?.type === "section"
        )
        .map(block =>
          summarizeGlobalScaleSection(
            block,
            semanticBlocks
          )
        ),
      null,
      2
    )
  );
}

function assertNoNullChildren(
  blocks: any[],
  stage: string
) {
  const invalidPaths: string[] = [];

  const walk = (
    items: any[],
    path: string
  ) => {
    items.forEach(
      (
        item,
        index
      ) => {
        const itemPath =
          `${path}[${index}]`;

        if (
          item === null ||
          item === undefined
        ) {
          invalidPaths.push(
            itemPath
          );
          return;
        }

        const children =
          item.children;

        if (!children) {
          return;
        }

        if (
          !Array.isArray(children)
        ) {
          invalidPaths.push(
            `${itemPath}.children`
          );
          return;
        }

        children.forEach(
          (
            child: any,
            childIndex: number
          ) => {
            if (
              child === null ||
              child === undefined
            ) {
              invalidPaths.push(
                `${itemPath}.children[${childIndex}]`
              );
            }
          }
        );

        walk(
          children.filter(Boolean),
          `${itemPath}.children`
        );
      }
    );
  };

  walk(
    blocks || [],
    "blocks"
  );

  if (invalidPaths.length) {
    console.error(
      "NULL_CHILDREN_IN_BLOCK_TREE",
      {
        stage,
        invalidPaths
      }
    );

    throw new Error(
      `NULL_CHILDREN_IN_BLOCK_TREE: ${stage}`
    );
  }
}

function describeClaimedElement(
  element: HTMLElement | undefined,
  body: HTMLElement
) {
  if (!element) {
    return null;
  }

  const bodyChildren =
    getSafeChildren(body);

  const directBodyIndex =
    bodyChildren.findIndex(
      child => child === element
    );

  const parent =
    element.parentElement;

  return {
    tag:
      element.tagName,
    id:
      element.id || "",
    className:
      getElementClassName(
        element
      ),
    directBodyIndex,
    isDirectBodyChild:
      directBodyIndex >= 0,
    parent:
      parent
        ? {
            tag:
              parent.tagName,
            id:
              parent.id || "",
            className:
              getElementClassName(
                parent
              )
          }
        : null
  };
}
}
