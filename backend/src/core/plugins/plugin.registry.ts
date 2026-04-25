// 📂 src/core/plugins/plugin.registry.ts
import { ICmsPlugin } from "./plugin.types";
import { addToQueue } from "../queues/plugin.queue";
import { eventBus } from "./events/eventBus";

export class PluginRegistry {
  private static instance: PluginRegistry;
  private plugins: Map<string, { instance: ICmsPlugin; priority: number; enabled: boolean }> = new Map();

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

  // 🔥 أهم ميثود: تويّة الـ Registry تربط الـ Plugins بالـ Bus بالرسمي
  init(context: any) {
    console.log("🛠️ [Registry]: Wiring Plugins to Central EventBus...");

    // 1️⃣ حوّل الـ Map لـ Array ورتبهم حسب الـ Priority (من الأكبر للأصغر)
    const sortedPlugins = Array.from(this.plugins.values())
      .sort((a, b) => b.priority - a.priority);

    // 2️⃣ نربطوهم بالـ Bus وهوما مترتبين
    sortedPlugins.forEach(({ instance, enabled }) => {
      if (!enabled) return;

      if (typeof instance.register === 'function') {
        instance.register(context);
      }

      instance.events.forEach(eventName => {
        eventBus.on(eventName, async (payload) => {
          // 3️⃣ نزيدو Trace ID بسيط (بما إنك مازلت ما استعملتش UUID)
          const traceId = Math.random().toString(36).substring(7);
          console.log(`[Trace][${traceId}] Running ${instance.name} on ${eventName}`);
          
          await this.dispatch(instance, eventName, payload);
        });
      });
    });

    console.log("✅ [Registry]: Reactive Wiring Complete.");
  }

  // 🧠 الـ Execution Engine: هو المسؤول عن الـ Sync والـ Async
  private async dispatch(instance: ICmsPlugin, event: string, payload: any) {
    try {
      if (instance.mode === 'sync') {
        // 🔥 تنفيذ مباشر (Blocking)
        await instance.execute(event, payload);
      } else {
        // 🚀 دفع للـ Queue (Non-blocking)
        const priority = this.plugins.get(instance.name)?.priority || 10;
        await addToQueue(instance.name, event, payload, { priority });
      }
    } catch (err: any) {
      console.error(`💥 [Engine Error] ${instance.name} on ${event}:`, err.message);
    }
  }

  // الـ emit توّة تولي "عفوية" عبر الـ Bus
  async emit(event: string, payload: any) {
    console.log(`📡 [Bus]: Emitting ${event}`);
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