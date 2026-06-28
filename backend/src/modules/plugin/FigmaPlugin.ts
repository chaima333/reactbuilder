import { ICmsPlugin } from "../../core/plugins/plugin.types";

export const FigmaPlugin: ICmsPlugin = {
  name: "figma-plugin",
  mode: "async",
  priority: 20,
  isCritical: false,
  events: [],
  enabled: true,

  permissions: [
    "dashboard.read"
  ],

  async onInstall(siteId: number) {
    console.log(`📦 Figma Plugin installed for site ${siteId}`);
  },

  async onEnable(siteId: number) {
    console.log(`✅ Figma Plugin enabled for site ${siteId}`);
  },

  async onDisable(siteId: number) {
    console.log(`⛔ Figma Plugin disabled for site ${siteId}`);
  },

  async onUninstall(siteId: number) {
    console.log(`🗑️ Figma Plugin removed for site ${siteId}`);
  },

  async execute() {
    // Figma import is triggered manually from the UI.
  }
};