import type {
  StructuralNode
} from "../structure/buildStructuralGraph";

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
}
