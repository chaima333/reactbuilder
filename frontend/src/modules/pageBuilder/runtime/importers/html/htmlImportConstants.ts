export const MAX_IMPORT_DEPTH = 20;
export const MAX_IMPORT_CHILDREN = 100;
export const MAX_IMPORT_NODES = 5000;

export const DEFAULT_GRID_GAP_DESKTOP = "24px";
export const DEFAULT_GRID_GAP_TABLET = "16px";
export const DEFAULT_GRID_GAP_MOBILE = "12px";
export const DEFAULT_GRID_MAX_WIDTH = "1180px";

export const NON_VISUAL_TAGS = new Set([
  "script",
  "style",
  "iframe",
  "head",
  "meta",
  "link",
  "noscript"
]);

export const SECTION_TAG_NAMES = new Set([
  "section",
  "header",
  "main",
  "article"
]);

export const HEADING_TAGS = new Set([
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6"
]);

export const LIST_TAG_NAMES = new Set([
  "ul",
  "ol"
]);

export const INLINE_SEMANTIC_EXCLUDE_TAGS = new Set([
  "img",
  "input",
  "textarea",
  "select",
  "option"
]);

export const SEMANTIC_TAGS = new Set([
  "a",
  "button",
  "nav"
]);

export const SKIP_TEXT_COVERAGE_SELECTOR = "script,style,noscript,svg";

export const ROOT_ALLOWED_TYPES = new Set([
  "section",
  "navbar"
]);

export const COMPILER_BLOCK_TYPES = {
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
  LINK: "link"
} as const;

export const TARGET_CONTAINER_CHILD_CLASSES = new Set([
  "svc-grid",
  "deliverables",
  "markets",
  "cta-svc",
  "other-svc"
]);

export const SERVICE_SELECTOR_BY_VARIANT: Record<string, string> = {
  SERVICE_INTRO_GRID: ".svc-grid",
  SERVICE_DELIVERABLES: ".deliverables",
  SERVICE_MARKETS: ".markets",
  SERVICE_CTA: ".cta-svc",
  SERVICE_CARDS: ".other-svc"
};
