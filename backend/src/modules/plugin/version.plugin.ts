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

    // 🛡️ Guard 1: المصدر لازم يكون الـ Handler اليدوي
    if (context.source !== "page.handler") {
      console.log("🛡️ [VersionPlugin] Ignored: Source is auto/internal");
      return;
    }

    // 🛡️ Guard 2: منع الـ Loops (العمق)
    if ((context.depth || 0) > 1) {
      console.log("🚫 [VersionPlugin] Loop blocked!");
      return;
    }

    const { current, previous } = data;
    if (!current || !previous) return;

    // 🧼 Normalize strictly for Hashing
    const clean = (p: any) => ({
      title: (p.title || "").trim(),
      content: (p.content || "").trim(),
      slug: (p.slug || "").trim(),
      // نركزو كان على الـ Data متاع الـ Blocks ونحيو أي Metadata زايدة
      blocksData: JSON.stringify((p.blocks || []).map((b: any) => b.data || b))
    });

    const curr = clean(current);
    const prev = clean(previous);

    // 🧐 هل فمة تغيير حقيقي في المحتوى؟
    const hasChange = 
      curr.title !== prev.title || 
      curr.content !== prev.content || 
      curr.slug !== prev.slug || 
      curr.blocksData !== prev.blocksData;

    if (!hasChange) {
      console.log("ℹ️ [VersionPlugin] No meaningful changes detected.");
      return;
    }

    // 🆔 صنع بصمة فريدة للمحتوى (Version Tag)
    const versionTag = createHash("sha256")
      .update(`${current.id}-${curr.title}-${curr.content}-${curr.slug}-${curr.blocksData}`)
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
      console.log(`✅ [VersionPlugin] New version saved: ${versionTag.slice(0, 8)}`);
    } catch (err: any) {
      if (err.name === "SequelizeUniqueConstraintError") {
        console.log("🟡 [VersionPlugin] Duplicate content ignored.");
        return;
      }
      throw err;
    }
  }
};