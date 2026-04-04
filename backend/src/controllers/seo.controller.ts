import { Response } from 'express';
import { Page, Site } from '../models';
import { Seo } from '../models/Seo';
import { AuthRequest } from '../shared/auth.util';


// Récupérer le SEO d'une page
export const getPageSeo = async (req: AuthRequest, res: Response) => {
  try {
    const { pageId } = req.params;
    const pageIdNum = typeof pageId === 'string' ? parseInt(pageId) : parseInt(pageId[0]);
    
    const seo = await Seo.findOne({ where: { pageId: pageIdNum } });
    
    res.json({
      success: true,
      data: seo || {}
    });
  } catch (error) {
    console.error('Get SEO error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Mettre à jour le SEO d'une page
export const updatePageSeo = async (req: AuthRequest, res: Response) => {
  try {
    const { pageId } = req.params;
    const pageIdNum = typeof pageId === 'string' ? parseInt(pageId) : parseInt(pageId[0]);
    const seoData = req.body;
    
    let seo = await Seo.findOne({ where: { pageId: pageIdNum } });
    
    if (seo) {
      await seo.update(seoData);
    } else {
      seo = await Seo.create({ pageId: pageIdNum, ...seoData });
    }
    
    res.json({
      success: true,
      message: 'SEO mis à jour',
      data: seo
    });
  } catch (error) {
    console.error('Update SEO error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Générer le sitemap.xml
export const generateSitemap = async (req: AuthRequest, res: Response) => {
  try {
    const { siteId } = req.params;
    const siteIdNum = typeof siteId === 'string' ? parseInt(siteId) : parseInt(siteId[0]);
    
    const site = await Site.findByPk(siteIdNum);
    if (!site) {
      return res.status(404).send('Site non trouvé');
    }
    
    const pages = await Page.findAll({
      where: { siteId: siteIdNum, status: 'published' }
    });
    
    // Récupérer le SEO pour chaque page
    const seoList = await Seo.findAll({
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
  } catch (error) {
    console.error('Generate sitemap error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Générer robots.txt
export const getRobotsTxt = async (req: AuthRequest, res: Response) => {
  try {
    const { siteId } = req.params;
    const siteIdNum = typeof siteId === 'string' ? parseInt(siteId) : parseInt(siteId[0]);
    
    const site = await Site.findByPk(siteIdNum);
    if (!site) {
      return res.status(404).send('Site non trouvé');
    }
    
    const robots = `User-agent: *
Allow: /
Sitemap: https://${req.headers.host}/api/seo/sites/${siteIdNum}/sitemap.xml
Host: https://${req.headers.host}`;
    
    res.header('Content-Type', 'text/plain');
    res.send(robots);
  } catch (error) {
    console.error('Robots.txt error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};