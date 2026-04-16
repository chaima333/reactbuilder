import { Response } from 'express';
import { AuthRequest } from '../../shared/auth.util';
import * as SeoService from './seo.service';
import { Site } from '../../models';

export const getPageSeo = async (req: AuthRequest, res: Response) => {
  try {
    const pageId = parseInt(req.params.pageId);
    const seo = await SeoService.fetchSeoByPage(pageId);
    res.json({ success: true, data: seo || {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const updatePageSeo = async (req: AuthRequest, res: Response) => {
  try {
    const pageId = parseInt(req.params.pageId);
    const seo = await SeoService.upsertSeo(pageId, req.body);
    res.json({ success: true, message: 'SEO mis à jour', data: seo });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const generateSitemap = async (req: AuthRequest, res: Response) => {
  try {
    const siteId = parseInt(req.params.siteId);
    const xml = await SeoService.buildSitemapXml(siteId, req.headers.host || '');
    res.header('Content-Type', 'application/xml').send(xml);
  } catch (error: any) {
    res.status(error.message === 'Site non trouvé' ? 404 : 500).send(error.message);
  }
};

export const getRobotsTxt = async (req: AuthRequest, res: Response) => {
  try {
    const siteId = parseInt(req.params.siteId);
    const site = await Site.findByPk(siteId);
    if (!site) return res.status(404).send('Site non trouvé');

    const robots = `User-agent: *\nAllow: /\nSitemap: https://${req.headers.host}/api/seo/sites/${siteId}/sitemap.xml\nHost: https://${req.headers.host}`;
    res.header('Content-Type', 'text/plain').send(robots);
  } catch (error) {
    res.status(500).send('Erreur serveur');
  }
};