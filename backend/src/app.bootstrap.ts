import { cmsRegistry } from "./core/plugins/plugin.registry";
import { SEOPlugin } from "./modules/plugin/seo.plugin";
import { VersionPlugin } from "./modules/plugin/version.plugin";
import { NotificationPlugin } from "./modules/plugin/notification.plugin";

import { eventBus } from "./core/plugins/events/eventBus"; // ثبت في الـ path

// 📂 src/bootstrap.ts

export const bootstrapPlugins = () => {
  // 1. الـ Versioning هو الأساس (Priority 100) - يخدم Sync
  cmsRegistry.register(VersionPlugin, 100);

  // 2. الـ SEO مهم أما ينجم يستنى (Priority 50) - يخدم Async
  cmsRegistry.register(SEOPlugin, 50);

  // 3. الـ Notification آخر حاجة (Priority 10) - يخدم Async
  cmsRegistry.register(NotificationPlugin, 10);

  // نعديو الـ context (إلي فيه الـ eventBus)
  cmsRegistry.init({ eventBus }); 

  console.log("✅ [Bootstrap]: Plugins registered with Semantic Priorities");
  
  return cmsRegistry;
};

export const registry = cmsRegistry;
