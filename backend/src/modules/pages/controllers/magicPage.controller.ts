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

    // 🔄 Redirect Logic: يبعث للرابط الجديد مع الـ siteId
    if (!result.isOriginal) {
      return res.redirect(302, `/pages/${siteId}/${result.page.slug}`);
    }

    const seo = SEOBuilder.build(result.page);
    const page = result.page;

    // ✅ الـ Response توّة صار HTML
    return res.status(200).send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${seo.title}</title>
    <meta name="description" content="${seo.description}">
    <meta property="og:title" content="${seo.openGraph.title}">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 50px; line-height: 1.6; color: #333; background: #fff; }
        .container { max-width: 800px; margin: auto; background: #f9f9f9; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #2c3e50; }
        .content { font-size: 1.2rem; margin-top: 20px; }
        footer { margin-top: 20px; font-size: 0.8rem; color: #777; }
    </style>
</head>
<body>
    <div class="container">
        <h1>${page.title}</h1>
        <div class="content">
            ${page.content}
        </div>
        <hr>
        <footer>
            Site ID: ${page.siteId} | Page ID: ${page.id} | Powered by ReactBuilder
        </footer>
    </div>
</body>
</html>
    `);

  } catch (error: any) {
    console.error("[RENDER ERROR]", error.message);
    return res.status(500).send("<h1>500 - Internal Server Error</h1>");
  }
};