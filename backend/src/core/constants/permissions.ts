// src/core/constants/permissions.ts

export const PERMISSIONS = {
  // Site Permissions
  SITE_READ: "SITE_READ",
  SITE_CREATE: "SITE_CREATE", 
  SITE_UPDATE: "SITE_UPDATE", 
  SITE_EDIT: "SITE_UPDATE",  
  SITE_DELETE: "SITE_DELETE",

  // Page Permissions
  PAGE_CREATE: "PAGE_CREATE",
  PAGE_UPDATE: "PAGE_UPDATE",
  PAGE_DELETE: "PAGE_DELETE",
  PAGE_READ: "PAGE_READ"
} as const;

export type PermissionType = keyof typeof PERMISSIONS;