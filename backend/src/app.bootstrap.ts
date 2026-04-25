import { cmsRegistry } from "./core/plugins/plugin.registry";
import { SEOPlugin } from "./modules/plugin/seo.plugin";
import { VersionPlugin } from "./modules/plugin/version.plugin";
import { NotificationPlugin } from "./modules/plugin/notification.plugin";

import { eventBus } from "./core/plugins/events/eventBus"; // ثبت في الـ path

export const bootstrapPlugins = () => {
  cmsRegistry.register(VersionPlugin, 100);
  cmsRegistry.register(SEOPlugin, 50);
  cmsRegistry.register(NotificationPlugin, 10);

  // نعديو الـ eventBus كـ context للـ plugins
  cmsRegistry.init({ eventBus }); 

  console.log("✅ Plugins bootstrapped successfully");
  return cmsRegistry;
};
// نخرجوا الـ instance باش السيرفر ينجم يستعملها
export const registry = cmsRegistry;