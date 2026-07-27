import {
  BaseSemanticPayload
} from "./BaseSemanticPayload";

export type FeaturePillarItem = {
  id: string;
  title: string;
  description: string;
  styles?: FeaturePillarItemStyles;
};

export type FeaturePillarStyle = {
  desktop?: Record<string, any>;
  tablet?: Record<string, any>;
  mobile?: Record<string, any>;
};

export type FeaturePillarItemStyles = {
  card?: FeaturePillarStyle;
  eyebrow?: FeaturePillarStyle;
  title?: FeaturePillarStyle;
  description?: FeaturePillarStyle;
  tags?: FeaturePillarStyle[];
};

export type FeaturePillarsStyles = {
  section?: FeaturePillarStyle;
  container?: FeaturePillarStyle;
  eyebrow?: FeaturePillarStyle;
  title?: FeaturePillarStyle;
  description?: FeaturePillarStyle;
  grid?: FeaturePillarStyle;
  card?: FeaturePillarStyle;
  tag?: FeaturePillarStyle;
};

export interface FeaturePillarsPayload
  extends BaseSemanticPayload {

  type:
    "FEATURE_PILLARS";

  items:
    FeaturePillarItem[];

  gridNode?: BaseSemanticPayload["claimedNode"];
  sourceNode?:BaseSemanticPayload["claimedNode"];
  suppressIntro?:boolean;
  styles?:FeaturePillarsStyles;
}
