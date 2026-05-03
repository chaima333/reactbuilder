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
    // 1️⃣ استخراج البيانات من العقد الموحد مباشرة
    const { data, context, id } = event;
    const { current, previous, changes } = data;

    console.log(`📦 [VersionPlugin] Processing event: ${id}`);

    if (!context || !current || !previous) return;

    // 🛡️ 2️⃣ الـ Guard: التثبت من الـ action (عوض source)
    if (context.action !== "update") {
      console.log(`🟡 [VersionPlugin] Skip: Action is "${context.action}". No snapshot needed.`);
      return;
    }

    // 🎯 3️⃣ الفلتر الذكي
    const hasMeaningfulChange = 
      changes.includes('title') || 
      changes.includes('content') || 
      changes.includes('status');

    if (!hasMeaningfulChange) {
      console.log("🟡 [VersionPlugin] Skip: Blocks-only update");
      return;
    }

    // 📦 4️⃣ صناعة النسخة
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

    console.log(`✅ [VersionPlugin] Version created for Page ${current.id}`);
  }
};