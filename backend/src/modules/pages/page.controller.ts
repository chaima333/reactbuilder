import { Response } from "express";
import { Page, ActivityLog, Site } from "../../models";
import { AuthRequest } from "../../shared/auth.util";
import { Op } from "sequelize";

// Types
export type PageStatus = "draft" | "published" | "scheduled" | "deleted";
export interface PageBlock {
  type: string;
  content: string;
}

interface PageCreateInput {
  title: string;
  content?: string;
  blocks?: PageBlock[];
  status?: PageStatus;
}

interface PageUpdateInput {
  title?: string;
  content?: string;
  blocks?: PageBlock[];
  status?: PageStatus;
}

// Helper: generate slug unique par site
const generateSlug = async (
  title: string,
  siteId: number,
  excludeId?: number
) => {
  let baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  let slug = baseSlug;
  let counter = 1;

  while (
    await Page.findOne({
      where: {
        slug,
        site_id: siteId,
        status: { [Op.ne]: "deleted" },
        ...(excludeId ? { id: { [Op.ne]: excludeId } } : {}),
      },
    })
  ) {
    slug = `${baseSlug}-${counter++}`;
  }

  return slug;
};

// ------------------------
// GET all pages
// ------------------------
export const getPages = async (req: AuthRequest, res: Response) => {
  try {
    const { siteId } = req.params;
    const userId = req.user.id;

    const site = await Site.findOne({ where: { id: Number(siteId), ownerId: userId } });
    if (!site) return res.status(404).json({ success: false, message: "Site non trouvé ou accès refusé" });

    const pages = await Page.findAll({
      where: { siteId: Number(siteId), userId, status: { [Op.ne]: "deleted" } },
      order: [["createdAt", "ASC"]],
    });

    return res.json({ success: true, data: pages });
  } catch (error) {
    console.error("❌ Get pages error:", error);
    return res.status(500).json({ success: false, message: "Erreur lors de la récupération des pages" });
  }
};

// ------------------------
// GET single page by ID
// ------------------------
export const getPageById = async (req: AuthRequest, res: Response) => {
  try {
    const { siteId, pageId } = req.params;
    const userId = req.user.id;

    const page = await Page.findOne({
      where: { id: Number(pageId), siteId: Number(siteId), userId, status: { [Op.ne]: "deleted" } },
    });

    if (!page) return res.status(404).json({ success: false, message: "Page non trouvée" });

    return res.json({ success: true, data: page });
  } catch (error) {
    console.error("❌ Get page error:", error);
    return res.status(500).json({ success: false, message: "Erreur lors de la récupération de la page" });
  }
};

// ------------------------
// CREATE page
// ------------------------
export const createPage = async (req: AuthRequest, res: Response) => {
  try {
    console.log("BODY:", req.body);

    const { siteId } = req.params;
    const userId = req.user.id;

    const { title, content = "", blocks = [], status = "draft" } = req.body;

    const safeBlocks = Array.isArray(blocks) ? blocks : [];

    const site = await Site.findOne({
      where: { id: Number(siteId), ownerId: userId }
    });

    if (!site) {
      return res.status(404).json({ success: false, message: "Site not found" });
    }

    const slug = await generateSlug(title, Number(siteId));

    const page = await Page.create({
      title,
      slug,
      content,
      blocks: safeBlocks,
      status,
      userId,
      siteId: Number(siteId),
    });

    return res.status(201).json({ success: true, data: page });

  } catch (error: any) {
    console.error("🔥 FULL ERROR:", error);
    console.error("🔥 SQL:", error?.parent?.sql);
    console.error("🔥 DETAIL:", error?.parent?.detail);
    console.error("🔥 MESSAGE:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ------------------------
// UPDATE page
// ------------------------
export const updatePage = async (req: AuthRequest, res: Response) => {
  try {
    const { siteId, pageId } = req.params;
    const userId = req.user.id;
    const { title, content, blocks, status } = req.body as PageUpdateInput;

    const page = await Page.findOne({ where: { id: Number(pageId), siteId: Number(siteId), userId } });
    if (!page || page.status === "deleted") return res.status(404).json({ success: false, message: "Page non trouvée" });

    const updateData: Partial<PageUpdateInput & { slug?: string }> = {};
    if (title && title !== page.title) {
      updateData.title = title;
      updateData.slug = await generateSlug(title, Number(siteId), page.id);
    }
    if (content !== undefined) updateData.content = content;
    if (blocks !== undefined) {
      if (!Array.isArray(blocks) || blocks.some(b => !b.type || !b.content)) {
        return res.status(400).json({ success: false, message: "Blocs invalides" });
      }
      updateData.blocks = blocks;
    }
    if (status !== undefined) updateData.status = status;

    await page.update(updateData);

    try {
      await ActivityLog.create({ userId, siteId: Number(siteId), action: "page_updated", entityType: "page", entityId: page.id, details: { title: page.title } });
    } catch (e) { console.warn("⚠️ ActivityLog failed:", e); }

    return res.json({ success: true, message: "Page mise à jour avec succès", data: page });
  } catch (error) {
    console.error("❌ Update page error:", error);
    return res.status(500).json({ success: false, message: "Erreur lors de la mise à jour de la page" });
  }
};

// ------------------------
// DELETE page (soft)
// ------------------------
export const deletePage = async (req: AuthRequest, res: Response) => {
  try {
    const { siteId, pageId } = req.params;
    const userId = req.user.id;

    const page = await Page.findOne({ where: { id: Number(pageId), siteId: Number(siteId), userId } });
    if (!page || page.status === "deleted") return res.status(404).json({ success: false, message: "Page non trouvée" });

    await page.update({ status: "deleted" });

    try {
      await ActivityLog.create({ userId, siteId: Number(siteId), action: "page_deleted", entityType: "page", entityId: page.id, details: { title: page.title } });
    } catch (e) { console.warn("⚠️ ActivityLog failed:", e); }

    return res.json({ success: true, message: "Page supprimée avec succès" });
  } catch (error) {
    console.error("❌ Delete page error:", error);
    return res.status(500).json({ success: false, message: "Erreur lors de la suppression de la page" });
  }
};