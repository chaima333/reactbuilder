import type {
  StructuralNode
} from "../structure/buildStructuralGraph";

export type FooterPayload = {
  type: "FOOTER";
  confidence: number;
  reason: string[];
  preserveGenericSubtree: true;
  claimedNode: StructuralNode;
};
