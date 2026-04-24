import { cmsRegistry } from "./core/plugins/plugin.registry";
import { SEOPlugin } from "./modules/plugin/seo.plugin";
import { VersionPlugin } from "./modules/plugin/version.plugin";
import { NotificationPlugin } from "./modules/plugin/notification.plugin";

export const bootstrapPlugins = () => {
  // 1. تسجيل الـ Plugins في الـ Registry
  cmsRegistry.register(VersionPlugin);
  cmsRegistry.register(SEOPlugin);
  cmsRegistry.register(NotificationPlugin);

  // 2. تشغيل الـ Init (ربط الـ EventBus)
  cmsRegistry.init();

  console.log("✅ Plugins bootstrapped successfully");
  return cmsRegistry;
};

// نخرجوا الـ instance باش السيرفر ينجم يستعملها
export const registry = cmsRegistry;