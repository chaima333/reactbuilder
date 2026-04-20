import { Response ,Request} from "express";
import { AuthRequest } from "../../shared/auth.util";
import { PageService } from "./page.service";
import { Page } from "../../models";
import slugify from "slugify";
import { Op } from "sequelize";




export const createPage = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content } = req.body;
    const siteId = req.siteContext.siteId;
    const userId = req.user.id;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "title is required",
      });
    }

    const baseSlug = slugify(title, {
      lower: true,
      strict: true,
    });

    let slug = baseSlug;
    let counter = 1;

    while (await Page.findOne({ where: { slug, siteId } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const page = await Page.create({
      title,
      content: content || "",
      slug,
      status: "draft",
      siteId,
      userId,
      blocks: [],
    });

    return res.json({ success: true, data: page });

  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


export const getPages = async (req: AuthRequest, res: Response) => {
  try {
    const siteId = req.siteContext.siteId;

    const pages = await Page.findAll({
      where: {
        siteId,
        status: {
          [Op.ne]: "deleted",
        },
      },
      order: [["createdAt", "DESC"]],
    });

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
    const { pageId } = req.params;

    const page = await Page.findOne({
      where: { id: pageId, siteId },
    });

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }

    await page.update({
      ...req.body,
      userId,
    });

    return res.json({
      success: true,
      data: page,
    });

  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


export const deletePage = async (req: AuthRequest, res: Response) => {
  try {
    const siteId = req.siteContext.siteId;
    const { pageId } = req.params;

    const page = await Page.findOne({
      where: { id: pageId, siteId },
    });

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }

    await page.update({
      status: "deleted",
    });

    return res.json({
      success: true,
      message: "Page deleted",
    });

  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


export const getPublicPage = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const page = await Page.findOne({
      where: {
        slug,
        status: "published",
      },
    });

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }

    return res.json({
      success: true,
      data: page,
    });

  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};