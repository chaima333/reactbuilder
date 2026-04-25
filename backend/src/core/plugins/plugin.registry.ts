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

  register(plugin: ICmsPlugin, priority = 10, enabled = true) {
    if (this.plugins.has(plugin.name)) return;

    this.plugins.set(plugin.name, {
      instance: plugin,
      priority: plugin.priority || priority,
      enabled,
    });

    console.log(`🔌 [Registry] ${plugin.name} registered`);
  }

  async emit(event: string, payload: any) {
    const eventId = payload?._meta?.eventId;

    if (!eventId) {
      console.error("🚨 Missing eventId");
      return;
    }

    const active = Array.from(this.plugins.values())
      .filter(p => p.enabled && p.instance.events.includes(event))
      .sort((a, b) => b.priority - a.priority);

    console.log(`📡 [Bus] ${event} | ${eventId}`);

    for (const { instance } of active) {
      await instance.execute(event, payload);
    }
  }
}

export const cmsRegistry = PluginRegistry.getInstance();