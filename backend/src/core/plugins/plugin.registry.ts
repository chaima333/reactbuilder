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

  // ✅ الـ Emit توا ولات تخدم خدمتها الأصلية: تبعث للـ Bus فقط
  // ما عادش تطبع وحدها ولا تعمل في Dispatching يدوي
  async emit(event: string, payload: any, source: string) {
    // نبعثوا الـ Event للـ Bus.. والـ Bus توا يكلم الـ orchestrate
    eventBus.emit(event, payload);
  }

  // 🚀 الـ Orchestrate توا هي الـ Main Engine
  private async orchestrate(event: string, payload: any) {
    const eventId = payload._meta?.eventId || 'unknown';

    // 🎯 نجلبوا الـ Plugins المعنيين بالترتيب
    const activePlugins = Array.from(this.plugins.values())
      .filter(p => p.enabled && p.instance.events.includes(event))
      .sort((a, b) => b.priority - a.priority);

    if (activePlugins.length === 0) return;

    console.log(`📡 [Bus] Dispatching: ${event} | ID: ${eventId}`);

    for (const { instance } of activePlugins) {
      const start = Date.now();
      try {
        // تنفيذ مع Timeout باش ما يبلوكيش السيستام
        await this.runWithTimeout(instance.execute(event, payload), 5000);
        console.log(`[Trace][${eventId.slice(0,8)}] 🏁 ${instance.name} Done | ${Date.now() - start}ms`);
      } catch (err: any) {
        console.error(`💥 [Failure][${instance.name}]: ${err.message}`);
        if (instance.isCritical) throw new Error(`CRITICAL_FAILURE: ${instance.name}`);
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

  getListeners(): string[] {
    return eventBus.eventNames() as string[]; 
  }
}

export const cmsRegistry = PluginRegistry.getInstance();