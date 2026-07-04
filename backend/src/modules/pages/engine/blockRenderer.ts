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

export const safeURL = (url?: string): string => {
  if (!url) return "#";
  const trimmed = url.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/")) {
    return trimmed;
  }
  return "#";
};

export const safeColor = (color?: string): string => {
  if (!color) return "#007bff";
  const safe = /^#([A-Fa-f0-9]{3}){1,2}$/.test(color) || /^[a-zA-Z]+$/.test(color);
  return safe ? color : "#007bff";
};

/**
 * =========================================================
 * RENDERER FUNCTIONS
 * =========================================================
 */

const renderHeroBlock = (data: any) => `
  <section class="hero" style="padding:50px; text-align:center; background:#f4f4f4; border-radius:10px;">
    <h2>${escapeHTML(data.props?.headline || data.headline || "Hero Title")}</h2>
    ${data.props?.subtext ? `<p>${escapeHTML(data.props.subtext)}</p>` : ""}
  </section>`;

const renderButtonBlock = (data: any) => `
  <div class="button-wrapper" style="text-align:center; margin:20px 0;">
    <a href="${safeURL(data.props?.url || data.url)}" class="btn-primary" 
       style="background:${safeColor(data.props?.color || data.color)}; color:white; padding:12px 25px; border-radius:6px; text-decoration:none;">
      ${escapeHTML(data.props?.label || data.label || "Click here")}
    </a>
  </div>`;

const renderSectionBlock = (data: any, childrenHTML: string) => `
  <section class="pb-section" style="width:100%; padding:40px 0;">
    ${childrenHTML}
  </section>`;

const renderFooterBlock = (data: any, childrenHTML: string) => {
  const style =
    data.style?.desktop || {};

  return `
    <footer
      class="pb-footer"
      style="
        display:flex;
        flex-direction:${style.flexDirection || "column"};
        justify-content:${style.justifyContent || "flex-start"};
        align-items:${style.alignItems || "stretch"};
        gap:${style.gap || "32px"};
        flex-wrap:${style.flexWrap || "wrap"};
        width:100%;
        box-sizing:border-box;
        background:${style.background || style.backgroundColor || "#020617"};
        color:${style.color || "#ffffff"};
        padding:${style.padding || "70px 40px 35px"};
      "
    >
      ${childrenHTML}
    </footer>`;
};

const renderFlexBlock = (
  data: any,
  childrenHTML: string
) => {

  const style =
    data.style?.desktop || {};

  return `
    <div
      class="pb-flex"
      style="
        display:flex;
        flex-direction:${style.flexDirection || "row"};
        justify-content:${style.justifyContent || "flex-start"};
        align-items:${style.alignItems || "stretch"};
        gap:${style.gap || "0px"};
        flex-wrap:${style.flexWrap || "nowrap"};
        width:100%;
        box-sizing:border-box;
      "
    >
      ${childrenHTML}
    </div>`;
};

  

const renderFlexItemBlock = (
  data: any,
  childrenHTML: string
) => {

  const style =
    data.style?.desktop || {};

  return `
    <div
      class="pb-flex-item"
      style="
        flex-grow:${style.flexGrow ?? 0};
        flex-shrink:${style.flexShrink ?? 1};
        flex-basis:${style.flexBasis || "auto"};
        min-width:${style.minWidth || "auto"};
        display:block;
        width:100%;
      "
    >
      ${childrenHTML}
    </div>`;
};

const renderGridBlock = (
  data: any,
  childrenHTML: string
) => `
  <div
    class="pb-grid-container"

    style="
      display:grid;
      gap:${data.style?.desktop?.gap || "24px"};
      width:100%;

      grid-template-columns:

      ${

        data.style?.desktop
          ?.gridTemplateColumns

        ||

        `repeat(${
          data.style?.desktop
            ?.columns || 4
        }, 1fr)`
      };
    "
  >
    ${childrenHTML}
  </div>`;
  

const renderGridItemBlock = (data: any, childrenHTML: string) => `
  <div class="pb-grid-item" style="padding:20px; border:1px solid #eee; border-radius:8px;">
    ${childrenHTML}
  </div>`;

const renderTitleBlock = (data: any) => `
  <h2>
    ${escapeHTML(
      data.props?.content ||
      data.props?.text ||
      "Title"
    )}
  </h2>
`;

const renderTextBlock = (data: any) => `
  <p>
    ${escapeHTML(
      data.props?.content ||
      data.props?.text ||
      "Text"
    )}
  </p>
`;

const renderImageBlock = (data: any) => `<img src="${data.props?.src || ''}" alt="Image" style="width:100%; max-width:100%;" />`;

/**
 * =========================================================
 * BLOCK REGISTRY
 * =========================================================
 */

