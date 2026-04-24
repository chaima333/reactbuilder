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
    try {
      if (plugin.execute) {
        // نبعثو للـ Queue ونكملو طول، ما نستناوش!
        addToQueue(plugin.name, event, payload).catch(err => 
          console.error(`❌ Queue Error [${plugin.name}]:`, err)
        );
      }
    } catch (err) {
      console.error(`💥 Registry Error:`, err);
    }
  }

  // الـ Sync الوحيد اللي يبقى (للمهمات المستعجلة كيف الـ Versioning)
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