import type {
  FigmaNode
} from "./figma.types";

const getBox = (
  node: FigmaNode
) => node.absoluteBoundingBox;

export const detectFigmaLayout = (
  children: FigmaNode[]
): "row" | "column" => {

  if (children.length < 2) {
    return "column";
  }

  const xs = children.map(
    child => getBox(child)?.x ?? 0
  );

  const ys = children.map(
    child => getBox(child)?.y ?? 0
  );

  const xSpread =
    Math.max(...xs) -
    Math.min(...xs);

  const ySpread =
    Math.max(...ys) -
    Math.min(...ys);

  return xSpread > ySpread
    ? "row"
    : "column";
};