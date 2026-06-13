import { FigmaNode } from "./figma.types";

// Figma → CSS
export const figmaColorToHex = (
  color: { r: number; g: number; b: number; a?: number }
): string => {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  const a = color.a ?? 1;
  if (a < 1) return `rgba(${r},${g},${b},${a.toFixed(2)})`;
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
};

export const mapFrameStyles = (node: FigmaNode) => ({
  desktop: {display: node.layoutMode && node.layoutMode !== "NONE" ? "flex" : "block",
    flexDirection: node.layoutMode === "HORIZONTAL" ? "row": node.layoutMode === "VERTICAL"? "column": undefined,
    gap: `${node.itemSpacing ?? 0}px`,
    paddingTop: `${node.paddingTop ?? 0}px`,
    paddingBottom: `${node.paddingBottom ?? 0}px`,
    paddingLeft: `${node.paddingLeft ?? 0}px`,
    paddingRight: `${node.paddingRight ?? 0}px`,
    backgroundColor: node.fills?.[0]?.type === "SOLID"
      ? figmaColorToHex(node.fills[0].color!)
      : "transparent",
    borderRadius: node.cornerRadius ? `${node.cornerRadius}px` : undefined,
    width: "100%",
maxWidth: node.absoluteBoundingBox?.width
  ? `${node.absoluteBoundingBox.width}px`
  : undefined,
  },
  tablet: {},
  mobile: {}
});

export const mapTextStyles = (node: FigmaNode) => ({
  desktop: {
    fontSize: `${node.style?.fontSize ?? 16}px`,
    fontWeight: String(node.style?.fontWeight ?? 400),
    lineHeight: `${node.style?.lineHeightPx ?? 24}px`,
    letterSpacing: `${node.style?.letterSpacing ?? 0}px`,
    textAlign: node.style?.textAlignHorizontal?.toLowerCase() ?? "left",
    color: node.fills?.[0]?.type === "SOLID"
      ? figmaColorToHex(node.fills[0].color!)
      : "#000000",
      maxWidth: node.absoluteBoundingBox?.width
  ? `${node.absoluteBoundingBox.width}px`
  : undefined,
  },
  tablet: {},
  mobile: {}
});