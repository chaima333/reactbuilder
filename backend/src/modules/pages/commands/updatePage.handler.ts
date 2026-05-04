import { Page } from "../../../models/page";
import { EventBus } from "../../../core/plugins/events/eventBus";
import { SEO_RULES, VERSIONING_RULES } from "../domain/rules";

// 🧼 1. Normalization Layer: توحيد الداتا
export const normalizePage = (data: any) => {
  if (!data) return null;
  return {
    id: data.id,
    title: String(data.title || "").trim(),
    slug: String(data.slug || "").trim().toLowerCase(),
    content: String(data.content || "").trim(),
    blocks: JSON.stringify(data.blocks || []),
    status: data.status,
    userId: Number(data.userId || data.user_id),
    siteId: Number(data.siteId || data.site_id),
  };
};

// 🧠 2. Semantic Diff Engine: المقارنة الذكية
const getSemanticChanges = (oldN: any, newN: any): string[] => {
  return Object.keys(newN).filter((key) => {
    // إذا كان التغيير مجرد حروف كبيرة/صغيرة أو فراغات في العناوين، نعتبروه "لا يوجد تغيير"
    if (['title', 'slug'].includes(key)) {
      return oldN[key].toLowerCase() !== newN[key].toLowerCase();
    }
    return oldN[key] !== newN[key];
  });
};

export const updatePageHandler = async (command: any) => {
  const { payload, context: cmdContext } = command;
  
  const page = await Page.findOne({ where: { id: payload.pageId, siteId: cmdContext.siteId } });
  if (!page) throw new Error("Page not found");

  // 1. تصوير الحالات (Normalization)
  const oldN = normalizePage(page.get({ plain: true }));
  await page.update(payload);
  await page.reload();
  const currentN = normalizePage(page.get({ plain: true }));

  // 2. الـ Semantic Diff (The Judge)
  const semanticChanges = getSemanticChanges(oldN, currentN);

  // 🛑 الجدار العازل: إذا "Noise"، أخرج فوراً وما تعيطش للـ EventBus
  if (semanticChanges.length === 0) {
    console.log("🤫 [ARCH-GATE] No meaningful change. Communication halted at Handler level.");
    return { success: true, updated: false, data: page.get({ plain: true }) };
  }

  // 3. تطبيق القواعد (Gating Logic)
  const shouldVersion = VERSIONING_RULES.shouldCreateVersion(semanticChanges, oldN, currentN);
  const shouldSEO = SEO_RULES.shouldUpdateSEO(semanticChanges);

  // 🛑 إذا التغييرات ما تستحق حتى Plugin، زادة ما تبعثش Event (Option A+)
  if (!shouldVersion && !shouldSEO) {
    console.log("🛑 [ARCH-GATE] Change is meaningful but doesn't hit business rules. Suppression active.");
    return { success: true, updated: true, data: page.get({ plain: true }) };
  }

  // 🚀 توّة فقط، الـ EventBus يستحق يخدم
  await EventBus.emit({
    type: "page.updated",
    data: {
      current: page.get({ plain: true }),
      previous: oldN, // نبعثوا النسخة النظيفة للمقارنة السهلة
      changes: semanticChanges,
      flags: { shouldVersion, shouldSEO }
    },
    context: { siteId: cmdContext.siteId, userId: cmdContext.userId, action: "update" }
  });

  return { success: true, updated: true, data: page.get({ plain: true }) };
};