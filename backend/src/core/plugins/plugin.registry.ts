// 📂 src/plugins/plugin.registry.ts
import { ICmsPlugin } from "./plugin.types";
import { addToQueue } from "../queues/plugin.queue";
import { eventBus } from "./events/eventBus";

class PluginRegistry {
  // ✅ استعملنا Map عوض Array لمنع التكرار
  private plugins: Map<string, ICmsPlugin> = new Map();

  register(plugin: ICmsPlugin) {
    // 🛡️ حماية ضد الـ Double Registration
    if (this.plugins.has(plugin.name)) {
      // console.warn(`⚠️ Plugin [${plugin.name}] already registered.`);
      return;
    }
    this.plugins.set(plugin.name, plugin);
  }

  async emit(event: string, payload: any) {
    // تحويل الـ Map لـ Array باش نفركسو فيه
    const pluginsArray = Array.from(this.plugins.values());
    const interestedPlugins = pluginsArray.filter(p => p.events.includes(event));

    for (const plugin of interestedPlugins) {
      try {
        if (plugin.execute) {
          // نبعثو للـ Queue ونكملو طول
          addToQueue(plugin.name, event, payload).catch(err => 
            console.error(`❌ Queue Error [${plugin.name}]:`, err)
          );
        }
      } catch (err) {
        console.error(`💥 Registry Error:`, err);
      }
    }

    // الـ Sync للـ Versioning وغيرو
    eventBus.emit(event, payload);
  }

  init(context: any) {
    this.plugins.forEach(p => p.register(context));
  }

  getPlugin(name: string) {
    return this.plugins.get(name); // Map lookup أسرع من find
  }
}

export const cmsRegistry = new PluginRegistry();