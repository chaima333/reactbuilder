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

  // 🎯 ميثود الـ init اللي كان الـ bootstrap يلوّج عليها
  init(context: any) {
    console.log("🛠️ [Registry]: Initializing plugins context...");
    this.plugins.forEach(p => {
      if (p.instance.register) {
        p.instance.register(context);
      }
    });
  }

  // ✅ ميثود الـ emit باش الـ PageService يسكت
  async emit(event: string, payload: any) {
    await this.dispatch(event, payload);
  }

  // 🧠 الـ Execution Engine اللي يحترم الـ Priority والـ Sync/Async
  async dispatch(event: string, payload: any) {
    const activePlugins = Array.from(this.plugins.values())
      .filter(p => p.enabled && p.instance.events.includes(event))
      .sort((a, b) => b.priority - a.priority);

    console.log(`🚀 [Engine]: Dispatching ${event} to ${activePlugins.length} plugins`);

    for (const entry of activePlugins) {
      const { instance, priority } = entry;
      try {
        if (instance.name.includes('version')) {
          console.log(`📜 [Sync Execution]: ${instance.name}`);
          await instance.execute(event, payload);
        } else {
          console.log(`📦 [Offloading]: ${instance.name} to Queue (Priority: ${priority})`);
          // نبعثو الـ Priority للـ BullMQ
          await addToQueue(instance.name, event, payload, { priority });
        }
      } catch (err: any) {
        if (instance.name.includes('version')) throw err;
        console.error(`⚠️ [Engine Error] ${instance.name}:`, err.message);
      }
    }

    // نخليوا الـ EventBus القديم يخدم لو فمة شكون يسمع لبرّة
    eventBus.emit(event, payload);
  }

  // 🛠️ ميثود الـ getPlugin اللي يحتاجها الـ Worker
  getPlugin(name: string) {
    return this.plugins.get(name)?.instance;
  }
}

export const cmsRegistry = new PluginRegistry();