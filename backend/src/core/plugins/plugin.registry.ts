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

async emitSafe(event: string, payload: any) {
  // 1. Validation Layer
  if (event === PAGE_EVENTS.UPDATED) {
    const result = PageUpdatedSchema.safeParse(payload);
    if (!result.success) {
      console.error(`❌ [Validation Error] Invalid payload for ${event}:`, result.error.format());
      return; // نوقفوا قبل ما نعديو البيانات الغالطة للـ Plugins
    }
    payload = result.data; // البيانات توّة نظيفة ومضمونة
  }

  // 2. Safe Execution with Priority
  const listeners = this.eventBus.listeners(event);
  
  for (const listener of listeners) {
    try {
      // 3. Plugin Timeout (Race)
      await Promise.race([
        listener(payload),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error("PLUGIN_TIMEOUT")), 3000)
        )
      ]);
    } catch (err) {
      console.error(`💥 [Plugin Failure] on ${event}:`, err.message);
      // هوني تنجم تزيد "Monitoring" بسيط: سجل الـ failure في DB أو Log file
    }
  }
}
}