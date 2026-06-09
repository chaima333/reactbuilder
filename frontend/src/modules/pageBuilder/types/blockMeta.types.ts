export type SemanticType =

  | "HERO_SECTION"

  | "VALUES_GRID"

  | "OFFICES_TABLE"

  | "CTA_SECTION"

  | "INSIGHTS_SECTION"

  | "TRUST_LOGO_SECTION"

  | "NAVBAR"

  | "FEATURE_PILLARS";

export interface BlockMeta {

  semanticType?:
    SemanticType;

  confidence?:
    number;
}
