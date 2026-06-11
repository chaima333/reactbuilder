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
import { resolveContentListSection } from "../contentList/resolveContentListSection";
import { resolveInfoBanner } from "../infoBanner/resolveInfoBanner";
import { resolveTwoColumnIntro } from "../twoColumnIntro/resolveTwoColumnIntro";
import { resolveCtaCard } from "../ctaCard/resolveCtaCard";

export const semanticResolverRegistry = [

  resolveHero,

  resolveAuthHero,

  resolveContactLayout,

  resolveFeaturePillars,

  resolveOfficeTable,

  resolveValuesGrid,

  resolveTrustLogoSection,

  resolveInsightsSection,

  resolveCtaCard,

  resolveCtaSection,

   resolveTwoColumnIntro,

  resolveContentListSection,

  resolveInfoBanner,
  
  resolveRepeatedSemanticEntity,

  ];
