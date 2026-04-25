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
    const pluginsArray = Array.from(this.plugins.values())
      .filter(p => p.enabled && p.events.includes(event))
      .sort((a, b) => b.priority - a.priority); // ترتيب من الأهم للأقل أهمية

    console.log(`🚀 [Engine]: Dispatching ${event} to ${pluginsArray.length} plugins`);

    for (const plugin of pluginsArray) {
      // 1. المهمات الحرجة (Core) تخدم Sync
      if (plugin.name.includes('version')) {
        try {
          console.log(`📜 [Sync Execution]: ${plugin.name}`);
          if (plugin.execute) await plugin.execute(event, payload); 
        } catch (err) {
          console.error(`❌ Critical Plugin Failed: ${plugin.name}`, err);
          throw err; // يوقف الـ Request باش نضمنوا الـ Data Integrity
        }
      } 
      // 2. المهمات الثانوية تمشي للـ Queue
      else {
        console.log(`📦 [Offloading]: ${plugin.name} to Queue`);
        // ما نستعملوش await هوني باش ما نعطلوش الـ User
        addToQueue(plugin.name, event, payload).catch(err => 
          console.error(`❌ Queue Error [${plugin.name}]:`, err)
        );
      }
    }

    // نخليوا الـ EventBus للمهمات القديمة أو الـ Internal Monitoring
    eventBus.emit(event, payload);
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