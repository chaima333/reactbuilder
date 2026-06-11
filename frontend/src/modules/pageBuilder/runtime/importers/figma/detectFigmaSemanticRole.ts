import { FigmaNode } from "./figma.types";

export const detectFigmaSemanticRole = (
  node: FigmaNode
): string | null => {
  const name = node.name.toLowerCase().trim();
  
  if (name.includes("hero") || name.includes("banner")) return "HERO_SECTION";
  if (name.includes("navbar") || name.includes("nav") || name.includes("header")) return "NAVBAR";
  if (name.includes("feature") || name.includes("pillar")) return "FEATURE_PILLARS";
  if (name.includes("cta") || name.includes("call to action")) return "CTA_SECTION";
  if (name.includes("footer")) return "FOOTER";
  if (name.includes("card") && node.children?.length) return "CARD_GROUP";
  
  return null;
};