import { detectFigmaLayout } from "./detectFigmaLayouts";
import { detectFigmaSemanticRole } from "./detectFigmaSemanticRole";
import type {
  FigmaNode
} from "./figma.types";

export type FigmaSemanticNode = {
  id: string;
  type: "section" | "row" | "column" | "card" | "text" | "image" | "shape";
  semanticRole?: string | null;
  name: string;
  source: FigmaNode;
  children: FigmaSemanticNode[];
};

const box = (node: FigmaNode) =>
  node.absoluteBoundingBox;

const isText = (node: FigmaNode) =>
  node.type === "TEXT";

const isImageLike = (node: FigmaNode) =>
  node.fills?.some(fill => fill.type === "IMAGE");

const isShape = (node: FigmaNode) =>
  ["RECTANGLE", "VECTOR", "ELLIPSE"].includes(node.type);

const sortByPosition = (nodes: FigmaNode[]) =>
  [...nodes].sort((a, b) => {
    const ay = box(a)?.y ?? 0;
    const by = box(b)?.y ?? 0;
    const ax = box(a)?.x ?? 0;
    const bx = box(b)?.x ?? 0;

    return ay === by ? ax - bx : ay - by;
  });

const mapLeafType = (
  node: FigmaNode
): FigmaSemanticNode["type"] => {
  if (isText(node)) return "text";
  if (isImageLike(node)) return "image";
  return "shape";
};

const toLeaf = (node: FigmaNode): FigmaSemanticNode => ({
  id: node.id,
  name: node.name,
  type: mapLeafType(node),
  source: node,
  children: []
});

const overlaps = (
  container: FigmaNode,
  child: FigmaNode
) => {
  const a = box(container);
  const b = box(child);

  if (!a || !b) return false;

  return (
    b.x >= a.x &&
    b.y >= a.y &&
    b.x + b.width <= a.x + a.width &&
    b.y + b.height <= a.y + a.height
  );
};

const isBackgroundShape = (
  node: FigmaNode,
  siblings: FigmaNode[]
) => {
  if (!isShape(node)) return false;

  const contained =
    siblings.filter(other =>
      other.id !== node.id &&
      overlaps(node, other)
    );

  const hasText =
    contained.some(other =>
      other.type === "TEXT"
    );

  const hasImage =
    contained.some(other =>
      isImageLike(other)
    );

  return hasText && !hasImage;
};

const groupCards = (
  nodes: FigmaNode[],
  parentLayoutMode?: "HORIZONTAL" | "VERTICAL" | "NONE"
): FigmaSemanticNode[] => {
  if (parentLayoutMode === "VERTICAL") {
  return sortByPosition(nodes).map(child =>
    figmaToSemanticTree(child)
  );
}
  const used = new Set<string>();
  const result: FigmaSemanticNode[] = [];

  for (const node of sortByPosition(nodes)) {
    if (used.has(node.id)) continue;

    if (isBackgroundShape(node, nodes)) {
      const inner = nodes.filter(other =>
        other.id !== node.id &&
        !used.has(other.id) &&
        overlaps(node, other)
      );

      inner.forEach(child => used.add(child.id));
      used.add(node.id);

      result.push({
        id: `${node.id}-card`,
        name: node.name,
        type: "card",
        source: node,
        children: inner.map(child =>
          figmaToSemanticTree(child)
        )
      });

      continue;
    }

    if (!used.has(node.id)) {
      used.add(node.id);
      result.push(figmaToSemanticTree(node));
    }
  }

  return result;
};

const groupByColumns = (
  nodes: FigmaSemanticNode[]
): FigmaSemanticNode[] => {
  if (nodes.length <= 2) return nodes;

  const sorted = [...nodes].sort((a, b) => {
    const ax = box(a.source)?.x ?? 0;
    const bx = box(b.source)?.x ?? 0;
    return ax - bx;
  });

  const xs = sorted.map(n => box(n.source)?.x ?? 0);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);

const spread = maxX - minX;

if (spread < 150) {
  return nodes;
}
  const mid = (minX + maxX) / 2;

  const left = sorted.filter(n =>
    (box(n.source)?.x ?? 0) < mid
  );

  const right = sorted.filter(n =>
    (box(n.source)?.x ?? 0) >= mid
  );

  if (!left.length || !right.length) return nodes;
left.sort((a, b) =>
  (box(a.source)?.y ?? 0) -
  (box(b.source)?.y ?? 0)
);

right.sort((a, b) =>
  (box(a.source)?.y ?? 0) -
  (box(b.source)?.y ?? 0)
);
  return [
    {
      id: "figma-left-column",
      name: "Left column",
      type: "column",
      source: left[0].source,
      children: left
    },
    {
      id: "figma-right-column",
      name: "Right column",
      type: "column",
      source: right[0].source,
      children: right
    }
  ];
};

export const figmaToSemanticTree = (
  node: FigmaNode
): FigmaSemanticNode => {
  const rawChildren =
    sortByPosition(node.children || []);

  if (!rawChildren.length) {
    return toLeaf(node);
  }
const cardGrouped =
  sortByPosition(rawChildren).map(child =>
    figmaToSemanticTree(child)
  );
  

  const columnGrouped =
  node.layoutMode === "HORIZONTAL" ||
  node.layoutMode === "VERTICAL"
    ? cardGrouped
    : groupByColumns(cardGrouped);

  const layout =
  detectFigmaLayout(
    rawChildren
  );
console.log(
  "FIGMA LAYOUT",
  {
    node: node.name,
    layout,
    children: rawChildren.length
  }
);

console.log(
  "FIGMA NODE",
  {
    name: node.name,
    layoutMode: node.layoutMode,
    children: columnGrouped.length
  }
);
return {
  id: node.id,
  name: node.name,
  type:
    node.type === "FRAME"
      ? "section"
      : layout === "row"
        ? "row"
        : "column",
        semanticRole:
  detectFigmaSemanticRole(node),
  source: node,
  children: columnGrouped
};
};