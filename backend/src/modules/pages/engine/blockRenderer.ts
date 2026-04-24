// دالة الحماية من الـ XSS
export const escapeHTML = (str: string): string => {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// دالة تحويل الـ Blocks لـ HTML
export const renderBlocks = (blocks: any[]): string => {
  if (!blocks || !blocks.length) return "";
  return blocks.map(block => {
    switch (block.type) {
      case 'hero': 
        return `<section class="hero" style="background:#eee; padding:40px; text-align:center;">
                  <h2>${escapeHTML(block.data.text)}</h2>
                </section>`;
      case 'text': 
        return `<div class="text-block" style="margin:20px 0;">
                  <p>${escapeHTML(block.data.content)}</p>
                </div>`;
      default: 
        return ``;
    }
  }).join('');
};

// دالة تجميع الصفحة كاملة
export const renderFullPage = (page: any, seo: any, canonical: string, blocksHTML: string): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${seo.title}</title>
    <meta name="description" content="${seo.description}">
    <link rel="canonical" href="${canonical}" />
    <meta property="og:title" content="${seo.openGraph?.title || seo.title}">
    <meta property="og:url" content="${canonical}">
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; padding: 2rem; line-height: 1.5; background: #fafafa; color: #333; }
        .container { max-width: 800px; margin: auto; background: white; padding: 2.5rem; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        h1 { color: #2c3e50; border-bottom: 2px solid #f0f0f0; padding-bottom: 1rem; }
        .content { margin-bottom: 2rem; font-size: 1.1rem; }
        hr { border: 0; border-top: 1px solid #eee; margin: 2rem 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>${escapeHTML(page.title)}</h1>
        <div class="content">${escapeHTML(page.content)}</div>
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