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
import {
  applyImportedResponsiveDefaults
} from "./applyImportedResponsiveDefaults";
import {
  flattenImportedNestedCards
} from "./flattenImportedNestedCards";
import { normalizeCanonicalContainers } from "../../normalize/normalizeCanonicalContainers";
import {
  createVisitorAuthBlockFromForm,
  detectImportedAuthForm
} from "./authFormDetection";

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
  SELECT: "select",
  INPUT: "input",
  TEXTAREA: "textarea",
  FORM: "form"

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
  sourceFile?: string;
  slug?: string;
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

let activeImportContext:
  ImportHtmlContext = {};

let activeSemanticClaimRoots =
  new WeakSet<HTMLElement>();

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

const isInsideClaimedSemanticSubtree = (
  element: HTMLElement
) => {
  let current:
    HTMLElement | null =
      element;

  while (current) {
    if (
      activeSemanticClaimRoots.has(
        current
      )
    ) {
      return current !== element;
    }

    current =
      current.parentElement;
  }

  return false;
};

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

const sanitizeImportedFlowStyle = (
  style: Record<string, any> = {},
  options: {
    sectionRoot?: boolean;
    centered?: boolean;
    preserveMaxWidth?: boolean;
  } = {}
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

  const scrubDevice = (
    deviceStyle: Record<string, any>
  ) => {
    delete deviceStyle.left;
    delete deviceStyle.right;
    delete deviceStyle.top;
    delete deviceStyle.bottom;
    delete deviceStyle.inset;
    delete deviceStyle.insetInline;
    delete deviceStyle.insetInlineStart;
    delete deviceStyle.insetInlineEnd;
    delete deviceStyle.translate;
    delete deviceStyle.transform;

    if (
      deviceStyle.position === "absolute" ||
      deviceStyle.position === "fixed"
    ) {
      deviceStyle.position = "relative";
    }

    return deviceStyle;
  };

  scrubDevice(nextStyle.desktop);
  scrubDevice(nextStyle.tablet);
  scrubDevice(nextStyle.mobile);

  if (options.sectionRoot) {
    nextStyle.desktop.width = "100%";
    nextStyle.desktop.boxSizing = "border-box";
    nextStyle.desktop.overflow = "visible";
    delete nextStyle.desktop.maxWidth;
    delete nextStyle.desktop.marginLeft;
    delete nextStyle.desktop.marginRight;
  }

  if (options.centered) {
    nextStyle.desktop.width = "100%";
    nextStyle.desktop.marginLeft = "auto";
    nextStyle.desktop.marginRight = "auto";
  }

  if (!options.preserveMaxWidth && !options.sectionRoot) {
    const maxWidth =
      nextStyle.desktop.maxWidth;

    if (
      !maxWidth ||
      maxWidth === "none" ||
      maxWidth === "0px"
    ) {
      nextStyle.desktop.maxWidth = "100%";
    }
  }

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
const isVisibleTextCoverageElement = (
  element: HTMLElement
) => {
  const view =
    getElementWindow(element);

  let current:
    HTMLElement | null =
      element;

  while (current) {
    const tagName =
      getTagNameLower(current);

    if (
      current.hidden ||
      current.getAttribute(
        "aria-hidden"
      ) === "true" ||
      [
        "template",
        "option"
      ].includes(tagName)
    ) {
      return false;
    }

    const computed =
      view.getComputedStyle(
        current
      );

    if (
      computed.display === "none" ||
      computed.visibility === "hidden" ||
      computed.visibility === "collapse" ||
      Number.parseFloat(
        computed.opacity || "1"
      ) === 0
    ) {
      return false;
    }

    current =
      current.parentElement;
  }

  return true;
};
const collectDomTextNodes = (
  root: HTMLElement,
  options: {
    respectVisibility?: boolean;
  } = {}
): ImportTextNodeDiagnostic[] => {
  const {
    respectVisibility = true
  } = options;

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

    const excludedSourceElement =
      !!parent?.closest(
        `
          script,
          style,
          noscript,
          svg,
          template,
          option,
          [hidden],
          [aria-hidden="true"]
        `
      );

    if (
      parent &&
      isMeaningfulImportedText(
        text
      ) &&
      !shouldSkipTextCoverageElement(
        parent
      ) &&
      !excludedSourceElement &&
      (
        !respectVisibility ||
        isVisibleTextCoverageElement(
          parent
        )
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
  console.error(
    "❌ SEMANTIC_DROPPED_TEXT",
    {
      sourceTag:
        element.tagName,

      sourceClass:
        getElementClassName(
          element
        ),

      emittedBlockId:
        emittedBlock.id,

      emittedBlockType:
        emittedBlock.type,

      droppedTextNodes
    }
  );
}

  return droppedTextNodes;
};


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
      sanitizeImportedFlowStyle(
        withDesktopFallback(
          style,
          {
            display: "flex",
            flexDirection: "column"
          }
        ),
        {
          centered: true,
          preserveMaxWidth: true
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
          sanitizeImportedFlowStyle(
            withDesktopFallback(
              style,
              {
                width: "100%"
              }
            )
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
    "img,svg,video,audio,input,textarea,select,button,a"
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
const normalizeCssPaint = (
  value?: string
) =>
  (value || "")
    .replace(/\s+/g, "")
    .toLowerCase();

const isTransparentColor = (
  value?: string
) => {
  const normalized =
    normalizeCssPaint(value);

  if (
    normalized.includes("url(") ||
    normalized.includes("gradient(")
  ) {
    return false;
  }

  return (
    !normalized ||
    normalized === "transparent" ||
    normalized === "none" ||
    normalized === "rgba(0,0,0,0)" ||
    normalized === "rgb(0,0,0,0)"
  );
};

const hasRealPaint = (
  styles: ReturnType<typeof extractComputedStyles>
) => {
  const background =
    styles.background || "";

  const backgroundColor =
    styles.backgroundColor || "";

  const backgroundImage =
    styles.backgroundImage || "";

  return (
    !isTransparentColor(backgroundColor) ||
    (
      !!backgroundImage &&
      backgroundImage !== "none"
    ) ||
    (
      !isTransparentColor(background) &&
      (
        background.includes("rgb") ||
        background.includes("#") ||
        background.includes("gradient") ||
        background.includes("url(")
      )
    )
  );
};

const findNearestPaintSource = (
  start: HTMLElement | null
) => {
  let current =
    start;

  while (
    current &&
    current.tagName.toLowerCase() !== "html"
  ) {
    const styles =
      extractComputedStyles(current);

    if (
      hasRealPaint(styles)
    ) {
      return styles;
    }

    current =
      current.parentElement;
  }

  return null;
};

const resolveOwnPaintSource = (
  computed: ReturnType<typeof extractComputedStyles>
) =>
  hasRealPaint(computed)
    ? computed
    : null;


const getRgbParts = (
  value?: string
) => {
  const match =
    String(value || "").match(
      /rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)/
    );

  if (!match) {
    return null;
  }

  return {
    r: Number(match[1]),
    g: Number(match[2]),
    b: Number(match[3])
  };
};

const isLightColor = (
  value?: string
) => {
  const rgb =
    getRgbParts(value);

  if (!rgb) {
    return false;
  }

  return (
    (rgb.r + rgb.g + rgb.b) / 3 >= 180
  );
};

const isDarkPaint = (
  value?: string
) => {
  const rgb =
    getRgbParts(value);

  if (!rgb) {
    return false;
  }

  return (
    (rgb.r + rgb.g + rgb.b) / 3 <= 90
  );
};

const resolveSectionPaintSource = (
  element: HTMLElement,
  computed: ReturnType<typeof extractComputedStyles>
) => {
  const ownPaint =
    resolveOwnPaintSource(computed);

  if (ownPaint) {
    return ownPaint;
  }

  const inheritedPaint =
    findNearestPaintSource(
      element.parentElement
    );

  const inheritedIsDark =
    isDarkPaint(
      inheritedPaint?.backgroundColor
    ) ||
    isDarkPaint(
      inheritedPaint?.background
    );

  const textIsLight =
    isLightColor(
      computed.color
    );

  return inheritedIsDark && textIsLight
    ? inheritedPaint
    : null;
};

const getPreservedWrapperDesktopStyle = (
  computed: ReturnType<typeof extractComputedStyles>,
  layoutDesktop: Record<string, any> = {},
  element?: HTMLElement
) => {
 const paintSource =
  hasRealPaint(computed)
    ? computed
    : null;

  return {
    ...layoutDesktop,

    background:
      paintSource?.background ||
      layoutDesktop.background,

    backgroundColor:
      paintSource?.backgroundColor ||
      layoutDesktop.backgroundColor,

    backgroundImage:
      paintSource?.backgroundImage ||
      layoutDesktop.backgroundImage,

    backgroundSize:
      paintSource?.backgroundSize ||
      layoutDesktop.backgroundSize,

    backgroundPosition:
      paintSource?.backgroundPosition ||
      layoutDesktop.backgroundPosition,

    backgroundRepeat:
      paintSource?.backgroundRepeat ||
      layoutDesktop.backgroundRepeat,

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
  };
};
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

const mergeExtractedVisualStyles = (
  element: HTMLElement
) => {
  const layout =
    extractLayoutStyles(
      element
    );

  const typography =
    extractTypographyStyles(
      element
    );

  return {
    desktop: {
      ...(layout.desktop || {}),
      ...(typography.desktop || {})
    },
    tablet: {
      ...(layout.tablet || {}),
      ...(typography.tablet || {})
    },
    mobile: {
      ...(layout.mobile || {}),
      ...(typography.mobile || {})
    }
  };
};

const attachPseudoElementBlocks = (
  _element: HTMLElement,
  _path: (string | number)[],
  compiledBlocks: SerializedBlock[]
): SerializedBlock[] => {
  return compiledBlocks;
};

function parseDomToBlocks(
  element: HTMLElement,
  path: (string | number)[],
  ownership: OwnershipBuckets,
  warnings: ImportWarning[],
  matcherHits: ImportMatcherHit[]
): SerializedBlock[] {
  return attachPseudoElementBlocks(
    element,
    path,
    parseDomToBlocksInternal(
      element,
      path,
      ownership,
      warnings,
      matcherHits
    )
  );
}

const createChoiceControlVisual = (
  element: HTMLInputElement,
  path: (string | number)[]
): SerializedBlock => {
  const computed =
    getElementWindow(
      element
    ).getComputedStyle(
      element
    );

  const isRadio =
    element.type === "radio";

  const marker =
    isRadio
      ? element.checked
        ? "◉"
        : "○"
      : element.checked
        ? "☑"
        : "☐";

  const sourceSize =
    Number.parseFloat(
      computed.width || ""
    );

  const size =
    Number.isFinite(sourceSize) &&
    sourceSize > 0
      ? `${Math.min(
          Math.max(
            sourceSize,
            12
          ),
          24
        )}px`
      : "16px";

  return {
    id: generateNodeId(
      COMPILER_BLOCK_TYPES.TEXT,
      path
    ),
    type: COMPILER_BLOCK_TYPES.TEXT,
    data: {
      props: {
        content: marker
      },
      style: {
        desktop: {
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: size,
          minWidth: size,
          maxWidth: size,
          height: size,
          flexShrink: 0,
          color: computed.color,
          fontFamily: computed.fontFamily,
          fontSize: size,
          lineHeight: "1",
          boxSizing: "border-box",
          overflow: "visible"
        },
        tablet: {
          width: size,
          minWidth: size,
          maxWidth: size,
          height: size,
          flexShrink: 0
        },
        mobile: {
          width: size,
          minWidth: size,
          maxWidth: size,
          height: size,
          flexShrink: 0
        }
      }
    },
    children: []
  };
};
const createVisualFormControl = (
  element: HTMLElement,
  path: (string | number)[],
  displayText = ""
): SerializedBlock => {
  const visualStyle =
    mergeExtractedVisualStyles(
      element
    );

  return {
    id:
      generateNodeId(
        COMPILER_BLOCK_TYPES.FLEX,
        path
      ),

    type:
      COMPILER_BLOCK_TYPES.FLEX,

    data: {
      props: {
        semantic: {
          semanticIntent:
            "FORM_CONTROL_VISUAL"
        }
      },

      style: {
        ...visualStyle,

        desktop: {
          ...(visualStyle.desktop || {}),

          display:
            "flex",

          alignItems:
            "center",

          width:
            visualStyle.desktop?.width ||
            "100%",

          maxWidth:
            visualStyle.desktop?.maxWidth ||
            "100%",

          minWidth:
            "0",

          boxSizing:
            "border-box",

          overflow:
            "hidden"
        },

        tablet: {
          ...(visualStyle.tablet || {}),

          width:
            "100%",

          maxWidth:
            "100%",

          minWidth:
            "0",

          boxSizing:
            "border-box"
        },

        mobile: {
          ...(visualStyle.mobile || {}),

          width:
            "100%",

          maxWidth:
            "100%",

          minWidth:
            "0",

          boxSizing:
            "border-box"
        }
      }
    },

    children:
      displayText
        ? [
            {
              id:
                generateNodeId(
                  COMPILER_BLOCK_TYPES.TEXT,
                  [
                    ...path,
                    "value"
                  ]
                ),

              type:
                COMPILER_BLOCK_TYPES.TEXT,

              data: {
                props: {
                  content:
                    displayText
                },

                style:
                  extractTypographyStyles(
                    element
                  )
              },

              children: []
            }
          ]
        : []
  };
};
const emitFallbackLabel = (
  element: HTMLElement,
  path: (string | number)[],
  ownership: OwnershipBuckets,
  warnings: ImportWarning[],
  matcherHits: ImportMatcherHit[]
): SerializedBlock[] => {
  const computed =
    getElementWindow(
      element
    ).getComputedStyle(
      element
    );

  const visualStyle =
    mergeExtractedVisualStyles(
      element
    );

  const directChoiceControl =
    Array.from(
      element.children
    ).find(
      child =>
        child instanceof
          getElementWindow(
            element
          ).HTMLInputElement &&
        (
          (child as HTMLInputElement)
            .type === "checkbox" ||
          (child as HTMLInputElement)
            .type === "radio"
        )
    ) as HTMLInputElement | undefined;

  if (directChoiceControl) {
    const isRadio =
      directChoiceControl.type ===
      "radio";

    const marker =
      isRadio
        ? directChoiceControl.checked
          ? "◉"
          : "○"
        : directChoiceControl.checked
          ? "☑"
          : "☐";

    const labelText =
      Array.from(
        element.childNodes
      )
        .filter(
          node =>
            node !==
            directChoiceControl
        )
        .map(
          node =>
            node.textContent || ""
        )
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

    return [
      {
        id: generateNodeId(
          COMPILER_BLOCK_TYPES.TEXT,
          path
        ),
        type: COMPILER_BLOCK_TYPES.TEXT,
        data: {
          props: {
            content:
              labelText
                ? `${marker} ${labelText}`
                : marker
          },
          style: {
            ...visualStyle,
            desktop: {
              ...(visualStyle.desktop || {}),
              display: "inline-flex",
              alignItems:
                computed.alignItems ||
                "center",
              width: "max-content",
              maxWidth: "100%",
              minWidth: "0",
              boxSizing: "border-box"
            }
          }
        },
        children: []
      }
    ];
  }

  if (
    element.children.length === 0
  ) {
    return [
      {
        id: generateNodeId(
          COMPILER_BLOCK_TYPES.TEXT,
          path
        ),
        type: COMPILER_BLOCK_TYPES.TEXT,
        data: {
          props: {
            content:
              normalizeDiagnosticText(
                element.textContent || ""
              )
          },
          style: visualStyle
        },
        children: []
      }
    ];
  }

  const children =
    compileDirectChildNodes(
      element,
      path,
      ownership,
      warnings,
      matcherHits
    );

  if (!children.length) {
    return [];
  }

  const sourceDisplay =
    computed.display;

  const display =
    sourceDisplay === "flex" ||
    sourceDisplay === "inline-flex"
      ? sourceDisplay
      : "inline-flex";

  return [
    {
      id: generateNodeId(
        COMPILER_BLOCK_TYPES.FLEX,
        path
      ),
      type: COMPILER_BLOCK_TYPES.FLEX,
      data: {
        props: {},
        style: {
          ...visualStyle,
          desktop: {
            ...(visualStyle.desktop || {}),
            display,
            flexDirection:
              computed.flexDirection ||
              "row",
            flexWrap:
              computed.flexWrap ||
              "wrap",
            alignItems:
              computed.alignItems ||
              "center",
            justifyContent:
              computed.justifyContent ||
              "flex-start",
            gap:
              computed.gap &&
              computed.gap !== "normal"
                ? computed.gap
                : "8px",
            minWidth: "0",
            boxSizing: "border-box"
          }
        }
      },
      children: children.map(
        (child, index) => ({
          id: generateNodeId(
            COMPILER_BLOCK_TYPES.FLEX_ITEM,
            [
              ...path,
              "label-item",
              index
            ]
          ),
          type:
            COMPILER_BLOCK_TYPES.FLEX_ITEM,
          data: {
            props: {},
            style: {
              desktop: {
                flex: "0 0 auto",
                minWidth: "0",
                boxSizing: "border-box"
              },
              tablet: {
                flex: "0 0 auto",
                minWidth: "0"
              },
              mobile: {
                flex: "0 0 auto",
                minWidth: "0"
              }
            }
          },
          children: [child]
        })
      )
    }
  ];
};
const makeImportedFormChildShrinkSafe = (
  block: SerializedBlock
): SerializedBlock => {
  const isFormControl =
    [
      COMPILER_BLOCK_TYPES.INPUT,
      COMPILER_BLOCK_TYPES.SELECT,
      COMPILER_BLOCK_TYPES.TEXTAREA,
      COMPILER_BLOCK_TYPES.BUTTON
    ].includes(
      block.type as any
    );

  const isLayout =
    [
      COMPILER_BLOCK_TYPES.FLEX,
      COMPILER_BLOCK_TYPES.GRID
    ].includes(
      block.type as any
    );

  const currentStyle =
    block.data?.style || {};

  const nextStyle = {
    ...currentStyle,

    desktop: {
      ...(currentStyle.desktop || {}),

      ...(isFormControl || isLayout
        ? {
            width: "100%"
          }
        : {}),

      maxWidth:
        "100%",

      minWidth:
        "0",

      boxSizing:
        "border-box"
    },

    tablet: {
      ...(currentStyle.tablet || {}),

      ...(isFormControl || isLayout
        ? {
            width: "100%"
          }
        : {}),

      maxWidth:
        "100%",

      minWidth:
        "0",

      boxSizing:
        "border-box"
    },

    mobile: {
      ...(currentStyle.mobile || {}),

      ...(isFormControl || isLayout
        ? {
            width: "100%"
          }
        : {}),

      maxWidth:
        "100%",

      minWidth:
        "0",

      boxSizing:
        "border-box"
    }
  };

  return {
    ...block,

    data: {
      ...(block.data || {}),
      style:
        nextStyle
    },

    children:
      (block.children || []).map(
        makeImportedFormChildShrinkSafe
      )
  };
};
const emitFallbackFormContainer = (
  element: HTMLElement,
  path: (string | number)[],
  ownership: OwnershipBuckets,
  warnings: ImportWarning[],
  matcherHits: ImportMatcherHit[]
): SerializedBlock[] => {
  const computed =
    getElementWindow(
      element
    ).getComputedStyle(
      element
    );

  const extracted =
    extractLayoutStyles(
      element
    );

const children =
  getSafeChildren(
    element
  )
    .flatMap(
      (child, index) =>
        parseDomToBlocks(
          child,
          [...path, index],
          ownership,
          warnings,
          matcherHits
        )
    )
    .map(
      makeImportedFormChildShrinkSafe
    );
    
  if (!children.length) {
    return [];
  }

  const isGrid =
    computed.display === "grid";

const isFlex =
  computed.display === "flex" ||
  computed.display === "inline-flex";

  const blockType =
  COMPILER_BLOCK_TYPES.FORM;

const layoutType =
  isGrid
    ? COMPILER_BLOCK_TYPES.GRID
    : COMPILER_BLOCK_TYPES.FLEX;

const itemType =
  isGrid
    ? COMPILER_BLOCK_TYPES.GRID_ITEM
    : COMPILER_BLOCK_TYPES.FLEX_ITEM;

  const leftMargin =
    Number.parseFloat(
      computed.marginLeft || ""
    );

  const rightMargin =
    Number.parseFloat(
      computed.marginRight || ""
    );

  const centered =
    computed.marginLeft === "auto" ||
    computed.marginRight === "auto" ||
    (
      Number.isFinite(leftMargin) &&
      Number.isFinite(rightMargin) &&
      leftMargin > 0 &&
      leftMargin === rightMargin
    );

const desktopStyle = {
  ...(extracted.desktop || {}),

  display: "block",

  width: "100%",
  maxWidth: "100%",

  marginLeft:
    centered
      ? "auto"
      : computed.marginLeft,

  marginRight:
    centered
      ? "auto"
      : computed.marginRight,

  padding: "0",
  border: "none",
  borderRadius: "0",
  background: "transparent",
  backgroundColor: "transparent",
  boxShadow: "none",

  color:
    computed.color,

  boxSizing:
    "border-box",

  minWidth:
    "0",

  overflow:
    "visible"
};

  return [
    {
      id: generateNodeId(
        blockType,
        path
      ),
      type: blockType,
      data: {
  props: {
    renderMode: "imported",
    formId: "",

    successMessage:
      "Your message has been sent successfully.",

    errorMessage:
      "Failed to send your message."
  },
        style: {
          ...extracted,
          desktop: desktopStyle,
          tablet: {
            ...(extracted.tablet || {}),
            width: "100%",
            maxWidth:
              desktopStyle.maxWidth ||
              "100%",
            marginLeft: "auto",
            marginRight: "auto",
            minWidth: "0",
            boxSizing: "border-box"
          },
          mobile: {
            ...(extracted.mobile || {}),
            width: "100%",
            maxWidth: "100%",
            marginLeft: "auto",
            marginRight: "auto",
            minWidth: "0",
            boxSizing: "border-box"
          }
        }
      },


     children: [
  {
    id: generateNodeId(
      layoutType,
      [
        ...path,
        "form-layout"
      ]
    ),

    type: layoutType,

    data: {
      props: {
        semantic: {
          semanticIntent:
            "IMPORTED_FORM_LAYOUT"
        }
      },

      style: {
        desktop: {
          display:
            isGrid
              ? "grid"
              : "flex",
            flexDirection:
  isGrid
    ? undefined
    : isFlex
      ? (
          computed.flexDirection ||
          "column"
        )
      : "column",

flexWrap:
  isGrid
    ? undefined
    : isFlex
      ? (
          computed.flexWrap ||
          "nowrap"
        )
      : "nowrap",

          gridTemplateColumns:
            isGrid
              ? (
                  computed.gridTemplateColumns &&
                  computed.gridTemplateColumns !==
                    "none"
                    ? makeGridTracksShrinkSafe(
                        computed.gridTemplateColumns
                      )
                    : "minmax(0, 1fr)"
                )
              : undefined,

         justifyContent:
  isGrid || isFlex
    ? (
        computed.justifyContent ||
        "flex-start"
      )
    : "flex-start",

alignItems:
  isGrid || isFlex
    ? (
        computed.alignItems ||
        "stretch"
      )
    : "stretch",

          gap:
            computed.gap &&
            computed.gap !== "normal"
              ? computed.gap
              : "16px",

          width:
            "100%",

          maxWidth:
            "100%",

          minWidth:
            "0",

          boxSizing:
            "border-box",

          overflow:
            "visible"
        },

        tablet: {
          display:
            isGrid
              ? "grid"
              : "flex",

          flexDirection:
            isGrid
              ? undefined
              : "column",

          gridTemplateColumns:
            isGrid
              ? "minmax(0, 1fr)"
              : undefined,

          width:
            "100%",

          maxWidth:
            "100%",

          minWidth:
            "0",

          boxSizing:
            "border-box"
        },

        mobile: {
          display:
            isGrid
              ? "grid"
              : "flex",

          flexDirection:
            isGrid
              ? undefined
              : "column",

          gridTemplateColumns:
            isGrid
              ? "minmax(0, 1fr)"
              : undefined,

          width:
            "100%",

          maxWidth:
            "100%",

          minWidth:
            "0",

          boxSizing:
            "border-box"
        }
      }
    },

    children: children.map(
      (
        child,
        index
      ) => ({
        id: generateNodeId(
          itemType,
          [
            ...path,
            "form-layout",
            "item",
            index
          ]
        ),

        type:
          itemType,

        data: {
          props: {},

          style: {
            desktop: {
              width:
                "100%",

              minWidth:
                "0",

              boxSizing:
                "border-box",

              overflow:
                "visible"
            },

            tablet: {
              width:
                "100%",

              minWidth:
                "0",

              boxSizing:
                "border-box"
            },

            mobile: {
              width:
                "100%",

              minWidth:
                "0",

              boxSizing:
                "border-box"
            }
          }
        },

        children: [
          child
        ]
      })
    )
  }
]
    }
  ];
};

const emitFallbackStructuredContainer = (
  element: HTMLElement,
  path: (string | number)[],
  ownership: OwnershipBuckets,
  warnings: ImportWarning[],
  matcherHits: ImportMatcherHit[]
): SerializedBlock[] => {
  const computed =
    extractComputedStyles(element);

  const layoutStyle =
    extractLayoutStyles(element);

  const className =
    getElementClassName(element).toLowerCase();

  const isMissionGrid =
    className
      .split(/\s+/)
      .includes("mission-grid");

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
    layoutStyle.desktop || {},
    element
  );

  const getNearestSectionBackground = () => {
    const section =
      element.closest(
        "section, main, article"
      ) as HTMLElement | null;

    if (!section) {
      return {};
    }

    const sectionComputed =
      extractComputedStyles(section);

    return {
      background:
        sectionComputed.background,

      backgroundColor:
        sectionComputed.backgroundColor,

      color:
        sectionComputed.color
    };
  };

  const missionSectionVisual =
    isMissionGrid
      ? getNearestSectionBackground()
      : {};

  if (
    computed.display === "grid" &&
    sourceGridColumns
  ) {
    const gridChildren =
      getSafeChildren(element)
        .filter(hasMeaningfulElementContent)
        .map((child, index) => {
          const childStyle =
            extractLayoutStyles(child);
          const childClassName =
            getElementClassName(child).toLowerCase();

          const isQuoteLikeChild =
            isMissionGrid &&
            (
              childClassName.includes("quote") ||
              childClassName.includes("card") ||
              child.textContent
                ?.toLowerCase()
                .includes("founder")
            );

          if (!isQuoteLikeChild) {
            delete childStyle.desktop.height;
            delete childStyle.desktop.minHeight;
            delete childStyle.desktop.maxHeight;
          }

          const childBlocks =
            parseDomToBlocks(
              child,
              [...path, index],
              ownership,
              warnings,
              matcherHits
            ).map((block: any) => {
              const desktop =
                block.data?.style?.desktop;

              if (
                desktop &&
                !isQuoteLikeChild
              ) {
                delete desktop.height;
                delete desktop.minHeight;
                delete desktop.maxHeight;
              }

              return block;
            });

          return {
            id: generateNodeId(
              COMPILER_BLOCK_TYPES.GRID_ITEM,
              [...path, index]
            ),

            type:
              COMPILER_BLOCK_TYPES.GRID_ITEM,

            data: {
              props: {},

              style: withDesktopFallback(
                childStyle,
                {
                  width: "100%",
                  maxWidth: "100%",
                  minWidth: "0",
                  overflow: "visible",
                  boxSizing: "border-box",

                  ...(isMissionGrid
                    ? {
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: isQuoteLikeChild
                          ? "stretch"
                          : "center"
                      }
                    : {})
                }
              )
            },

            children:
              childBlocks
          };
        })
        .filter(
          item =>
            item.children.length > 0
        );

    if (
      gridChildren.length >= 2
    ) {
      const containerDesktopStyle = sanitizeImportedFlowStyle({
        desktop: {
        ...preservedWrapperStyle,

        display: "grid",

        gridTemplateColumns:
          isMissionGrid
            ? "minmax(0, 1fr) minmax(0, 1fr)"
            : sourceGridColumns,

        gap:
          computed.gap ||
          layoutStyle.desktop?.gap ||
          (
            isMissionGrid
              ? "64px"
              : "0px"
          ),

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
          isMissionGrid
            ? missionSectionVisual.background ||
              computed.background ||
              layoutStyle.desktop?.background
            : computed.background ||
              layoutStyle.desktop?.background,

        backgroundColor:
          isMissionGrid
            ? missionSectionVisual.backgroundColor ||
              computed.backgroundColor ||
              layoutStyle.desktop?.backgroundColor
            : computed.backgroundColor ||
              layoutStyle.desktop?.backgroundColor,

        color:
          isMissionGrid
            ? missionSectionVisual.color ||
              computed.color ||
              layoutStyle.desktop?.color
            : computed.color ||
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
          isMissionGrid
            ? "1180px"
            : sourceMaxWidth,

        marginLeft:
          isMissionGrid
            ? "auto"
            : (preservedWrapperStyle as any).marginLeft,

        marginRight:
          isMissionGrid
            ? "auto"
            : (preservedWrapperStyle as any).marginRight,

        minWidth: "0",
        boxSizing: "border-box",
        overflow: "visible"
        }
      }, {
        centered: true,
        preserveMaxWidth: true
      }).desktop;

      return [
        {
          id: generateNodeId(
            COMPILER_BLOCK_TYPES.GRID,
            path
          ),

          type:
            COMPILER_BLOCK_TYPES.GRID,

          data: {
            props: {
              ...(isMissionGrid
                ? {
                    semantic: {
                      semanticIntent:
                        "MISSION_GRID"
                    }
                  }
                : {})
            },

            style: {
              ...layoutStyle,

              desktop:
                containerDesktopStyle,

              tablet: {
                ...(layoutStyle.tablet || {}),
                display: "grid",
                gridTemplateColumns:
                  "minmax(0, 1fr)",
                gap: "32px",
                width: "100%",
                maxWidth: "100%",
                minWidth: "0",
                boxSizing: "border-box"
              },

              mobile: {
                ...(layoutStyle.mobile || {}),
                display: "grid",
                gridTemplateColumns:
                  "minmax(0, 1fr)",
                gap: "24px",
                width: "100%",
                maxWidth: "100%",
                minWidth: "0",
                boxSizing: "border-box"
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
    getSafeChildren(element)
      .filter(hasMeaningfulElementContent)
      .map((child, index) => ({
        id: generateNodeId(
          COMPILER_BLOCK_TYPES.FLEX_ITEM,
          [...path, index]
        ),

        type:
          COMPILER_BLOCK_TYPES.FLEX_ITEM,

        data: {
          props: {},

          style: withDesktopFallback(
            extractLayoutStyles(child),
            {
              minWidth: "0",
              boxSizing: "border-box"
            }
          )
        },

        children: parseDomToBlocks(
          child,
          [...path, index],
          ownership,
          warnings,
          matcherHits
        )
      }))
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
      id: generateNodeId(
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
              computed.gap || "12px",

            minWidth: "0",
            boxSizing: "border-box",
            overflow: "visible"
          },

          tablet: {
            ...(layoutStyle.tablet || {}),
            minWidth: "0",
            boxSizing: "border-box"
          },

          mobile: {
            ...(layoutStyle.mobile || {}),
            flexWrap: "wrap",
            minWidth: "0",
            boxSizing: "border-box"
          }
        }
      },

      children
    }
  ];
};

const makeShortInlineTextSafe = (
  style: Record<string, any> = {}
) => ({
  ...style,

  desktop: {
    ...(style.desktop || {}),

    display:
      "inline-flex",

    width:
      "max-content",

    minWidth:
      "max-content",

    maxWidth:
      "none",

    flexShrink:
      0,

    alignSelf:
      "flex-start",

    whiteSpace:
      "nowrap",

    wordBreak:
      "keep-all",

    overflowWrap:
      "normal",

    hyphens:
      "none",

    overflow:
      "visible"
  },

  tablet: {
    ...(style.tablet || {}),

    width:
      "max-content",

    minWidth:
      "max-content",

    whiteSpace:
      "nowrap",

    wordBreak:
      "keep-all",

    overflowWrap:
      "normal",

    hyphens:
      "none"
  },

  mobile: {
    ...(style.mobile || {}),

    width:
      "max-content",

    minWidth:
      "max-content",

    whiteSpace:
      "nowrap",

    wordBreak:
      "keep-all",

    overflowWrap:
      "normal",

    hyphens:
      "none"
  }
});
const cleanImportedListItemText = (
  value = ""
) =>
  normalizeDiagnosticText(
    value
  )
    .replace(
      /^([•·●○◦▪▫‣→✓✔\-]\s*)+/,
      ""
    )
    .trim();

const getImportedListMarker = (
  element: HTMLElement
) => {
  const parent =
    element.parentElement;

  if (
    parent &&
    getTagNameLower(parent) === "ol"
  ) {
    const index =
      Array.from(parent.children)
        .filter(
          child =>
            isHtmlElementLike(child) &&
            getTagNameLower(child) === "li"
        )
        .indexOf(element);

    return `${index + 1}.`;
  }

  return "•";
};

const makeImportedFlowTextSafe = (
  input: Record<string, any> = {},
  kind: "title" | "text"
) => {
  const next = {
    ...input,

    desktop: {
      ...(input.desktop || {})
    },

    tablet: {
      ...(input.tablet || {})
    },

    mobile: {
      ...(input.mobile || {})
    }
  };

  (
    [
      "desktop",
      "tablet",
      "mobile"
    ] as const
  ).forEach(device => {
    const style =
      next[device];

    delete style.height;
    delete style.minHeight;
    delete style.maxHeight;

    delete style.top;
    delete style.right;
    delete style.bottom;
    delete style.left;
    delete style.inset;
    delete style.transform;
    delete style.translate;

    if (
      style.position === "absolute" ||
      style.position === "fixed"
    ) {
      style.position =
        "relative";
    }

    style.display =
      "block";

    style.width =
      "100%";

    style.maxWidth =
      "100%";

    style.minWidth =
      "0";

    style.whiteSpace =
      "normal";

    style.wordBreak =
      "normal";

    style.overflowWrap =
      "break-word";

    style.overflow =
      "visible";

    style.boxSizing =
      "border-box";

    const rawLineHeight =
      String(
        style.lineHeight || ""
      )
        .trim()
        .toLowerCase();

    const numericLineHeight =
      Number.parseFloat(
        rawLineHeight
      );

    const fontSize =
      Number.parseFloat(
        String(
          style.fontSize || ""
        )
      );

    const isUnitless =
      /^-?\d*\.?\d+$/.test(
        rawLineHeight
      );

    const minimumRatio =
      kind === "title"
        ? 1.05
        : 1.2;

    const fallbackLineHeight =
      kind === "title"
        ? "1.12"
        : "1.5";

    const unsafeUnitless =
      isUnitless &&
      Number.isFinite(
        numericLineHeight
      ) &&
      numericLineHeight <
        minimumRatio;

    const unsafePixels =
      rawLineHeight.endsWith(
        "px"
      ) &&
      Number.isFinite(
        numericLineHeight
      ) &&
      Number.isFinite(
        fontSize
      ) &&
      fontSize > 0 &&
      numericLineHeight /
        fontSize <
        minimumRatio;

    if (
      !rawLineHeight ||
      rawLineHeight === "normal" ||
      unsafeUnitless ||
      unsafePixels
    ) {
      style.lineHeight =
        fallbackLineHeight;
    }

    if (
      kind === "title" &&
      (
        !style.marginBottom ||
        style.marginBottom ===
          "0px" ||
        style.marginBottom ===
          "0"
      )
    ) {
      style.marginBottom =
        "8px";
    }
  });

  return next;
};
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

  if (
    isInsideClaimedSemanticSubtree(
      element
    )
  ) {
    recordTrackedFallbackBranch(
      element,
      "skipped:insideClaimedSemanticSubtree"
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

const sectionPaintSource =
  resolveSectionPaintSource(
    element,
    computedSection
  );

const sectionStyle =
  sanitizeSectionLayoutStyle(
    sectionId,
    extractLayoutStyles(element)
  );

  sectionStyle.desktop = {
    ...(sectionStyle.desktop || {}),
background:
  sectionPaintSource?.background ||
  undefined,

backgroundColor:
  sectionPaintSource?.backgroundColor ||
  undefined,

backgroundImage:
  sectionPaintSource?.backgroundImage ||
  undefined,

backgroundSize:
  sectionPaintSource?.backgroundSize ||
  undefined,

backgroundPosition:
  sectionPaintSource?.backgroundPosition ||
  undefined,

backgroundRepeat:
  sectionPaintSource?.backgroundRepeat ||
  undefined,

color:
  computedSection.color ||
  sectionStyle.desktop?.color,

    padding:
      computedSection.padding &&
      computedSection.padding !== "0px"
        ? computedSection.padding
        : sectionStyle.desktop?.padding,

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
        style: sanitizeImportedFlowStyle(
          sectionStyle,
          {
            sectionRoot: true
          }
        )
      },

      children: compiledChildren
    }
  ];
}

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
  const titleContent =
    normalizeDiagnosticText(
      element.textContent || ""
    );

  const titleSegments =
    extractTitleSegments(
      element
    );

  return [
    {
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
            titleContent,

          level:
            tagName,

          ...(titleSegments.length
            ? {
                segments:
                  titleSegments
              }
            : {})
        },

       style:
  makeImportedFlowTextSafe(
    extractTypographyStyles(
      element
    ),
    "title"
  )
      },

      children: []
    }
  ];
}
if (
  tagName === "form"
) {
  const authDetection =
    detectImportedAuthForm({
      form:
        element as HTMLFormElement,
      pageTitle:
        activeImportContext.slug,
      slug:
        activeImportContext.slug,
      sourceFile:
        activeImportContext.sourceFile
    });

  if (
    authDetection.kind &&
    authDetection.confidence === "strong"
  ) {
    matcherHits.push({
      matcher:
        `auth-form:${authDetection.kind}`,
      score:
        authDetection.reasons.length,
      path:
        path.join(".")
    });

    return [
      createVisitorAuthBlockFromForm(
        element as HTMLFormElement,
        path,
        authDetection.kind
      ) as SerializedBlock
    ];
  }

  if (
    authDetection.confidence === "weak"
  ) {
    warnings.push({
      type:
        "AUTH_FORM_DETECTION_WEAK",
      message:
        `Weak auth-form evidence ignored: ${authDetection.reasons.join(", ")}`,
      path:
        path.join(".")
    });
  }

  return emitFallbackFormContainer(
    element,
    path,
    ownership,
    warnings,
    matcherHits
  );
}

if (
  tagName === "label"
) {
  return emitFallbackLabel(
    element,
    path,
    ownership,
    warnings,
    matcherHits
  );
}

if (
  tagName === "input"
) {
  const input =
    element as HTMLInputElement;

  if (
    input.type === "checkbox" ||
    input.type === "radio"
  ) {
    return [
      createChoiceControlVisual(
        input,
        path
      )
    ];
  }

  return [
    {
      id: generateNodeId(
        COMPILER_BLOCK_TYPES.INPUT,
        path
      ),

      type:
        COMPILER_BLOCK_TYPES.INPUT,

      data: {
        props: {
          type:
            input.type ||
            "text",

          placeholder:
            input.getAttribute(
              "placeholder"
            ) ||
            input.getAttribute(
              "aria-label"
            ) ||
            ""
        },

        style:
          mergeExtractedVisualStyles(
            input
          )
      },

      children: []
    }
  ];
}

if (
  tagName === "textarea"
) {
  const textarea =
    element as HTMLTextAreaElement;

  return [
    {
      id: generateNodeId(
        COMPILER_BLOCK_TYPES.TEXTAREA,
        path
      ),

      type:
        COMPILER_BLOCK_TYPES.TEXTAREA,

      data: {
        props: {
          placeholder:
            textarea.getAttribute(
              "placeholder"
            ) ||
            textarea.getAttribute(
              "aria-label"
            ) ||
            ""
        },

        style:
          mergeExtractedVisualStyles(
            textarea
          )
      },

      children: []
    }
  ];
}

if (
  tagName === "select"
) {
  const select =
    element as HTMLSelectElement;
    

  const options =
    Array.from(
      select.options || []
    )
      .map(option =>
        normalizeDiagnosticText(
          option.textContent ||
          option.value ||
          ""
        )
      )
      .filter(Boolean);

  const placeholder =
    options[0] ||
    "Select option";

  return [
    {
      id: generateNodeId(
        COMPILER_BLOCK_TYPES.SELECT,
        path
      ),

      type:
        COMPILER_BLOCK_TYPES.SELECT,

      data: {
        props: {
          placeholder,
          options
        },

        style:
          mergeExtractedVisualStyles(
            select
          )
      },

      children: []
    }
  ];
}
if (
  tagName === "ul" ||
  tagName === "ol"
) {
  const computed =
    extractComputedStyles(
      element
    );

  const listItems =
    getSafeChildren(
      element
    ).filter(
      child =>
        getTagNameLower(child) === "li" &&
        hasMeaningfulElementContent(child)
    );

  if (!listItems.length) {
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
        props: {
          semantic: {
            semanticIntent:
              "IMPORTED_LIST"
          }
        },

        style: {
          ...extractLayoutStyles(
            element
          ),

          desktop: {
            ...(extractLayoutStyles(element).desktop || {}),

            display:
              "flex",

            flexDirection:
              "column",

            gap:
              computed.gap &&
              computed.gap !== "normal"
                ? computed.gap
                : "14px",

            paddingLeft:
              "0",

            margin:
              computed.margin || "0",

            listStyleType:
              "none",

            width:
              "100%",

            maxWidth:
              "100%",

            minWidth:
              "0",

            boxSizing:
              "border-box"
          },

          tablet: {
            ...(extractLayoutStyles(element).tablet || {}),

            paddingLeft:
              "0",

            width:
              "100%",

            minWidth:
              "0"
          },

          mobile: {
            ...(extractLayoutStyles(element).mobile || {}),

            paddingLeft:
              "0",

            width:
              "100%",

            minWidth:
              "0"
          }
        }
      },

      children:
        listItems.map(
          (item, index) => ({
            id:
              generateNodeId(
                COMPILER_BLOCK_TYPES.FLEX_ITEM,
                [
                  ...path,
                  "list-item",
                  index
                ]
              ),

            type:
              COMPILER_BLOCK_TYPES.FLEX_ITEM,

            data: {
              props: {},

              style: {
                desktop: {
                  display:
                    "flex",

                  alignItems:
                    "flex-start",

                  width:
                    "100%",

                  minWidth:
                    "0",

                  boxSizing:
                    "border-box"
                },

                tablet: {
                  width:
                    "100%",

                  minWidth:
                    "0"
                },

                mobile: {
                  width:
                    "100%",

                  minWidth:
                    "0"
                }
              }
            },

            children:
              parseDomToBlocks(
                item,
                [
                  ...path,
                  "list-item",
                  index,
                  "content"
                ],
                ownership,
                warnings,
                matcherHits
              )
          })
        )
    }
  ];
}

