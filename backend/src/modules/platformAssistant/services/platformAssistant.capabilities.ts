export type PlatformCapabilityStatus =
  | "implemented"
  | "partially_implemented"
  | "admin_only"
  | "site_scoped"
  | "experimental"
  | "disabled"
  | "not_implemented";

export type PlatformCapability = {
  id: string;
  name: string;
  status: PlatformCapabilityStatus;
  scope: "global" | "site" | "page" | "public";
  summary: string;
  evidence: string[];
};

export const PLATFORM_CAPABILITIES: PlatformCapability[] = [
  {
    id: "authentication",
    name: "Authentication",
    status: "implemented",
    scope: "global",
    summary: "Login, registration, password reset and JWT authentication are implemented.",
    evidence: ["backend/src/modules/auth", "frontend/src/modules/auth"]
  },
  {
    id: "sites",
    name: "Sites",
    status: "implemented",
    scope: "global",
    summary: "Users can create and manage sites, with site-scoped workspace data.",
    evidence: ["backend/src/modules/sites", "frontend/src/modules/sites"]
  },
  {
    id: "pages",
    name: "Pages",
    status: "implemented",
    scope: "site",
    summary: "Pages can be created, edited, saved, published, deleted and restored from versions.",
    evidence: ["backend/src/modules/pages", "frontend/src/redux/services/pages.api.ts"]
  },
  {
    id: "page-builder",
    name: "Page Builder",
    status: "implemented",
    scope: "page",
    summary: "The visual Page Builder supports editable blocks, drag and drop, structure/tree editing and responsive desktop/tablet/mobile previews.",
    evidence: ["frontend/src/modules/pageBuilder"]
  },
  {
    id: "page-ai",
    name: "Page generation AI and Design Copilot",
    status: "implemented",
    scope: "page",
    summary: "Page Builder AI can generate pages, suggest improvements, edit selected blocks and run Design Copilot suggestions.",
    evidence: ["backend/src/modules/ia", "frontend/src/modules/pageBuilder/pages/aiAssistant"]
  },
  {
    id: "cms",
    name: "CMS",
    status: "implemented",
    scope: "site",
    summary: "CMS collections, fields, entries, public entry rendering and CMS bindings are implemented.",
    evidence: ["backend/src/modules/cms", "frontend/src/modules/cms"]
  },
  {
    id: "forms",
    name: "Forms",
    status: "implemented",
    scope: "site",
    summary: "Forms can be created and managed, and Form blocks can be linked into pages.",
    evidence: ["backend/src/modules/forms", "frontend/src/modules/forms"]
  },
  {
    id: "media",
    name: "Media Library",
    status: "implemented",
    scope: "site",
    summary: "The Media Library supports site media upload, listing, update and deletion with permissions.",
    evidence: ["backend/src/modules/media", "frontend/src/modules/media"]
  },
  {
    id: "seo",
    name: "SEO",
    status: "implemented",
    scope: "page",
    summary: "Page SEO metadata is implemented, with SEO widgets and plugin support.",
    evidence: ["backend/src/models/Seo.ts", "frontend/src/redux/services/pages.api.ts"]
  },
  {
    id: "imports",
    name: "HTML and ZIP import",
    status: "implemented",
    scope: "site",
    summary: "HTML and ZIP website import are implemented for importing existing website structures.",
    evidence: ["backend/src/modules/import", "frontend/src/modules/pageBuilder/runtime/importers/html"]
  },
  {
    id: "figma",
    name: "Figma integration",
    status: "implemented",
    scope: "site",
    summary: "Figma plugin token generation and Figma import bridge are present.",
    evidence: ["backend/src/modules/figmaPlugin", "frontend/src/modules/pageBuilder/pages/figma"]
  },
  {
    id: "plugins",
    name: "Marketplace and plugins",
    status: "implemented",
    scope: "site",
    summary: "Site-scoped plugin marketplace installation, enable, disable and uninstall routes are implemented.",
    evidence: ["backend/src/modules/plugin", "frontend/src/modules/pageBuilder/plugins"]
  },
  {
    id: "static-export",
    name: "Static export",
    status: "implemented",
    scope: "global",
    summary: "Static export endpoints and block export capability analysis are implemented.",
    evidence: ["backend/src/modules/export", "backend/src/modules/sites/export"]
  },
  {
    id: "visitor-auth",
    name: "Visitor authentication",
    status: "implemented",
    scope: "public",
    summary: "Visitor login/register/session APIs and visitor auth page blocks are implemented.",
    evidence: ["backend/src/modules/siteVisitors", "frontend/src/modules/pageBuilder/components/blocks/data/visitorLogin"]
  },
  {
    id: "partner-applications",
    name: "Partner applications",
    status: "implemented",
    scope: "site",
    summary: "Public partner application submission and site-side review pages are implemented.",
    evidence: ["backend/src/modules/partnerApplications", "frontend/src/modules/partnerApplications"]
  },
  {
    id: "dashboard",
    name: "Dashboard",
    status: "implemented",
    scope: "site",
    summary: "Dashboard widgets, activity, analytics and site projections are implemented.",
    evidence: ["backend/src/modules/dashboard", "frontend/src/modules/dashboard"]
  },
  {
    id: "users-admin",
    name: "User administration",
    status: "admin_only",
    scope: "global",
    summary: "Platform ADMIN users can manage users and admin settings.",
    evidence: ["backend/src/modules/users", "backend/src/modules/admin"]
  }
];

export const findCapability = (
  text: string
) => {
  const normalized = text.toLowerCase();

  return PLATFORM_CAPABILITIES.find((capability) =>
    [
      capability.id,
      capability.name,
      capability.summary
    ]
      .join(" ")
      .toLowerCase()
      .includes(normalized)
  );
};
