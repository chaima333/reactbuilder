import { ICmsPlugin } from "./plugin.types";
import { addToQueue } from "../queues/plugin.queue";
import { eventBus } from "./events/eventBus";

class PluginRegistry {
  // تخزين الـ instance والـ metadata (الـ priority والـ enabled)
  private plugins: Map<string, { instance: ICmsPlugin; priority: number; enabled: boolean }> = new Map();

  register(plugin: ICmsPlugin, priority = 10, enabled = true) {
    if (this.plugins.has(plugin.name)) return;
    
    this.plugins.set(plugin.name, { 
      instance: plugin, 
      priority, 
      enabled 
    });
    console.log(`🔌 [Registry]: ${plugin.name} registered (Priority: ${priority})`);
  }

  // 🎯 ميثود الـ init لتمرير الـ context لجميع الـ plugins
  init(context: any) {
    console.log("🛠️ [Registry]: Initializing plugins context...");
    this.plugins.forEach(p => {
      if (typeof p.instance.register === 'function') {
        p.instance.register(context);
      }
    });
  }

  // ✅ الـ Bridge بين الـ Service والـ Engine
  async emit(event: string, payload: any) {
    await this.dispatch(event, payload);
  }

  // 🧠 الـ Execution Engine: هو المسؤول عن توزيع المهام

async dispatch(event: string, payload: any) {
  const activePlugins = Array.from(this.plugins.values())
    .filter(p => p.enabled && p.instance.events.includes(event))
    .sort((a, b) => b.priority - a.priority);

  for (const entry of activePlugins) {
    const { instance, priority } = entry;
    
    if (typeof instance.execute !== 'function') continue;

    try {
      // 🎯 الفرز حسب الـ Mode موش حسب الاسم
      if (instance.mode === 'sync') {
        await instance.execute(event, payload);
      } else {
        await addToQueue(instance.name, event, payload, { priority });
      }
    } catch (err: any) {
      console.error(`💥 [Engine Error] ${instance.name}:`, err.message);
      if (instance.mode === 'sync') throw err; 
    }
  }
}

  // 🛠️ ميثود الـ getPlugin يحتاجها الـ Background Worker لجلب الـ Logic
  getPlugin(name: string) {
    return this.plugins.get(name)?.instance;
  }
}

export const cmsRegistry = new PluginRegistry();