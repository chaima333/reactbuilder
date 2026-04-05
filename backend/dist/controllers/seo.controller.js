"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRobotsTxt = exports.generateSitemap = exports.updatePageSeo = exports.getPageSeo = void 0;
const models_1 = require("../models");
const Seo_1 = require("../models/Seo");
// Récupérer le SEO d'une page
const getPageSeo = async (req, res) => {
    try {
        const { pageId } = req.params;
        const pageIdNum = typeof pageId === 'string' ? parseInt(pageId) : parseInt(pageId[0]);
        const seo = await Seo_1.Seo.findOne({ where: { pageId: pageIdNum } });
        res.json({
            success: true,
            data: seo || {}
        });
    }
    catch (error) {
        console.error('Get SEO error:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};
exports.getPageSeo = getPageSeo;
// Mettre à jour le SEO d'une page
const updatePageSeo = async (req, res) => {
    try {
        const { pageId } = req.params;
        const pageIdNum = typeof pageId === 'string' ? parseInt(pageId) : parseInt(pageId[0]);
        const seoData = req.body;
        let seo = await Seo_1.Seo.findOne({ where: { pageId: pageIdNum } });
        if (seo) {
            await seo.update(seoData);
        }
        else {
            seo = await Seo_1.Seo.create({ pageId: pageIdNum, ...seoData });
        }
        res.json({
            success: true,
            message: 'SEO mis à jour',
            data: seo
        });
    }
    catch (error) {
        console.error('Update SEO error:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};
exports.updatePageSeo = updatePageSeo;
// Générer le sitemap.xml
const generateSitemap = async (req, res) => {
    try {
        const { siteId } = req.params;
        const siteIdNum = typeof siteId === 'string' ? parseInt(siteId) : parseInt(siteId[0]);
        const site = await models_1.Site.findByPk(siteIdNum);
        if (!site) {
            return res.status(404).send('Site non trouvé');
        }
        const pages = await models_1.Page.findAll({
            where: { siteId: siteIdNum, status: 'published' }
        });
        // Récupérer le SEO pour chaque page
        const seoList = await Seo_1.Seo.findAll({
            where: { pageId: pages.map(p => p.id) }
        });
        const seoMap = new Map();
        seoList.forEach(seo => {
            seoMap.set(seo.pageId, seo);
        });
        let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
        sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
        for (const page of pages) {
            const seo = seoMap.get(page.id);
            const changefreq = seo?.sitemapChangefreq || 'weekly';
            const priority = seo?.sitemapPriority || 0.5;
            sitemap += `  <url>\n`;
            sitemap += `    <loc>https://${req.headers.host}/s/${site.subdomain}/${page.slug}</loc>\n`;
            sitemap += `    <lastmod>${page.updatedAt.toISOString()}</lastmod>\n`;
            sitemap += `    <changefreq>${changefreq}</changefreq>\n`;
            sitemap += `    <priority>${priority}</priority>\n`;
            sitemap += `  </url>\n`;
        }
        sitemap += '</urlset>';
        res.header('Content-Type', 'application/xml');
        res.send(sitemap);
    }
    catch (error) {
        console.error('Generate sitemap error:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};
exports.generateSitemap = generateSitemap;
// Générer robots.txt
const getRobotsTxt = async (req, res) => {
    try {
        const { siteId } = req.params;
        const siteIdNum = typeof siteId === 'string' ? parseInt(siteId) : parseInt(siteId[0]);
        const site = await models_1.Site.findByPk(siteIdNum);
        if (!site) {
            return res.status(404).send('Site non trouvé');
        }
        const robots = `User-agent: *
Allow: /
Sitemap: https://${req.headers.host}/api/seo/sites/${siteIdNum}/sitemap.xml
Host: https://${req.headers.host}`;
        res.header('Content-Type', 'text/plain');
        res.send(robots);
    }
    catch (error) {
        console.error('Robots.txt error:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};
exports.getRobotsTxt = getRobotsTxt;
