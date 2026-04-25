
import { cmsRegistry } from "./core/plugins/plugin.registry";
import { SEOPlugin } from "./modules/plugin/seo.plugin";
import { VersionPlugin } from "./modules/plugin/version.plugin";
import { eventBus } from "./core/plugins/events/eventBus";

// 📂 src/app.bootstrap.ts

export const bootstrapPlugins = () => {
  cmsRegistry.register(VersionPlugin, 100);
  cmsRegistry.register(SEOPlugin, 50);

  cmsRegistry.init({ eventBus });

  console.log("✅ Plugins Active:", cmsRegistry.getListeners());

  // 🛡️ Log إضافي باش تطمن على الـ Events
  const eventMapping = {};
  cmsRegistry.getListeners().forEach(name => {
      const p = cmsRegistry.getPlugin(name);
      eventMapping[name] = p?.events;
  });
  console.log("📡 Event Mapping:", eventMapping);

  return cmsRegistry;
};