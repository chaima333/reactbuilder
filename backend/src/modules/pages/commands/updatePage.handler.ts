// modules/pages/commands/updatePage.handler.ts
import { Page } from "../../../models/page";
import { EventBus, detectChanges } from "../../../core/plugins/events/eventBus";
import { SEO_RULES, VERSIONING_RULES } from "../domain/rules";


const sanitizeForContract = (raw: any) => {
  if (!raw) return null;
  return {
    id: raw.id,
    title: raw.title,
    slug: raw.slug,
    content: raw.content,
    blocks: raw.blocks || [],
    status: raw.status,
    userId: raw.userId || raw.user_id, 
    siteId: raw.siteId || raw.site_id, 
    metaData: raw.metaData || raw.meta_data || {}
  };
};

export const updatePageHandler = async (command: any) => {
  const { payload, context } = command;
  
  // 1. البحث عن الصفحة
  const page = await Page.findOne({ 
    where: { id: payload.pageId, siteId: context.siteId } 
  });
  
  if (!page) throw new Error("Page not found");

  const oldData = sanitizeForContract(JSON.parse(JSON.stringify(page.get({ plain: true }))));

  await page.update({ 
    title: payload.title, 
    content: payload.content, 
    blocks: payload.blocks 
  });
  
  await page.reload();
  
  const currentData = sanitizeForContract(page.get({ plain: true }));
  
  const changes = detectChanges(oldData, currentData);

  if (changes.length === 0) {
    return { success: true, updated: false, data: currentData };
  }

  console.log("🔥 ACTUAL CLEAN DATA BEFORE BUS:", JSON.stringify({
    changes,
    userId: currentData?.userId,
    siteId: currentData?.siteId
  }, null, 2));


// 🎯 توّة القرار يخرج من الـ Rules Engine موش من الـ Handler
const shouldVersion = VERSIONING_RULES.shouldCreateVersion(changes);
const shouldSEO = SEO_RULES.shouldUpdateSEO(changes);

await EventBus.emit({
  type: "page.updated",
  data: {
    current: currentData,
    previous: oldData,
    changes: changes,
    flags: {
      shouldVersion, // توّة تولي True خاطر الـ Title موجود في الـ Required Fields
      shouldSEO
    }
  },
  context: {
    userId: currentData.userId,
    siteId: currentData.siteId,
    action: "update"
  }
});

  return { 
    success: true, 
    updated: true, 
    pageId: payload.pageId, 
    data: currentData 
  };
};