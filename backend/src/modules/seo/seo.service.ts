import { Page, Site } from '../../models';
import { Seo } from '../../models/Seo';

export const fetchSeoByPage = async (pageId: number) => {
  return await Seo.findOne({ where: { pageId } });
};

export const upsertSeo = async (pageId: number, seoData: any) => {
  let seo = await Seo.findOne({ where: { pageId } });
  if (seo) {
    return await seo.update(seoData);
  }
  return await Seo.create({ pageId, ...seoData });
};

export const buildSitemapXml = async (siteId: number, host: string) => {
  const site = await Site.findByPk(siteId);
  if (!site) throw new Error('Site non trouvé');

  const pages = await Page.findAll({
    where: { siteId, status: 'published' }
  });

  const seoList = await Seo.findAll({
    where: { pageId: pages.map(p => p.id) }
  });

  const seoMap = new Map(seoList.map(s => [s.pageId, s]));

  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  for (const page of pages) {
    const seo: any = seoMap.get(page.id);
    const changefreq = seo?.sitemapChangefreq || 'weekly';
    const priority = seo?.sitemapPriority || 0.5;

    sitemap += `  <url>\n`;
    sitemap += `    <loc>https://${host}/s/${site.subdomain}/${page.slug}</loc>\n`;
    sitemap += `    <lastmod>${page.updatedAt.toISOString()}</lastmod>\n`;
    sitemap += `    <changefreq>${changefreq}</changefreq>\n`;
    sitemap += `    <priority>${priority}</priority>\n`;
    sitemap += `  </url>\n`;
  }

  sitemap += '</urlset>';
  return sitemap;
};