import type {
  FigmaSemanticNode
} from "./figmaToSemanticTree";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const text = (node: FigmaSemanticNode) =>
  escapeHtml(node.source.characters || "");

const fontSize = (node: FigmaSemanticNode) =>
  node.source.style?.fontSize || 16;

const renderNode = (
  node: FigmaSemanticNode
): string => {
  if (node.type === "text") {
    const tag =
      fontSize(node) > 42
        ? "h1"
        : fontSize(node) > 26
          ? "h2"
          : "p";

    return `<${tag} class="rb-text">${text(node)}</${tag}>`;
  }

  if (node.type === "image") {
    return `<div class="rb-media" role="img" aria-label="${escapeHtml(node.name)}"></div>`;
  }

  if (node.type === "card") {
    return `
<article class="rb-card">
  ${node.children.map(renderNode).join("\n")}
</article>`;
  }

  if (node.type === "column") {
    return `
<div class="rb-column">
  ${node.children.map(renderNode).join("\n")}
</div>`;
  }

  if (node.type === "row") {
    return `
<div class="rb-row">
  ${node.children.map(renderNode).join("\n")}
</div>`;
  }

  if (node.type === "section") {
    return `
<section class="rb-section">
  <div class="rb-grid">
    ${node.children.map(renderNode).join("\n")}
  </div>
</section>`;
  }

  return "";
};

export const semanticTreeToHtml = (
  tree: FigmaSemanticNode
): string => {
  return `
<style>
  .rb-section {
    padding: 32px;
    background: #d37386;
  }

  .rb-grid {
    display: grid;
    grid-template-columns: minmax(280px, 420px) 1fr;
    gap: 32px;
    align-items: start;
  }

  .rb-column {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .rb-row {
    display: flex;
    gap: 24px;
    align-items: start;
  }

  .rb-card {
    background: #d9d9d9;
    padding: 24px;
  }

  .rb-media {
    width: 100%;
    min-height: 320px;
    background: #d9d9d9;
  }

  .rb-text {
    margin: 0 0 12px;
  }
</style>

${renderNode(tree)}
`;
};