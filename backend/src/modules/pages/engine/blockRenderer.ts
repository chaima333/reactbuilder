/**
 * =========================================================
 * SAFE HTML HELPERS
 * =========================================================
 */

import { resolveBindings } from "../../cms/utils/binding.resolver";

export const escapeHTML = (value: unknown = ""): string => {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

export const safeURL = (url?: string): string => {
  if (!url) {
    return "#";
  }

  const trimmed = String(url).trim();

  if (!trimmed || /[\u0000-\u001F\u007F]/.test(trimmed)) {
    return "#";
  }

  if (trimmed.startsWith("#")) {
    return trimmed;
  }

  if (
    trimmed.startsWith("/") &&
    !trimmed.startsWith("//")
  ) {
    return trimmed;
  }

  if (
    trimmed.startsWith("./") ||
    trimmed.startsWith("../")
  ) {
    return trimmed;
  }

  if (/^mailto:[^\s@]+@[^\s@]+$/i.test(trimmed)) {
    return trimmed;
  }

  if (/^tel:\+?[0-9()\-\s]+$/i.test(trimmed)) {
    return trimmed;
  }

  if (
  /^data:image\/(?:png|jpeg|jpg|gif|webp|svg\+xml);base64,[a-zA-Z0-9+/=\s]+$/i.test(
    trimmed
  )
) {
  return trimmed;
}
  try {
    const parsed = new URL(trimmed);

    if (
      parsed.protocol === "http:" ||
      parsed.protocol === "https:"
    ) {
      return parsed.toString();
    }
  } catch {
    return "#";
  }

  return "#";
};

export const safeColor = (color?: string): string => {
  if (!color) {
    return "#007bff";
  }

  const trimmed = String(color).trim();

  const isHex =
    /^#(?:[A-Fa-f0-9]{3}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/.test(
      trimmed
    );

  const isNamedColor =
    /^[a-zA-Z]+$/.test(trimmed);

  const isRgb =
    /^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\)$/.test(
      trimmed
    );

  const isCssVariable =
    /^var\(--[a-zA-Z0-9-_]+\)$/.test(trimmed);

  return isHex ||
    isNamedColor ||
    isRgb ||
    isCssVariable
    ? trimmed
    : "#007bff";
};

const normalizeGridColumns = (
  value: unknown,
  fallback = 3
): number => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(
    12,
    Math.max(1, Math.trunc(parsed))
  );
};

type ResponsiveStyle = {
  desktop?: Record<string, unknown>;
  tablet?: Record<string, unknown>;
  mobile?: Record<string, unknown>;
};

type RenderContext = {
  responsiveCss: string[];
  nextBlockId: number;
};

const UNIT_LESS_CSS_PROPS = new Set([
  "animationIterationCount",
  "aspectRatio",
  "borderImageOutset",
  "borderImageSlice",
  "borderImageWidth",
  "boxFlex",
  "boxFlexGroup",
  "boxOrdinalGroup",
  "columnCount",
  "columns",
  "flex",
  "flexGrow",
  "flexPositive",
  "flexShrink",
  "flexNegative",
  "flexOrder",
  "fontWeight",
  "gridArea",
  "gridColumn",
  "gridColumnEnd",
  "gridColumnStart",
  "gridRow",
  "gridRowEnd",
  "gridRowStart",
  "lineClamp",
  "lineHeight",
  "opacity",
  "order",
  "orphans",
  "tabSize",
  "widows",
  "zIndex",
  "zoom",
]);

const isRecord = (
  value: unknown
): value is Record<string, unknown> => {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
};

const isResponsiveStyle = (
  value: unknown
): value is ResponsiveStyle => {
  return (
    isRecord(value) &&
    (
      isRecord(value.desktop) ||
      isRecord(value.tablet) ||
      isRecord(value.mobile)
    )
  );
};

const toKebabCase = (
  value: string
): string => {
  return value
    .replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)
    .replace(/^ms-/, "-ms-");
};

