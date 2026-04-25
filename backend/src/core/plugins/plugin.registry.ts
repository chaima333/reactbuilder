// 📂 src/core/plugins/plugin.registry.ts
import { ICmsPlugin } from "./plugin.types";
import { addToQueue } from "../queues/plugin.queue";
import { eventBus } from "./events/eventBus";

export class PluginRegistry {
  private static instance: PluginRegistry;
  private plugins: Map<string, { instance: ICmsPlugin; priority: number; enabled: boolean }> = new Map();
  private isInitialized = false; // 🛡️ Guard لمنع التكرار

  private constructor() {}

  public static getInstance(): PluginRegistry {
    if (!PluginRegistry.instance) {
      PluginRegistry.instance = new PluginRegistry();
    }
    return PluginRegistry.instance;
  }

  register(plugin: ICmsPlugin, priority = 10, enabled = true) {
    if (this.plugins.has(plugin.name)) return;
    this.plugins.set(plugin.name, { instance: plugin, priority, enabled });
    console.log(`🔌 [Registry]: ${plugin.name} registered`);
  }

  init(context: any) {
    // 1️⃣ من غير تكرار: لو الـ Registry تخدمت مرة، نخرجو
    if (this.isInitialized) {
      console.log("⚠️ [Registry]: Already wired. Skipping duplicate initialization.");
      return;
    }

    console.log("🛠️ [Registry]: Wiring Plugins to Central EventBus...");
    
    // 2️⃣ تنظيف الـ Bus قبل الربط (Safety first)
    eventBus.removeAllListeners();

    const sortedPlugins = Array.from(this.plugins.values())
      .sort((a, b) => b.priority - a.priority);

    sortedPlugins.forEach(({ instance, enabled }) => {
      if (!enabled) return;

      if (typeof instance.register === 'function') {
        instance.register(context);
      }

      instance.events.forEach(eventName => {
        eventBus.on(eventName, async (payload) => {
          const traceId = Math.random().toString(36).substring(7);
          const start = Date.now(); // ⏱️ توقيت البداية
          
          console.log(`[Trace][${traceId}] 🟢 Start: ${instance.name} on ${eventName}`);
          
          await this.dispatch(instance, eventName, payload);
          
          const duration = Date.now() - start; // ⏱️ المدة المستغرقة
          console.log(`[Trace][${traceId}] 🏁 End: ${instance.name} | ${duration}ms | Success`);
        });
      });
    });

    this.isInitialized = true; // 🏁 تم الربط بنجاح
    console.log("✅ [Registry]: Reactive Wiring Complete.");
  }

  private async dispatch(instance: ICmsPlugin, event: string, payload: any) {
    try {
      if (instance.mode === 'sync') {
        await instance.execute(event, payload);
      } else {
        const priority = this.plugins.get(instance.name)?.priority || 10;
        await addToQueue(instance.name, event, payload, { priority });
      }
    } catch (err: any) {
      console.error(`💥 [Engine Error] ${instance.name}:`, err.message);
    }
  }

  async emit(event: string, payload: any) {
    console.log(`📡 [Bus]: Emit ${event} | Origin: Registry`);
    eventBus.emit(event, payload);
  }

  getPlugin(name: string) {
    return this.plugins.get(name)?.instance;
  }

  getListeners() {
    return Array.from(this.plugins.keys());
  }
}

export const cmsRegistry = PluginRegistry.getInstance();