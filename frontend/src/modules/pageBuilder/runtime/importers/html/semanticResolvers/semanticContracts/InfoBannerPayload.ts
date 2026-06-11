import { StructuralNode } from "../../structure/buildStructuralGraph";

export type InfoBannerPayload = {
  type: "INFO_BANNER";

  claimedNode?: StructuralNode;

  label: string;

  value: string;

  actionText?: string;

  actionHref?: string;
};