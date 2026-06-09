import {
  BaseSemanticPayload
} from "./BaseSemanticPayload";

export type FeaturePillarItem = {

  id: string;

  title: string;

  description: string;
};

export interface FeaturePillarsPayload
  extends BaseSemanticPayload {

  type:
    "FEATURE_PILLARS";

  items:
    FeaturePillarItem[];

  gridNode?:
    BaseSemanticPayload["claimedNode"];

  sourceNode?:
    BaseSemanticPayload["claimedNode"];
}
