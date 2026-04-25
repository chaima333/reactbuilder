import { ICmsPlugin } from "./plugin.types";

export class PluginRegistry {
  private static instance: PluginRegistry;

  private plugins: Map<
    string,
    { instance: ICmsPlugin; priority: number; enabled: boolean }
  > = new Map();

  private isInitialized = false;

  private constructor() {}

  public static getInstance(): PluginRegistry {
    if (!PluginRegistry.instance) {
      PluginRegistry.instance = new PluginRegistry();
    }
    return PluginRegistry.instance;
  }

  // ✅ Register plugin فقط (no bus)
  register(plugin: ICmsPlugin, priority = 10, enabled = true) {
    if (this.plugins.has(plugin.name)) return;

    this.plugins.set(plugin.name, {
      instance: plugin,
      priority: plugin.priority || priority,
      enabled,
    });

    console.log(`🔌 [Registry]: ${plugin.name} registered.`);
  }

  // ✅ Dispatcher entrypoint
  async emit(event: string, payload: any, source?: string) {
    const eventId = payload?._meta?.eventId;

    if (!eventId) {
      console.error(`🚨 Missing eventId for ${event}`);
      return;
    }

    console.log(`📡 [Dispatcher] ${event} | ${eventId}`);

    await this.orchestrate(event, payload);
  }

  // ✅ Core execution engine
  private async orchestrate(event: string, payload: any) {
    const eventId = payload._meta.eventId;

    const activePlugins = Array.from(this.plugins.values())
      .filter(
        (p) => p.enabled && p.instance.events.includes(event)
      )
      .sort((a, b) => b.priority - a.priority);

    if (activePlugins.length === 0) {
      console.warn(`⚠️ No plugins for ${event}`);
      return;
    }

    console.log(`📡 [Bus] Dispatching: ${event} | ID: ${eventId}`);

    for (const { instance } of activePlugins) {
      const start = Date.now();

      try {
        await this.runWithTimeout(
          instance.execute(event, payload),
          5000
        );

        console.log(
          `[Trace][${eventId.slice(0, 8)}] 🏁 ${instance.name} Done | ${
            Date.now() - start
          }ms`
        );
      } catch (err: any) {
        console.error(
          `💥 [Failure][${instance.name}]: ${err.message}`
        );

        if (instance.isCritical) throw err;
      }
    }
  }

  private runWithTimeout(promise: Promise<any>, ms: number) {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("TIMEOUT")), ms)
      ),
    ]);
  }

  init(context: any) {
    if (this.isInitialized) return;

    console.log("🛠️ [Registry]: Initializing Plugins Context...");

    this.plugins.forEach(({ instance, enabled }) => {
      if (enabled && typeof instance.register === "function") {
        instance.register(context);
      }
    });

    this.isInitialized = true;
  }

  public getPlugin(name: string): ICmsPlugin | undefined {
    return this.plugins.get(name)?.instance;
  }
  public getListeners(): string[] {
  return Array.from(this.plugins.values())
    .flatMap(p => p.instance.events);
}
}

export const cmsRegistry = PluginRegistry.getInstance();