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
  // 1️⃣ نجبدو الـ source مالـ payload
  const { current, previous, context, changes, source } = payload;

  if (!context || !current || !previous) return;

  // 🛡️ 2️⃣ الـ Guard الجديد: لو العملية موش "update" (يعني restore مثلاً)، نخرجوا فوراً
  if (source !== "update") {
    console.log(`🟡 [VersionPlugin] Skip: Source is "${source}". No snapshot needed.`);
    return;
  }

  // 🎯 3️⃣ الفلتر الذكي (title, content, status)
  const hasMeaningfulChange = 
    changes.includes('title') || 
    changes.includes('content') || 
    changes.includes('status');

  if (!hasMeaningfulChange) {
    console.log("🟡 [VersionPlugin] Skip: Blocks-only update (No version created)");
    return;
  }

  // 📦 4️⃣ صناعة النسخة (فقط للـ Manual Updates)
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