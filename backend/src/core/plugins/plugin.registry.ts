import { EventEmitter } from "events";
import { Plugin, PluginContext } from "./plugin.interface";
import { PAGE_EVENTS, PageUpdatedSchema } from "./events/pageEvents";
// 🔥 لازم تزيد الـ import هذا باش الـ registry ينجم يبعث للـ Redis
import { addToQueue } from "../queues/plugin.queue";

export class PluginRegistry {
  private plugins: Plugin[] = [];
  public eventBus = new EventEmitter();

  register(plugin: Plugin) {
    this.plugins.push(plugin);
  }

  // 🔥 ميثود باش الـ Worker يلقى الـ Plugin بالاسم
  getPlugin(name: string): Plugin | undefined {
    return this.plugins.find((p) => p.name === name);
  }

  init() {
    const ctx: PluginContext = { eventBus: this.eventBus };

    this.plugins
      .filter((p) => p.enabled !== false)
      .sort((a, b) => (b.priority || 0) - (a.priority || 0))
      .forEach((plugin) => {
        console.log(`🔌 Loading plugin: ${plugin.name}`);
        plugin.register(ctx);
      });
  }

  emit(event: string, payload: any) {
    this.eventBus.emit(event, payload);
  }

  // 🔥 الميثود السحرية اللي باش تبعث الخدمة للـ Redis (BullMQ)
  async emitToQueue(event: string, payload: any) {
    const listeners = this.eventBus.listeners(event);
    
    for (const listener of listeners) {
      const pluginName = (listener as any).pluginName;
      if (pluginName) {
        console.log(`📦 [Queue] Scheduling background task for: ${pluginName}`);
        await addToQueue(pluginName, event, payload);
      }
    }
  }

  async emitSafe(event: string, payload: any) {
    // 1. Validation Layer
    if (event === PAGE_EVENTS.UPDATED) {
      const result = PageUpdatedSchema.safeParse(payload);
      if (!result.success) {
        console.error(`❌ [Validation Error] Invalid payload for ${event}:`, result.error.format());
        return;
      }
      payload = result.data;
    }

    const listeners = this.eventBus.listeners(event);

    for (const listener of listeners) {
      const pluginName = (listener as any).pluginName || "unknown-plugin";
      const start = performance.now();

      try {
        await Promise.race([
          listener(payload),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("PLUGIN_TIMEOUT")), 3000)
          ),
        ]);

        const end = performance.now();
        const duration = (end - start).toFixed(2);
        console.log(`⏱️ [Performance] ${pluginName} responded in ${duration}ms`);
      } catch (err: any) {
        const end = performance.now();
        console.error(
          `💥 [Plugin Failure] ${pluginName} failed after ${(end - start).toFixed(2)}ms:`,
          err.message
        );
      }
    }
  }

  emitAsync(event: string, payload: any) {
    const listeners = this.eventBus.listeners(event);

    for (const listener of listeners) {
      setImmediate(async () => {
        const pluginName = (listener as any).pluginName || "unknown-plugin";
        const start = performance.now();

        try {
          await Promise.race([
            listener(payload),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("TIMEOUT")), 5000)
            ),
          ]);
          const duration = (performance.now() - start).toFixed(2);
          console.log(`⚡ [Async Plugin] ${pluginName} finished in ${duration}ms (Background)`);
        } catch (err: any) {
          console.error(`❌ [Async Plugin Failure] ${pluginName}:`, err.message);
        }
      });
    }
  }
}

// ✅ تصدير الـ Instance الموحدة
export const cmsRegistry = new PluginRegistry();