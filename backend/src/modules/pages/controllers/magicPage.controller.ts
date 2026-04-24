import { RedirectGraphEngine } from "../engine/redirectGraph.engine";
import { SEOBuilder } from "../engine/seoBuilder";


export const getPublicPage = async (req, res) => {
  try {
    const siteId = Number(req.params.siteId);
    const inputSlug = req.params.slug;

    const result = await RedirectGraphEngine.resolve(siteId, inputSlug);

    if (!result || !result.page) {
      return res.status(404).send("<h1>404 - Page Not Found</h1>");
    }

    // 🔄 Redirect Logic (محافظين عليه)
    if (!result.isOriginal) {
      return res.redirect(302, `/pages/${siteId}/${result.page.slug}`);
    }

    const { page } = result;
    const seo = SEOBuilder.build(page); // نفترض الـ Builder متاعك يرجع Metadata كاملة

    // 🚀 التحول من API إلى Website Renderer
    return res.status(200).send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <title>${seo.title || page.title}</title>
    <meta name="description" content="${seo.description || ''}">
    
    <meta property="og:title" content="${seo.openGraph?.title || seo.title}">
    <meta property="og:description" content="${seo.openGraph?.description || seo.description}">
    <meta property="og:type" content="website">
    
    <style>
        body { font-family: sans-serif; line-height: 1.6; padding: 2rem; max-width: 800px; margin: auto; }
        h1 { color: #333; border-bottom: 2px solid #eee; padding-bottom: 1rem; }
        .content { margin-top: 2rem; }
    </style>
</head>
<body>
    <header>
        <h1>${page.title}</h1>
    </header>
    
    <main class="content">
        ${page.content} 
    </main>

    <footer>
        <hr>
        <p><small>Powered by ReactBuilder CMS</small></p>
    </footer>
</body>
</html>
    `);

  } catch (error: any) {
    console.error("[RENDER ERROR]", error.message);
    return res.status(500).send("<h1>500 - Internal Server Error</h1>");
  }
};