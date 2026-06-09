import {
  BaseSemanticPayload
} from "./BaseSemanticPayload";

export interface CtaSectionAction {
  id: string;
  label: string;
  href: string;
  tag: string;
}

export interface CtaSectionPayload
  extends BaseSemanticPayload {
  type: "CTA_SECTION";
  confidence: number;
  reason: string[];
  title: string;
  text?: string;
  actions: CtaSectionAction[];
}
