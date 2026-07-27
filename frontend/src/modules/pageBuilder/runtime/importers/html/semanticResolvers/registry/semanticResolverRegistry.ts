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
import { resolveNavbar } from "../navbar/resolveNavbar";
import { resolveFooter } from "../footer/resolveFooter";
import {
  resolveServicePageSection
} from "../servicePageSection/resolveServicePageSection";


export const semanticResolverRegistry = [
resolveNavbar,

  resolveFooter,
  
  resolveHero,

  resolveServicePageSection,

  resolveTwoColumnIntro,

  resolveContactLayout,

  resolveFeaturePillars,

  resolveOfficeTable,

  resolveValuesGrid,

  resolveTrustLogoSection,

  resolveInsightsSection,

  resolveCtaCard,

  resolveCtaSection,

  resolveContentListSection,

  resolveInfoBanner,
  
  resolveRepeatedSemanticEntity,

  ];
