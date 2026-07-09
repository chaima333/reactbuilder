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

const renderCTABlock = (data: any) => `
  <section class="cta" style="padding:50px; text-align:center; background:#00C49A; color:white; border-radius:10px; margin:20px 0;">
    <h3 style="font-size:2rem;margin:0 0 16px 0;">
      ${escapeHTML(data.props?.title || data.title || "Ready to start?")}
    </h3>
    ${data.props?.subtext ? `<p style="font-size:1.1rem;opacity:0.9;">${escapeHTML(data.props.subtext)}</p>` : ''}
    ${data.props?.buttonText ? `
      <a href="${safeURL(data.props?.buttonUrl || '#')}" style="
        display:inline-block;
        padding:12px 32px;
        background:white;
        color:#00C49A;
        border-radius:50px;
        text-decoration:none;
        font-weight:600;
        margin-top:16px;
      ">
        ${escapeHTML(data.props.buttonText)}
      </a>
    ` : ''}
  </section>
`;

const renderFeaturesBlock = (data: any) => {
  const features = data.props?.features || data.features || [];
  
  return `
    <section class="features" style="padding:50px 0; text-align:center;">
      <h3 style="font-size:2rem;margin:0 0 40px 0;">
        ${escapeHTML(data.props?.title || data.title || "Our Features")}
      </h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:24px;">
        ${features.map((feature: any, i: number) => `
          <div style="padding:20px;border:1px solid #e0e0e0;border-radius:12px;">
            ${feature.icon ? `<div style="font-size:2rem;">${feature.icon}</div>` : ''}
            <h4 style="margin:12px 0 8px 0;">${escapeHTML(feature.title || `Feature ${i+1}`)}</h4>
            ${feature.description ? `<p style="color:#666;font-size:0.95rem;">${escapeHTML(feature.description)}</p>` : ''}
          </div>
        `).join('')}
      </div>
    </section>
  `;
};

const renderFAQBlock = (data: any) => {
  const items = data.props?.items || data.items || [];
  
  return `
    <section class="faq" style="padding:50px 0; text-align:center;">
      <h3 style="font-size:2rem;margin:0 0 40px 0;">
        ${escapeHTML(data.props?.title || data.title || "Frequently Asked Questions")}
      </h3>
      <div style="max-width:800px;margin:0 auto;text-align:left;">
        ${items.map((item: any, i: number) => `
          <div style="padding:16px 20px;border-bottom:1px solid #e0e0e0;">
            <h4 style="margin:0 0 8px 0;font-weight:600;">${escapeHTML(item.question || `Question ${i+1}`)}</h4>
            <p style="margin:0;color:#666;">${escapeHTML(item.answer || 'Answer here...')}</p>
          </div>
        `).join('')}
      </div>
    </section>
  `;
};

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

/**
 * =========================================================
 * COLLECTION LIST RENDERER (CMS)
 * =========================================================
 */
const renderCollectionListBlock = async (data: any, siteId: number) => {
  const collectionSlug = data.props?.collectionSlug;
  const titleField = data.props?.titleField || 'title';
  const descriptionField = data.props?.descriptionField || 'description';
  const columns = data.props?.columns || 3;

  if (!collectionSlug || !siteId) {
    return `
      <div class="collection-list-error" style="padding:20px;text-align:center;color:#999;">
        Collection not configured
      </div>
    `;
  }

  try {
    const { CmsService } = require('../../cms/cms.service');
    const entries = await CmsService.getPublishedEntriesByCollectionSlug(
      Number(siteId),
      collectionSlug
    );

    if (!entries || entries.length === 0) {
      return `
        <div class="collection-list-empty" style="padding:40px;text-align:center;color:#999;">
          No entries found
        </div>
      `;
    }

    return `
      <div class="collection-list" style="
        display:grid;
        grid-template-columns:repeat(${columns}, 1fr);
        gap:24px;
        padding:20px 0;
        max-width:1200px;
        margin:0 auto;
      ">
        ${entries.map((entry: any) => {
          const title = entry.data?.[titleField] || entry.slug || 'Untitled';
          const description = entry.data?.[descriptionField] || '';
          
          return `
            <div class="collection-item" style="
              padding:20px;
              border:1px solid #e0e0e0;
              border-radius:12px;
              background:#ffffff;
              transition:transform 0.2s;
            ">
              <h3 style="
                margin:0 0 8px 0;
                font-size:1.2rem;
                font-weight:600;
                color:#0D0D0D;
              ">
                ${escapeHTML(title)}
              </h3>
              ${description ? `
                <p style="
                  margin:0;
                  color:#666;
                  font-size:0.95rem;
                  line-height:1.5;
                ">
                  ${escapeHTML(description)}
                </p>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;
  } catch (error) {
    console.error('CollectionList render error:', error);
    return `
      <div class="collection-list-error" style="padding:20px;text-align:center;color:#e74c3c;">
        Failed to load collection entries
      </div>
    `;
  }
};

/**
 * =========================================================
 * BLOCK REGISTRY
 * =========================================================
 */

const BLOCK_RENDERERS: Record<string, (data: any, childrenHTML: string, siteId?: number) => string | Promise<string>> = {
  hero: (data, children) => renderHeroBlock(data),
  cta: (data, children) => renderCTABlock(data),
  features: (data, children) => renderFeaturesBlock(data),
  faq: (data, children) => renderFAQBlock(data),
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
  collectionList: async (data, children, siteId) => {
    return await renderCollectionListBlock(data, siteId || 0);
  },
};

/**
 * =========================================================
 * RECURSIVE ENGINE
 * =========================================================
 */

export const renderBlocks = (blocks: any[] = [], siteId?: number): string => {
  if (!Array.isArray(blocks)) return "";

  return blocks
    .map((block) => {
      const renderer = BLOCK_RENDERERS[block.type];
      if (!renderer) {
        console.warn(`⚠ Unknown block type: ${block.type}`);
        return "";
      }

      const childrenHTML = (block.children && block.children.length > 0) 
        ? renderBlocks(block.children, siteId) 
        : "";

      // ✅ Appel du renderer avec siteId
      return renderer(block.data || {}, childrenHTML, siteId);
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