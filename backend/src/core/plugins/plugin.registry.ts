// 📂 src/plugins/plugin.registry.ts
import { ICmsPlugin } from "./plugin.types";
import { addToQueue } from "../queues/plugin.queue";
import { eventBus } from "./events/eventBus"; // 👈 ثبت في الـ path

class PluginRegistry {
  [x: string]: any;
  private plugins: ICmsPlugin[] = [];

  register(plugin: ICmsPlugin) {
    this.plugins.push(plugin);
  }

  async emit(event: string, payload: any) {
    const interestedPlugins = this.plugins.filter(p => p.events.includes(event));

    for (const plugin of interestedPlugins) {
      // 1. المهمة الخلفية (Async)
      if (plugin.execute) {
        console.log(`🚀 Offloading ${plugin.name} to Redis...`);
        await addToQueue(plugin.name, event, payload); 
      }
    }

    // 2. 🔥 السطر السحري: تفيق الـ Plugins اللي يخدموا Sync (عن طريق الـ handle)
    // الـ Plugins اللي عملوا eventBus.on في ميثود الـ register متاعهم باش يفيقوا توّة
    eventBus.emit(event, payload);
  }

  init(context: any) {
    this.plugins.forEach(p => p.register(context));
  }

  getPlugin(name: string) {
    return this.plugins.find(p => p.name === name);
  }
}

export const cmsRegistry = new PluginRegistry();