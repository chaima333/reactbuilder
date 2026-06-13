import type {
  SemanticPayload
} from "../../emitters/emitSemanticBlock";

import {
  generateContactLayoutPreset
} from "../../../../../presets/generateContactLayoutPreset";

import {
  presetRegistry
} from "../../../../../presets/presetRegistry";
import { generateNavbarPreset } from "../../../../../presets/generateNavbarPreset";

const generateCTAGroupPreset = (
  payload: any
) => {
  const hasActions =
    Array.isArray(
      payload?.actions
    ) &&
    payload.actions.length > 0;

  const forwardedPayload =
    hasActions
      ? {
          ...payload,
          title:
            payload?.title ||
            payload?.actions?.[0]?.label ||
            "Ready to get started?",
          text:
            payload?.text ||
            payload?.description ||
            "",
          actions:
            payload.actions
        }
      : {
          title:
            payload?.title ||
            "Ready to get started?",
          text:
            payload?.text ||
            payload?.description ||
            "",
          button:
            payload?.button ||
            "Start Now"
        };

  console.log(
    "CTA_EMITTER_FORWARD_ACTIONS",
    {
      incomingActionsLength:
        payload?.actions?.length || 0,
      forwardedActionsLength:
        forwardedPayload.actions?.length || 0,
      fallbackButtonUsed:
        !hasActions
    }
  );

  return presetRegistry.cta(
    forwardedPayload
  );
};

export const semanticEmitterRegistry:

Partial<

  Record<
    SemanticPayload["type"],
    Function
  >

> = {

  NAVBAR: generateNavbarPreset,

  HERO_SECTION:
    presetRegistry.hero,

  FEATURE_PILLARS:
    presetRegistry.featurePillars,

  OFFICES_TABLE:
    presetRegistry.officeTable,

  VALUES_GRID:
    presetRegistry.valuesGrid,

  CONTACT_LAYOUT:
    generateContactLayoutPreset,

  CTA_GROUP:
    generateCTAGroupPreset,

  CTA_SECTION:
    generateCTAGroupPreset,

  INSIGHTS_SECTION:
    presetRegistry.insights,

  TRUST_LOGO_SECTION:
    presetRegistry.trustLogo,

    CONTENT_LIST_SECTION:
  presetRegistry.contentList,

  INFO_BANNER:
  presetRegistry.infoBanner,

  TWO_COLUMN_INTRO:
  presetRegistry.twoColumnIntro,

  CTA_CARD:
  generateCTAGroupPreset,
    
};
