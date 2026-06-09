import { resolveAuthHero } from "../authHero/resolveAuthHero";
import { resolveContactLayout } from "../contactLayout/resolveContactLayout";
import { resolveFeaturePillars } from "../featurePillars/resolveFeaturePillars";
import {
  resolveHero
} from "../hero/resolveHero";

import {
  resolveOfficeTable
} from "../officeTable/resolveOfficeTable";

import {
  resolveValuesGrid
} from "../valuesGrid/resolveValuesGrid";

import {
  resolveRepeatedSemanticEntity
} from "../repeatedStructures/resolveRepeatedSemanticEntity";
import {
  resolveInsightsSection
} from "../insights/resolveInsightsSection";
import {
  resolveCtaSection
} from "../cta/resolveCtaSection";
import {
  resolveTrustLogoSection
} from "../trustLogo/resolveTrustLogoSection";

export const semanticResolverRegistry = [

  resolveHero,

  resolveAuthHero,

  resolveContactLayout,

  resolveFeaturePillars,

  resolveOfficeTable,

  resolveValuesGrid,

  resolveTrustLogoSection,

  resolveInsightsSection,

  resolveCtaSection,

  resolveRepeatedSemanticEntity
];
