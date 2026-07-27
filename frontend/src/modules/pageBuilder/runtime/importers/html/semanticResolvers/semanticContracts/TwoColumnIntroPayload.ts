import { StructuralNode } from "../../structure/buildStructuralGraph";

export type TwoColumnIntroPayload = {
  type: "TWO_COLUMN_INTRO";

  claimedNode?: StructuralNode;

  columns: {
    eyebrow?: string;
    title: string;
    text: string;
  }[];
};