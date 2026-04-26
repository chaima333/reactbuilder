import { PageEventPayload } from "../../core/plugins/events/types";
import { ICmsPlugin } from "../../core/plugins/plugin.types";
import { PageVersionRepository } from "../pages/repositories/pageVersion.repository";

export const VersionPlugin: ICmsPlugin = {
  name: "version-plugin",
  mode: "sync",
  priority: 100,
  isCritical: true,
  events: ["page.updated", "page.restored"],
  enabled: true,

  async execute(event, payload) {
    const { current, previous, context, changes } = payload;

    if (!context || !current || !previous) return;
    
    // 🎯 الفلتر الذكي: نثبّتوا في التغييرات "المهمة" فقط
    const hasMeaningfulChange = 
      changes.includes('title') || 
      changes.includes('content') || 
      changes.includes('status');

    if (!hasMeaningfulChange) {
      console.log("🟡 [VersionPlugin] Skip: Blocks-only update (No version created)");
      return;
    }

    // 📦 إذا التغيير مستاهل، نصنعوا الـ Version
    await PageVersionRepository.create({
      pageId: current.id,
      siteId: context.siteId,
      versionNumber: Date.now(),
      title: current.title,
      content: current.content,
      blocks: current.blocks,
      status: current.status,
      createdBy: context.userId
    });

    console.log(`✅ [VersionPlugin] Version created for Page ${current.id} (Triggered by: ${changes.join(', ')})`);
  }
};