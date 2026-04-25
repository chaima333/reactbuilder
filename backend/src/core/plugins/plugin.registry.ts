import { ICmsPlugin } from "./plugin.types";
import { addToQueue } from "../queues/plugin.queue";
import { eventBus } from "./events/eventBus";

class PluginRegistry {
  // زدنا 'enabled' باش تنجم تطفي وتشعل Plugins
  private plugins: Map<string, ICmsPlugin & { priority: number; enabled: boolean }> = new Map();

  register(plugin: ICmsPlugin, priority = 10, enabled = true) {
    this.plugins.set(plugin.name, { ...plugin, priority, enabled });
    console.log(`🔌 [Registry]: ${plugin.name} registered (Priority: ${priority})`);
  }

  // 🎯 التصليح: زدنا الميثود هذي باش الـ PageService يخدم بلا Error
  async emit(event: string, payload: any) {
    await this.dispatch(event, payload);
  }

  // 🧠 الـ Execution Engine

async dispatch(event: string, payload: any) {
  const activePlugins = Array.from(this.plugins.values())
    .filter(p => p.enabled && p.events.includes(event))
    .sort((a, b) => b.priority - a.priority);

  for (const plugin of activePlugins) {
    try {
      // 🛡️ Isolation Layer: كل Plugin في Try-Catch وحدو
      if (plugin.name.includes('version')) {
        await plugin.execute(event, payload);
      } else {
        // 🚀 نبعثو الـ Priority للـ Queue (BullMQ يحترمها)
        await addToQueue(plugin.name, event, payload, { 
          priority: plugin.priority 
        });
      }
    } catch (err) {
      // 💥 الـ Versioning هو الوحيد اللي يوقف الـ Request (Critical)
      if (plugin.name.includes('version')) throw err;
      
      // البقية نكتفيو بالـ Log باش ما نوقفوش الـ Flow
      console.error(`⚠️ [Engine]: Plugin ${plugin.name} failed to dispatch:`, err.message);
    }
  }
}

  // 🛠️ ميثودات مساعدة يحتاجها الـ Worker والـ Bootstrap
  getPlugin(name: string) {
    return this.plugins.get(name);
  }

  init(context: any) {
    this.plugins.forEach(p => p.register && p.register(context));
  }
}

export const cmsRegistry = new PluginRegistry();