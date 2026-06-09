import type {
  StructuralNode
} from "../structure/buildStructuralGraph";

export interface BaseSemanticPayload {

  claimedNode?:
    StructuralNode;
}