import { RedirectGraphEngine } from "../engine/redirectGraph.engine";
import { SEOBuilder } from "../engine/seoBuilder";


function escapeHTML(str: string) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export const getPublicPage = async (req, res) => {
  try {
    const siteId = Number(req.params.siteId);
    const inputSlug = req.params.slug;

    const result = await RedirectGraphEngine.resolve(siteId, inputSlug);

    if (!result || !result.page) {
      return res.status(404).send("<h1>404 - Page Not Found</h1>");
    }

    // 1️⃣ Fix: Permanent Redirect (301) للـ SEO
    if (!result.isOriginal) {
      return res.redirect(301, `/pages/${siteId}/${result.page.slug}`);
    }

    const seo = SEOBuilder.build(result.page);
    const page = result.page;

    // 2️⃣ Fix: Performance (Cache Header)
    // نخليوه Cacheable لمدة دقيقة باش نقصو الضغط على الـ DB
    res.set("Cache-Control", "public, max-age=60");

    const fullUrl = `https://yourdomain.com/pages/${siteId}/${page.slug}`;

    // 3️⃣ الـ Render مع الـ Security والـ Canonical
    return res.status(200).send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <title>${seo.title}</title>
    <meta name="description" content="${seo.description}">
    <link rel="canonical" href="${fullUrl}" />
    
    <meta property="og:title" content="${seo.openGraph.title}">
    <meta property="og:url" content="${fullUrl}">
    
    <style>
        body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 2rem; line-height: 1.6; color: #333; background: #fff; }
        .container { max-width: 800px; margin: auto; border: 1px solid #eee; padding: 2rem; border-radius: 12px; }
        h1 { color: #2c3e50; margin-top: 0; }
        footer { margin-top: 2rem; font-size: 0.8rem; color: #aaa; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <h1>${page.title}</h1>
        <div class="content">
            ${page.content} 
        </div>
        <footer>
            Site: ${siteId} | Page: ${page.id} | Rendered at: ${new Date().toLocaleTimeString()}
        </footer>
    </div>
</body>
</html>
    `);

  } catch (error: any) {
    console.error("[PRODUCTION ERROR]", error.message);
    return res.status(500).send("<h1>500 - Internal Server Error</h1>");
  }
};