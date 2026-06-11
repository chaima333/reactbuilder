import { StructuralNode } from "../../structure/buildStructuralGraph";

export type ContentListSectionPayload = {
  type: "CONTENT_LIST_SECTION";

  claimedNode?: StructuralNode;

  title: string;

  description?: string;

  items: string[];
};