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
      priority: plugin.priority ?? priority,
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

  const results: any[] = []; // 👈 الجديد

  for (const { instance } of activePlugins) {
    const start = Date.now();

    try {
      await instance.execute(event, payload);

      results.push({
        plugin: instance.name,
        success: true,
        duration: Date.now() - start
      });

    } catch (err: any) {
      results.push({
        plugin: instance.name,
        success: false,
        error: err.message
      });
    }
  }

  // 👇 أهم حاجة
  console.log("📊 EVENT SUMMARY:", results);
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

  public getPluginsForEvent(event: string): string[] {
    return Array.from(this.plugins.values())
      .filter(p => p.instance.events.includes(event))
      .map(p => p.instance.name);
  }
}

export const cmsRegistry = PluginRegistry.getInstance();