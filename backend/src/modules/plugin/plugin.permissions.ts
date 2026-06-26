import { ICmsPlugin, PluginPermission } from "../../core/plugins/plugin.types";

export function hasPermission(
  plugin: ICmsPlugin,
  permission: PluginPermission
): boolean {
  return (
    plugin.permissions?.includes(permission) ?? false
  );
}

export function requirePermission(
  plugin: ICmsPlugin,
  permission: PluginPermission
) {
  if (!hasPermission(plugin, permission)) {
    throw new Error(
      `Plugin "${plugin.name}" is missing permission "${permission}".`
    );
  }
}