const sanitizeCssValue = (
  key: string,
  value: unknown
): string => {
  if (
    value === null ||
    value === undefined ||
    typeof value === "boolean" ||
    typeof value === "function" ||
    isRecord(value) ||
    Array.isArray(value)
  ) {
    return "";
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      return "";
    }

    return UNIT_LESS_CSS_PROPS.has(key)
      ? String(value)
      : `${value}px`;
  }

  const trimmed =
    String(value)
      .trim();

  if (!trimmed) {
    return "";
  }

  if (
    /[\u0000-\u001F\u007F]/.test(trimmed) ||
    /<|>|expression\s*\(|javascript:/i.test(trimmed)
  ) {
    return "";
  }

  return trimmed;
};

const serializeStyleObject = (
  style: Record<string, unknown> = {},
  important = false
): string => {
  return Object
    .entries(style)
    .map(([key, value]) => {
      if (
        key.startsWith("__") ||
        key === "children" ||
        key === "zoom" ||
        !/^[a-zA-Z][a-zA-Z0-9-]*$/.test(key)
      ) {
        return "";
      }

      const safeValue =
        sanitizeCssValue(
          key,
          value
        );

      if (!safeValue) {
        return "";
      }

      return `${toKebabCase(key)}:${safeValue}${important ? " !important" : ""};`;
    })
    .filter(Boolean)
    .join("");
};

const mergeStyles = (
  ...styles: Array<Record<string, unknown> | undefined>
): Record<string, unknown> => {
  return Object.assign(
    {},
    ...styles.filter(isRecord)
  );
};

const extractResponsiveStyle = (
  data: any
): ResponsiveStyle => {
  const dataStyle =
    data?.style;

  const propsStyle =
    data?.props?.style;

  const result: ResponsiveStyle = {
    desktop: {},
    tablet: {},
    mobile: {},
  };

  if (isResponsiveStyle(propsStyle)) {
    result.desktop = mergeStyles(result.desktop, propsStyle.desktop);
    result.tablet = mergeStyles(result.tablet, propsStyle.tablet);
    result.mobile = mergeStyles(result.mobile, propsStyle.mobile);
  } else if (isRecord(propsStyle)) {
    result.desktop = mergeStyles(result.desktop, propsStyle);
  }

  if (isResponsiveStyle(dataStyle)) {
    result.desktop = mergeStyles(result.desktop, dataStyle.desktop);
    result.tablet = mergeStyles(result.tablet, dataStyle.tablet);
    result.mobile = mergeStyles(result.mobile, dataStyle.mobile);
  } else if (isRecord(dataStyle)) {
    result.desktop = mergeStyles(result.desktop, dataStyle);
  }

  return result;
};

const registerBlockCss = (
  data: any,
  defaults: Record<string, unknown> = {}
): string => {
  const className =
    data?.__rbClassName ||
    "rb-block";

  const context =
    data?.__rbContext as RenderContext | undefined;

  const responsive =
    extractResponsiveStyle(data);

  const desktop =
    mergeStyles(
      defaults,
      responsive.desktop
    );

  const tablet =
    mergeStyles(
      desktop,
      responsive.tablet
    );

  const mobile =
    mergeStyles(
      desktop,
      responsive.tablet,
      responsive.mobile
    );

  const desktopCss =
    serializeStyleObject(desktop);

  const tabletCss =
    serializeStyleObject(tablet, true);

  const mobileCss =
    serializeStyleObject(mobile, true);

  if (context) {
    if (desktopCss) {
      context.responsiveCss.push(
        `.${className}{${desktopCss}}`
      );
    }

    if (tabletCss) {
      context.responsiveCss.push(
        `@media (min-width:601px) and (max-width:1024px){.${className}{${tabletCss}}}`
      );
    }

    if (mobileCss) {
      context.responsiveCss.push(
        `@media (max-width:600px){.${className}{${mobileCss}}}`
      );
    }
  }

  return className;
};

