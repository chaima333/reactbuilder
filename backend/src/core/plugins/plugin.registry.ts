import { ICmsPlugin } from "./plugin.types";

type PluginEntry = {
  instance: ICmsPlugin;
  priority: number;
  enabled: boolean;
};

export class PluginRegistry {
  private static instance: PluginRegistry;

  private plugins: Map<string, PluginEntry> = new Map();

  private initialized = false;

  // 🛡️ anti-duplicate execution guard
  private static processedEvents: Set<string> = new Set();

  private constructor() {}

  public static getInstance(): PluginRegistry {
    if (!PluginRegistry.instance) {
      PluginRegistry.instance = new PluginRegistry();
    }
    return PluginRegistry.instance;
  }

  // =========================
  // REGISTER PLUGIN
  // =========================
  register(plugin: ICmsPlugin, priority = 10, enabled = true) {
    if (this.plugins.has(plugin.name)) return;

    this.plugins.set(plugin.name, {
      instance: plugin,
      priority: plugin.priority ?? priority,
      enabled,
    });

    console.log(`🔌 [Registry] registered: ${plugin.name}`);
  }

  // =========================
  // EMIT EVENT
  // =========================
  async emit(event: string, payload: any, source?: string) {
    const eventId = payload?._meta?.eventId;

    if (!eventId) {
      console.error(`🚨 Missing eventId | event: ${event}`);
      return;
    }

    console.log(`📡 [Dispatcher] ${event} | ${eventId}`);

    await this.orchestrate(event, payload);
  }

  // =========================
  // CORE ENGINE
  // =========================
  private async orchestrate(event: string, payload: any) {
    const eventId = payload?._meta?.eventId;

    // 🛡️ idempotency guard (prevents double execution)
    if (PluginRegistry.processedEvents.has(eventId)) {
      console.warn(`⚠️ Duplicate event blocked: ${eventId}`);
      return;
    }

    PluginRegistry.processedEvents.add(eventId);

    setTimeout(() => {
      PluginRegistry.processedEvents.delete(eventId);
    }, 60_000);

    const activePlugins = Array.from(this.plugins.values())
      .filter((p) => p.enabled && p.instance.events.includes(event))
      .sort((a, b) => b.priority - a.priority);

    if (activePlugins.length === 0) {
      console.warn(`⚠️ No plugins for event: ${event}`);
      return;
    }

    console.log(`📡 [Bus] Dispatching: ${event} | ID: ${eventId}`);

    // 🚀 PARALLEL execution (important upgrade)
    await Promise.all(
      activePlugins.map(async ({ instance }) => {
        const start = Date.now();

        try {
          await this.runWithTimeout(
            instance.execute(event, payload),
            5000
          );

          console.log(
            `[Trace][${eventId.slice(0, 8)}] ${instance.name} ✔ ${Date.now() - start}ms`
          );
        } catch (err: any) {
          console.error(
            `💥 [${instance.name}] failed: ${err.message}`
          );

          if (instance.isCritical) throw err;
        }
      })
    );
  }

  // =========================
  // TIMEOUT WRAPPER
  // =========================
  private runWithTimeout(promise: Promise<any>, ms: number) {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("TIMEOUT")), ms)
      ),
    ]);
  }

  // =========================
  // INIT SYSTEM
  // =========================
  init(context?: any) {
    if (this.initialized) return;

    console.log("🛠️ [Registry] initializing plugins...");

    for (const { instance, enabled } of this.plugins.values()) {
      if (enabled && typeof instance.register === "function") {
        instance.register(context);
      }
    }

    this.initialized = true;
  }

  // =========================
  // DEBUG HELPERS
  // =========================

  public getPlugin(name: string): ICmsPlugin | undefined {
    return this.plugins.get(name)?.instance;
  }

  public getListeners(): string[] {
    return Array.from(this.plugins.values())
      .filter((p) => p.enabled)
      .flatMap((p) => p.instance.events);
  }

  public getActivePlugins(): string[] {
    return Array.from(this.plugins.values())
      .filter((p) => p.enabled)
      .map((p) => p.instance.name);
  }
}

export const cmsRegistry = PluginRegistry.getInstance();