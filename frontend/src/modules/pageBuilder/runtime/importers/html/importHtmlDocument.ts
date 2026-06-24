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

type ContainerChildCompileTrace = {
  compiledRootBlockIds: string[];
  compiledBlockIds: string[];
  compiledBlockTypes: string[];
  fallbackBranch:
    string | null;
};

let activeBodyChildTwoContainer:
  HTMLElement | null = null;

let activeContainerChildCompileTraces =
  new WeakMap<
    HTMLElement,
    ContainerChildCompileTrace
  >();

const TARGET_CONTAINER_CHILD_CLASSES =
  new Set([
    "svc-grid",
    "deliverables",
    "markets",
    "cta-svc",
    "other-svc"
  ]);

const getTargetContainerChildClass = (
  element: HTMLElement
) =>
  getElementClassName(
    element
  )
    .split(/\s+/)
    .find(className =>
      TARGET_CONTAINER_CHILD_CLASSES.has(
        className
      )
  ) ||
  null;

const findTargetSemanticContainer = (
  root: HTMLElement
) => {
  const containsAllTargets = (
    candidate: HTMLElement
  ) =>
    Array.from(
      TARGET_CONTAINER_CHILD_CLASSES
    ).every(
      className =>
        candidate.classList.contains(
          className
        ) ||
        !!candidate.querySelector(
          `.${className}`
        )
    );

  const candidates = [
    root,
    ...Array.from(
      root.querySelectorAll(
        "*"
      )
    ).filter(
      (
        element
      ): element is HTMLElement =>
        isHtmlElementLike(
          element
        )
    )
  ].filter(
    containsAllTargets
  );

  const getDepth = (
    element: HTMLElement
  ) => {
    let depth = 0;
    let current:
      HTMLElement | null =
      element;

    while (
      current &&
      current !== root
    ) {
      depth += 1;
      current =
        current.parentElement;
    }

    return depth;
  };

  const deepest = (
    elements: HTMLElement[]
  ) =>
    elements.sort(
      (left, right) =>
        getDepth(
          right
        ) -
        getDepth(
          left
        )
    )[0] ||
    null;

  const directChildCandidates =
    candidates.filter(
      candidate =>
        new Set(
          getSafeChildren(
            candidate
          )
            .map(
              getTargetContainerChildClass
            )
            .filter(Boolean)
        ).size ===
        TARGET_CONTAINER_CHILD_CLASSES.size
    );

  return (
    deepest(
      directChildCandidates
    ) ||
    deepest(
      candidates
    )
  );
};

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

const isTrackedContainerChild = (
  element: HTMLElement
) =>
  !!activeBodyChildTwoContainer &&
  element.parentElement ===
    activeBodyChildTwoContainer &&
  !!getTargetContainerChildClass(
    element
  );

const collectBlockIds = (
  blocks: SerializedBlock[]
) => {
  const ids: string[] = [];

  const walk = (
    items: SerializedBlock[]
  ) => {
    items.forEach(block => {
      if (block?.id) {
        ids.push(block.id);
      }

      walk(
        block?.children || []
      );
    });
  };

  walk(blocks || []);

  return ids;
};

