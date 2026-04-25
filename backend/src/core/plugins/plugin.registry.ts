import { eventBus } from "./events/eventBus";
import { ICmsPlugin } from "./plugin.types";

export class PluginRegistry {
  private static instance: PluginRegistry;
  private plugins: Map<string, { instance: ICmsPlugin; priority: number; enabled: boolean }> = new Map();
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): PluginRegistry {
    if (!PluginRegistry.instance) {
      PluginRegistry.instance = new PluginRegistry();
    }
    return PluginRegistry.instance;
  }

  // ✅ تسجيل الـ Plugin وربطه بالـ Bus
  register(plugin: ICmsPlugin, priority = 10, enabled = true) {
    if (this.plugins.has(plugin.name)) return;

    this.plugins.set(plugin.name, { 
      instance: plugin, 
      priority: plugin.priority || priority, 
      enabled 
    });

    // 🔗 نربطوا الـ Event بالـ Orchestrate اللي هي "المحرك"
    plugin.events.forEach(event => {
      eventBus.on(event, (payload) => this.orchestrate(event, payload));
    });

    console.log(`🔌 [Registry]: ${plugin.name} registered.`);
  }

  // src/core/plugins/plugin.registry.ts

async emit(event: string, payload: any) {
  // 1️⃣ تأكد إن الـ Payload فيه الـ Meta صحيحة قبل ما تبعث
  if (!payload._meta || !payload._meta.eventId) {
    console.error("🚨 [Bus] Attempted to emit event without eventId!", event);
    return;
  }

  // 2️⃣ ابعث للـ Bus العادي
  eventBus.emit(event, payload);
}

private async orchestrate(event: string, payload: any) {
  const eventId = payload._meta?.eventId || 'no-id';

  // ⚠️ إذا الـ ID موش موجود، أوقف العملية فوراً (هذا اللي منع الـ unknown)
  if (eventId === 'no-id') return;

  // 3️⃣ توّة نجيبوا الـ Plugins
  const activePlugins = Array.from(this.plugins.values())
    .filter(p => p.enabled && p.instance.events.includes(event))
    .sort((a, b) => b.priority - a.priority);

  if (activePlugins.length === 0) return;

  // السطر هذا يطبع مرة وحدة بركة توّة
  console.log(`📡 [Bus] Dispatching: ${event} | ID: ${eventId}`);

  for (const { instance } of activePlugins) {
    const start = Date.now();
    try {
      await this.runWithTimeout(instance.execute(event, payload), 5000);
      console.log(`[Trace][${eventId.slice(0,8)}] 🏁 ${instance.name} Done | ${Date.now() - start}ms`);
    } catch (err: any) {
      console.error(`💥 [Failure][${instance.name}]: ${err.message}`);
      if (instance.isCritical) throw err;
    }
  }
}

  private runWithTimeout(promise: Promise<any>, ms: number) {
    return Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error("TIMEOUT")), ms))
    ]);
  }

  // ✅ الـ Method اللي كانت ناقصة الـ Dispatcher
  public getPluginsForEvent(event: string) {
    return Array.from(this.plugins.values())
      .filter(p => p.enabled && p.instance.events.includes(event))
      .map(p => p.instance);
  }

  init(context: any) {
    if (this.isInitialized) return;
    console.log("🛠️ [Registry]: Initializing Plugins Context...");
    this.plugins.forEach(({ instance, enabled }) => {
      if (enabled && typeof instance.register === 'function') {
        instance.register(context);
      }
    });
    this.isInitialized = true;
  }
  public getPlugin(name: string): ICmsPlugin | undefined {
    const entry = this.plugins.get(name);
    return entry ? entry.instance : undefined;
}

  getListeners(): string[] {
    return eventBus.eventNames() as string[]; 
  }
}

export const cmsRegistry = PluginRegistry.getInstance();