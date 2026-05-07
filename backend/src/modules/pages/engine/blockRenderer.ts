// 1. دالة الحماية (XSS)
export const escapeHTML = (str: string): string => {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// 2. قائمة الـ Renderers لكل بلوك (Scalable)
const BLOCK_TEMPLATES: Record<string, (data: any) => string> = {
  hero: (data) => {
    // يقرأ headline أو text، اللي يلقاه الأول يستعملو
    const title = data.headline || data.text || "";
    const sub = data.subtext || "";
    
    return `
      <section class="hero" style="background:#f4f4f4; padding:50px; text-align:center; border-radius:10px;">
        <h2>${escapeHTML(title)}</h2>
        ${sub ? `<p>${escapeHTML(sub)}</p>` : ""}
      </section>`;
  },
    
  button: (data) => `
    <div style="text-align:center; margin:20px;">
      <a href="${data.url || '#'}" style="background:${data.color || '#007bff'}; color:white; padding:12px 25px; border-radius:5px; text-decoration:none;">
        ${escapeHTML(data.label || 'Click here')}
      </a>
    </div>`,
};

export const renderBlocks = (blocks: any[]): string => {
  if (!blocks || !blocks.length) return "";
  return blocks.map(block => {
    const renderer = BLOCK_TEMPLATES[block.type];
    return renderer ? renderer(block.data) : ``;
  }).join('');
};

// 3. دالة تجميع الصفحة المصلحة (SEO & Theme)
export const renderFullPage = (page: any, seo: any, canonical: string, blocksHTML: string): string => {
  
  // حماية حقول الـ SEO
  const safeTitle = escapeHTML(seo.title);
  const safeDesc = escapeHTML(seo.description);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <title>${safeTitle}</title>
    <meta name="description" content="${safeDesc}">
    <link rel="canonical" href="${canonical}" />
    
    <meta property="og:title" content="${safeTitle}">
    <meta property="og:description" content="${safeDesc}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="${canonical}">
    <meta property="og:image" content="${seo.openGraph?.image || ''}">

    <style>
        body { font-family: system-ui, sans-serif; padding: 2rem; line-height: 1.5; background: #fafafa; color: #333; }
        .container { max-width: 800px; margin: auto; background: white; padding: 2.5rem; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        h1 { color: #2c3e50; border-bottom: 2px solid #f0f0f0; padding-bottom: 1rem; }
    </style>
</head>
<body>
   <div class="container">
    <h1>${escapeHTML(page.title)}</h1>
    
    ${page.content && page.content !== "{}" && typeof page.content === "string" 
        ? `<div class="content">${escapeHTML(page.content)}</div>` 
        : ""
    }
    
    <hr />
    <div id="blocks-area">
        ${blocksHTML}
    </div>
    
    <footer style="margin-top:30px; font-size:0.8rem; color:#aaa; text-align:center;">
        Rendered at: ${new Date().toLocaleTimeString()}
    </footer>
</div>
</body>
</html>`;
};