const getDesktopStyle = (
  data: any
): Record<string, unknown> => {
  return extractResponsiveStyle(data).desktop || {};
};

/**
 * =========================================================
 * RENDERER FUNCTIONS
 * =========================================================
 */

const renderHeroBlock = (data: any): string => {
  const className =
    registerBlockCss(data, {
      padding: "50px",
      textAlign: "center",
      background: "#f4f4f4",
      borderRadius: "10px",
      width: "100%",
    });

  return `
  <section
    class="hero ${className}"
  >
    <h2>${escapeHTML(
      data.props?.headline ||
        data.headline ||
        "Hero Title"
    )}</h2>

    ${
      data.props?.subtext
        ? `<p>${escapeHTML(data.props.subtext)}</p>`
        : ""
    }
  </section>`;
};

const renderCTABlock = (data: any): string => {
  const className =
    registerBlockCss(data, {
      padding: "50px",
      textAlign: "center",
      background: "#00C49A",
      color: "white",
      borderRadius: "10px",
      margin: "20px 0",
      width: "100%",
    });

  return `
  <section
    class="cta ${className}"
  >
    <h3 style="font-size:2rem;margin:0 0 16px 0;">
      ${escapeHTML(
        data.props?.title ||
          data.title ||
          "Ready to start?"
      )}
    </h3>

    ${
      data.props?.subtext
        ? `<p style="font-size:1.1rem;opacity:0.9;">${escapeHTML(
            data.props.subtext
          )}</p>`
        : ""
    }

    ${
      data.props?.buttonText
        ? `
      <a
        href="${escapeHTML(
          safeURL(
            data.props?.buttonUrl ||
              "#"
          )
        )}"
        style="
          display:inline-block;
          padding:12px 32px;
          background:white;
          color:#00C49A;
          border-radius:50px;
          text-decoration:none;
          font-weight:600;
          margin-top:16px;
        "
      >
        ${escapeHTML(data.props.buttonText)}
      </a>`
        : ""
    }
  </section>`;
};

const renderFeaturesBlock = (data: any): string => {
  const features = Array.isArray(
    data.props?.features || data.features
  )
    ? data.props?.features || data.features
    : [];

  const className =
    registerBlockCss(data, {
      padding: "50px 0",
      textAlign: "center",
      width: "100%",
    });

  return `
    <section
      class="features ${className}"
    >
      <h3 style="font-size:2rem;margin:0 0 40px 0;">
        ${escapeHTML(
          data.props?.title ||
            data.title ||
            "Our Features"
        )}
      </h3>

      <div
        style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:24px;"
      >
        ${features
          .map(
            (feature: any, index: number) => `
          <div
            style="padding:20px;border:1px solid #e0e0e0;border-radius:12px;"
          >
            ${
              feature?.icon
                ? `<div style="font-size:2rem;">${escapeHTML(
                    feature.icon
                  )}</div>`
                : ""
            }

            <h4 style="margin:12px 0 8px 0;">
              ${escapeHTML(
                feature?.title ||
                  `Feature ${index + 1}`
              )}
            </h4>

            ${
              feature?.description
                ? `<p style="color:#666;font-size:0.95rem;">${escapeHTML(
                    feature.description
                  )}</p>`
                : ""
            }
          </div>`
          )
          .join("")}
      </div>
    </section>`;
};

const renderFAQBlock = (data: any): string => {
  const items = Array.isArray(
    data.props?.items || data.items
  )
    ? data.props?.items || data.items
    : [];

  const className =
    registerBlockCss(data, {
      padding: "50px 0",
      textAlign: "center",
      width: "100%",
    });

  return `
    <section
      class="faq ${className}"
    >
      <h3 style="font-size:2rem;margin:0 0 40px 0;">
        ${escapeHTML(
          data.props?.title ||
            data.title ||
            "Frequently Asked Questions"
        )}
      </h3>

      <div
        style="max-width:800px;margin:0 auto;text-align:left;"
      >
        ${items
          .map(
            (item: any, index: number) => `
          <div
            style="padding:16px 20px;border-bottom:1px solid #e0e0e0;"
          >
            <h4 style="margin:0 0 8px 0;font-weight:600;">
              ${escapeHTML(
                item?.question ||
                  `Question ${index + 1}`
              )}
            </h4>

            <p style="margin:0;color:#666;">
              ${escapeHTML(
                item?.answer ||
                  "Answer here..."
              )}
            </p>
          </div>`
          )
          .join("")}
      </div>
    </section>`;
};

