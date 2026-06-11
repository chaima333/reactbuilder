import { StructuralNode } from "../../structure/buildStructuralGraph";

export type CtaCardPayload = {
  type: "CTA_CARD";

  claimedNode?: StructuralNode;

  title?: string;

  text?: string;

  actions?: Array<{
    label?: string;
    href?: string;
  }>;
};