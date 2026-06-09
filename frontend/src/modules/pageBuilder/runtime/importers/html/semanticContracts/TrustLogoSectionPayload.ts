import {
  BaseSemanticPayload
} from "./BaseSemanticPayload";

export interface TrustLogoItemPayload {
  id: string;
  label: string;
}

export interface TrustLogoSectionPayload
  extends BaseSemanticPayload {
  type: "TRUST_LOGO_SECTION";
  confidence: number;
  reason: string[];
  eyebrow?: string;
  title?: string;
  description?: string;
  items: TrustLogoItemPayload[];
  sourceNode?: HTMLElement;
}