const renderButtonBlock = (data: any): string => {
  const className =
    registerBlockCss(data, {
      display: "inline-block",
      background: safeColor(data.props?.color || data.color),
      color: "white",
      padding: "12px 25px",
      borderRadius: "6px",
      textDecoration: "none",
    });

  return `
  <div
    class="button-wrapper"
    style="text-align:center;margin:20px 0;"
  >
    <a
      href="${escapeHTML(
        safeURL(
          data.props?.url ||
            data.url
        )
      )}"
      class="btn-primary ${className}"
    >
      ${escapeHTML(
        data.props?.label ||
          data.label ||
          "Click here"
      )}
    </a>
  </div>`;
};

const renderSectionBlock = (
  data: any,
  childrenHTML: string
): string => {
  const className =
    registerBlockCss(data, {
      width: "100%",
      padding: "40px 0",
    });

  return `
  <section
    class="pb-section ${className}"
  >
    ${childrenHTML}
  </section>`;
};

const renderFooterBlock = (
  data: any,
  childrenHTML: string
): string => {
  const style =
    getDesktopStyle(data);

  const className =
    registerBlockCss(data, {
      display: "flex",
      flexDirection: style.flexDirection || "column",
      justifyContent: style.justifyContent || "flex-start",
      alignItems: style.alignItems || "stretch",
      gap: style.gap || "32px",
      flexWrap: style.flexWrap || "wrap",
      width: "100%",
      boxSizing: "border-box",
      background: style.background || style.backgroundColor || "#020617",
      color: style.color || "#ffffff",
      padding: style.padding || "70px 40px 35px",
    });

  return `
    <footer
      class="pb-footer ${className}"
    >
      ${childrenHTML}
    </footer>`;
};

const renderFlexBlock = (
  data: any,
  childrenHTML: string
): string => {
  const style =
    getDesktopStyle(data);

  const className =
    registerBlockCss(data, {
      display: "flex",
      flexDirection: style.flexDirection || "row",
      justifyContent: style.justifyContent || "flex-start",
      alignItems: style.alignItems || "stretch",
      gap: style.gap || "0px",
      flexWrap: style.flexWrap || "nowrap",
      width: "100%",
      boxSizing: "border-box",
    });

  return `
    <div
      class="pb-flex ${className}"
    >
      ${childrenHTML}
    </div>`;
};

const renderFlexItemBlock = (
  data: any,
  childrenHTML: string
): string => {
  const style =
    getDesktopStyle(data);

  const className =
    registerBlockCss(data, {
      flexGrow: style.flexGrow ?? 0,
      flexShrink: style.flexShrink ?? 1,
      flexBasis: style.flexBasis || "auto",
      minWidth: style.minWidth || "auto",
      display: "block",
      width: "100%",
    });

  return `
    <div
      class="pb-flex-item ${className}"
    >
      ${childrenHTML}
    </div>`;
};

const renderGridBlock = (
  data: any,
  childrenHTML: string
): string => {
  const style =
    getDesktopStyle(data);

  const columns =
    normalizeGridColumns(
      style.columns,
      4
    );

  const template =
    typeof style.gridTemplateColumns === "string" &&
    style.gridTemplateColumns.trim()
      ? style.gridTemplateColumns.trim()
      : `repeat(${columns}, 1fr)`;

  const className =
    registerBlockCss(data, {
      display: "grid",
      gap: style.gap || "24px",
      width: "100%",
      gridTemplateColumns: template,
    });

  return `
    <div
      class="pb-grid-container ${className}"
    >
      ${childrenHTML}
    </div>`;
};

