"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSite = exports.updateSite = exports.getSiteById = exports.getSites = exports.createSite = exports.myController = void 0;
const models_1 = require("../models");
// Au lieu de (req: Request), utilise (req: AuthRequest)
const myController = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    const { page } = req.query;
    const authHeader = req.headers.authorization;
};
exports.myController = myController;
const createSite = async (req, res) => {
    try {
        const { name, subdomain, title, description, language = 'fr', timezone = 'Europe/Paris' } = req.body;
        const userId = req.user.id;
        const existingSite = await models_1.Site.findOne({ where: { subdomain } });
        if (existingSite) {
            return res.status(400).json({ success: false, message: 'Ce sous-domaine est déjà utilisé' });
        }
        const site = await models_1.Site.create({
            name,
            subdomain,
            title,
            description,
            language,
            timezone,
            ownerId: userId,
            status: 'active'
        });
        // Créer page d'accueil correctement
        await models_1.Page.create({
            title: "Home",
            slug: "home",
            content: "<p>Bienvenue sur ce site !</p>",
            blocks: [
                { type: "title", content: "Bienvenue !" },
                { type: "text", content: "Voici une page exemple." }
            ],
            siteId: site.id,
            userId: userId,
            status: 'published'
        });
        // Journalisation safe
        try {
            await models_1.ActivityLog.create({
                userId,
                siteId: site.id,
                action: 'site_created',
                entityType: 'site',
                entityId: site.id,
                details: { name: site.name, subdomain: site.subdomain }
            });
        }
        catch (logErr) {
            console.warn('⚠️ Activity log failed:', logErr);
        }
        return res.status(201).json({ success: true, message: 'Site créé avec succès', data: site });
    }
    catch (error) {
        console.error('Create site error:', error);
        return res.status(500).json({ success: false, message: 'Erreur lors de la création du site' });
    }
};
exports.createSite = createSite;
const getSites = async (req, res) => {
    try {
        const userId = req.user.id;
        const sites = await models_1.Site.findAll({
            where: { ownerId: userId, status: 'active' },
            include: [
                {
                    model: models_1.Page,
                    as: 'pages', // لازم نفس الاسم في association
                    attributes: ['id', 'title', 'views', 'status'],
                    required: false // 🔥 مهم: باش يرجّع site حتى لو ما فيهش pages
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        const sitesWithStats = sites.map((site) => {
            const siteJson = site.toJSON();
            const pages = siteJson.pages || [];
            return {
                ...siteJson,
                pagesCount: pages.length,
                totalViews: pages.reduce((sum, page) => sum + (page.views || 0), 0)
            };
        });
        res.json({
            success: true,
            data: sitesWithStats
        });
    }
    catch (error) {
        console.error('❌ Get sites error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des sites'
        });
    }
};
exports.getSites = getSites;
const getSiteById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const site = await models_1.Site.findOne({
            where: { id, ownerId: userId },
            include: [
                {
                    model: models_1.Page,
                    as: 'pages',
                    attributes: ['id', 'title', 'slug', 'status', 'views', 'createdAt']
                }
            ]
        });
        if (!site) {
            return res.status(404).json({
                success: false,
                message: 'Site non trouvé'
            });
        }
        res.json({
            success: true,
            data: site
        });
    }
    catch (error) {
        console.error('Get site error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du site'
        });
    }
};
exports.getSiteById = getSiteById;
const updateSite = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { name, title, description, language, timezone } = req.body;
        const site = await models_1.Site.findOne({ where: { id, ownerId: userId } });
        if (!site) {
            return res.status(404).json({
                success: false,
                message: 'Site non trouvé'
            });
        }
        await site.update({ name, title, description, language, timezone });
        // Journaliser l'activité
        await models_1.ActivityLog.create({
            userId,
            siteId: site.id,
            action: 'site_updated',
            entityType: 'site',
            entityId: site.id,
            details: { name: site.name }
        });
        res.json({
            success: true,
            message: 'Site mis à jour avec succès',
            data: site
        });
    }
    catch (error) {
        console.error('Update site error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour du site'
        });
    }
};
exports.updateSite = updateSite;
const deleteSite = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const site = await models_1.Site.findOne({ where: { id, ownerId: userId } });
        if (!site) {
            return res.status(404).json({
                success: false,
                message: 'Site non trouvé'
            });
        }
        // Soft delete - changer le statut
        await site.update({ status: 'deleted' });
        // Journaliser l'activité
        await models_1.ActivityLog.create({
            userId,
            siteId: site.id,
            action: 'site_deleted',
            entityType: 'site',
            entityId: site.id,
            details: { name: site.name }
        });
        res.json({
            success: true,
            message: 'Site supprimé avec succès'
        });
    }
    catch (error) {
        console.error('Delete site error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression du site'
        });
    }
};
exports.deleteSite = deleteSite;
