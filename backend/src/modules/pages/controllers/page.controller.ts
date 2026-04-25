import { Response } from "express";
import { AuthRequest } from "../../../shared/auth.util";
import { PageService } from "../services/page.service";
import { PageVersionService } from "../services/pageVersion.service";
import { PageMapper } from "../mappers/page.mapper";
import { cmsRegistry } from "../../../core/plugins/plugin.registry";

/**
 * 🧠 Global Event Dispatcher
 */
const dispatchEvent = async (result: any) => {
  if (result && result.event) {
    await cmsRegistry.emit(
      result.event.type,
      result.event.payload,
      result.event.source || "GlobalDispatcher"
    );
  }
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

    await dispatchEvent(result);

    return res.status(201).json({
      success: true,
      data: PageMapper.toDTO(result.data || result)
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 🟢 UPDATE PAGE Fix
export const updatePage = async (req: AuthRequest, res: Response) => {
  try {
    const result = await PageService.updatePage(
      Number(req.siteContext.siteId),
      Number(req.params.pageId),
      req.body,
      req.user.id
    );

    await dispatchEvent(result);

    // ✅ التغيير هنا: استعمل result.data موش result.updated
    return res.json({ 
      success: true, 
      data: PageMapper.toDTO(result.data) 
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 🟢 RESTORE VERSION Fix
export const restorePageVersion = async (req: AuthRequest, res: Response) => {
  try {
    const result = await PageService.restoreVersion(
      Number(req.siteContext.siteId),
      Number(req.params.pageId),
      Number(req.params.versionId),
      req.user.id
    );

    await dispatchEvent(result);

    // ✅ التغيير هنا: استعمل result.data موش result.restored
    return res.json({ 
      success: true, 
      data: PageMapper.toDTO(result.data) 
    });
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
      req.user.id,
      req.siteContext.role
    );

    await dispatchEvent(result);

    return res.json({ 
      success: true, 
      // ✅ التغيير هنا: استعمل result.data فقط
      data: PageMapper.toDTO(result.data) 
    });
  } catch (err: any) {
    const status = err.message === "FORBIDDEN" ? 403 : err.message === "INVALID_TRANSITION" ? 400 : 500;
    return res.status(status).json({ success: false, message: err.message });
  }
};

// ========================
// 🟢 READ ONLY ACTIONS (No Events)
// ========================
export const getPages = async (req: AuthRequest, res: Response) => {
  try {
    const pages = await PageService.getPages(req.siteContext.siteId);
    return res.json({ success: true, data: PageMapper.toListDTO(pages) });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

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

export const deletePage = async (req: AuthRequest, res: Response) => {
  try {
    const result = await PageService.deletePage(
      req.siteContext.siteId,
      Number(req.params.pageId)
    );
    await dispatchEvent(result);
    return res.json({ success: true, message: "Page deleted" });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};