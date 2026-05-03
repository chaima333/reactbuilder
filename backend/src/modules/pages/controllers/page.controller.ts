import { Response } from "express";
import { AuthRequest } from "../../../shared/auth.util";
import { PageService } from "../services/page.service";
import { PageVersionService } from "../services/pageVersion.service";
import { PageMapper } from "../mappers/page.mapper";
import { EventDispatcher } from "../../../core/plugins/event.dispatcher";


export const handleEventDispatch = async (result: any, source: string) => {
  const event = result?.event;

  if (!event?.shouldEmit) return;

  const fullEvent = {
    type: event.type,
    data: event.data,
    context: event.context,
    meta: event.meta
  };

  const eventId = fullEvent.meta?.eventId;

  if (!eventId) {
    console.error("🚨 Missing eventId", fullEvent);
    return;
  }

  await EventDispatcher.dispatch(fullEvent, source);
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
export const updatePage = async (req: AuthRequest, res: Response) => {
  try {
    const result = await PageService.updatePage(
      Number(req.siteContext.siteId),
      Number(req.params.pageId),
      req.user.id,
      req.body
    );

    await handleEventDispatch(result, "PageController.updatePage");

    return res.json({
      success: true,
      data: PageMapper.toDTO(result.data),

      // ✅ الصحيح
      eventId: result.event?.meta?.eventId
    });

  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
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