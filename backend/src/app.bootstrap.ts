import { PluginRegistry } from "./core/plugins/plugin.registry";
import { NotificationPlugin } from "./modules/plugin/notification.plugin";
import { SEOPlugin } from "./modules/plugin/seo.plugin";
import { VersionPlugin } from "./modules/plugin/version.plugin";

export const registry = new PluginRegistry();

registry.register(VersionPlugin);
registry.register(SEOPlugin);
registry.register(NotificationPlugin);

registry.init();