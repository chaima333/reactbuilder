
import { cmsRegistry } from "./core/plugins/plugin.registry";
import { SEOPlugin } from "./modules/plugin/seo.plugin";
import { VersionPlugin } from "./modules/plugin/version.plugin";
import { eventBus } from "./core/plugins/events/eventBus";

export const bootstrapPlugins = () => {
  // 1. تسجيل الـ Plugins
  cmsRegistry.register(VersionPlugin, 100);
  cmsRegistry.register(SEOPlugin, 50);

  // 2. تفعيل الـ Context
  cmsRegistry.init({ eventBus });

  console.log("✅ Plugins Active:", cmsRegistry.getListeners());
  return cmsRegistry;
};