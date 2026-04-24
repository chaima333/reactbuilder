export const escapeHTML = (str: string) => {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

export const renderBlocks = (blocks: any[]) => {
  if (!blocks || !blocks.length) return "";
  return blocks.map(block => {
    switch (block.type) {
      case 'hero': return `<section class="hero"><h2>${escapeHTML(block.data.text)}</h2></section>`;
      case 'text': return `<p>${escapeHTML(block.data.content)}</p>`;
      default: return ``;
    }
  }).join('');
};

export const renderFullPage = (page: any, seo: any, canonical: string, blocksHTML: string) => {
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
        body { font-family: system-ui; padding: 2rem; line-height: 1.5; background: #fafafa; }
        .container { max-width: 800px; margin: auto; background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    </style>
</head>
<body>
    <div class="container">
        <h1>${escapeHTML(page.title)}</h1>
        <div class="content">${escapeHTML(page.content)}</div>
        <hr />
        <div id="blocks-area">${blocksHTML}</div>
    </div>
</body>
</html>`;
};