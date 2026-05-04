import { UnifiedEvent } from "../../core/plugins/events/contracts/unified.contract.ts";
import { ICmsPlugin } from "../../core/plugins/plugin.types";
import { PageVersion } from "../../models/pageVersion";
import { createHash } from "crypto";

// الوقت المسموح به لتحديث النسخة الحالية بدل إنشاء واحدة جديدة (دقيقة واحدة)
const RECENT_WINDOW = 60 * 1000;

export const VersionPlugin: ICmsPlugin = {
  name: "version-plugin",
  mode: "sync",
  priority: 100,
  isCritical: true,
  events: ["page.updated"],
  enabled: true,

  async execute(event: UnifiedEvent) {
    const { data, context } = event;

    // 🛡️ Guard 1: المصادر المسموح بها (Handler اليدوي أو الـ Bus الموثوق)
    const allowedSources = ["page.handler", "event.bus"];
    if (!allowedSources.includes(context.source)) {
      console.log(`🛡️ [VersionPlugin] Ignored! Source was: [${context.source}]`);
      return;
    }

    // 🛡️ Guard 2: منع التكرار اللانهائي (Infinite Loops)
    if ((context.depth || 0) > 1) {
      console.log(`🚫 [VersionPlugin] Loop killed! Depth: ${context.depth}`);
      return;
    }

    const { current, previous } = data;
    if (!current || !previous) return;

    // 🧼 دالة لتنظيف البيانات قبل المقارنة أو التشفير
    const getSnapshot = (p: any) => ({
      title: (p.title || "").trim(),
      content: (p.content || "").trim(),
      slug: (p.slug || "").trim(),
      blocksBody: JSON.stringify((p.blocks || []).map((b: any) => b.data || b))
    });

    const curr = getSnapshot(current);
    const prev = getSnapshot(previous);

    // 🧐 1. هل المحتوى تغير فعلياً عن النسخة السابقة مباشرة؟
    if (curr.title === prev.title && 
        curr.content === prev.content && 
        curr.slug === prev.slug && 
        curr.blocksBody === prev.blocksBody) {
      console.log("🟡 [VersionPlugin] No real content changes.");
      return;
    }

    // 🆔 توليد بصمة فريدة (Hash) للمحتوى الجديد
    const versionTag = createHash("sha256")
      .update(`${current.id}-${curr.title}-${curr.content}-${curr.slug}-${curr.blocksBody}`)
      .digest("hex");

    try {
      // 🧠 2. البحث عن آخر نسخة مسجلة لهذه الصفحة
      const lastVersion = await PageVersion.findOne({
        where: { pageId: current.id },
        order: [['createdAt', 'DESC']]
      });

      const now = Date.now();
      
      // 🚀 3. منطق التحديث الذكي (Smart Update):
      // إذا وجدت نسخة في أقل من دقيقة، قم بتحديثها بدل إنشاء واحدة جديدة
      if (lastVersion && (now - new Date(lastVersion.createdAt).getTime() < RECENT_WINDOW)) {
        await lastVersion.update({
          versionTag,
          title: current.title,
          content: current.content,
          blocks: current.blocks,
          createdBy: context.userId // تحديث صاحب التعديل الأخير
        });
        console.log(`🔄 [VERSION UPDATED] Content merged into recent version. Tag: ${versionTag.slice(0, 8)}`);
        return;
      }

      // 4. إنشاء نسخة جديدة كلياً إذا مر وقت طويل
      await PageVersion.create({
        pageId: current.id,
        siteId: context.siteId,
        versionTag,
        title: current.title,
        content: current.content,
        blocks: current.blocks,
        createdBy: context.userId
      });
      
      console.log(`✅ [VERSION CREATED] New entry saved. Tag: ${versionTag.slice(0, 8)}`);

    } catch (err: any) {
      if (err.name === "SequelizeUniqueConstraintError") {
        console.log("🟡 [VERSION] Duplicate content (Hash collision) ignored.");
        return;
      }
      console.error("❌ [VERSION ERROR]:", err.message);
      throw err;
    }
  }
};