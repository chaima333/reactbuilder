import { InfoBannerPayload } from "../runtime/importers/html/semanticResolvers/semanticContracts/InfoBannerPayload";

export type SemanticType =

  | "HERO_SECTION"

  | "VALUES_GRID"

  | "OFFICES_TABLE"

  | "CTA_SECTION"

  | "INSIGHTS_SECTION"

  | "TRUST_LOGO_SECTION"

  | "NAVBAR"

  | "FEATURE_PILLARS"

  | "CONTENT_LIST_SECTION"

  | "INFO_BANNER"

  | "TWO_COLUMN_INTRO"

  | "CTA_CARD"

  

export interface BlockMeta {

  semanticType?:
    SemanticType;

  confidence?:
    number;
}
