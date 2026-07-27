import type {
  StructuralNode
} from "../structure/buildStructuralGraph";

export type HeroStyle = {
  desktop?: Record<string, any>;
  tablet?: Record<string, any>;
  mobile?: Record<string, any>;
};

export interface HeroPayload {

  type:
    "HERO_SECTION";

  title:
    string;

  subtitle?:
    string;

  ctaText?:
    string;

  buttons?:
    string[];

  kpiItems?:
    string[];

  partnerItems?:
    string[];

  image?:
    string;

  claimedNode?:
    StructuralNode;

  styles?: {
    section?: HeroStyle;
  };
}
