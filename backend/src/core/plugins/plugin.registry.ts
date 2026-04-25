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

 async emit(event: string, payload: any, source?: string) {
    // 1. التثبت من الـ ID (Idempotency Guard)
    const eventId = payload?._meta?.eventId;

    if (!eventId) {
      console.error(`🚨 [Bus] Blocked: Event ${event} from ${source || 'unknown'} missing eventId!`);
      return;
    }

    // 2. توزيع المهام على الـ Plugins
    await this.orchestrate(event, payload);
  }

private async orchestrate(event: string, payload: any) {
    const eventId = payload._meta.eventId;
    
    // نجيبوا الـ Plugins المهتمين بالـ Event هذا
    const activePlugins = Array.from(this.plugins.values())
      .filter(p => p.enabled && p.instance.events.includes(event))
      .sort((a, b) => b.priority - a.priority);

    if (activePlugins.length === 0) return;

    // طباعة سطر واحد فقط في الـ Bus
    console.log(`📡 [Bus] Dispatching: ${event} | ID: ${eventId}`);

    for (const { instance } of activePlugins) {
      const start = Date.now();
      try {
        // تنفيذ الـ Plugin مع Timeout 5 ثواني
        await Promise.race([
          instance.execute(event, payload),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
        ]);
        
        console.log(`[Trace][${eventId.slice(0, 8)}] 🏁 ${instance.name} Done | ${Date.now() - start}ms`);
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