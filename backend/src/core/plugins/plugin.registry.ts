import { getRequiredPermissionForEvent } from "../../modules/plugin/plugin.permission.map";
import { UnifiedEvent } from "./events/contracts/unified.contract";
import { ICmsPlugin } from "./plugin.types";

export class PluginRegistry {


public getAllPlugins() {
  return Array.from(this.plugins.values())
    .filter(p => p.enabled)
    .map(p => p.instance);
}



  private static instance: PluginRegistry;

  private plugins = new Map<
    string,
    { instance: ICmsPlugin; priority: number; enabled: boolean }
  >();

  static getInstance() {
    if (!this.instance) this.instance = new PluginRegistry();
    return this.instance;
  }

  // ======================
  // REGISTER
  // ======================
  register(plugin: ICmsPlugin, priority = 10, enabled = true) {
    if (this.plugins.has(plugin.name)) return;

    this.plugins.set(plugin.name, {
      instance: plugin,
      priority: plugin.priority ?? priority,
      enabled,
    });

    console.log(`🔌 [Registry] ${plugin.name} registered`);
  }

  // ======================
  // EMIT
  // ======================

  async emit(event: UnifiedEvent) {
    const activePlugins = Array.from(this.plugins.values())
      .filter(p => p.enabled && p.instance.events.includes(event.type))
      .sort((a, b) => b.priority - a.priority);

    const results: any[] = [];

    for (const { instance } of activePlugins) {
      const start = Date.now();

      try {
  const requiredPermission =
    getRequiredPermissionForEvent(event.type);

  if (
    requiredPermission &&
    !instance.permissions?.includes(requiredPermission)
  ) {
    throw new Error(
      `Missing permission "${requiredPermission}" for event "${event.type}"`
    );
  }

  await instance.execute(event);

  results.push({
    plugin: instance.name,
    success: true,
    duration: Date.now() - start
  });
} catch (err: any) {
        console.error(`❌ Plugin [${instance.name}] failed:`, err.message);
        results.push({
          plugin: instance.name,
          success: false,
          error: err.message
        });
      }
    }

    console.log("📊 EVENT SUMMARY:", results);
    return results;
  }
  public getRegisteredPlugins() {
  return Array.from(this.plugins.values()).map(
    ({ instance, priority, enabled }) => ({
      instance,
      name: instance.name,
      mode: instance.mode,
      priority,
      enabled,
      events: instance.events,
      permissions: instance.permissions ?? [],
      marketplace: instance.marketplace,
      meta: instance.meta
    })
  );
}

 public getMarketplacePlugins() {
  return Array.from(this.plugins.values()).map(
    ({ instance, enabled, priority }) => ({
      name: instance.name,
      events: instance.events,
      priority,
      runtimeEnabled: enabled
    })
  );
}

  // ======================
  // DEBUG HELPERS
  // ======================
  public getPlugin(name: string) {
    return this.plugins.get(name)?.instance;
  }

  public getPlugins(): string[] {
    return [...this.plugins.keys()];
  }

  getPluginsForEvent(event: string): string[] {
  return Array.from(this.plugins.values())
    .filter(p => p.enabled && p.instance.events.includes(event))
    .map(p => p.instance.name);
}


}

export const cmsRegistry = PluginRegistry.getInstance();
