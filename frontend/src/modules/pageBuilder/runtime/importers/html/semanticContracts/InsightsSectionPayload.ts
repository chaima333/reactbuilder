import {
  BaseSemanticPayload
} from "./BaseSemanticPayload";

export interface InsightItemPayload {
  category?: string;
  title: string;
  description?: string;
  meta?: string;
  source?: string;
  time?: string;
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
