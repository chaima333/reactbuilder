import { eventBus } from "./events/eventBus";
import { ICmsPlugin } from "./plugin.types";
import crypto from 'crypto';
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

 register(plugin: ICmsPlugin, priority = 10, enabled = true) {
  if (this.plugins.has(plugin.name)) return;

  this.plugins.set(plugin.name, { 
    instance: plugin, 
    priority: plugin.priority || priority, 
    enabled 
  });

  plugin.events.forEach(event => {
    eventBus.on(event, (payload) => this.orchestrate(event, payload));
  });

  console.log(`🔌 [Registry]: ${plugin.name} registered and listening.`);
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
  getPlugin(name: string): ICmsPlugin | undefined {
    const entry = this.plugins.get(name);
    
    return entry ? entry.instance : undefined;
  }

  async emit(event: string, payload: any, source: string) {
    const eventId = crypto.randomUUID();
    console.log(`📡 [Bus] Event: ${event} | From: ${source} | ID: ${eventId}`);
    
    const enrichedPayload = { 
      ...payload, 
      _meta: { eventId, source, timestamp: Date.now() } 
    };
    console.log(`📡 [Bus] Dispatching: ${event} | ID: ${eventId}`);
    eventBus.emit(event, enrichedPayload);
  }

private async orchestrate(event: string, payload: any) {
    const eventId = payload._meta.eventId;

    // 1️⃣ [Hard Idempotency Check] 🛡️
    // هوني لازمك تزيد check في الـ DB مستقبلاً، توّة نخلّيوها Cache
    if ((global as any).processedEvents?.has(eventId)) return;

    const activePlugins = Array.from(this.plugins.values())
      .filter(p => p.enabled && p.instance.events.includes(event))
      .sort((a, b) => b.priority - a.priority);

    for (const { instance } of activePlugins) {
      const start = Date.now();
      try {
        // 2️⃣ Execution with Isolation & Timeout
        await this.runWithTimeout(instance.execute(event, payload), 5000);
        console.log(`[Trace][${eventId.slice(0,8)}] 🏁 ${instance.name} Done | ${Date.now() - start}ms`);
      } catch (err: any) {
        console.error(`💥 [Failure][${instance.name}]: ${err.message}`);
        if (instance.isCritical) throw new Error(`CRITICAL_FAILURE: ${instance.name}`);
      }
    }

    // 3️⃣ تذكّر الـ ID باش ما تعاودش
    if (!(global as any).processedEvents) (global as any).processedEvents = new Set();
    (global as any).processedEvents.add(eventId);
  }

private runWithTimeout(promise: Promise<any>, ms: number) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("TIMEOUT")), ms))
  ]);
}
 getListeners(): string[] {
    return eventBus.eventNames() as string[]; 
 }
}
export const cmsRegistry = PluginRegistry.getInstance();