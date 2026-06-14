// src/models/index.ts
import { User } from "./User";
import { Token } from "./token";
import { Page } from "./page";
import { Site } from "./site";
import { ActivityLog } from "./activityLog";
import { Media } from "./media";
import { Seo } from "./Seo";
import { SitePlugin } from "./SitePlugin";
import Plugin from "./Plugin";
import { SiteMember } from "./SiteMember";
import PageVersion from "./pageVersion"; 
import PageSlug from "./pageSlug"; 
import { FigmaImport } from "./FigmaImport";
import { ContactSubmission } from "./contactSubmission";
import { FigmaPluginToken } from "./FigmaPluginToken";

export const models = [
  User, Token, Page, Site, ActivityLog, Media, 
  Seo, Plugin, SitePlugin, SiteMember, 
  PageVersion, PageSlug, FigmaImport,ContactSubmission,FigmaPluginToken
];

export { 
  User, Token, Page, Site, ActivityLog, 
  Media, Seo, Plugin, SitePlugin, SiteMember, 
  PageVersion, PageSlug, FigmaImport,ContactSubmission,FigmaPluginToken
};