if (
  tagName === "li"
) {
  const text =
    cleanImportedListItemText(
      element.textContent || ""
    );

  if (!text) {
    return [];
  }

  const marker =
    getImportedListMarker(
      element
    );

  const typography =
    extractTypographyStyles(
      element
    );

  const cleanStyle = {
    ...typography,

    desktop: {
      ...(typography.desktop || {}),

      display:
        "block",

      listStyleType:
        "none",

      listStylePosition:
        "outside",

      margin:
        "0",

      padding:
        "0",

      paddingLeft:
        "0",

      textIndent:
        "0",

      whiteSpace:
        "normal",

      minWidth:
        "0",

      boxSizing:
        "border-box"
    },

    tablet: {
      ...(typography.tablet || {}),

      display:
        "block",

      listStyleType:
        "none",

      margin:
        "0",

      padding:
        "0",

      paddingLeft:
        "0",

      textIndent:
        "0",

      whiteSpace:
        "normal",

      minWidth:
        "0"
    },

    mobile: {
      ...(typography.mobile || {}),

      display:
        "block",

      listStyleType:
        "none",

      margin:
        "0",

      padding:
        "0",

      paddingLeft:
        "0",

      textIndent:
        "0",

      whiteSpace:
        "normal",

      minWidth:
        "0"
    }
  };

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
            `${marker} ${text}`
        },

        style:
          cleanStyle
      },

      children: []
    }
  ];
}
// =========================================
// MIXED INLINE PARAGRAPH
// =========================================

