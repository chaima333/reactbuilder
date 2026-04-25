// 📂 src/core/plugins/plugin.registry.ts

import { ICmsPlugin } from "./plugin.types";
import { addToQueue } from "../queues/plugin.queue";

export class PluginRegistry {
  private static instance: PluginRegistry;
  private plugins: Map<string, { instance: ICmsPlugin; priority: number; enabled: boolean }> = new Map();

  // Constructor Private باش نمنعو الـ new لبرا
  private constructor() {}

  public static getInstance(): PluginRegistry {
    if (!PluginRegistry.instance) {
      PluginRegistry.instance = new PluginRegistry();
    }
    return PluginRegistry.instance;
  }

  register(plugin: ICmsPlugin, priority = 10, enabled = true) {
    if (this.plugins.has(plugin.name)) return;
    this.plugins.set(plugin.name, { instance: plugin, priority, enabled });
    console.log(`🔌 [Registry]: ${plugin.name} registered`);
  }

  init(context: any) {
    this.plugins.forEach(p => {
      if (typeof p.instance.register === 'function') p.instance.register(context);
    });
  }

  async emit(event: string, payload: any) {
    const activePlugins = Array.from(this.plugins.values())
      .filter(p => p.enabled && p.instance.events.includes(event))
      .sort((a, b) => b.priority - a.priority);

    for (const entry of activePlugins) {
      const { instance, priority } = entry;
      try {
        if (instance.mode === 'sync') {
          await instance.execute(event, payload);
        } else {
          await addToQueue(instance.name, event, payload, { priority });
        }
      } catch (err: any) {
        console.error(`💥 [Engine Error] ${instance.name}:`, err.message);
      }
    }
  }
getPlugin(name: string) {
    return this.plugins.get(name)?.instance;
  }
  getListeners() {
    return Array.from(this.plugins.keys());
  }
}

// 🎯 نخرجو النسخة الوحيدة
export const cmsRegistry = PluginRegistry.getInstance();