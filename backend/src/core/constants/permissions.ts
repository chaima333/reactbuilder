// src/core/constants/permissions.ts

export const PERMISSIONS = {
  // =========================
  // SITE
  // =========================
  SITE_READ: "SITE_READ",
  SITE_CREATE: "SITE_CREATE",
  SITE_UPDATE: "SITE_UPDATE",
  SITE_DELETE: "SITE_DELETE",

  SITE_EDIT: "SITE_UPDATE",

  // =========================
  // DASHBOARD
  // =========================
  DASHBOARD_READ: "DASHBOARD_READ",

  // =========================
  // PAGES
  // =========================
  PAGE_READ: "PAGE_READ",
  PAGE_CREATE: "PAGE_CREATE",
  PAGE_UPDATE: "PAGE_UPDATE",
  PAGE_DELETE: "PAGE_DELETE",
  PAGE_PUBLISH: "PAGE_PUBLISH",
  PAGE_RESTORE: "PAGE_RESTORE",

  // =========================
  // MEDIA
  // =========================
  MEDIA_READ: "MEDIA_READ",
  MEDIA_UPLOAD: "MEDIA_UPLOAD",
  MEDIA_UPDATE: "MEDIA_UPDATE",
  MEDIA_DELETE: "MEDIA_DELETE",

  // =========================
  // PLUGINS
  // =========================
  PLUGIN_READ: "PLUGIN_READ",
  PLUGIN_INSTALL: "PLUGIN_INSTALL",
  PLUGIN_ENABLE: "PLUGIN_ENABLE",
  PLUGIN_DISABLE: "PLUGIN_DISABLE",
  PLUGIN_UNINSTALL: "PLUGIN_UNINSTALL",

  // =========================
  // SITE MEMBERS
  // =========================
  MEMBER_READ: "MEMBER_READ",
  MEMBER_INVITE: "MEMBER_INVITE",
  MEMBER_UPDATE_ROLE: "MEMBER_UPDATE_ROLE",
  MEMBER_REMOVE: "MEMBER_REMOVE",
} as const;

export type Permission =
  typeof PERMISSIONS[keyof typeof PERMISSIONS];

export type PermissionKey =
  keyof typeof PERMISSIONS;