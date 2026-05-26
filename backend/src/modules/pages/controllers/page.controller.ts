import { Response } from "express";
import { AuthRequest } from "../../../shared/auth.util";
import { PageService } from "../services/page.service";
import { PageVersionService } from "../services/pageVersion.service";
import { PageMapper } from "../mappers/page.mapper";
import { EventDispatcher } from "../../../core/plugins/event.dispatcher";


export const handleEventDispatch = async (result: any, source: string) => {
  const eventPayload = result?.event;

  if (!eventPayload?.shouldEmit) return;

  const envelope = {
    type: eventPayload.type,
    data: eventPayload.data || eventPayload.payload, // دعم التسميتين مؤقتاً
    context: eventPayload.context || {},
    meta: eventPayload.meta || {
      eventId: crypto.randomUUID(),
      timestamp: Date.now()
    }
  };
await EventDispatcher.dispatch(
  envelope.type, // 1. اسم الحدث (مثلاً "page.updated") -> هذا هو الـ String المطلوب
  envelope,      // 2. المحتوى كامل (الـ Object)
  source         // 3. المصدر (مثلاً "page.controller")
);
};

// ========================
// 🟢 CREATE PAGE
// ========================
export const createPage = async (req: AuthRequest, res: Response) => {
  try {
    const result = await PageService.createPage(
      req.siteContext.siteId,
      req.user.id,
      req.body
    );
    await handleEventDispatch(result, "PageController.createPage");
    return res.status(201).json({ success: true, data: PageMapper.toDTO(result.data) });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ========================
// 🟢 GET PAGES
// ========================
export const getPages = async (req: AuthRequest, res: Response) => {
  try {
    const pages = await PageService.getPages(req.siteContext.siteId);
    return res.json({ success: true, data: PageMapper.toListDTO(pages) });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ========================
// 🟢 UPDATE PAGE
// ========================

// 🔒 مخزن مؤقت لحفظ الطلبات اللي قاعدة تتخدم توّة
const activeRequests = new Set<string>();

export const updatePage = async (req: AuthRequest, res: Response) => {
  // 🔑 نصنعوا مفتاح فريد يعتمد على الـ Site والـ Page
  const lockKey = `${req.siteContext.siteId}:${req.params.pageId}`;

  try {
    // 🛑 1. إذا الطلب هذا ديجا قاعد يتخدم، نرفضوا الطلب الجديد
    if (activeRequests.has(lockKey)) {
      console.log(`🛑 [CONTROLLER] Duplicate request blocked for Key: ${lockKey}`);
      return res.status(429).json({ 
        success: false, 
        message: "Action already in progress. Please wait." 
      });
    }

    // 🛡️ 2. نسجلوا الطلب كـ "نشط"
    activeRequests.add(lockKey);

    // 🏃 3. نعيطوا للـ Service بالخدمة متاعنا
    const result = await PageService.updatePage(
      Number(req.siteContext.siteId),
      Number(req.params.pageId),
      req.user.id,
      req.body
    );

    return res.json({
      success: true,
      data: PageMapper.toDTO(result.data)
    });

  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  } finally {
    // 🔓 4. أهم خطوة: ديما نحيوا الـ Lock في الـ finally (سواء نجحت العملية أو فشلت)
    // نزيدوا Delay صغير (مثلاً 500ms) باش نضمنوا إنو الـ Frontend ركح
    setTimeout(() => {
      activeRequests.delete(lockKey);
    }, 500);
  }
};
// ========================
// 🟢 DELETE PAGE
// ========================
export const deletePage = async (req: AuthRequest, res: Response) => {
  try {
    const result = await PageService.deletePage(
      req.siteContext.siteId,
      Number(req.params.pageId)
    );
    await handleEventDispatch(result, "PageController.deletePage");
    return res.json({ success: true, message: "Page deleted" });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ========================
// 🟢 PUBLISH PAGE
// ========================
export const publishPageController = async (req: AuthRequest, res: Response) => {
  try {
    const result = await PageService.publishPage(
      req.siteContext.siteId,
      Number(req.params.pageId),
      req.siteContext.role,
      req.user.id
    );
    await handleEventDispatch(result, "PageController.publishPage");
    return res.json({ success: true, data: PageMapper.toDTO(result.data) });
  } catch (err: any) {
    const status = err.message === "FORBIDDEN" ? 403 : err.message === "INVALID_TRANSITION" ? 400 : 500;
    return res.status(status).json({ success: false, message: err.message });
  }
};

// ========================
// 🟢 RESTORE VERSION
// ========================
export const restorePageVersion = async (req: AuthRequest, res: Response) => {
  try {
    const result = await PageService.restoreVersion(
      Number(req.siteContext.siteId),
      Number(req.params.pageId),
      Number(req.params.versionId),
      req.user.id
    );

    // ✅ نداء واحد بركة للـ Dispatcher النظيف متاعنا
    await handleEventDispatch(result, "PageController.restorePageVersion");

    return res.json({ success: true, data: PageMapper.toDTO(result.data) });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ========================
// 🟢 HISTORY
// ========================
export const getPageHistory = async (req: AuthRequest, res: Response) => {
  try {
    const history = await PageVersionService.getPageHistory(
      Number(req.params.pageId),
      req.siteContext.siteId
    );
    return res.json({ success: true, data: history });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ========================
// 🟢 GET SINGLE PAGE (For Editor)
// ========================
export const getPageById = async (req: AuthRequest, res: Response) => {
  try {
    const { pageId } = req.params;
    const siteId = req.siteContext.siteId;

    // نعيطوا للـ Service باش يجيب الصفحة
    const page = await PageService.getPageById(Number(pageId), siteId);

    if (!page) {
      return res.status(404).json({ 
        success: false, 
        message: "Page not found in this site" 
      });
    }

    return res.json({ 
      success: true, 
      data: PageMapper.toDTO(page) 
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};