const renderGridItemBlock = (
  data: any,
  childrenHTML: string
): string => {
  const className =
    registerBlockCss(data, {
      padding: "20px",
      border: "1px solid #eee",
      borderRadius: "8px",
    });

  return `
  <div
    class="pb-grid-item ${className}"
  >
    ${childrenHTML}
  </div>`;
};

const renderTitleBlock = (data: any): string => {
  const resolvedData =
    resolveBindings(data, data);

  const text =
    resolvedData?.props?.text ||
    resolvedData?.props?.content ||
    "Title";

  const className =
    registerBlockCss(data, {});

  return `
    <h2 class="${className}">${escapeHTML(text)}</h2>`;
};

const renderTextBlock = (data: any): string => {
  const resolvedData =
    resolveBindings(data, data);

  const text =
    resolvedData?.props?.text ||
    resolvedData?.props?.content ||
    "Text";

  const className =
    registerBlockCss(data, {});

  return `
    <p class="${className}">${escapeHTML(text)}</p>`;
};

const renderImageBlock = (data: any): string => {
  const source =
    safeURL(data.props?.src || "");

  const alt =
    data.props?.alt ||
    data.alt ||
    "Image";

  if (source === "#") {
    return "";
  }

  const className =
    registerBlockCss(data, {
      display: "block",
      width: "100%",
      maxWidth: "100%",
      height: "auto",
    });

  return `
    <img
      src="${escapeHTML(source)}"
      alt="${escapeHTML(alt)}"
      loading="lazy"
      class="${className}"
    />`;
};

const renderLinkBlock = (data: any): string => {
  const className =
    registerBlockCss(data, {});

  return `
  <a
    class="${className}"
    href="${escapeHTML(
      safeURL(
        data.props?.href ||
          data.props?.url
      )
    )}"
  >
    ${escapeHTML(
      data.props?.label ||
        data.props?.text ||
        "Link"
    )}
  </a>`;
};

const renderInputBlock = (data: any): string => {
  const className =
    registerBlockCss(data, {
      width: "100%",
      padding: "12px",
      border: "1px solid #ddd",
      borderRadius: "8px",
      marginBottom: "12px",
    });

  return `
  <input
    type="${escapeHTML(
      data.props?.type ||
        "text"
    )}"
    name="${escapeHTML(
      data.props?.name ||
        ""
    )}"
    placeholder="${escapeHTML(
      data.props?.placeholder ||
        ""
    )}"
    ${data.props?.required ? "required" : ""}
    class="${className}"
  />`;
};

const renderTextareaBlock = (data: any): string => {
  const className =
    registerBlockCss(data, {
      width: "100%",
      padding: "12px",
      border: "1px solid #ddd",
      borderRadius: "8px",
      marginBottom: "12px",
      minHeight: "120px",
    });

  return `
  <textarea
    name="${escapeHTML(
      data.props?.name ||
        ""
    )}"
    placeholder="${escapeHTML(
      data.props?.placeholder ||
        ""
    )}"
    ${data.props?.required ? "required" : ""}
    class="${className}"
  ></textarea>`;
};

