// src/models/index.ts

import { User } from "./User";
import { Token } from "./token";
import { Page } from "./page";
import { Site } from "./site";
import { ActivityLog } from "./activityLog";
import { Media } from "./media";
import { Seo } from "./Seo";
import Plugin from "./Plugin";
import { SitePlugin } from "./SitePlugin";
import { SiteMember } from "./SiteMember";
import PageVersion from "./pageVersion";
import PageSlug from "./pageSlug";
import { FigmaImport } from "./FigmaImport";
import { ContactSubmission } from "./contactSubmission";
import { FigmaPluginToken } from "./FigmaPluginToken";
import PlatformSetting from "./PlatformSetting";
import Notification from "./Notification";
import { AiGeneration } from "./AiGeneration";
import SiteInvitation from "./SiteInvitation";
import { AiActivityEvent } from "./AiActivityEvent";
import { PartnerApplication } from "./PartnerApplication";
import { CmsEntry } from "./CmsEntry.model";
import { CmsCollection } from "./CmsCollection.model";
import { CmsField } from "./CmsField.model";
import { FormSubmission } from "./FormSubmission.model";
import { Form } from "./Form.model";
import { SiteVisitor } from "./SiteVisitor";
import { SiteVisitorSession } from "./SiteVisitorSession";

export const models = [
  User,
  Token,
  Page,
  Site,
  ActivityLog,
  Media,
  Seo,
  Plugin,
  SitePlugin,
  SiteMember,
  PageVersion,
  PageSlug,
  FigmaImport,
  ContactSubmission,
  FigmaPluginToken,
  PlatformSetting,
  Notification,
  AiGeneration,
  SiteInvitation,
  AiActivityEvent,
  PartnerApplication,
  CmsEntry,
  CmsCollection,
  CmsField,
  FormSubmission,
  Form,
  SiteVisitor,
  SiteVisitorSession
];

export {
  User,
  Token,
  Page,
  Site,
  ActivityLog,
  Media,
  Seo,
  Plugin,
  SitePlugin,
  SiteMember,
  PageVersion,
  PageSlug,
  FigmaImport,
  ContactSubmission,
  FigmaPluginToken,
  PlatformSetting,
  Notification,
  AiGeneration,
  SiteInvitation,
  AiActivityEvent,
  PartnerApplication,
  CmsEntry,
  CmsCollection,
  CmsField,
  FormSubmission,
  Form,
  SiteVisitor,
  SiteVisitorSession
};