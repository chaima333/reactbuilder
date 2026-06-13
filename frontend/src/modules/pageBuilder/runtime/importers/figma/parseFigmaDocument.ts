import {
  FigmaDocument,
  FigmaNode
} from "./figma.types";

const findNodeById = (
  node: FigmaNode,
  id: string
): FigmaNode | null => {
  if (node.id === id) {
    return node;
  }

  for (const child of node.children || []) {
    const found = findNodeById(
      child,
      id
    );

    if (found) {
      return found;
    }
  }

  return null;
};

export const parseFigmaDocument = (
  doc: FigmaDocument,
  frameId?: string
): FigmaNode[] => {
  const canvas =
    doc.document.children?.[0];

  if (!canvas) {
    return [];
  }

  if (frameId) {
    const frame =
      findNodeById(
        canvas,
        frameId
      );

    return frame
      ? [frame]
      : [];
  }

  return (canvas.children || []).filter(
    node => node.type === "FRAME"
  );
};
// figma-plugin
export const parseFigmaPluginPayload = (
  payload: FigmaNode
): FigmaNode[] => {
  if (!payload) {
    return [];
  }

  if (
    payload.type === "FRAME" ||
    payload.type === "COMPONENT" ||
    payload.type === "SECTION"
  ) {
    return [payload];
  }

  return payload.children || [];
};