import { StructuralNode } from "../../structure/buildStructuralGraph";


export const claimSubtree = (
  node: StructuralNode
) => {

   console.log(
    "☠️ CLAIM",
    node.element.tagName,
    node.element.className,
    node.path
  );

  node.claimed = true;

  for (const child of node.children) {
    claimSubtree(child);
  }
};