"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePage = exports.updatePage = exports.createPage = exports.getPageById = exports.getPages = void 0;
const models_1 = require("../models");
const sequelize_1 = require("sequelize");
// Helper: generate slug unique par site
const generateSlug = async (title, siteId, excludeId) => {
    let baseSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    let slug = baseSlug;
    let counter = 1;
    while (await models_1.Page.findOne({
        where: {
            slug,
            siteId,
            status: { [sequelize_1.Op.ne]: "deleted" },
            ...(excludeId ? { id: { [sequelize_1.Op.ne]: excludeId } } : {}),
        },
    })) {
        slug = `${baseSlug}-${counter++}`;
    }
    return slug;
};
// ------------------------
// GET all pages
// ------------------------
const getPages = async (req, res) => {
    try {
        const { siteId } = req.params;
        const userId = req.user.id;
        const site = await models_1.Site.findOne({ where: { id: Number(siteId), ownerId: userId } });
        if (!site)
            return res.status(404).json({ success: false, message: "Site non trouvé ou accès refusé" });
        const pages = await models_1.Page.findAll({
            where: { siteId: Number(siteId), userId, status: { [sequelize_1.Op.ne]: "deleted" } },
            order: [["createdAt", "ASC"]],
        });
        return res.json({ success: true, data: pages });
    }
    catch (error) {
        console.error("❌ Get pages error:", error);
        return res.status(500).json({ success: false, message: "Erreur lors de la récupération des pages" });
    }
};
exports.getPages = getPages;
// ------------------------
// GET single page by ID
// ------------------------
const getPageById = async (req, res) => {
    try {
        const { siteId, pageId } = req.params;
        const userId = req.user.id;
        const page = await models_1.Page.findOne({
            where: { id: Number(pageId), siteId: Number(siteId), userId, status: { [sequelize_1.Op.ne]: "deleted" } },
        });
        if (!page)
            return res.status(404).json({ success: false, message: "Page non trouvée" });
        return res.json({ success: true, data: page });
    }
    catch (error) {
        console.error("❌ Get page error:", error);
        return res.status(500).json({ success: false, message: "Erreur lors de la récupération de la page" });
    }
};
exports.getPageById = getPageById;
// ------------------------
// CREATE page
// ------------------------
const createPage = async (req, res) => {
    try {
        const { siteId } = req.params;
        const userId = req.user.id;
        const { title, content = "", blocks = [], status = "draft" } = req.body;
        // Validation simple des blocs
        if (!Array.isArray(blocks) || blocks.some(b => !b.type || !b.content)) {
            return res.status(400).json({ success: false, message: "Blocs invalides" });
        }
        const site = await models_1.Site.findOne({ where: { id: Number(siteId), ownerId: userId } });
        if (!site)
            return res.status(404).json({ success: false, message: "Site non trouvé ou accès refusé" });
        const slug = await generateSlug(title, Number(siteId));
        const page = await models_1.Page.create({ title, slug, content, blocks, status, userId, siteId: Number(siteId) });
        // Log séparé pour fiabilité
        try {
            await models_1.ActivityLog.create({ userId, siteId: Number(siteId), action: "page_created", entityType: "page", entityId: page.id, details: { title: page.title } });
        }
        catch (e) {
            console.warn("⚠️ ActivityLog failed:", e);
        }
        return res.status(201).json({ success: true, message: "Page créée avec succès", data: page });
    }
    catch (error) {
        console.error("❌ Create page error:", error);
        return res.status(500).json({ success: false, message: "Erreur lors de la création de la page" });
    }
};
exports.createPage = createPage;
// ------------------------
// UPDATE page
// ------------------------
const updatePage = async (req, res) => {
    try {
        const { siteId, pageId } = req.params;
        const userId = req.user.id;
        const { title, content, blocks, status } = req.body;
        const page = await models_1.Page.findOne({ where: { id: Number(pageId), siteId: Number(siteId), userId } });
        if (!page || page.status === "deleted")
            return res.status(404).json({ success: false, message: "Page non trouvée" });
        const updateData = {};
        if (title && title !== page.title) {
            updateData.title = title;
            updateData.slug = await generateSlug(title, Number(siteId), page.id);
        }
        if (content !== undefined)
            updateData.content = content;
        if (blocks !== undefined) {
            if (!Array.isArray(blocks) || blocks.some(b => !b.type || !b.content)) {
                return res.status(400).json({ success: false, message: "Blocs invalides" });
            }
            updateData.blocks = blocks;
        }
        if (status !== undefined)
            updateData.status = status;
        await page.update(updateData);
        try {
            await models_1.ActivityLog.create({ userId, siteId: Number(siteId), action: "page_updated", entityType: "page", entityId: page.id, details: { title: page.title } });
        }
        catch (e) {
            console.warn("⚠️ ActivityLog failed:", e);
        }
        return res.json({ success: true, message: "Page mise à jour avec succès", data: page });
    }
    catch (error) {
        console.error("❌ Update page error:", error);
        return res.status(500).json({ success: false, message: "Erreur lors de la mise à jour de la page" });
    }
};
exports.updatePage = updatePage;
// ------------------------
// DELETE page (soft)
// ------------------------
const deletePage = async (req, res) => {
    try {
        const { siteId, pageId } = req.params;
        const userId = req.user.id;
        const page = await models_1.Page.findOne({ where: { id: Number(pageId), siteId: Number(siteId), userId } });
        if (!page || page.status === "deleted")
            return res.status(404).json({ success: false, message: "Page non trouvée" });
        await page.update({ status: "deleted" });
        try {
            await models_1.ActivityLog.create({ userId, siteId: Number(siteId), action: "page_deleted", entityType: "page", entityId: page.id, details: { title: page.title } });
        }
        catch (e) {
            console.warn("⚠️ ActivityLog failed:", e);
        }
        return res.json({ success: true, message: "Page supprimée avec succès" });
    }
    catch (error) {
        console.error("❌ Delete page error:", error);
        return res.status(500).json({ success: false, message: "Erreur lors de la suppression de la page" });
    }
};
exports.deletePage = deletePage;
