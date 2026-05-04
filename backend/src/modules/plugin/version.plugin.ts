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
  const { current, flags, changes } = data;

  console.log(`📦 [VersionPlugin] Processing event: ${id}`);

  if (!flags?.shouldVersion) {
    console.log(`🟡 [VersionPlugin] Skip: Handler decided NO versioning needed.`);
    return;
  }

  try {
    // 🛡️ Anti-duplication
    const exists = await PageVersionRepository.findOne({
      where: { versionNumber: id }
    });

    if (exists) {
      console.log(`🟡 [VersionPlugin] Skip: Already versioned event ${id}`);
      return;
    }

    await PageVersionRepository.create({
      pageId: current.id,
      siteId: context.siteId,
      versionTag: id,
      title: current.title,
      content: current.content,
      blocks: current.blocks,
      status: current.status,
      createdBy: context.userId,

      // 🔥 audit power
      changes,
      traceId: context.traceId
    });

    console.log(`✅ [VersionPlugin] Version created for Page ${current.id}`);

  } catch (error) {
    console.error(`❌ [VersionPlugin] Failed:`, error);
    throw error;
  }
}
};