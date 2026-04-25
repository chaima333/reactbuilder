// 📂 src/core/plugins/plugin.registry.ts
import { ICmsPlugin } from "./plugin.types";
import { addToQueue } from "../queues/plugin.queue";
import { eventBus } from "./events/eventBus";

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
    // نضمنوا إنو الـ priority المسجلة هي بيدها اللي في الـ instance
    this.plugins.set(plugin.name, { instance: plugin, priority: plugin.priority || priority, enabled });
    console.log(`🔌 [Registry]: ${plugin.name} registered`);
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
    
    await this.orchestrate(event, enrichedPayload);
  }

  private async orchestrate(event: string, payload: any) {
    const activePlugins = Array.from(this.plugins.values())
      .filter(p => p.enabled && p.instance.events.includes(event))
      .sort((a, b) => b.priority - a.priority);

    for (const { instance } of activePlugins) {
      const traceId = payload._meta.eventId.split('-')[0];
      const start = Date.now();

      try {
        console.log(`[Trace][${traceId}] 🟢 Executing: ${instance.name}`);
        
        if (instance.mode === 'sync') {
          await instance.execute(event, payload);
        } else {
          await addToQueue(instance.name, event, payload, { priority: instance.priority });
        }

        const duration = Date.now() - start;
        console.log(`[Trace][${traceId}] 🏁 ${instance.name} Done | ${duration}ms`);

      } catch (err: any) {
        console.error(`💥 [Plugin Error] ${instance.name} failed:`, err.message);
        
        if (instance.isCritical) {
          console.error(`🚨 CRITICAL FAILURE in ${instance.name}. Aborting chain.`);
          throw err; 
        }
      }
    }
  }
  getListeners(): string[] {
    // نرجعو فقط قائمة الأسامي (Keys) متاع الـ Plugins اللي مسجلين عندنا
    return Array.from(this.plugins.keys());
  }
}

export const cmsRegistry = PluginRegistry.getInstance();