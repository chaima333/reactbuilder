import {
  BaseSemanticPayload
} from "./BaseSemanticPayload";

export interface InsightItemPayload {
  title: string;
  description?: string;
  meta?: string;
  href?: string;
  ctaLabel?: string;
}

export interface InsightsSectionPayload
  extends BaseSemanticPayload {
  type: "INSIGHTS_SECTION";
  confidence: number;
  reason: string[];
  title?: string;
  description?: string;
  items: InsightItemPayload[];
}
