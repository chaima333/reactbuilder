import {
  generateFeaturePillarsPreset,
  generateHeroPreset,
  generateNavbarPreset
} from "../presets";

import {
  generateCTAPreset
} from "../presets";

import { generateOfficeTablePreset } from "./generateOfficeTablePreset";
import { generateInsightsPreset } from "./generateInsightsPreset";
import { generateValuesGridPreset } from "./generateValuesGridPreset";
import { generateTrustLogoPreset } from "./generateTrustLogoPreset";

export const presetRegistry = {

  hero:
    generateHeroPreset,

  cta:
    generateCTAPreset,

  navbar:
    generateNavbarPreset,

 officeTable:
  generateOfficeTablePreset,

  valuesGrid:
  generateValuesGridPreset,

  featurePillars:
  generateFeaturePillarsPreset,

  insights:
  generateInsightsPreset,

  trustLogo:
  generateTrustLogoPreset,
};
