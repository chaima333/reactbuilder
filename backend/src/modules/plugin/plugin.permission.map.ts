import { PluginPermission } from "../../core/plugins/plugin.types";

export const EVENT_PERMISSION_MAP: Record<string, PluginPermission> = {
  "page.created": "pages.read",
  "page.updated": "pages.read",
  "page.published": "pages.read",
  "page.restored": "pages.read",

  "media.uploaded": "media.read",

  "site.updated": "dashboard.read"
};

export const getRequiredPermissionForEvent = (
  eventType: string
): PluginPermission | null => {
  return EVENT_PERMISSION_MAP[eventType] || null;
};