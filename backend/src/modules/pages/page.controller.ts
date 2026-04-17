import { Response } from "express";
import { AuthRequest } from "../../shared/auth.util";
import { PageService } from "./page.service";
import { Page } from "../../models";

export const createPage = async (req: AuthRequest, res: Response) => {
  try {
    // 1. نجبدو الـ IDs م الـ Context اللي عبّاه الـ Middleware
    const siteId = req.siteContext?.siteId;
    const userId = req.user?.id;

    if (!siteId) {
      return res.status(400).json({ success: false, message: "Site context missing" });
    }

    // 2. نصنعو الصفحة باستعمال الـ IDs هاذم (مستحيل يغلطو)
    const newPage = await Page.create({
      ...req.body, // title, content...
      siteId: siteId,
      userId: userId
    });

    return res.status(201).json({
      success: true,
      message: "Page created successfully",
      data: newPage
    });

  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getPages = async (req: AuthRequest, res: Response) => {
  try {
    const siteId = req.siteContext?.siteId;

    if (!siteId) {
      return res.status(400).json({
        success: false,
        message: "Missing context",
      });
    }

    const pages = await PageService.getPages(siteId);

    return res.json({
      success: true,
      data: pages,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};



export const updatePage = async (req: AuthRequest, res: Response) => {
  try {
    const siteId = req.siteContext.siteId;
    const userId = req.user.id;
    const { pageId } = req.params; // الـ pageId يبقى في الـ params عادي

    const page = await PageService.updatePage(
      siteId, 
      Number(pageId), 
      userId, 
      req.body
    );

    return res.json({
      success: true,
      message: "Page updated successfully",
      data: page
    });
  } catch (error: any) {
    if (error.message === "PAGE_NOT_FOUND") {
      return res.status(404).json({ success: false, message: "Page not found" });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePage = async (req: AuthRequest, res: Response) => {
  try {
    const siteId = req.siteContext.siteId;
    const userId = req.user.id;
    const { pageId } = req.params;

    // ملاحظة: الـ deletePage في الـ service لازم تخدمها بنفس منطق الـ update 
    // باش تعمل soft delete (status = 'deleted')
    await PageService.updatePage(siteId, Number(pageId), userId, { status: "deleted" });

    return res.json({
      success: true,
      message: "Page deleted successfully"
    });
  } catch (error: any) {
    if (error.message === "PAGE_NOT_FOUND") {
      return res.status(404).json({ success: false, message: "Page not found" });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};