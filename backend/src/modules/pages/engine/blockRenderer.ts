
/**
 * =========================================================
 * SAFE HTML HELPERS
 * =========================================================
 */

export const escapeHTML = (str: string = ""): string => {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

/**
 * =========================================================
 * SAFE URL SANITIZER
 * =========================================================
 */

export const safeURL = (url?: string): string => {
  if (!url) return "#";

  const trimmed = url.trim();

  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/")
  ) {
    return trimmed;
  }

  return "#";
};

/**
 * =========================================================
 * SAFE COLOR SANITIZER
 * =========================================================
 */

export const safeColor = (color?: string): string => {
  if (!color) return "#007bff";

  const safe =
    /^#([A-Fa-f0-9]{3}){1,2}$/.test(color) ||
    /^[a-zA-Z]+$/.test(color);

  return safe ? color : "#007bff";
};

/**
 * =========================================================
 * BLOCK TYPES
 * =========================================================
 */

interface HeroBlockData {
  headline?: string;
  text?: string;
  subtext?: string;
}

interface ButtonBlockData {
  label?: string;
  url?: string;
  color?: string;
}

/**
 * =========================================================
 * BLOCK RENDERERS
 * =========================================================
 */

const renderHeroBlock = (data: HeroBlockData): string => {
  const title = data.headline || data.text || "";
  const subtext = data.subtext || "";

  return `
    <section class="hero">
      <h2>${escapeHTML(title)}</h2>

      ${
        subtext
          ? `<p>${escapeHTML(subtext)}</p>`
          : ""
      }
    </section>
  `;
};

const renderButtonBlock = (
  data: ButtonBlockData
): string => {
  return `
    <div class="button-wrapper">
      <a
        href="${safeURL(data.url)}"
        class="btn-primary"
        style="background:${safeColor(data.color)}"
      >
        ${escapeHTML(data.label || "Click here")}
      </a>
    </div>
  `;
};

/**
 * =========================================================
 * BLOCK REGISTRY
 * =========================================================
 */

const BLOCK_RENDERERS: Record<
  string,
  (data: any) => string
> = {
  hero: renderHeroBlock,
  button: renderButtonBlock,
};

/**
 * =========================================================
 * RENDER BLOCKS
 * =========================================================
 */

export const renderBlocks = (
  blocks: any[] = []
): string => {
  if (!Array.isArray(blocks)) {
    return "";
  }

  return blocks
    .map((block) => {
      if (!block?.type) return "";

      const renderer =
        BLOCK_RENDERERS[block.type];

      if (!renderer) {
        console.warn(
          `⚠ Unknown block type: ${block.type}`
        );

        return "";
      }

      try {
        return renderer(block.data || {});
      } catch (error) {
        console.error(
          `❌ Failed rendering block: ${block.type}`
        );

        return "";
      }
    })
    .join("");
};

/**
 * =========================================================
 * SEO TYPES
 * =========================================================
 */

interface SEOData {
  title?: string;
  description?: string;

  openGraph?: {
    image?: string;
  };
}

/**
 * =========================================================
 * FULL PAGE RENDERER
 * =========================================================
 */

export const renderFullPage = (
  page: any,
  seo: SEOData,
  canonical: string,
  blocksHTML: string
): string => {

  const safeTitle = escapeHTML(
    seo?.title || page?.title || "Untitled Page"
  );

  const safeDescription = escapeHTML(
    seo?.description || ""
  );

  const safeCanonical =
    safeURL(canonical);

 const rawContent =
  typeof page?.content === "string"
    ? page.content.trim()
    : "";

const content =
  rawContent &&
  rawContent !== "{}" &&
  rawContent !== "null"
    ? escapeHTML(rawContent)
    : "";
    

  return `
<!DOCTYPE html>
<html lang="en">

<head>

  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>${safeTitle}</title>

  <meta
    name="description"
    content="${safeDescription}"
  />

  <link
    rel="canonical"
    href="${safeCanonical}"
  />

  <meta
    property="og:title"
    content="${safeTitle}"
  />

  <meta
    property="og:description"
    content="${safeDescription}"
  />

  <meta
    property="og:type"
    content="article"
  />

  <meta
    property="og:url"
    content="${safeCanonical}"
  />

  <meta
    property="og:image"
    content="${escapeHTML(
      seo?.openGraph?.image || ""
    )}"
  />

  <style>

    body {
      font-family: system-ui, sans-serif;
      padding: 2rem;
      line-height: 1.5;
      background: #fafafa;
      color: #333;
    }

    .container {
      max-width: 900px;
      margin: auto;
      background: white;
      padding: 2.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.05);
    }

    h1 {
      color: #2c3e50;
      border-bottom: 2px solid #f0f0f0;
      padding-bottom: 1rem;
      margin-bottom: 2rem;
    }

    .hero {
      background: #f4f4f4;
      padding: 50px;
      text-align: center;
      border-radius: 10px;
      margin-bottom: 20px;
    }

    .button-wrapper {
      text-align: center;
      margin: 20px 0;
    }

    .btn-primary {
      color: white;
      padding: 12px 25px;
      border-radius: 6px;
      text-decoration: none;
      display: inline-block;
    }

    .content {
      margin-bottom: 2rem;
    }

    footer {
      margin-top: 40px;
      font-size: 0.8rem;
      color: #999;
      text-align: center;
    }

  </style>

</head>

<body>

  <div class="container">

    <h1>
      ${escapeHTML(page?.title || "Untitled")}
    </h1>

    ${
      content
        ? `
        <div class="content">
          ${content}
        </div>
      `
        : ""
    }

    <div id="blocks-area">
      ${blocksHTML}
    </div>

    <footer>
      Rendered at:
      ${new Date().toLocaleTimeString()}
    </footer>

  </div>

</body>

</html>
  `;
};