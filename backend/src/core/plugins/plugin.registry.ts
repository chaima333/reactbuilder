// 📂 src/modules/plugin/plugin.registry.ts
import { ICmsPlugin } from "./plugin.types";
import { addToQueue } from "../queues/plugin.queue";
import { eventBus } from "./events/eventBus";

class PluginRegistry {
  // تخزين الـ Plugins مع الـ Metadata متاعهم
  private plugins: Map<string, ICmsPlugin & { enabled: boolean; priority: number }> = new Map();

  register(plugin: ICmsPlugin, options = { enabled: true, priority: 10 }) {
    if (this.plugins.has(plugin.name)) return;
    
    this.plugins.set(plugin.name, { 
      ...plugin, 
      enabled: options.enabled, 
      priority: options.priority 
    });
    console.log(`🔌 [Registry]: ${plugin.name} registered (Priority: ${options.priority})`);
  }

  // 🛡️ الميثود اللي كانت ناقصة
  getPlugin(name: string) {
    return this.plugins.get(name);
  }

  togglePlugin(name: string, status: boolean) {
    const plugin = this.plugins.get(name);
    if (plugin) plugin.enabled = status;
  }

  async emit(event: string, payload: any) {
    const activePlugins = Array.from(this.plugins.values())
      .filter(p => p.enabled && p.events.includes(event))
      .sort((a, b) => b.priority - a.priority);

    for (const plugin of activePlugins) {
      if (plugin.execute) {
        // نبعثو للـ Queue ونكملو طول
        await addToQueue(plugin.name, event, payload);
      }
    }
    // الـ Sync event (Versioning)
    eventBus.emit(event, payload);
  }

  init(context: any) {
    this.plugins.forEach(p => p.register(context));
  }
}

export const cmsRegistry = new PluginRegistry();