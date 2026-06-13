import type {
  FigmaNode
} from "./figma.types";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const rgbToHex = (color: any) => {
  if (!color) return undefined;

  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);

  return `#${[r, g, b]
    .map(v => v.toString(16).padStart(2, "0"))
    .join("")}`;
};

const getSolidColor = (node: FigmaNode) => {
  const fill = node.fills?.find(
    fill => fill.type === "SOLID" && fill.visible !== false
  );

  return rgbToHex(fill?.color);
};

const getBox = (node: FigmaNode) =>
  node.absoluteBoundingBox;

const nodeToHtml = (
  node: FigmaNode,
  rootBox?: { x: number; y: number }
): string => {
  const box = getBox(node);
  const background = getSolidColor(node);

  const styleParts: string[] = [];

  if (box && rootBox) {
    styleParts.push(`position:absolute`);
    styleParts.push(`left:${Math.round(box.x - rootBox.x)}px`);
    styleParts.push(`top:${Math.round(box.y - rootBox.y)}px`);
    styleParts.push(`width:${Math.round(box.width)}px`);
    styleParts.push(`min-height:${Math.round(box.height)}px`);
  }

  if (background) {
    styleParts.push(`background:${background}`);
  }

  const style = styleParts.length
    ? ` style="${styleParts.join(";")}"`
    : "";

  if (node.type === "TEXT") {
    const content = escapeHtml(node.characters || "");
    const fontSize = node.style?.fontSize || 16;

    const tag = fontSize > 42
      ? "h1"
      : fontSize > 28
        ? "h2"
        : "p";

    return `<${tag}${style}>${content}</${tag}>`;
  }

  if (node.fills?.some(fill => fill.type === "IMAGE")) {
    return `<img${style} src="" alt="${escapeHtml(node.name)}" />`;
  }

  const children =
    (node.children || [])
      .map(child => nodeToHtml(child, rootBox))
      .join("\n");

  if (!children && node.type !== "FRAME") {
    return `<div${style}></div>`;
  }

  return `<div${style}>${children}</div>`;
};

export const figmaNodeToHtml = (
  node: FigmaNode
): string => {
  const box = node.absoluteBoundingBox;

  const background = getSolidColor(node);

  return `
<section
  data-figma-id="${node.id}"
  data-figma-name="${escapeHtml(node.name)}"
  style="position:relative;width:${Math.round(box?.width || 1200)}px;min-height:${Math.round(box?.height || 600)}px;${background ? `background:${background};` : ""}"
>
${(node.children || [])
  .map(child => nodeToHtml(child, box))
  .join("\n")}
</section>
`;
};