import { extractLayoutStyles, extractTypographyStyles } from "../css/extractStyleProps";
import { extractComputedStyles } from "../css/extractComputedStyles";
import {
  splitGridTrackList,
  makeGridTracksShrinkSafe,
  hasRealPaint,
  resolvePaintSource,
  getPreservedWrapperDesktopStyle,
  withDesktopFallback,
  sanitizeSectionLayoutStyle
} from "./importHtmlUtils";
import {
  DEFAULT_GRID_GAP_DESKTOP,
  DEFAULT_GRID_GAP_TABLET,
  DEFAULT_GRID_GAP_MOBILE,
  DEFAULT_GRID_MAX_WIDTH
} from "./htmlImportConstants";

export const mergeExtractedVisualStyles = (
  element: HTMLElement
) => {
  const layout = extractLayoutStyles(element);
  const typography = extractTypographyStyles(element);

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

export const makeShortInlineTextSafe = (
  style: Record<string, any> = {}
) => ({
  ...style,
  desktop: {
    ...(style.desktop || {}),
    display: "inline-flex",
    width: "max-content",
    minWidth: "max-content",
    maxWidth: "none",
    flexShrink: 0,
    alignSelf: "flex-start",
    whiteSpace: "nowrap",
    wordBreak: "keep-all",
    overflowWrap: "normal",
    hyphens: "none",
    overflow: "visible"
  },
  tablet: {
    ...(style.tablet || {}),
    width: "max-content",
    minWidth: "max-content",
    whiteSpace: "nowrap",
    wordBreak: "keep-all",
    overflowWrap: "normal",
    hyphens: "none"
  },
  mobile: {
    ...(style.mobile || {}),
    width: "max-content",
    minWidth: "max-content",
    whiteSpace: "nowrap",
    wordBreak: "keep-all",
    overflowWrap: "normal",
    hyphens: "none"
  }
});

export const makeGridContainerStyle = (
  computedStyles: ReturnType<typeof extractComputedStyles>,
  style: Record<string, any> = {},
  defaultMaxWidth = "1180px"
) => {
  const rawColumns = computedStyles.gridTemplateColumns || "";
  const computedColumnCount = rawColumns.split(" ").filter(Boolean).length;
  const finalColumnCount = computedColumnCount > 0 ? computedColumnCount : 2;

  return {
    desktop: {
      display: "grid",
      gridTemplateColumns:
        rawColumns && rawColumns !== "none"
          ? makeGridTracksShrinkSafe(rawColumns)
          : `repeat(${finalColumnCount}, minmax(0, 1fr))`,
      gridTemplateRows: style?.desktop?.gridTemplateRows || style?.gridTemplateRows,
      gap: style?.desktop?.gap || style?.gap || computedStyles.gap || DEFAULT_GRID_GAP_DESKTOP,
      padding: style?.desktop?.padding || style?.padding || computedStyles.padding,
      width: "100%",
      maxWidth: defaultMaxWidth,
      marginLeft: "auto",
      marginRight: "auto",
      backgroundColor: style?.desktop?.backgroundColor || style?.backgroundColor || computedStyles.backgroundColor,
      borderRadius: style?.desktop?.borderRadius || style?.borderRadius || computedStyles.borderRadius,
      overflow: "visible",
      boxSizing: "border-box"
    },
    tablet: {
      display: "grid",
      gridTemplateColumns: finalColumnCount >= 2 ? "repeat(2, minmax(0, 1fr))" : "minmax(0, 1fr)",
      gap: computedStyles.gap || DEFAULT_GRID_GAP_TABLET,
      width: "100%",
      maxWidth: "100%",
      minWidth: "0",
      boxSizing: "border-box"
    },
    mobile: {
      display: "grid",
      gridTemplateColumns: "minmax(0, 1fr)",
      gap: computedStyles.gap || DEFAULT_GRID_GAP_MOBILE,
      width: "100%",
      maxWidth: "100%",
      minWidth: "0",
      boxSizing: "border-box"
    }
  };
};

export const getWrapperDesktopStyle = (
  computed: ReturnType<typeof extractComputedStyles>,
  layoutDesktop: Record<string, any> = {},
  element?: HTMLElement
) => getPreservedWrapperDesktopStyle(computed, layoutDesktop, element);

export const sanitizeSectionStyle = (
  id: string,
  style: Record<string, any> = {}
) => sanitizeSectionLayoutStyle(id, style);
