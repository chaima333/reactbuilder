import { PluginRegistry } from "./core/plugins/plugin.registry";
import { VersionPlugin } from "./modules/plugin/version.plugin";

export const registry = new PluginRegistry();

registry.register(VersionPlugin);

registry.init();