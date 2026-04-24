import { EventEmitter } from "events";
import { Plugin, PluginContext } from "./plugin.interface";
import { PAGE_EVENTS, PageUpdatedSchema } from "./events/pageEvents";

export class PluginRegistry {
  private plugins: Plugin[] = [];
  public eventBus = new EventEmitter();

  register(plugin: Plugin) {
    this.plugins.push(plugin);
  }

  init() {
    const ctx: PluginContext = {
      eventBus: this.eventBus
    };

    // sort by priority (important)
    this.plugins
      .filter(p => p.enabled !== false)
      .sort((a, b) => (b.priority || 0) - (a.priority || 0))
      .forEach(plugin => {
        console.log(`🔌 Loading plugin: ${plugin.name}`);
        plugin.register(ctx);
      });
  }

  emit(event: string, payload: any) {
    this.eventBus.emit(event, payload);
  }

  // src/core/plugins/plugin.registry.ts

// src/core/plugins/plugin.registry.ts

async emitSafe(event: string, payload: any) {
  // 1. Validation Layer (كيما عملناها بـ Zod)
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
    const start = performance.now(); // ⏱️ نقطة البداية

    try {
      await Promise.race([
        listener(payload),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error("PLUGIN_TIMEOUT")), 3000)
        )
      ]);

      const end = performance.now(); // ⏱️ نقطة النهاية
      const duration = (end - start).toFixed(2);
      
      // 📊 Log احترافي للوقت
      console.log(`⏱️ [Performance] ${pluginName} responded in ${duration}ms`);

    } catch (err) {
      const end = performance.now();
      console.error(`💥 [Plugin Failure] ${pluginName} failed after ${(end - start).toFixed(2)}ms:`, err.message);
    }
  }
}
}