const mixedInlineTextTags =
  new Set([
    "p",
    "blockquote",
    "figcaption"
  ]);

const inlineFormattingTags =
  new Set([
    "span",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "mark",
    "small",
    "sup",
    "sub",
    "br"
  ]);

const directMixedTextNodes =
  getMeaningfulDirectTextNodes(
    element
  );

const safeInlineChildren =
  getSafeChildren(
    element
  );

const isMixedInlineParagraph =
  mixedInlineTextTags.has(
    tagName
  ) &&
  directMixedTextNodes.length > 0 &&
  safeInlineChildren.length > 0 &&
  safeInlineChildren.every(
    child =>
      inlineFormattingTags.has(
        getTagNameLower(
          child
        )
      )
  ) &&
  !element.querySelector(
    "a, button, img, input, select, textarea"
  );

if (
  isMixedInlineParagraph
) {
  const content =
    normalizeDiagnosticText(
      element.textContent || ""
    );

  if (!content) {
    return [];
  }

  const typographyStyle =
    extractTypographyStyles(
      element
    );

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
          content
        },

        style: {
          ...typographyStyle,

          desktop: {
            ...(typographyStyle.desktop || {}),

            display:
              "block",

            width:
              "100%",

            maxWidth:
              "100%",

            minWidth:
              "0",

            whiteSpace:
              "normal",

            wordBreak:
              "normal",

            overflowWrap:
              "break-word",

            boxSizing:
              "border-box",

            overflow:
              "visible"
          },

          tablet: {
            ...(typographyStyle.tablet || {}),

            display:
              "block",

            width:
              "100%",

            maxWidth:
              "100%",

            minWidth:
              "0",

            whiteSpace:
              "normal",

            overflowWrap:
              "break-word"
          },

          mobile: {
            ...(typographyStyle.mobile || {}),

            display:
              "block",

            width:
              "100%",

            maxWidth:
              "100%",

            minWidth:
              "0",

            whiteSpace:
              "normal",

            overflowWrap:
              "break-word"
          }
        }
      },

      children: []
    }
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
const directTextComputed =
  extractComputedStyles(
    element
  );

