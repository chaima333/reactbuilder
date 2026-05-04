import { ICmsPlugin } from "../../core/plugins/plugin.types";
import { PageVersionRepository } from "../pages/repositories/pageVersion.repository";
import { UnifiedEvent } from "../../core/plugins/events/contracts/unified.contract.ts"; // استورد النوع الموحد

export const VersionPlugin: ICmsPlugin = {
  name: "version-plugin",
  mode: "sync",
  priority: 100,
  isCritical: true,
  events: ["page.updated", "page.restored"],
  enabled: true,

  async execute(event: UnifiedEvent) {
    const { data, context, id } = event;
    const { current, flags } = data;

    console.log(`📦 [VersionPlugin] Processing event: ${id}`);

    if (!flags?.shouldVersion) {
      console.log(`🟡 [VersionPlugin] Skip: no versioning needed`);
      return;
    }

    try {
      await PageVersionRepository.create({
        pageId: current.id,
        siteId: context.siteId,

        // 🔥 مهم: version identity لازم يكون منطقي مش event id
        versionNumber: `${current.id}-${Date.now()}`,

        title: current.title,
        content: current.content,
        blocks: current.blocks,
        createdBy: context.userId
      });

      console.log(`✅ [VersionPlugin] Version created for Page ${current.id}`);

    } catch (error) {
      console.error(`❌ [VersionPlugin] Failed:`, error);
      throw error;
    }
  }
};