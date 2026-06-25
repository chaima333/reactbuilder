import { PageBlock } from "../pages/types/page.types";

export type AiPageType =
  | "home"
  | "about"
  | "services"
  | "solutions"
  | "reservation"
  | "contact"
  | "pricing"
  | "integrations";

export interface GeneratePageRequest {
  title?: string;
  prompt: string;
}

export interface GeneratedPage {
  title: string;
  blocks: PageBlock[];
}

export interface BusinessProfile {
  industry: string;
  companyName: string;
  services: string[];
  audience: string[];
  keywords: string[];
  tone: string;
  needsPricing: boolean;
  needsIntegrations: boolean;
  needsBooking: boolean;
}

export interface SiteContext {
  companyName: string;
  category: string;
  audience: string[];
  tone: string;
  services: string[];
  cta: string;
  pages: AiPageType[];
  keywords: string[];
}

export interface AiGeneratedContent {
  title: string;

  heroTitle: string;
  heroText: string;

  missionTitle: string;
  missionText: string;

  services: string[];
  features: string[];

  stats: Array<{
    value: string;
    label: string;
  }>;

  testimonials: string[];
  faqs: string[];

  ctaTitle: string;
  ctaText: string;

  storyText?: string;
  values?: string[];
  team?: string[];
  pricing?: string[];
  integrations?: string[];
  timeline?: string[];
}