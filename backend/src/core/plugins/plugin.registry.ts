import { ICmsPlugin } from "./plugin.types";

export class PluginRegistry {
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
      priority: plugin.priority || priority,
      enabled,
    });

    console.log(`🔌 [Registry] ${plugin.name} registered`);
  }

  // ======================
  // EMIT
  // ======================
  async emit(event: string, payload: any, source?: string) {
    const eventId = payload?._meta?.eventId;

    if (!eventId) {
      console.error(`🚨 Missing eventId for ${event}`);
      return;
    }

    console.log(`📡 [Dispatcher] ${event} | ${eventId} | ${source ?? "unknown"}`);

    const activePlugins = Array.from(this.plugins.values())
      .filter(p => p.enabled && p.instance.events.includes(event))
      .sort((a, b) => b.priority - a.priority);

    for (const { instance } of activePlugins) {
      await instance.execute(event, payload);
    }
  }

  // ======================
  // GET SINGLE PLUGIN
  // ======================
  public getPlugin(name: string): ICmsPlugin | undefined {
    return this.plugins.get(name)?.instance;
  }

  // ======================
  // ALL PLUGINS (DEBUG)
  // ======================
  public getPlugins(): string[] {
    return Array.from(this.plugins.values()).map(p => p.instance.name);
  }

  // ======================
  // PLUGINS FOR EVENT (FIXED NAME)
  // ======================
  public getPluginsForEvent(event: string): string[] {
    return Array.from(this.plugins.values())
      .filter(p => p.instance.events.includes(event))
      .map(p => p.instance.name);
  }
}

export const cmsRegistry = PluginRegistry.getInstance();