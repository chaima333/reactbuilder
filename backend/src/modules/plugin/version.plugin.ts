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
    const { current, flags } = data; // 👈 استخراج الـ flags الجاهزة

    console.log(`📦 [VersionPlugin] Processing event: ${id}`);

    // 1️⃣ الـ Guard الوحيد: هل الـ Handler قالي اخدم؟
    // ما عادش نثبتوا في الـ changes ولا الـ action هنا. القرار تاشخ ديجا.
    if (!flags?.shouldVersion) {
      console.log(`🟡 [VersionPlugin] Skip: Handler decided NO versioning needed for this change.`);
      return;
    }

    try {
      // 2️⃣ تنفيذ المهمة (Muscles only)
      await PageVersionRepository.create({
        pageId: current.id,
        siteId: context.siteId,
        versionNumber: Date.now(), // أو الـ timestamp متاع الـ event لضمان التطابق
        title: current.title,
        content: current.content,
        blocks: current.blocks,
        status: current.status,
        createdBy: context.userId
      });

      console.log(`✅ [VersionPlugin] Version created for Page ${current.id} | Event: ${id}`);
    } catch (error) {
      console.error(`❌ [VersionPlugin] Failed to create version:`, error);
      // بما أن isCritical: true، الـ Worker باش يعاود (Retry) حسب الـ Policy
      throw error; 
    }
  }
};