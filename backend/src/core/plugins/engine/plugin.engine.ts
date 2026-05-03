/*mport { cmsRegistry } from "../plugin.registry";

export class PluginEngine {

  static resolve(event: string) {
    return cmsRegistry.getAllPlugins()
      .filter(p => p.enabled && p.events.includes(event))
      .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  }

}*/