const renderSelectBlock = (data: any): string => {
  const options = Array.isArray(
    data.props?.options
  )
    ? data.props.options
    : [];

  const className =
    registerBlockCss(data, {
      width: "100%",
      padding: "12px",
      border: "1px solid #ddd",
      borderRadius: "8px",
      marginBottom: "12px",
    });

  return `
    <select
      name="${escapeHTML(
        data.props?.name ||
          ""
      )}"
      ${data.props?.required ? "required" : ""}
      class="${className}"
    >
      <option value="">
        ${escapeHTML(
          data.props?.placeholder ||
            "Select option"
        )}
      </option>

      ${options
        .map((option: any) => {
          const label =
            typeof option === "string"
              ? option
              : option?.label ||
                option?.value ||
                "";

          const value =
            typeof option === "string"
              ? option
              : option?.value ||
                option?.label ||
                "";

          return `<option value="${escapeHTML(
            value
          )}">${escapeHTML(label)}</option>`;
        })
        .join("")}
    </select>`;
};

/**
 * =========================================================
 * COLLECTION LIST RENDERER (CMS)
 * =========================================================
 */

const renderCollectionListBlock = async (
  data: any,
  siteId: number
): Promise<string> => {
  const collectionSlug =
    data.props?.collectionSlug;

  const titleField =
    data.props?.titleField ||
    "title";

  const descriptionField =
    data.props?.descriptionField ||
    "description";

  const columns =
    normalizeGridColumns(
      data.props?.columns,
      3
    );

  const className =
    registerBlockCss(data, {
      display: "grid",
      gridTemplateColumns: `repeat(${columns},minmax(0,1fr))`,
      gap: "24px",
      padding: "20px 0",
      width: "100%",
    });

  if (!collectionSlug || !siteId) {
    return `
      <div
        class="collection-list-error"
        style="padding:20px;text-align:center;color:#999;"
      >
        Collection not configured
      </div>`;
  }

  try {
    const { CmsService } =
      require("../../cms/cms.service");

    const entries =
      await CmsService
        .getPublishedEntriesByCollectionSlug(
          Number(siteId),
          collectionSlug
        );

    if (
      !Array.isArray(entries) ||
      entries.length === 0
    ) {
      return `
        <div
          class="collection-list-empty"
          style="padding:40px;text-align:center;color:#999;"
        >
          No entries found
        </div>`;
    }

    return `
      <div
        class="collection-list ${className}"
      >
        ${entries
          .map((entry: any) => {
            const entryData =
              entry?.data &&
              typeof entry.data === "object"
                ? entry.data
                : entry || {};

            const title =
              entryData?.[titleField] ||
              entry?.slug ||
              "Untitled";

            const description =
              entryData?.[descriptionField] ||
              "";

            return `
              <article
                class="collection-item"
                style="
                  padding:20px;
                  border:1px solid #e0e0e0;
                  border-radius:12px;
                  background:#ffffff;
                "
              >
                <h3
                  style="
                    margin:0 0 8px 0;
                    font-size:1.2rem;
                    font-weight:600;
                    color:#0D0D0D;
                  "
                >
                  ${escapeHTML(title)}
                </h3>

                ${
                  description
                    ? `
                <p
                  style="
                    margin:0;
                    color:#666;
                    font-size:0.95rem;
                    line-height:1.5;
                  "
                >
                  ${escapeHTML(description)}
                </p>`
                    : ""
                }
              </article>`;
          })
          .join("")}
      </div>`;
  } catch (error) {
    console.error(
      "COLLECTION_LIST_RENDER_ERROR",
      error
    );

    return `
      <div
        class="collection-list-error"
        style="padding:20px;text-align:center;color:#e74c3c;"
      >
        Failed to load collection entries
      </div>`;
  }
};

/**
 * =========================================================
 * BLOCK REGISTRY
 * =========================================================
 */

type BlockRenderer = (
  data: any,
  childrenHTML: string,
  siteId?: number
) => string | Promise<string>;

const BLOCK_RENDERERS: Record<
  string,
  BlockRenderer
> = {
  hero: (data) =>
    renderHeroBlock(data),

  cta: (data) =>
    renderCTABlock(data),

  features: (data) =>
    renderFeaturesBlock(data),

  faq: (data) =>
    renderFAQBlock(data),

  button: (data) =>
    renderButtonBlock(data),

  section:
    renderSectionBlock,

  flex:
    renderFlexBlock,

  flexItem:
    renderFlexItemBlock,

  grid:
    renderGridBlock,

  gridItem:
    renderGridItemBlock,

  title: (data) =>
    renderTitleBlock(data),

  text: (data) =>
    renderTextBlock(data),

  image: (data) =>
    renderImageBlock(data),

  link: (data) =>
    renderLinkBlock(data),

  input: (data) =>
    renderInputBlock(data),

  textarea: (data) =>
    renderTextareaBlock(data),

  select: (data) =>
    renderSelectBlock(data),

  navbar:
    renderFlexBlock,

  footer:
    renderFooterBlock,

  collectionList: async (
    data,
    _childrenHTML,
    siteId
  ) => {
    return renderCollectionListBlock(
      data,
      siteId || 0
    );
  },
};

/**
 * =========================================================
 * RECURSIVE ENGINE
 * =========================================================
 */

const renderBlocksInternal = async (
  blocks: any[] = [],
  siteId: number | undefined,
  context: RenderContext
): Promise<string> => {
  if (!Array.isArray(blocks)) {
    return "";
  }

  let html = "";

  for (const block of blocks) {
    if (
      !block ||
      typeof block !== "object"
    ) {
      continue;
    }

    const childrenHTML =
      Array.isArray(block.children) &&
      block.children.length > 0
        ? await renderBlocksInternal(
            block.children,
            siteId,
            context
          )
        : "";

    const renderData =
      isRecord(block.data)
        ? {
            ...block.data,

            __rbClassName:
              `rb-block-${context.nextBlockId++}`,

            __rbContext:
              context,
          }
        : {
            __rbClassName:
              `rb-block-${context.nextBlockId++}`,

            __rbContext:
              context,
          };

    const renderer =
      BLOCK_RENDERERS[
        String(block.type || "")
      ];

    if (!renderer) {
      console.warn(
        `Unknown block type: ${String(
          block.type
        )}`
      );

      const className =
        registerBlockCss(
          renderData,
          {
            width: "100%",
            boxSizing: "border-box",
          }
        );

      html += `
        <div
          class="rb-unknown-block ${className}"
          data-rb-block-type="${escapeHTML(
            String(
              block.type ||
                "unknown"
            )
          )}"
        >
          ${childrenHTML}
        </div>
      `;

      continue;
    }

    const result =
      await renderer(
        renderData,
        childrenHTML,
        siteId
      );

    html +=
      result || "";
  }

  return html;
};

export const renderBlocks = async (
  blocks: any[] = [],
  siteId?: number
): Promise<string> => {
  const context: RenderContext = {
    responsiveCss: [],
    nextBlockId: 1,
  };

  const html =
    await renderBlocksInternal(
      blocks,
      siteId,
      context
    );

  if (
    context.responsiveCss.length === 0
  ) {
    return html;
  }

  return `
  <style data-rb-block-styles>
    ${context.responsiveCss.join("\n")}
  </style>
  ${html}`;
};

/**
 * =========================================================
 * FULL PAGE RENDERER
 * =========================================================
 */

const safeOptionalURL = (
  url?: string
): string => {
  const safe = safeURL(url);

  return safe === "#"
    ? ""
    : safe;
};

const renderMetaName = (
  name: string,
  content?: string
): string => {
  if (!content) {
    return "";
  }

  return `
  <meta
    name="${escapeHTML(name)}"
    content="${escapeHTML(content)}"
  />`;
};

const renderMetaProperty = (
  property: string,
  content?: string
): string => {
  if (!content) {
    return "";
  }

  return `
  <meta
    property="${escapeHTML(property)}"
    content="${escapeHTML(content)}"
  />`;
};

const renderJsonLd = (
  schemaOrg?: unknown
): string => {
  if (!schemaOrg) {
    return "";
  }

  try {
    const serialized =
      JSON.stringify(schemaOrg)
        .replace(/</g, "\\u003c")
        .replace(/\u2028/g, "\\u2028")
        .replace(/\u2029/g, "\\u2029");

    return `
  <script type="application/ld+json">${serialized}</script>`;
  } catch (error) {
    console.warn(
      "SEO_SCHEMA_SERIALIZATION_FAILED",
      error
    );

    return "";
  }
};

const normalizeLanguage = (
  value: unknown
): string => {
  const language =
    String(value || "")
      .trim();

  return /^[a-zA-Z]{2,3}(?:-[a-zA-Z0-9]{2,8})*$/.test(
    language
  )
    ? language
    : "en";
};

const getThemeTokens = (
  page: any
): Record<string, unknown> => {
  const site =
    page?.site || {};

  return (
    page?.theme ||
    site?.theme ||
    site?.settings?.theme ||
    page?.settings?.theme ||
    {}
  );
};

const renderThemeStyles = (
  page: any
): string => {
  const theme =
    getThemeTokens(page);

  const colors =
    isRecord(theme.colors)
      ? theme.colors
      : {};

  const typography =
    isRecord(theme.typography)
      ? theme.typography
      : {};

  const primary =
    sanitizeCssValue(
      "color",
      colors.primary || theme.primaryColor || "#2563eb"
    );

  const onPrimary =
    sanitizeCssValue(
      "color",
      colors.onPrimary || theme.onPrimaryColor || "#ffffff"
    );

  const background =
    sanitizeCssValue(
      "background",
      colors.background || theme.backgroundColor || "#ffffff"
    );

  const foreground =
    sanitizeCssValue(
      "color",
      colors.text || colors.foreground || theme.textColor || "#111827"
    );

  const fontFamily =
    sanitizeCssValue(
      "fontFamily",
      typography.fontFamily || theme.fontFamily || "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    );

  return `
    :root {
      --rb-color-primary: ${primary || "#2563eb"};
      --rb-color-on-primary: ${onPrimary || "#ffffff"};
      --rb-color-background: ${background || "#ffffff"};
      --rb-color-text: ${foreground || "#111827"};
      --rb-font-family: ${fontFamily || "system-ui, sans-serif"};
    }

    body {
      background: var(--rb-color-background);
      color: var(--rb-color-text);
      font-family: var(--rb-font-family);
    }

    a {
      color: inherit;
    }
  `;
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

  const keywords =
    seo?.keywords ||
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

  const language =
    normalizeLanguage(
      page?.language ||
        page?.locale
    );

  return `<!DOCTYPE html>
