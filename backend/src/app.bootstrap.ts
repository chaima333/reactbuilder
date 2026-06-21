import { cmsRegistry } from "./core/plugins/plugin.registry";
import { SEOPlugin } from "./modules/plugin/seo.plugin";
import { VersionPlugin } from "./modules/plugin/version.plugin";
import { MediaPlugin } from "./modules/plugin/media.plugin";
import { NotificationPlugin } from "./modules/plugin/notification.plugin";
import { AiHistoryPlugin } from "./modules/plugin/aiHistory.plugin";

let initialized = false;


export const bootstrapPlugins = () => {
  
  if (initialized) return cmsRegistry;
  initialized = true;

  cmsRegistry.register(VersionPlugin, 100);
  cmsRegistry.register(SEOPlugin, 50);
  cmsRegistry.register(NotificationPlugin, 30);
  cmsRegistry.register(AiHistoryPlugin, 25);
  cmsRegistry.register(MediaPlugin, 20);


  console.log("✅ Plugins registered:", cmsRegistry.getPlugins());

console.log("✅ [Bootstrap] Plugins Active:", cmsRegistry.getPlugins());
  return cmsRegistry;

};

