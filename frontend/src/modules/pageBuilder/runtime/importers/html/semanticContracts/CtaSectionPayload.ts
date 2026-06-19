import { StructuralNode } from "../structure/buildStructuralGraph";
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
  titleSegments?: Array<{
    text: string;
    variant: "default" | "accent";
    sourceClass?: string;
  }>;
  text?: string;
  actions: CtaSectionAction[];
  claimedNode?: StructuralNode;
  sectionElement?: HTMLElement;
  containerElement?: HTMLElement;
  panelElement?: HTMLElement;
}