const hasVisualTextBox =
  (
    tagName === "div" ||
    tagName === "span"
  ) &&
  (
    hasRealPaint(
      directTextComputed
    ) ||
    directTextComputed.padding !==
      "0px" ||
    directTextComputed.border !==
      "0px none rgb(0, 0, 0)" ||
    directTextComputed.borderRadius !==
      "0px"
  );
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
  hasVisualTextBox
    ? mergeExtractedVisualStyles(
        element
      )
    : (
        tagName === "span" ||
        (
          normalizeDiagnosticText(
            element.textContent || ""
          ).length <= 40 &&
          !normalizeDiagnosticText(
            element.textContent || ""
          ).includes(" ")
        )
      )
        ? makeShortInlineTextSafe(
            extractTypographyStyles(
              element
            )
          )
        : extractTypographyStyles(
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
  const safeChildren =
    getSafeChildren(
      element
    );

  const isCompositeLink =
    safeChildren.length > 0 &&
    !!element.querySelector(
      "h1,h2,h3,h4,h5,h6,p,span,div,img"
    );

  if (
    isCompositeLink
  ) {
    const compositeChildren =
      safeChildren.flatMap(
        (
          child,
          index
        ) =>
          parseDomToBlocks(
            child,
            [
              ...path,
              index
            ],
            ownership,
            warnings,
            matcherHits
          )
      );
const anchorStyle =
  extractLayoutStyles(
    element
  );

const originalCardHeight = anchorStyle.desktop?.minHeight || anchorStyle.desktop?.height;
delete anchorStyle.desktop.height; delete anchorStyle.desktop.maxHeight;delete anchorStyle.desktop.overflow;
const normalizeCardTextBlocks = (
  blocks: SerializedBlock[]
): SerializedBlock[] =>
  blocks.map((block: any) => {
    const next = {
      ...block,

      data: {
        ...(block.data || {}),

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
      },

      children:
        normalizeCardTextBlocks(
          block.children || []
        )
    };

    if (
      next.type ===
      COMPILER_BLOCK_TYPES.TITLE
    ) {
      next.data.style.desktop.fontSize =
        "22px";

      next.data.style.desktop.lineHeight =
        "1.12";

      next.data.style.desktop.margin =
        "0";

      next.data.style.desktop.marginBottom =
        "8px";

      next.data.style.tablet.fontSize =
        "21px";

      next.data.style.mobile.fontSize =
        "20px";
    }

    if (
      next.type ===
      COMPILER_BLOCK_TYPES.TEXT
    ) {
      next.data.style.desktop.margin =
        "0";

      next.data.style.desktop.lineHeight =
        next.data.style.desktop.lineHeight ||
        "1.55";
    }

    return next;
  });
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
          props: {
            href:
              element.getAttribute(
                "href"
              ) || "#"
          },

    style: {
  ...anchorStyle,

  desktop: {
    ...(anchorStyle.desktop || {}),

    display:
      "flex",

    flexDirection:
      "column",

    alignItems:
      "flex-start",

    justifyContent:
      "space-between",

    gap:
      anchorStyle.desktop?.gap &&
      anchorStyle.desktop.gap !== "normal"
        ? anchorStyle.desktop.gap
        : "12px",

    width:
      "100%",

    maxWidth:
      "100%",

    minWidth:
      "0",

    height:
      "auto",

    minHeight:
      originalCardHeight &&
      originalCardHeight !== "auto"
        ? originalCardHeight
        : "220px",

    overflow:
      "visible",

    boxSizing:
      "border-box"
  },

  tablet: {
    ...(anchorStyle.tablet || {}),

    width:
      "100%",

    maxWidth:
      "100%",

    minWidth:
      "0",

    overflow:
      "visible"
  },

  mobile: {
    ...(anchorStyle.mobile || {}),

    width:
      "100%",

    maxWidth:
      "100%",

    minWidth:
      "0",

    overflow:
      "visible"
  }
}
        },

        children: [
          {
            id:
              generateNodeId(
                COMPILER_BLOCK_TYPES.FLEX_ITEM,
                [
                  ...path,
                  "content"
                ]
              ),

            type:
              COMPILER_BLOCK_TYPES.FLEX_ITEM,

            data: {
              props: {},
              style: {
  desktop: {
    display:
      "flex",

    flexDirection:
      "column",

    alignItems:
      "flex-start",

    gap:
      "14px",

    width:
      "100%",

    minWidth:
      "0",

    overflow:
      "visible",

    boxSizing:
      "border-box"
  },

  tablet: {
    display:
      "flex",

    flexDirection:
      "column",

    alignItems:
      "flex-start",

    gap:
      "12px",

    width:
      "100%",

    minWidth:
      "0",

    overflow:
      "visible"
  },

  mobile: {
    display:
      "flex",

    flexDirection:
      "column",

    alignItems:
      "flex-start",

    gap:
      "10px",

    width:
      "100%",

    minWidth:
      "0",

    overflow:
      "visible"
  }
} },
children:
  normalizeCardTextBlocks(
    compositeChildren
  )
    }  ]  } ];}

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
          mergeExtractedVisualStyles(
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
        getSafeChildren(
          element
        ).flatMap(
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
                childClassName.includes(
                  "logo"
                ) ||
                !!child.querySelector(
                  ".logo, [class*='logo']"
                )
              );

            const isNavbarDropdownChild =
              isNavbarContainer &&
              (
                childClassName.includes(
                  "dropdown"
                ) ||
                childClassName.includes(
                  "submenu"
                ) ||
                childClassName.includes(
                  "has-sub"
                ) ||
                !!child.querySelector(
                  "ul"
                )
              );

            const isNavbarLinksChild =
              isNavbarContainer &&
              !isNavbarDropdownChild &&
              (
                childClassName.includes(
                  "nav-links"
                ) ||
                childClassName.includes(
                  "menu"
                )
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

            return [
              {
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
                            flexGrow:
                              0,

                            height:
                              "auto",

                            minHeight:
                              "auto",

                            minWidth:
                              "0"
                          },

                    tablet:
                      {},

                    mobile:
                      isNavbarContainer
                        ? {
                            width:
                              "100%",

                            minWidth:
                              "0"
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
              }
            ];
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

  const safeContainerStyle =
    sanitizeImportedFlowStyle(
      containerStyle,
      {
        centered: true,
        preserveMaxWidth: true
      }
    );
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
          safeContainerStyle
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

const isIndustriesImportDebugContext = (
  context: ImportHtmlContext
) =>
  [
    context.slug,
    context.sourceFile
  ]
    .filter(Boolean)
    .some(value =>
      String(value)
        .toLowerCase()
        .includes("industries")
    );

const collectSemanticTypesFromBlocks = (
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

const hasSemanticType = (
  blocks: any[] = [],
  allowedTypes: string[]
) =>
  collectSemanticTypesFromBlocks(
    blocks
  ).some(type =>
    allowedTypes.includes(type)
  );

const ensureSemanticHeroPreserved = (
  blocks: SerializedBlock[],
  semanticBlocks: any[]
): SerializedBlock[] => {
  if (
    hasSemanticType(
      blocks,
      ["HERO_SECTION", "HERO"]
    )
  ) {
    return blocks;
  }

  const emittedHero =
    semanticBlocks.find(
      entry => {
        const semanticType =
          entry?.emitted?.meta?.semanticType ||
          entry?.semanticResult?.type;

        return (
          semanticType === "HERO_SECTION" ||
          semanticType === "HERO"
        );
      }
    )?.emitted as SerializedBlock | undefined;

  if (!emittedHero) {
    return blocks;
  }

  return [
    emittedHero,
    ...blocks
  ];
};
const stripFounderPortraitInnerShell = (
  block: SerializedBlock
): SerializedBlock => {
  const sourceStyle =
    block.data?.style || {};

  const responsiveStyle = {
    ...sourceStyle,

    desktop: {
      ...(sourceStyle.desktop || {})
    },

    tablet: {
      ...(sourceStyle.tablet || {})
    },

    mobile: {
      ...(sourceStyle.mobile || {})
    }
  };

  (
    [
      "desktop",
      "tablet",
      "mobile"
    ] as const
  ).forEach(
    device => {
      const style =
        responsiveStyle[device];

      delete style.background;
      delete style.backgroundColor;
      delete style.backgroundImage;
      delete style.backgroundSize;
      delete style.backgroundPosition;
      delete style.backgroundRepeat;

      delete style.border;
      delete style.borderTop;
      delete style.borderRight;
      delete style.borderBottom;
      delete style.borderLeft;
      delete style.borderRadius;

      delete style.boxShadow;

      delete style.padding;
      delete style.paddingTop;
      delete style.paddingRight;
      delete style.paddingBottom;
      delete style.paddingLeft;

      delete style.aspectRatio;

      style.width =
        "100%";

      style.maxWidth =
        "100%";

      style.minWidth =
        "0";

      style.height =
        "100%";

      style.boxSizing =
        "border-box";

      style.overflow =
        "visible";
    }
  );

  return {
    ...block,

    data: {
      ...(block.data || {}),

      props: {
        ...(block.data?.props || {})
      },

      style:
        responsiveStyle
    }
  };
};
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
const parentComputedStyles =
  element.parentElement
    ? extractComputedStyles(
        element.parentElement
      )
    : null;

const ownWidth =
  parseCssNumericValue(
    computedStyles.width
  );

const parentWidth =
  parseCssNumericValue(
    parentComputedStyles?.width
  );

const resolvedGridMaxWidth =
  computedStyles.maxWidth &&
  computedStyles.maxWidth !== "none" &&
  computedStyles.maxWidth !== "100%"
    ? computedStyles.maxWidth
    : parentWidth > 0 &&
        ownWidth > 0 &&
        ownWidth < parentWidth
      ? computedStyles.width
      : "1180px";
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

  width:
  "100%",

maxWidth:
  resolvedGridMaxWidth,

marginLeft:
  "auto",

marginRight:
  "auto",

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

   children:
  getSafeChildren(element)
    .filter(
      hasMeaningfulElementContent
    )
    .map(
      (
        child,
        index
      ) => {
        const childPath = [
          ...path,
          index
        ];

        const childClassTokens =
          getElementClassName(
            child
          )
            .toLowerCase()
            .split(/\s+/)
            .filter(Boolean);

        const isFounderPortraitChild =
          childClassTokens.includes(
            "founder-portrait"
          );

        const childLayoutStyle =
          extractLayoutStyles(
            child
          );

        childLayoutStyle.desktop = {
          ...(childLayoutStyle.desktop || {})
        };

        childLayoutStyle.tablet = {
          ...(childLayoutStyle.tablet || {})
        };

        childLayoutStyle.mobile = {
          ...(childLayoutStyle.mobile || {})
        };

      if (
  !isFounderPortraitChild
) {
  delete childLayoutStyle
    .desktop.height;

  delete childLayoutStyle
    .desktop.minHeight;

  delete childLayoutStyle
    .desktop.maxHeight;

  childLayoutStyle
    .desktop.overflow =
      "visible";
}

 const shouldCompileGridItemContents =
  !isFounderPortraitChild &&
  ![
    "A",
    "BUTTON",
    "FORM"
  ].includes(
    child.tagName
  ) &&
  getSafeChildren(
    child
  ).length > 0;

const rawCompiledChildren =
  shouldCompileGridItemContents
    ? compileDirectChildNodes(
        child,
        childPath,
        ownership,
        warnings,
        matcherHits
      )
    : fallbackCompileElement(
        child,
        childPath,
        ownership,
        warnings,
        matcherHits
      );

const compiledChildren =
  isFounderPortraitChild
    ? rawCompiledChildren.map(
        stripFounderPortraitInnerShell
      )
    : rawCompiledChildren;

        if (
          isFounderPortraitChild
        ) {
          console.info(
            "HTML_IMPORT_FOUNDER_PORTRAIT_GRID_CHILD",
            {
              sourceFile:
                activeImportContext
                  .sourceFile,

              path:
                childPath.join("."),

              compiledTypes:
                compiledChildren.map(
                  block =>
                    block.type
                )
            }
          );
        }

        return {
          id:
            generateNodeId(
              COMPILER_BLOCK_TYPES
                .GRID_ITEM,
              childPath
            ),

          type:
            COMPILER_BLOCK_TYPES
              .GRID_ITEM,

          data: {
            props: {},

            style: {
              desktop: {
                ...(childLayoutStyle
                  .desktop || {}),

                width: "100%",
                maxWidth: "100%",
                minWidth: "0",
                overflow:
  isFounderPortraitChild
    ? (
        childLayoutStyle
          .desktop?.overflow ||
        "hidden"
      )
    : "visible",
                boxSizing:
                  "border-box"
              },

              tablet: {
                ...(isFounderPortraitChild
                  ? childLayoutStyle
                      .tablet || {}
                  : {}),

                width: "100%",
                maxWidth: "100%",
                minWidth: "0",
                overflow:
  isFounderPortraitChild
    ? "hidden"
    : "visible",
                boxSizing:
                  "border-box"
              },

              mobile: {
                ...(isFounderPortraitChild
                  ? childLayoutStyle
                      .mobile || {}
                  : {}),

                width: "100%",
                maxWidth: "100%",
                minWidth: "0",
                overflow:
  isFounderPortraitChild
    ? "hidden"
    : "visible",
                boxSizing:
                  "border-box"
              }
            }
          },

          children:
            compiledChildren
        };
      }
    )
    .filter(
      item =>
        item.children.length > 0
     )
  }
];
}
function parseDomToBlocksInternal(
  element: HTMLElement,
  path: (string | number)[],
  ownership: OwnershipBuckets,
  warnings: ImportWarning[],
  matcherHits: ImportMatcherHit[]
): SerializedBlock[] {
  if (
    element.tagName === "P" &&
    !element.querySelector(
      "a,button,img,input,select,textarea,form"
    )
  ) {
    const content =
      normalizeDiagnosticText(
        element.textContent || ""
      );

    if (content) {
      const typography =
        extractTypographyStyles(
          element
        );
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
              content
            },

           style:
  makeImportedFlowTextSafe(
    typography,
    "text"
  )
          },

          children: []
        }
      ];
    }
  }

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

  if (
    isInsideClaimedSemanticSubtree(
      element
    )
  ) {
    return [];
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
      "SMALL"
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
          style: makeImportedFlowTextSafe(
  extractTypographyStyles(element),
  "title"
)

        },

        children: []
      }
    ];
  }

  if (
    element.tagName === "LABEL"
  ) {
    return emitFallbackLabel(
      element,
      path,
      ownership,
      warnings,
      matcherHits
    );
  }

  if (
    element.tagName === "FORM"
  ) {
    return emitFallbackFormContainer(
      element,
      path,
      ownership,
      warnings,
      matcherHits
    );
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
        "LABEL",
        "INPUT",
        "TEXTAREA",
        "SELECT",
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

type ImportedDocumentSurface = {
  background?: string;
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundPosition?: string;
  backgroundRepeat?: string;
  backgroundSize?: string;
};

const hasVisibleBackground = (
  style: Record<string, any> = {}
) => {
  const background =
    String(style.background || "").trim();
  const backgroundColor =
    String(style.backgroundColor || "").trim();
  const backgroundImage =
    String(style.backgroundImage || "").trim();

  return (
    (!!background &&
      background !== "none" &&
      !/^rgba?\(0,\s*0,\s*0,\s*0\)/i.test(background) &&
      background !== "transparent") ||
    (!!backgroundColor &&
      !isTransparentColor(backgroundColor)) ||
    (!!backgroundImage &&
      backgroundImage !== "none")
  );
};

const isDefaultWhiteSurface = (
  surface: ImportedDocumentSurface
) => {
  const normalizedColor =
    String(
      surface.backgroundColor || ""
    )
      .replace(/\s+/g, "")
      .toLowerCase();

  const normalizedImage =
    String(
      surface.backgroundImage || ""
    )
      .trim()
      .toLowerCase();

  return (
    (
      normalizedColor === "rgb(255,255,255)" ||
      normalizedColor === "#fff" ||
      normalizedColor === "#ffffff"
    ) &&
    (
      !normalizedImage ||
      normalizedImage === "none"
    )
  );
};

const surfaceFromElement = (
  element: HTMLElement
): ImportedDocumentSurface => {
  const computed =
    getElementWindow(
      element
    ).getComputedStyle(
      element
    );

  const hasColor =
    !isTransparentColor(
      computed.backgroundColor
    );

  const hasImage =
    computed.backgroundImage &&
    computed.backgroundImage !== "none";

  if (
    !hasColor &&
    !hasImage
  ) {
    return {};
  }

  return {
    background:
      computed.background || undefined,
    backgroundColor:
      hasColor
        ? computed.backgroundColor
        : undefined,
    backgroundImage:
      hasImage
        ? computed.backgroundImage
        : undefined,
    backgroundPosition:
      hasImage
        ? computed.backgroundPosition
        : undefined,
    backgroundRepeat:
      hasImage
        ? computed.backgroundRepeat
        : undefined,
    backgroundSize:
      hasImage
        ? computed.backgroundSize
        : undefined
  };
};
const extractDocumentSurface = (
  body: HTMLElement
): ImportedDocumentSurface => {
  const getSurfaceFromElement = (
    element: HTMLElement
  ): ImportedDocumentSurface => {
    const computed =
      getElementWindow(element).getComputedStyle(element);

    const hasColor =
      !isTransparentColor(computed.backgroundColor);

    const hasImage =
      computed.backgroundImage &&
      computed.backgroundImage !== "none";

    if (!hasColor && !hasImage) {
      return {};
    }

    return {
      background:
        computed.background || undefined,

      backgroundColor:
        hasColor
          ? computed.backgroundColor
          : undefined,

      backgroundImage:
        hasImage
          ? computed.backgroundImage
          : undefined,

      backgroundPosition:
        hasImage
          ? computed.backgroundPosition
          : undefined,

      backgroundRepeat:
        hasImage
          ? computed.backgroundRepeat
          : undefined,

      backgroundSize:
        hasImage
          ? computed.backgroundSize
          : undefined
    };
  };

  const isDefaultWhiteSurface = (
    surface: ImportedDocumentSurface
  ) => {
    const value =
      String(
        surface.backgroundColor ||
        surface.background ||
        ""
      )
        .replace(/\s+/g, "")
        .toLowerCase();

    return (
      value === "rgb(255,255,255)" ||
      value === "rgba(255,255,255,1)" ||
      value === "#fff" ||
      value === "#ffffff" ||
      value === "white"
    );
  };

  const bodySurface =
    getSurfaceFromElement(body);

  if (
    hasVisibleBackground(bodySurface) &&
    !isDefaultWhiteSurface(bodySurface)
  ) {
    return bodySurface;
  }

  const candidates =
    Array.from(
      body.querySelectorAll(
        "main, .page, .site, .wrapper, .app, header, section"
      )
    ).filter(
      (element): element is HTMLElement =>
        element instanceof HTMLElement
    );

  for (const candidate of candidates) {
    const surface =
      getSurfaceFromElement(candidate);

    if (
      hasVisibleBackground(surface) &&
      !isDefaultWhiteSurface(surface)
    ) {
      return surface;
    }
  }

  return bodySurface;
};

const isDefaultWhitePaint = (
  value?: string
) => {
  const normalized =
    String(value || "")
      .replace(/\s+/g, "")
      .toLowerCase();

  return (
    normalized === "white" ||
    normalized === "#fff" ||
    normalized === "#ffffff" ||
    normalized === "rgb(255,255,255)" ||
    normalized === "rgba(255,255,255,1)"
  );
};

const hasDefaultWhiteBackground = (
  style: Record<string, any> = {}
) =>
  isDefaultWhitePaint(style.backgroundColor) ||
  isDefaultWhitePaint(style.background);

const blockHasLightText = (
  block: any
): boolean => {
  const desktop =
    block?.data?.style?.desktop ||
    block?.style?.desktop ||
    {};

  if (
    isLightColor(desktop.color)
  ) {
    return true;
  }

  return (
    block?.children || []
  ).some(blockHasLightText);
};

const applyDocumentSurfaceToRootSections = (
  blocks: SerializedBlock[],
  surface: ImportedDocumentSurface
): SerializedBlock[] => {
  if (!hasVisibleBackground(surface)) {
    return blocks;
  }

  return blocks.map((block) => {
    if (block.type !== "section") {
      return block;
    }

    const desktop =
      block.data?.style?.desktop || {};

    const localHasBackground =
      hasVisibleBackground(desktop);

    const localIsWhite =
      hasDefaultWhiteBackground(desktop);

    const textIsLight =
      blockHasLightText(block);

    const needsSurface =
      !localHasBackground ||
      (
        localIsWhite &&
        textIsLight
      );

    if (!needsSurface) {
      return block;
    }

    return {
      ...block,
      data: {
        ...block.data,
        style: {
          ...(block.data?.style || {}),
          desktop: {
            ...desktop,

            background:
              surface.background ||
              desktop.background,

            backgroundColor:
              surface.backgroundColor ||
              desktop.backgroundColor,

            backgroundImage:
              surface.backgroundImage ||
              desktop.backgroundImage,

            backgroundSize:
              surface.backgroundSize ||
              desktop.backgroundSize,

            backgroundPosition:
              surface.backgroundPosition ||
              desktop.backgroundPosition,

            backgroundRepeat:
              surface.backgroundRepeat ||
              desktop.backgroundRepeat
          }
        }
      }
    };
  });
};

const enforceFinalImportedTitleFlow = (
  blocks: SerializedBlock[]
): SerializedBlock[] => {
  return (blocks || []).map(
    block => {
      const children =
        enforceFinalImportedTitleFlow(
          block.children || []
        );

      if (
        block.type !==
        COMPILER_BLOCK_TYPES.TITLE
      ) {
        return {
          ...block,
          children
        };
      }

      const sourceStyle =
        block.data?.style || {};

      const hasResponsiveStyle =
        "desktop" in sourceStyle ||
        "tablet" in sourceStyle ||
        "mobile" in sourceStyle;

      const nextStyle:
        Record<string, any> =
        hasResponsiveStyle
          ? {
              ...sourceStyle,

              desktop: {
                ...(sourceStyle.desktop || {})
              },

              tablet: {
                ...(sourceStyle.tablet || {})
              },

              mobile: {
                ...(sourceStyle.mobile || {})
              }
            }
          : {
              desktop: {
                ...sourceStyle
              },

              tablet: {},

              mobile: {}
            };

      (
        [
          "desktop",
          "tablet",
          "mobile"
        ] as const
      ).forEach(
        device => {
          const style =
            nextStyle[device];

          delete style.height;
          delete style.minHeight;
          delete style.maxHeight;

          const fontSize =
            Number.parseFloat(
              String(
                style.fontSize || ""
              )
            );

          const rawLineHeight =
            String(
              style.lineHeight || ""
            )
              .trim()
              .toLowerCase();

          const lineHeight =
            Number.parseFloat(
              rawLineHeight
            );

          const isPixelLineHeight =
            rawLineHeight.endsWith(
              "px"
            );

          const isUnitlessLineHeight =
            /^-?\d*\.?\d+$/.test(
              rawLineHeight
            );

          const pixelRatio =
            isPixelLineHeight &&
            Number.isFinite(fontSize) &&
            fontSize > 0 &&
            Number.isFinite(lineHeight)
              ? lineHeight / fontSize
              : null;

          const unsafePixelLineHeight =
            pixelRatio !== null &&
            pixelRatio < 0.9;

          const unsafeUnitlessLineHeight =
            isUnitlessLineHeight &&
            Number.isFinite(lineHeight) &&
            lineHeight < 0.9;

          if (
            !rawLineHeight ||
            rawLineHeight === "normal" ||
            unsafePixelLineHeight ||
            unsafeUnitlessLineHeight
          ) {
            style.lineHeight =
              "1.05";
          }

          style.display =
            "block";

          style.width =
            "100%";

          style.maxWidth =
            "100%";

          style.minWidth =
            "0";

          style.whiteSpace =
            "normal";

          style.wordBreak =
            "normal";

          style.overflowWrap =
            "break-word";

          style.overflow =
            "visible";

          style.boxSizing =
            "border-box";

          if (
            !style.marginBottom ||
            style.marginBottom === "0" ||
            style.marginBottom === "0px"
          ) {
            style.marginBottom =
              "8px";
          }
        }
      );

      return {
        ...block,

        data: {
          ...(block.data || {}),

          props: {
            ...(block.data?.props || {})
          },

          style:
            nextStyle
        },

        children
      } as SerializedBlock;
    }
  );
};
export async function importHtmlDocument(
  htmlString: string,
  context: ImportHtmlContext = {}
): Promise<ImportHtmlResult> {
  totalImportedNodes = 0;
  activeImportContext = context;
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

            // SPA hosts often answer a missing asset with index.html and 200.
            // Treating that response as CSS silently produces a half-styled import.
            if (
              /^\s*(?:<!doctype\s+html|<html[\s>])/i.test(
                content
              )
            ) {
              loadReport.push({
                href,
                loaded: false,
                candidate,
                status,
                contentType,
                reason: "HTML_RESPONSE_INSTEAD_OF_CSS"
              });
              continue;
            }

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

        warnings.push({
          type: "EXTERNAL_STYLESHEET_LOAD_FAILED",
          message:
            `Could not load stylesheet "${href}". ` +
            "The imported page may be only partially styled; import the complete site bundle or inline the CSS.",
          path: `head > link[href="${href}"]`
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
    activeSemanticClaimRoots =
      new WeakSet<HTMLElement>();
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
sandboxFrame.style.opacity = "0";
sandboxFrame.style.pointerEvents = "none";

document.body.appendChild(
  sandboxFrame
);
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

    const documentSurface =
      extractDocumentSurface(body);

   const originalDomTextNodes =
  collectDomTextNodes(
    body,
    {
      respectVisibility: false
    }
  );

  

    const extractedDesignTokens =
      extractDesignTokens(body);

    const designTokens: ExtractedDesignTokens = {
      ...extractedDesignTokens,
      colors: {
        ...extractedDesignTokens.colors,
        surface:
          documentSurface.backgroundColor ||
          extractedDesignTokens.colors.surface
      }
    };
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
   
    activeSemanticClaimRoots =
      new WeakSet<HTMLElement>();

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
getSafeChildren(body).forEach(
  (child, index) => {
    if (
      activeBodyChildTwoContainer &&
      (
        child === activeBodyChildTwoContainer ||
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

    const matchedSemantic =
      semanticBlocks.find(
        (entry: any) => {
          const claimed =
            entry.claimedNode?.element;

          return claimed === child;
        }
      );
      const containsForm =
  child.tagName === "FORM" ||
  !!child.querySelector(
    "form"
  );

  if (containsForm) {
  const formSubtree = [
    child,
    ...Array.from(
      child.querySelectorAll("*")
    )
  ];

  formSubtree.forEach(
    node => {
      activeSemanticReplacementMap.delete(
        node as HTMLElement
      );

      activeSemanticClaimRoots.delete(
        node as HTMLElement
      );
    }
  );
}

    if (
  matchedSemantic?.emitted &&
  !containsForm
) {
      finalBlocks.push(
        matchedSemantic.emitted
      );

      logSemanticDroppedText(
        child,
        matchedSemantic.emitted
      );

      return;
    }

    const compiled =
      parseDomToBlocks(
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
);
//preserveMissingSemanticBlocks(
  //"finalBlocks",
  //finalBlocks,
  //semanticBlocks
//);

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


assertFeaturePillarsPreservedAfterMerge(
  "semanticMergedBlocks",
  semanticMergedBlocks,
  semanticBlocks
);

assertNoNullChildren(
  semanticMergedBlocks,
  "FINAL_BLOCKS_AFTER_SEMANTIC_MERGE"
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
const canonicalNormalized =
  wrapInvalidRootBlocks(
    normalizeCanonicalContainers(
      normalized as unknown[]
    ) as any
  );

assertNoNullChildren(
  canonicalNormalized,
  "CANONICAL_NORMALIZED_BLOCKS"
);

logFeatureFlexItemStyles(
  "CANONICAL_NORMALIZED",
  canonicalNormalized
);
const droppedPageText =
  collectDroppedDomTextNodes(
    document.body,
    canonicalNormalized
  );

if (droppedPageText.length) {
  console.error(
    "❌ HTML_IMPORT_DROPPED_PAGE_TEXT",
    droppedPageText
  );
}
// ============================================
// DEBUG INVALID FLEXITEM OWNERS
// ============================================
const debugInvalidFlexItemOwners = (
  blocks: any[]
) => {
  const allowedParentTypes =
    new Set([
      "flex",
      "navbar",
      "footer"
    ]);

  const walk = (
    block: any,
    parent: any = null,
    path: string[] = []
  ) => {
    if (!block) {
      return;
    }

    const currentPath = [
      ...path,
      `${block.type}:${block.id}`
    ];

    if (
      block.type === "flexItem" &&
      !allowedParentTypes.has(
        String(parent?.type || "")
      )
    ) {
    
    }

    const children =
      Array.isArray(block.children)
        ? block.children
        : [];

    children.forEach(
      (child: any) =>
        walk(
          child,
          block,
          currentPath
        )
    );
  };

  blocks.forEach(
    block =>
      walk(block)
  );
};

debugInvalidFlexItemOwners(
  canonicalNormalized as any[]
);

assertTreeInvariants(
  canonicalNormalized as any
);

const normalizedWithDocumentSurface =
  applyDocumentSurfaceToRootSections(
    canonicalNormalized as any,
    documentSurface
  );

const normalizedWithTokens =
  applyDesignTokensToBlocks(
    normalizedWithDocumentSurface as any,
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

if (
  sandboxFrame?.parentNode
) {
  sandboxFrame.parentNode.removeChild(
    sandboxFrame
  );
}

activeSemanticReplacementMap =
  new WeakMap();
activeSemanticClaimRoots =
  new WeakSet<HTMLElement>();
activeSemanticReplacementDiagnostics =
  [];

assertTreeInvariants(
  visualBlocks as any
);

const visualBlocksWithDocumentSurface =
  applyDocumentSurfaceToRootSections(
    visualBlocks as any,
    documentSurface
  );


const semanticBlocksWithoutFormRoots =
  semanticBlocks.filter(
    (entry: any) => {
      const claimed =
        entry?.claimedNode?.element as
          | HTMLElement
          | undefined;

      if (!claimed) {
        return true;
      }

      const containsForm =
        claimed.tagName === "FORM" ||
        !!claimed.querySelector("form");

      return !containsForm;
    }
  );

  const responsiveVisualBlocks =
  applyImportedResponsiveDefaults(
    ensureSemanticHeroPreserved(
      flattenImportedNestedCards(
        visualBlocksWithDocumentSurface as any
      ) as any,
      semanticBlocksWithoutFormRoots
    ) as any
  );

const finalTypographySafeBlocks =
  enforceFinalImportedTitleFlow(
    responsiveVisualBlocks as any
  );

const serializableVisualBlocks =
  sanitizeBlockTreeStyles(
    finalTypographySafeBlocks as any,
    "importHtmlDocument.finalBlocks"
  );
  
const finalTextProps =
  collectTextProps(
    serializableVisualBlocks as any
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
  finalDroppedDomTextNodes.length
) {
  console.table(
    finalDroppedDomTextNodes.map(
      ({
        text,
        tag,
        className,
        path
      }) => ({
        text,
        tag,
        className,
        path
      })
    )
  );
}
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
    activeSemanticClaimRoots =
      new WeakSet<HTMLElement>();
    activeSemanticReplacementDiagnostics =
      [];

    if (
      sandboxFrame?.parentNode
    ) {
      sandboxFrame.parentNode.removeChild(
        sandboxFrame
      );
  }
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

        activeSemanticClaimRoots.add(
          element
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

        activeSemanticClaimRoots.add(
          liveElement
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
   
    throw new Error(
      `NULL_CHILDREN_IN_BLOCK_TREE: ${stage}`
    );
  }
}
}
