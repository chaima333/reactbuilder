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

    if (!["page.handler", "event.bus"].includes(context.source)) return;
    if ((context.depth || 0) > 1) return;

    const { current, previous } = data;
    if (!current || !previous) return;

    const getSnapshot = (p: any) => ({
      title: (p.title || "").trim(),
      content: (p.content || "").trim(),
      slug: (p.slug || "").trim(),
      blocksBody: JSON.stringify((p.blocks || []).map((b: any) => b.data || b))
    });

    const curr = getSnapshot(current);
    const prev = getSnapshot(previous);

    // 1. تثبت هل فمة تغيير حقيقي؟
    if (curr.title === prev.title && 
        curr.content === prev.content && 
        curr.slug === prev.slug && 
        curr.blocksBody === prev.blocksBody) {
      return;
    }

    const versionTag = createHash("sha256")
      .update(`${current.id}-${curr.title}-${curr.content}-${curr.slug}-${curr.blocksBody}`)
      .digest("hex");

    try {
      // 2. ✅ ديما Create (ممنوع الـ Update والـ Merge)
      // الـ Unique Index في الداتابيز هو اللي باش يتصرف لو فمة تكرار
      await PageVersion.create({
        pageId: current.id,
        siteId: context.siteId,
        versionTag,
        title: current.title,
        content: current.content,
        blocks: current.blocks,
        createdBy: context.userId
      });
      
      console.log(`📜 [VERSION CREATED] Tag: ${versionTag.slice(0, 8)}`);

    } catch (err: any) {
      // 3. لو الـ Database رجعت UniqueConstraintError معناها المحتوى موجود ديجا
      if (err.name === "SequelizeUniqueConstraintError") {
        console.log("🟡 [VERSION] State already exists (Deduplicated by Database).");
        return;
      }
      throw err;
    }
  }
};