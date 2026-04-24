import { EventEmitter } from "events";
import { Plugin, PluginContext } from "./plugin.interface";

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
}