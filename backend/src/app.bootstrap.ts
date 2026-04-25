import { cmsRegistry } from "./core/plugins/plugin.registry";
import { SEOPlugin } from "./modules/plugin/seo.plugin";
import { VersionPlugin } from "./modules/plugin/version.plugin";

export const bootstrapPlugins = () => {
  cmsRegistry.register(VersionPlugin, 100);
  cmsRegistry.register(SEOPlugin, 50);

  // ❌ remove init completely

console.log("✅ Plugins Active:", cmsRegistry.getPlugins());

  const plugins = ["version-plugin", "seo-plugin"];

  const eventMapping: Record<string, string[]> = {};

  for (const name of plugins) {
    const p = cmsRegistry.getPlugin(name);
    if (p) {
      eventMapping[name] = p.events;
    }
  }

  console.log("📡 Event Mapping:", eventMapping);

  return cmsRegistry;
};