<html lang="${escapeHTML(language)}">
<head>
  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1"
  />

  <title>${escapeHTML(title)}</title>

  ${renderMetaName(
    "description",
    description
  )}

  ${renderMetaName(
    "keywords",
    keywords
  )}

  ${renderMetaName(
    "robots",
    robots
  )}

  ${
    canonicalUrl
      ? `<link
          rel="canonical"
          href="${escapeHTML(
            canonicalUrl
          )}"
        />`
      : ""
  }

  ${renderMetaProperty(
    "og:title",
    ogTitle
  )}

  ${renderMetaProperty(
    "og:description",
    ogDescription
  )}

  ${
    canonicalUrl
      ? renderMetaProperty(
          "og:url",
          canonicalUrl
        )
      : ""
  }

  ${
    ogImage
      ? renderMetaProperty(
          "og:image",
          ogImage
        )
      : ""
  }

  ${renderMetaProperty(
    "og:type",
    openGraph.type ||
      "website"
  )}

  ${renderMetaName(
    "twitter:card",
    twitter.card ||
      "summary_large_image"
  )}

  ${renderMetaName(
    "twitter:title",
    twitterTitle
  )}

  ${renderMetaName(
    "twitter:description",
    twitterDescription
  )}

  ${
    twitterImage
      ? renderMetaName(
          "twitter:image",
          twitterImage
        )
      : ""
  }

  ${renderJsonLd(
    seo?.schemaOrg
  )}

  <style>
    ${renderThemeStyles(page)}

    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }

    html,
    body {
      width: 100%;
      min-height: 100%;
      margin: 0;
      padding: 0;
    }

    body {
      overflow-x: hidden;
    }

    img,
    video,
    iframe {
      max-width: 100%;
    }
  </style>
</head>

<body>
  <div id="blocks-area">
    ${blocksHTML}
  </div>
</body>
</html>`;
};
