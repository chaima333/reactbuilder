import { UnifiedEvent } from "../../core/plugins/events/contracts/unified.contract.ts";
import { ICmsPlugin } from "../../core/plugins/plugin.types";
import { PageVersion } from "../../models/pageVersion";
import { createHash } from "crypto";

export const VersionPlugin: ICmsPlugin = {
  name: "version-plugin",
  mode: "sync",
  priority: 100,
  isCritical: true,
  events: ["page.updated"],
  enabled: true,

  async execute(event: UnifiedEvent) {
    const { data, context } = event;

    // 🛡️ Guard 1: المصدر لازم يكون الـ Handler حصراً
      // في VersionPlugin.ts
if (context.source !== "page.handler") {
  console.log(`🛡️ [VersionPlugin] Ignored! Source was: [${context.source}] | Depth: ${context.depth}`);
  return;
}
    // 🛡️ Guard 2: منع الـ Loops (العمق)
    if ((context.depth || 0) > 1) {
      console.log("🚫 [VersionPlugin] Loop killed!");
      return;
    }

    const { current, previous } = data;
    if (!current || !previous) return;

    // 🧼 Normalize strictly for Hashing (المهم هو الـ Data فقط)
    const getSnapshot = (p: any) => ({
      title: (p.title || "").trim(),
      content: (p.content || "").trim(),
      slug: (p.slug || "").trim(),
      blocksBody: JSON.stringify((p.blocks || []).map((b: any) => b.data || b))
    });

    const curr = getSnapshot(current);
    const prev = getSnapshot(previous);

    // 🧐 تثبت: هل تغير المحتوى فعلاً؟
    if (curr.title === prev.title && 
        curr.content === prev.content && 
        curr.slug === prev.slug && 
        curr.blocksBody === prev.blocksBody) {
      return;
    }

    // 🆔 صنع بصمة المحتوى الفريدة
    const versionTag = createHash("sha256")
      .update(`${current.id}-${curr.title}-${curr.content}-${curr.slug}-${curr.blocksBody}`)
      .digest("hex");

    try {
      await PageVersion.create({
        pageId: current.id,
        siteId: context.siteId,
        versionTag,
        title: current.title,
        content: current.content,
        blocks: current.blocks,
        createdBy: context.userId
      });
      console.log(`✅ [VERSION SAVED] Tag: ${versionTag.slice(0, 8)}`);
    } catch (err: any) {
      if (err.name === "SequelizeUniqueConstraintError") {
        console.log("🟡 [VERSION] Duplicate content ignored.");
        return;
      }
      throw err;
    }
  }
};