const recordTrackedFallbackBranch = (
  element: HTMLElement,
  fallbackBranch: string
) => {
  if (
    !isTrackedContainerChild(
      element
    )
  ) {
    return;
  }

  const current =
    activeContainerChildCompileTraces.get(
      element
    ) || {
      compiledRootBlockIds: [],
      compiledBlockIds: [],
      compiledBlockTypes: [],
      fallbackBranch: null
    };

  activeContainerChildCompileTraces.set(
    element,
    {
      ...current,
      fallbackBranch
    }
  );
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

  delete nextStyle.desktop.height;
  delete nextStyle.desktop.maxHeight;
  delete nextStyle.desktop.minHeight;

  delete nextStyle.desktop.paddingTop;
  delete nextStyle.desktop.paddingBottom;

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
    computed.display === "flex"
      ? computed.flexDirection
      : "column",
  flexWrap: "nowrap",
  alignItems:
    computed.alignItems || "stretch",
  gap:
    computed.gap || "12px"
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

  recordTrackedFallbackBranch(
    element,
    "entered"
  );

  if (
    shouldSkipImportedElement(
      element
    )
  ) {
    recordTrackedFallbackBranch(
      element,
      "skipped:shouldSkipImportedElement"
    );

    return [];
  }

  totalImportedNodes++;

  if (
    totalImportedNodes >
    MAX_IMPORT_NODES
  ) {
    recordTrackedFallbackBranch(
      element,
      "skipped:MAX_IMPORT_NODES"
    );

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
    recordTrackedFallbackBranch(
      element,
      "skipped:MAX_IMPORT_DEPTH"
    );


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
    recordTrackedFallbackBranch(
      element,
      "skipped:non-visual-tag"
    );

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

  const computedSection =
    extractComputedStyles(element);

  const sectionStyle =
    sanitizeSectionLayoutStyle(
      sectionId,
      extractLayoutStyles(element)
    );

  sectionStyle.desktop = {
    ...(sectionStyle.desktop || {}),

    background:
      computedSection.background ||
      sectionStyle.desktop?.background,

    backgroundColor:
      computedSection.backgroundColor ||
      sectionStyle.desktop?.backgroundColor,

    color:
      computedSection.color ||
      sectionStyle.desktop?.color,

    padding:
      computedSection.padding ||
      sectionStyle.desktop?.padding,

    width: "100%",
    maxWidth: "100%",
    boxSizing: "border-box",
    overflow: "visible"
  };

  return [
    {
      id: sectionId,
      type: COMPILER_BLOCK_TYPES.SECTION,

      data: {
        props: {},
        style: sectionStyle
      },

      children: compiledChildren
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

        segments: []
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
    recordTrackedFallbackBranch(
      element,
      "compiled:emitFallbackStructuredContainer"
    );
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
      recordTrackedFallbackBranch(
        element,
        "compiled:mixed-direct-content"
      );
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

recordTrackedFallbackBranch(
  element,
  compiledChildren.length
    ? "compiled:flattened-wrapper"
    : "skipped:flattened-wrapper-produced-no-children"
);

return compiledChildren;
  }

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
                      flexGrow: 0,height: "auto",minHeight: "auto", minWidth: "0"
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

function splitNestedSemanticSectionsForRoot(
  blocks: SerializedBlock[],
  allowTopLevelSections = false
): SerializedBlock[] {
  const isSection = (
    block: SerializedBlock
  ) =>
    block.type ===
      COMPILER_BLOCK_TYPES.SECTION;

  const containsSection = (
    block: SerializedBlock
  ): boolean =>
    isSection(
      block
    ) ||
    (block.children || []).some(
      containsSection
    );

  const splitBlock = (
    block: SerializedBlock,
    isTopLevel = false
  ): SerializedBlock[] => {
    if (
      isSection(
        block
      ) &&
      !(
        allowTopLevelSections &&
        isTopLevel
      )
    ) {
      return [
        block
      ];
    }

    const children =
      block.children || [];

    if (
      !children.some(
        containsSection
      )
    ) {
      return [
        block
      ];
    }

    const output:
      SerializedBlock[] = [];
    let pendingChildren:
      SerializedBlock[] = [];
    let segmentIndex = 0;

    const flushPending = () => {
      if (
        !pendingChildren.length
      ) {
        return;
      }

      output.push({
        ...block,
        id:
          `${block.id}-segment-${segmentIndex}`,
        children:
          pendingChildren
      });

      segmentIndex += 1;
      pendingChildren = [];
    };

    children.forEach(
      child => {
        splitBlock(
          child,
          false
        ).forEach(
          part => {
            if (
              isSection(
                part
              )
            ) {
              flushPending();
              output.push(
                part
              );
              return;
            }

            pendingChildren.push(
              part
            );
          }
        );
      }
    );

    flushPending();

    return output;
  };

  const result =
    blocks.flatMap(
      block =>
        splitBlock(
          block,
          true
        )
    );

  return result;
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

  const directChildren =
    getSafeChildren(
      element
    );

  const children =
    directChildren.flatMap(
      (child, index) => {
        const compiled =
          parseDomToBlocks(
            child,
            [...path, index],
            ownership,
            warnings,
            matcherHits
          );

        if (
          isTrackedContainerChild(
            child
          )
        ) {
          const current =
            activeContainerChildCompileTraces.get(
              child
            );

          activeContainerChildCompileTraces.set(
            child,
            {
              compiledRootBlockIds:
                compiled
                  .map(
                    block =>
                      block.id
                  )
                  .filter(
                    (
                      id
                    ): id is string =>
                      !!id
                  ),
              compiledBlockIds:
                collectBlockIds(
                  compiled
                ),
              compiledBlockTypes:
                compiled.map(
                  block =>
                    block.type
                ),
              fallbackBranch:
                current?.fallbackBranch ||
                null
            }
          );
        }

        return splitNestedSemanticSectionsForRoot(
          compiled
        );
      }
    );

  if (
    element ===
    activeBodyChildTwoContainer
  ) {
  }

  if (!children.length) {
    return [];
  }

const constrainedMaxWidth =
  centered
    ? "1180px"
    : computed.maxWidth &&
      computed.maxWidth !== "none"
        ? computed.maxWidth
        : desktopStyle.maxWidth || "100%";

const containerStyle = {
  ...extracted,
  desktop: {
    ...desktopStyle,

    display:
      desktopStyle.display ||
      computed.display ||
      "block",

    width: "100%",
    maxWidth: constrainedMaxWidth,

    marginLeft:
      centered ? "auto" : computed.marginLeft || desktopStyle.marginLeft,

    marginRight:
      centered ? "auto" : computed.marginRight || desktopStyle.marginRight,

    paddingLeft:
      computed.paddingLeft || desktopStyle.paddingLeft,

    paddingRight:
      computed.paddingRight || desktopStyle.paddingRight,

    color:
      computed.color || desktopStyle.color,

    background:
      computed.background || desktopStyle.background,

    backgroundColor:
      computed.backgroundColor || desktopStyle.backgroundColor,

    boxSizing: "border-box",
    minWidth: "0",
    overflow: "visible"
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
  const createContainerSegment = (
    segmentChildren:
      SerializedBlock[],
    segmentIndex:
      number | null
  ): SerializedBlock => {
    const segmentSuffix =
      segmentIndex === null
        ? []
        : [
            "segment",
            segmentIndex
          ];

    return {
      id:
        generateNodeId(
          COMPILER_BLOCK_TYPES.FLEX,
          [
            ...path,
            "container",
            ...segmentSuffix
          ]
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
                ...segmentSuffix,
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
          children:
            segmentChildren
        }
      ]
    };
  };

  const isSection = (
    block: SerializedBlock
  ) =>
    block.type ===
      COMPILER_BLOCK_TYPES.SECTION;

  if (
    !children.some(
      isSection
    )
  ) {
    return [
      createContainerSegment(
        children,
        null
      )
    ];
  }

  const orderedOutput:
    SerializedBlock[] = [];
  let pendingGeneric:
    SerializedBlock[] = [];
  let segmentIndex = 0;

  const flushGeneric = () => {
    if (
      !pendingGeneric.length
    ) {
      return;
    }

    orderedOutput.push(
      createContainerSegment(
        pendingGeneric,
        segmentIndex
      )
    );

    segmentIndex += 1;
    pendingGeneric = [];
  };

  children.forEach(
    block => {
      if (
        isSection(
          block
        )
      ) {
        flushGeneric();
        orderedOutput.push(
          block
        );
        return;
      }

      pendingGeneric.push(
        block
      );
    }
  );

  flushGeneric();
  return orderedOutput;
}

function compileServiceContainerInDomOrder(
  container: HTMLElement,
  path: (string | number)[],
  ownership: OwnershipBuckets,
  warnings: ImportWarning[],
  matcherHits: ImportMatcherHit[]
): SerializedBlock[] {
  const orderedBlocks:
    SerializedBlock[] = [];

  getSafeChildren(
    container
  ).forEach(
    (
      child,
      index
    ) => {
      const replacement =
        activeSemanticReplacementMap.get(
          child
        );
      const isServiceReplacement =
        (
          replacement as any
        )?.meta
          ?.semanticType ===
        "SERVICE_PAGE_SECTION";

      if (
        replacement &&
        isServiceReplacement
      ) {
        orderedBlocks.push(
          replacement
        );
        return;
      }

      const compiled =
        parseDomToBlocks(
          child,
          [
            ...path,
            index
          ],
          ownership,
          warnings,
          matcherHits
        );

      orderedBlocks.push(
        ...splitNestedSemanticSectionsForRoot(
          compiled
        )
      );
    }
  );
  return orderedBlocks;
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
const computedStyles = extractComputedStyles(element);
const rawColumns = computedStyles.gridTemplateColumns || "";
const semanticColumns = semanticMetadata?.columnCount;
const computedColumnCount = rawColumns .split(" ").filter(Boolean).length;
const columnCount = semanticColumns || computedColumnCount || 2;
const semanticColumnCount = semanticMetadata ?.columnCount;
const finalColumnCount = computedColumnCount > 0 ? computedColumnCount   : semanticColumnCount || 2;
const normalizedColumns =
  rawColumns && rawColumns !== "none"
    ? rawColumns
    : `repeat(${finalColumnCount}, minmax(0, 1fr))`;
  // =====================================
  // NORMALIZED STYLE
  // =====================================

 const normalizedStyle = {
  desktop: {
    display: "grid",

    gridTemplateColumns:
      rawColumns && rawColumns !== "none"
        ? makeGridTracksShrinkSafe(rawColumns)
        : `repeat(${finalColumnCount}, minmax(0, 1fr))`,

    gridTemplateRows:
      style?.desktop?.gridTemplateRows ||
      style?.gridTemplateRows,

    gap:
      style?.desktop?.gap ||
      style?.gap ||
      computedStyles.gap ||
      "24px",

    padding:
      style?.desktop?.padding ||
      style?.padding ||
      computedStyles.padding,

    margin: "0 auto",
    width: "100%",
    maxWidth: "100%",
    minWidth: "0",

    backgroundColor:
      style?.desktop?.backgroundColor ||
      style?.backgroundColor ||
      computedStyles.backgroundColor,

    borderRadius:
      style?.desktop?.borderRadius ||
      style?.borderRadius ||
      computedStyles.borderRadius,

    overflow: "visible",
    boxSizing: "border-box"
  },

  tablet: {
    display: "grid",
    gridTemplateColumns:
      columnCount >= 2
        ? "repeat(2, minmax(0, 1fr))"
        : "minmax(0, 1fr)",
    gap: computedStyles.gap || "16px",
    width: "100%",
    maxWidth: "100%",
    minWidth: "0",
    boxSizing: "border-box"
  },

  mobile: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: computedStyles.gap || "12px",
    width: "100%",
    maxWidth: "100%",
    minWidth: "0",
    boxSizing: "border-box"
  }
};

return [
  {
    id: generateNodeId(
      COMPILER_BLOCK_TYPES.GRID,
      path
    ),

    type: COMPILER_BLOCK_TYPES.GRID,

    data: {
      props: {
        ...(semanticMetadata
          ? {
              semantic: semanticMetadata
            }
          : {})
      },

      style: normalizedStyle
    },

    children: getSafeChildren(element).map(
      (child, index) => {
        const childLayoutStyle =
          extractLayoutStyles(child);

        const fallbackChildren =
          fallbackCompileElement(
            child,
            [...path, index],
            ownership,
            warnings,
            matcherHits
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
                ...(childLayoutStyle.desktop || {}),
                width: "100%",
                maxWidth: "100%",
                minWidth: "0",
                overflow: "hidden",
                boxSizing: "border-box"
              },

              tablet: {
                width: "100%",
                maxWidth: "100%",
                minWidth: "0",
                overflow: "hidden",
                boxSizing: "border-box"
              },

              mobile: {
                width: "100%",
                maxWidth: "100%",
                minWidth: "0",
                overflow: "hidden",
                boxSizing: "border-box"
              }
            }
          },

          children: fallbackChildren
        };
      }
    )
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
    activeSemanticReplacementMap.get(element);

  if (semanticReplacement) {
    if (
      (semanticReplacement as any)?.meta?.semanticType?.semanticType ===
        "FOOTER" &&
      (semanticReplacement as any)?.meta?.semanticType?.preserveGenericSubtree
    ) {
      activeSemanticReplacementMap.delete(element);

     const preservedBlocks =
  parseDomToBlocks(
    element,
    path,
    ownership,
    warnings,
    matcherHits
  ).map(block => {
    const blockAny = block as any;

    return {
      ...block,
      meta: {
        ...(blockAny.meta || {}),
        semanticType: "FOOTER",
        resolverName:
          (semanticReplacement as any)?.meta?.semanticType
            ?.resolverName || "resolveFooter"
      }
    } as SerializedBlock;
  });

      activeSemanticReplacementMap.set(
        element,
        semanticReplacement
      );

      return preservedBlocks;
    }

    const hasChildren =
      Array.isArray(semanticReplacement.children) &&
      semanticReplacement.children.length > 0;

    const propsText =
      JSON.stringify(
        semanticReplacement.data?.props || {}
      );

    const hasUsefulProps =
      propsText.replace(/\s+/g, "").length > 2;

    if (hasChildren || hasUsefulProps) {
      logSemanticDroppedText(
        element,
        semanticReplacement
      );

      return [semanticReplacement];
    }
  }

  if (shouldSkipImportedElement(element)) {
    return [];
  }

  let bestMatcher: any = null;
  let highestScore = 0;

  const elementId =
    getElementId(element);

  // =====================================
  // INLINE TEXT GUARD
  // يمنع span/small داخل heading من الخروج كـ TEXT ثاني
  // =====================================

  if (
    [
      "SPAN",
      "SMALL",
      "LABEL"
    ].includes(element.tagName)
  ) {
    const isInsideHeading =
      !!element.parentElement?.closest(
        "h1,h2,h3,h4,h5,h6"
      );

    if (isInsideHeading) {
      return [];
    }

    const text =
      (element.textContent || "").trim();

    if (!text) {
      return [];
    }

    return [
      {
        id: generateNodeId(
          COMPILER_BLOCK_TYPES.TEXT,
          path
        ),

        type: COMPILER_BLOCK_TYPES.TEXT,

        data: {
          props: {
            content: text
          },

          style: extractTypographyStyles(element)
        },

        children: []
      }
    ];
  }

  const directSemanticReplacementChildren =
    getSafeChildren(element)
      .map((child, index) => ({
        child,
        index,
        replacement:
          activeSemanticReplacementMap.get(child)
      }))
      .filter(entry => !!entry.replacement);

  if (directSemanticReplacementChildren.length > 0) {
    const semanticAwareContainer =
      emitContainer(
        element,
        path,
        ownership,
        warnings,
        matcherHits,
        false
      );

    if (semanticAwareContainer.length) {
      return semanticAwareContainer;
    }
  }

  const ownedGrid =
    ownership.grids.find(
      grid =>
        grid.elementId === getElementId(element)
    );

  const ownedFlexGroup =
    ownership.flexGroups?.find(
      flex => flex.elementId === elementId
    );

  const ownedNavbar =
    ownership.navbars?.find(
      navbar => navbar.elementId === elementId
    );

  const semanticMetadata = {
    semanticIntent:
      ownedNavbar?.metadata?.semanticIntent ||
      ownedGrid?.metadata?.semanticIntent,

    semanticRegions:
      ownedNavbar?.metadata?.semanticRegions,

    columnCount:
      ownedGrid?.metadata?.columnCount
  };

  if (ownedGrid) {
    return emitGridContainer(
      element,
      path,
      ownership,
      warnings,
      matcherHits,
      extractLayoutStyles(element),
      semanticMetadata
    );
  }

  if (ownedNavbar) {
    return emitFlexContainer(
      element,
      path,
      ownership,
      warnings,
      matcherHits,
      extractLayoutStyles(element),
      semanticMetadata,
      COMPILER_BLOCK_TYPES.NAVBAR
    );
  }

  if (
    ownedFlexGroup &&
    ownership.flexGroups.some(
      candidate => candidate.elementId === elementId
    )
  ) {
    return emitFlexContainer(
      element,
      path,
      ownership,
      warnings,
      matcherHits,
      extractLayoutStyles(element),
      semanticMetadata
    );
  }

  const children =
    getSafeChildren(element);

  const hasTextContent =
    (element.textContent || "").trim().length > 0;

  const hasSemanticContent =
    hasTextContent ||
    children.some(child =>
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
      ].includes(child.tagName)
    );

  const computed =
    getElementWindow(element).getComputedStyle(element);

  const alreadyOwned =
    ownedFlexGroup || ownedNavbar || ownedGrid;

  const isFlex =
    computed.display === "flex" ||
    element.tagName === "NAV";

  const isGrid =
    computed.display === "grid";

  const shouldPreserveFlex =
    element.tagName === "NAV" ||
    (
      getSafeChildren(element).length >= 2 &&
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
    getElementWindow(element).innerWidth;

  const numericMaxWidth =
    parseFloat(computed.maxWidth || "");

  const hasConstrainedMaxWidth =
    Number.isFinite(numericMaxWidth) &&
    numericMaxWidth > 0 &&
    viewportWidth > 0 &&
    numericMaxWidth < viewportWidth;

  const hasAutoSideMargins =
    computed.marginLeft === "auto" ||
    computed.marginRight === "auto";

  const hasCenteredLayoutConstraint =
    hasAutoSideMargins || hasConstrainedMaxWidth;

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

    if (preservedContainer.length) {
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

  if (isTransparentContainer) {
    return children.flatMap((child, index) =>
      parseDomToBlocks(
        child,
        [...path, index],
        ownership,
        warnings,
        matcherHits
      )
    );
  }

  if (
    isFlex &&
    !alreadyOwned &&
    shouldPreserveFlex
  ) {
    return emitFlexContainer(
      element,
      path,
      ownership,
      warnings,
      matcherHits,
      extractLayoutStyles(element)
    );
  }

  for (const matcher of semanticMatchers) {
    const score =
      matcher.getScore(element);

    if (
      score >= matcher.threshold &&
      score > highestScore
    ) {
      highestScore = score;
      bestMatcher = matcher;
    }
  }

  if (bestMatcher) {
    matcherHits.push({
      matcher: bestMatcher.name,
      score: highestScore,
      path: path.join(".")
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
        id: generateNodeId(
          compiled.type,
          path
        )
      }
    ];
  }

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
  activeBodyChildTwoContainer = null;
  activeContainerChildCompileTraces =
    new WeakMap();
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
      }

      if (!loaded) {
        loadReport.push({
          href,
          loaded: false,
          candidates
        });

      }
    }
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
    await waitForStyleApplication();
    logImportSandboxCssDiagnostics(
      iframeDocument,
      sandbox,
      importedCSS
    );

    assertImportedCSSApplied(
      sandbox,
      importedCSS
    );
    const body = sandbox;

    const originalDomTextNodes =
      collectDomTextNodes(
        body
      );

  

    const designTokens = extractDesignTokens(body);
    const {
      ownership,
      semanticBlocks
    } = runSemanticPipeline(
      body,
      getElementId,
      context
    );


logTrustSectionAnalysis(
  "after-semantic-pipeline",
  body,
  semanticBlocks
);

getSafeChildren(body).forEach((child) => {

});

    const ownershipBuckets = toOwnershipBuckets(ownership);
    const finalBlocks: SerializedBlock[] = [];
   
    activeSemanticReplacementMap =
      createSemanticReplacementMap(
        semanticBlocks,
        body
      );

    const bodyChildTwoContainer =
      findTargetSemanticContainer(
        body
      );

    if (
      bodyChildTwoContainer
    ) {
      activeBodyChildTwoContainer =
        bodyChildTwoContainer;
    }
    getSafeChildren(body).forEach((child, index) => {
      if (
        activeBodyChildTwoContainer &&
        (
          child ===
            activeBodyChildTwoContainer ||
          child.contains(
            activeBodyChildTwoContainer
          )
        )
      ) {
        finalBlocks.push(
          ...compileServiceContainerInDomOrder(
            activeBodyChildTwoContainer,
            [
              index,
              "servicePage"
            ],
            ownershipBuckets,
            warnings,
            matcherHits
          )
        );

        return;
      }

      const matchedSemantic = semanticBlocks.find((b: any) => {
        const claimed = b.claimedNode?.element;
        return claimed === child ;
      });
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
} });
preserveMissingSemanticBlocks(
  "finalBlocks",
  finalBlocks,
  semanticBlocks
);

const orderedServiceSections =
  finalBlocks.filter(
    (block: any) =>
      block?.meta
        ?.semanticType ===
      "SERVICE_PAGE_SECTION"
  );
assertNoSectionInsideLayout(
  "finalBlocks",
  finalBlocks
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

assertNoSectionInsideLayout(
  "semanticMergedBlocks",
  semanticMergedBlocks
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

logTrustSectionAnalysis(
  "after-final-blocks",
  body,
  semanticBlocks,
  semanticMergedBlocks
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

const rootSafeCleanedBlocks =
  splitNestedSemanticSectionsForRoot(
    cleanedBlocks as any,
    true
  );

assertNoSectionInsideLayout(
  "rootSafeCleanedBlocks",
  rootSafeCleanedBlocks
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

logFeatureFlexItemStyles(
  "CLEANED",
  cleanedBlocks
);
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


const normalizedBeforeRootSafety =
  wrapInvalidRootBlocks(
    normalizeTree(
      rootSafeCleanedBlocks as any
    ) as any
  );

const normalized =
  wrapInvalidRootBlocks(
    splitNestedSemanticSectionsForRoot(
      normalizedBeforeRootSafety as any,
      true
    )
  );

assertNoSectionInsideLayout(
  "normalized",
  normalized
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


logFeatureFlexItemStyles(
  "NORMALIZED",
  normalized
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
  semanticBlocks: any[],
  importRoot?: HTMLElement
) {
  const map =
    new WeakMap<
      HTMLElement,
      SerializedBlock
    >();

  const body =
    importRoot ||
    semanticBlocks.find(
      (entry: any) =>
        entry.claimedNode?.element
          ?.ownerDocument?.body
    )?.claimedNode?.element
      ?.ownerDocument?.body as HTMLElement | undefined;

const serviceSelectorByVariant:
  Record<string, string> = {
  SERVICE_INTRO_GRID:
    ".svc-grid",
  SERVICE_DELIVERABLES:
    ".deliverables",
  SERVICE_MARKETS:
    ".markets",
  SERVICE_CTA:
    ".cta-svc",
  SERVICE_CARDS:
    ".other-svc"
};

  const resolveRegistrationElement = (
    entry: any
  ) => {
    const claimedElement =
      (
        entry?.claimedNode
          ?.element ||
        entry?.semanticResult
          ?.claimedNode
          ?.element
      ) as HTMLElement | undefined;
    const variant =
      entry?.semanticResult
        ?.variant as string | undefined;
    const serviceSelector =
      variant
        ? serviceSelectorByVariant[
            variant
          ]
        : undefined;

    if (
      claimedElement &&
      (
        !body ||
        claimedElement === body ||
        body.contains(
          claimedElement
        )
      )
    ) {
      return {
        element:
          claimedElement,
        source:
          "claimedNode.element"
      };
    }

    if (
      body &&
      serviceSelector
    ) {
      const liveServiceElement =
        body.querySelector(
          serviceSelector
        ) as HTMLElement | null;

      if (
        liveServiceElement
      ) {
        return {
          element:
            liveServiceElement,
          source:
            "service-variant-live-dom"
        };
      }
    }

    return {
      element:
        claimedElement,
      source:
        claimedElement
          ? "detached-claimedNode.element"
          : "missing-claimedNode.element"
    };
  };

  const registered =
    semanticBlocks
      .map((entry: any) => {
        const {
          element,
          source:
            elementSource
        } =
          resolveRegistrationElement(
            entry
          );

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

        const registeredBlock =
          map.get(
            element
          );

        if (
          registeredBlock !==
          emitted
        ) {
      
          return null;
        }
        return {
          semantic:
            (emitted as any).meta?.semanticType,
          resolver:
            entry.resolverName ||
            (emitted as any).meta?.resolverName,
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
            entry.claimedNode
              ?.path ||
            entry.semanticResult
              ?.claimedNode
              ?.path,
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

  if (
    body
  ) {
    Object.entries(
      serviceSelectorByVariant
    ).forEach(
      (
        [
          variant,
          selector
        ]
      ) => {
        const entry =
          semanticBlocks.find(
            (candidate: any) =>
              candidate
                ?.semanticResult
                ?.type ===
                "SERVICE_PAGE_SECTION" &&
              candidate
                ?.semanticResult
                ?.variant ===
                variant
          );
        const emitted =
          entry?.emitted as
            | SerializedBlock
            | undefined;
        const liveElement =
          body.querySelector(
            selector
          ) as HTMLElement | null;

        if (
          !liveElement ||
          !emitted
        ) {
        
          return;
        }

        map.set(
          liveElement,
          emitted
        );
      }
    );
  }

  activeSemanticReplacementDiagnostics =
    registered as Array<Record<string, any>>;

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
    const semanticResultType =
      entry?.semanticResult?.type;
    const emittedText =
      normalizeDiagnosticText(
        collectTextProps(
          emitted
            ? [
                emitted
              ]
            : []
        )
          .map(
            textEntry =>
              textEntry.text
          )
          .join(
            " "
          )
      );
    const alreadyExists =
      !!emitted &&
      existingIds.has(
        emitted.id
      );
      if (semanticType === "CTA_SECTION") {


  return;
}

    if (
      !emitted ||
      !semanticType ||
      alreadyExists
    ) {
  
      return;
    }

    if (
      emitted.type ===
      COMPILER_BLOCK_TYPES.SECTION
    ) {
      if (
        semanticType ===
        "SERVICE_PAGE_SECTION"
      ) {
    
        return;
      }

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
    
      return;
    }
    blocks.push(
      emitted
    );
    existingIds.add(
      emitted.id
    );
  });
}

function assertNoSectionInsideLayout(
  stage: string,
  blocks: any[]
) {
  const layoutTypes =
    new Set([
      COMPILER_BLOCK_TYPES.FLEX,
      COMPILER_BLOCK_TYPES.FLEX_ITEM,
      COMPILER_BLOCK_TYPES.GRID,
      COMPILER_BLOCK_TYPES.GRID_ITEM
    ]);

  const violations:
    Array<{
      parentId: string;
      parentType: string;
      sectionId: string;
      semanticType: string;
    }> = [];

  const walk = (
    items: any[],
    layoutParent:
      any | null
  ) => {
    items.forEach(
      block => {
        if (!block) {
          return;
        }

        if (
          layoutParent &&
          block.type ===
            COMPILER_BLOCK_TYPES.SECTION
        ) {
          violations.push({
            parentId:
              layoutParent.id,
            parentType:
              layoutParent.type,
            sectionId:
              block.id,
            semanticType:
              block.meta
                ?.semanticType ||
              "generic-section"
          });
        }

        walk(
          block.children || [],
          layoutTypes.has(
            block.type
          )
            ? block
            : layoutParent
        );
      }
    );
  };

  walk(
    blocks || [],
    null
  );

  if (
    !violations.length
  ) {
    return;
  }

  console.error(
    "SECTION_NESTED_INSIDE_LAYOUT",
    {
      stage,
      violations
    }
  );

  throw new Error(
    "SECTION_NESTED_INSIDE_LAYOUT"
  );
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
  beforeFeatureBlocks
    .filter(
      (block: any) =>
        !afterIds.has(
          block?.id
        )
    )
    .forEach((block: any) => {
     
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