const BLOCK_RENDERERS: Record<string, (data: any, childrenHTML: string) => string> = {
  hero: (data, children) => renderHeroBlock(data),
  button: (data, children) => renderButtonBlock(data),
  section: renderSectionBlock,
  flex: renderFlexBlock,
  flexItem: renderFlexItemBlock,
  grid: renderGridBlock,
  gridItem: renderGridItemBlock,
  title: (data) => renderTitleBlock(data),
  text: (data) => renderTextBlock(data),
  image: (data) => renderImageBlock(data),
  link: (data) => renderLinkBlock(data),
  input: (data) => renderInputBlock(data),
  textarea: (data) => renderTextareaBlock(data),
  select: (data) => renderSelectBlock(data),
  navbar: renderFlexBlock,
  footer: renderFooterBlock,
};

/**
 * =========================================================
 * RECURSIVE ENGINE
 * =========================================================
 */

export const renderBlocks = (blocks: any[] = []): string => {
  if (!Array.isArray(blocks)) return "";

  return blocks
    .map((block) => {
      const renderer = BLOCK_RENDERERS[block.type];
      if (!renderer) {
        console.warn(`⚠ Unknown block type: ${block.type}`);
        return "";
      }

      // 1. Recursive call for children
      const childrenHTML = (block.children && block.children.length > 0) 
        ? renderBlocks(block.children) 
        : "";

      // 2. Render current block with its children
      return renderer(block.data || {}, childrenHTML);
    })
    .join("");
};

/**
 * =========================================================
 * FULL PAGE RENDERER
 * =========================================================
 */

const safeOptionalURL = (url?: string): string => {
  const safe = safeURL(url);
  return safe === "#" ? "" : safe;
};

const renderMetaName = (
  name: string,
  content?: string
): string => {
  if (!content) return "";

  return `
  <meta name="${escapeHTML(name)}" content="${escapeHTML(content)}" />`;
};

const renderMetaProperty = (
  property: string,
  content?: string
): string => {
  if (!content) return "";

  return `
  <meta property="${escapeHTML(property)}" content="${escapeHTML(content)}" />`;
};

export const renderFullPage = (
  page: any,
  seo: any,
  canonical: string,
  blocksHTML: string
): string => {
  const title =
    seo?.title ||
    page?.title ||
    "Untitled page";

  const description =
    seo?.description ||
    "";

  const canonicalUrl =
    safeOptionalURL(
      seo?.canonical ||
      canonical
    );

  const robots =
    seo?.robots ||
    "index,follow";

  const openGraph =
    seo?.openGraph || {};

  const twitter =
    seo?.twitter || {};

  const ogTitle =
    openGraph.title ||
    title;

  const ogDescription =
    openGraph.description ||
    description;

  const ogImage =
    safeOptionalURL(
      openGraph.image
    );

  const twitterTitle =
    twitter.title ||
    ogTitle;

  const twitterDescription =
    twitter.description ||
    ogDescription;

  const twitterImage =
    safeOptionalURL(
      twitter.image ||
      ogImage
    );

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHTML(title)}</title>
  ${renderMetaName("description", description)}
  ${renderMetaName("robots", robots)}
  ${
    canonicalUrl
      ? `<link rel="canonical" href="${escapeHTML(canonicalUrl)}" />`
      : ""
  }
  ${renderMetaProperty("og:title", ogTitle)}
  ${renderMetaProperty("og:description", ogDescription)}
  ${ogImage ? renderMetaProperty("og:image", ogImage) : ""}
  ${renderMetaProperty("og:type", openGraph.type || "website")}
  ${renderMetaName("twitter:card", twitter.card || "summary_large_image")}
  ${renderMetaName("twitter:title", twitterTitle)}
  ${renderMetaName("twitter:description", twitterDescription)}
  ${twitterImage ? renderMetaName("twitter:image", twitterImage) : ""}
  <style>
    body { font-family: sans-serif; background: #fafafa; padding: 2rem; }
    .container { max-width: 900px; margin: auto; background: white; padding: 2rem; border-radius: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${escapeHTML(page?.title)}</h1>
    <div id="blocks-area">${blocksHTML}</div>
  </div>
</body>
</html>`;
};
const renderLinkBlock = (data: any) => `
  <a href="${safeURL(data.props?.href || data.props?.url)}">
    ${escapeHTML(data.props?.label || data.props?.text || "Link")}
  </a>
`;

const renderInputBlock = (data: any) => `
  <input
    type="${escapeHTML(data.props?.type || "text")}"
    name="${escapeHTML(data.props?.name || "")}"
    placeholder="${escapeHTML(data.props?.placeholder || "")}"
    style="width:100%;padding:12px;border:1px solid #ddd;border-radius:8px;margin-bottom:12px;"
  />
`;

const renderTextareaBlock = (data: any) => `
  <textarea
    name="${escapeHTML(data.props?.name || "")}"
    placeholder="${escapeHTML(data.props?.placeholder || "")}"
    style="width:100%;padding:12px;border:1px solid #ddd;border-radius:8px;margin-bottom:12px;min-height:120px;"
  ></textarea>
`;

const renderSelectBlock = (data: any) => `
  <select style="width:100%;padding:12px;border:1px solid #ddd;border-radius:8px;margin-bottom:12px;">
    <option>${escapeHTML(data.props?.placeholder || "Select option")}</option>
  </select>
`;
