import type {
  Block
} from "../../../types/page.types";

type Device =
  | "desktop"
  | "tablet"
  | "mobile";

type ResponsiveStyle = {
  desktop?: Record<string, any>;
  tablet?: Record<string, any>;
  mobile?: Record<string, any>;
};

const DEVICE_WIDTHS: Record<Device, number> = {
  desktop: 1440,
  tablet: 768,
  mobile: 390
};

const createId = (
  prefix: string
) =>
  `${prefix}-${crypto.randomUUID()}`;

const normalizeText = (
  value?: string | null
) =>
  (value || "")
    .replace(/\s+/g, " ")
    .trim();

const responsiveStyle = (
  style: Record<string, any> = {},
  device: Device = "desktop"
): ResponsiveStyle => ({
  desktop:
    device === "desktop" ? style : {},

  tablet:
    device === "tablet" ? style : {},

  mobile:
    device === "mobile" ? style : {}
});

const makeBlock = (
  type: string,
  props: Record<string, any>,
  style: ResponsiveStyle,
  children: Block[] = [],
  prefix: string = type,
  meta?: Record<string, any>
): Block => ({
  id:
    createId(prefix),

  type,

  meta,

  data: {
    props,
    style: {
      desktop:
        style.desktop || {},
      tablet:
        style.tablet || {},
      mobile:
        style.mobile || {}
    }
  },

  children
} as Block);

const getOwnText = (
  element: Element
) =>
  normalizeText(
    Array.from(
      element.childNodes
    )
      .filter(
        node =>
          node.nodeType ===
          Node.TEXT_NODE
      )
      .map(
        node =>
          node.textContent || ""
      )
      .join(" ")
  );

const getElementMeta = (
  element: Element
) => ({
  tagName:
    element.tagName.toLowerCase(),

  className:
    element.getAttribute("class") || "",

  htmlId:
    element.getAttribute("id") || ""
});

const cleanStyleValue = (
  value: string,
  options: {
    keepAuto?: boolean;
    keepZero?: boolean;
  } = {}
) => {
  const normalized =
    value?.trim();

  if (
    !normalized ||
    normalized === "normal" ||
    normalized === "none" ||
    normalized === "rgba(0, 0, 0, 0)"
  ) {
    return undefined;
  }

  if (
    normalized === "auto" &&
    !options.keepAuto
  ) {
    return undefined;
  }

  if (
    normalized === "0px" &&
    !options.keepZero
  ) {
    return undefined;
  }

  return normalized;
};

const extractComputedStyle = (
  element: Element,
  win: Window
): Record<string, any> => {
  const computed =
    win.getComputedStyle(
      element
    );

  const style: Record<string, any> = {};

  const copy = (
    key: string,
    cssKey: string = key,
    options: {
      keepAuto?: boolean;
      keepZero?: boolean;
    } = {}
  ) => {
    const value =
      cleanStyleValue(
        computed.getPropertyValue(
          cssKey
        ),
        options
      );

    if (
      value !== undefined
    ) {
      style[key] =
        value;
    }
  };

  copy("display");
  copy("position");

  copy("flexDirection", "flex-direction");
  copy("flexWrap", "flex-wrap");
  copy("justifyContent", "justify-content");
  copy("alignItems", "align-items");
  copy("alignContent", "align-content");
  copy("gap");
  copy("rowGap", "row-gap");
  copy("columnGap", "column-gap");

  copy("gridTemplateColumns", "grid-template-columns");
  copy("gridTemplateRows", "grid-template-rows");
  copy("gridColumn", "grid-column", {
    keepAuto: true
  });
  copy("gridRow", "grid-row", {
    keepAuto: true
  });

  copy("width", "width", {
    keepZero: true
  });
  copy("maxWidth", "max-width");
  copy("minWidth", "min-width", {
    keepZero: true
  });

  copy("height", "height", {
    keepZero: true
  });
  copy("maxHeight", "max-height");
  copy("minHeight", "min-height");

  copy("paddingTop", "padding-top", {
    keepZero: true
  });
  copy("paddingRight", "padding-right", {
    keepZero: true
  });
  copy("paddingBottom", "padding-bottom", {
    keepZero: true
  });
  copy("paddingLeft", "padding-left", {
    keepZero: true
  });

  copy("marginTop", "margin-top", {
    keepAuto: true,
    keepZero: true
  });
  copy("marginRight", "margin-right", {
    keepAuto: true,
    keepZero: true
  });
  copy("marginBottom", "margin-bottom", {
    keepAuto: true,
    keepZero: true
  });
  copy("marginLeft", "margin-left", {
    keepAuto: true,
    keepZero: true
  });

  copy("background");
  copy("backgroundColor", "background-color");
  copy("backgroundImage", "background-image");
  copy("backgroundSize", "background-size");
  copy("backgroundRepeat", "background-repeat");
  copy("backgroundPosition", "background-position");

  copy("color");

  copy("fontSize", "font-size");
  copy("fontWeight", "font-weight");
  copy("fontFamily", "font-family");
  copy("lineHeight", "line-height");
  copy("letterSpacing", "letter-spacing");
  copy("textTransform", "text-transform");
  copy("textAlign", "text-align");
  copy("textDecoration", "text-decoration");
  copy("whiteSpace", "white-space");

  copy("listStyle", "list-style");
  copy("listStyleType", "list-style-type");

  copy("border");
  copy("borderTop", "border-top");
  copy("borderRight", "border-right");
  copy("borderBottom", "border-bottom");
  copy("borderLeft", "border-left");
  copy("borderRadius", "border-radius");

  copy("boxShadow", "box-shadow");
  copy("opacity");
  copy("overflow");
  copy("overflowX", "overflow-x");
  copy("overflowY", "overflow-y");
  copy("objectFit", "object-fit");
  copy("boxSizing", "box-sizing");

  if (
    typeof style.marginLeft === "string" &&
    style.marginLeft.trim().startsWith("-")
  ) {
    delete style.marginLeft;
  }

  if (
    typeof style.marginRight === "string" &&
    style.marginRight.trim().startsWith("-")
  ) {
    delete style.marginRight;
  }

  if (
    style.overflow === "hidden"
  ) {
    style.overflow =
      "visible";
  }

  return style;
};

const shouldSkipElement = (
  element: Element,
  win: Window
) => {
  const tag =
    element.tagName.toLowerCase();

  if (
    [
      "script",
      "style",
      "noscript",
      "meta",
      "link",
      "template"
    ].includes(tag)
  ) {
    return true;
  }

  const computed =
    win.getComputedStyle(
      element
    );

  return (
    computed.visibility === "hidden"
  );
};

const svgToDataUri = (
  svg: SVGElement,
  win: Window
) => {
  const cloned =
    svg.cloneNode(
      true
    ) as SVGElement;

  cloned.setAttribute(
    "xmlns",
    "http://www.w3.org/2000/svg"
  );

  const sourceNodes = [
    svg,
    ...Array.from(
      svg.querySelectorAll("*")
    )
  ];

  const clonedNodes = [
    cloned,
    ...Array.from(
      cloned.querySelectorAll("*")
    )
  ];

  sourceNodes.forEach(
    (
      sourceNode,
      index
    ) => {
      const targetNode =
        clonedNodes[index];

      if (
        !targetNode
      ) {
        return;
      }

      const computed =
        win.getComputedStyle(
          sourceNode as Element
        );

      const color =
        computed.color;

      const fill =
        computed.fill;

      const stroke =
        computed.stroke;

      const strokeWidth =
        computed.getPropertyValue(
          "stroke-width"
        );

      const strokeLinecap =
        computed.getPropertyValue(
          "stroke-linecap"
        );

      const strokeLinejoin =
        computed.getPropertyValue(
          "stroke-linejoin"
        );

      const opacity =
        computed.opacity;

      if (
        color
      ) {
        targetNode.setAttribute(
          "color",
          color
        );
      }

      if (
        fill &&
        fill !== "none" &&
        fill !== "rgba(0, 0, 0, 0)"
      ) {
        targetNode.setAttribute(
          "fill",
          fill
        );
      }

      if (
        stroke &&
        stroke !== "none" &&
        stroke !== "rgba(0, 0, 0, 0)"
      ) {
        targetNode.setAttribute(
          "stroke",
          stroke
        );
      }

      if (
        strokeWidth &&
        strokeWidth !== "0px"
      ) {
        targetNode.setAttribute(
          "stroke-width",
          strokeWidth
        );
      }

      if (
        strokeLinecap &&
        strokeLinecap !== "butt"
      ) {
        targetNode.setAttribute(
          "stroke-linecap",
          strokeLinecap
        );
      }

      if (
        strokeLinejoin &&
        strokeLinejoin !== "miter"
      ) {
        targetNode.setAttribute(
          "stroke-linejoin",
          strokeLinejoin
        );
      }

      if (
        opacity &&
        opacity !== "1"
      ) {
        targetNode.setAttribute(
          "opacity",
          opacity
        );
      }
    }
  );

  const svgText =
    cloned.outerHTML;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    svgText
  )}`;
};
const addMeasuredBoxStyle = (
  element: Element,
  style: Record<string, any>
) => {
  const rect =
    element.getBoundingClientRect();

  const next = {
    ...style
  };

  if (
    !next.width &&
    rect.width > 0
  ) {
    next.width =
      `${Math.round(
        rect.width
      )}px`;
  }

  if (
    !next.height &&
    rect.height > 0
  ) {
    next.height =
      `${Math.round(
        rect.height
      )}px`;
  }

  if (
    !next.maxWidth &&
    rect.width > 0
  ) {
    next.maxWidth =
      `${Math.round(
        rect.width
      )}px`;
  }

  return next;
};
const normalizeListStyle = (
  tag: string,
  computedStyle: Record<string, any>
) => {
  if (
    [
      "ul",
      "ol",
      "li"
    ].includes(tag)
  ) {
    computedStyle.listStyle =
      "none";

    computedStyle.listStyleType =
      "none";

    if (
      computedStyle.display === "list-item"
    ) {
      computedStyle.display =
        "block";
    }
  }

  return computedStyle;
};

const convertElementToBlock = (
  element: Element,
  win: Window,
  device: Device
): Block | null => {
  if (
    shouldSkipElement(
      element,
      win
    )
  ) {
    return null;
  }

  const tag =
    element.tagName.toLowerCase();

  const computedStyle =
    normalizeListStyle(
      tag,
      extractComputedStyle(
        element,
        win
      )
    );

  const children =
    Array.from(
      element.children
    )
      .map(
        child =>
          convertElementToBlock(
            child,
            win,
            device
          )
      )
      .filter(Boolean) as Block[];

  if (
    tag === "img"
  ) {
    const img =
      element as HTMLImageElement;

    const src =
      img.getAttribute("src") ||
      img.getAttribute("data-src") ||
      "";

    if (
      !src
    ) {
      return null;
    }

    return makeBlock(
      "image",
      {
        ...getElementMeta(
          element
        ),
        url:
          src,
        src,
        alt:
          img.getAttribute("alt") || ""
      },
      responsiveStyle(
        {
          ...computedStyle,
          maxWidth:
            computedStyle.maxWidth || "100%",
          height:
            computedStyle.height || "auto",
          objectFit:
            computedStyle.objectFit || "contain"
        },
        device
      ),
      [],
      "footer-image"
    );
  }
if (
  tag === "svg"
) {
  const src =
    svgToDataUri(
      element as SVGElement,
      win
    );

  return makeBlock(
    "image",
    {
      ...getElementMeta(
        element
      ),
      url:
        src,
      src,
      alt:
        element.getAttribute("aria-label") || ""
    },
    responsiveStyle(
      addMeasuredBoxStyle(
        element,
        computedStyle
      ),
      device
    ),
    [],
    "footer-svg"
  );
}
  if (
    tag === "a"
  ) {
    const ownText =
      getOwnText(
        element
      );

    const href =
      element.getAttribute("href") || "#";

    if (
      ownText &&
      !children.length
    ) {
      return makeBlock(
        "link",
        {
          ...getElementMeta(
            element
          ),
          label:
            ownText,
          text:
            ownText,
          href
        },
        responsiveStyle(
          {
            ...computedStyle,
            whiteSpace:
              ownText.length <= 24
                ? computedStyle.whiteSpace || "nowrap"
                : computedStyle.whiteSpace
          },
          device
        ),
        [],
        "footer-link"
      );
    }

    if (
      children.length
    ) {
      return makeBlock(
        "flex",
        {
          ...getElementMeta(
            element
          ),
          href
        },
        responsiveStyle(
          computedStyle,
          device
        ),
        children,
        "footer-anchor"
      );
    }

    return null;
  }

  if (
    /^h[1-6]$/.test(tag)
  ) {
    const text =
      normalizeText(
        element.textContent
      );

    if (
      !text
    ) {
      return null;
    }

    return makeBlock(
      "title",
      {
        ...getElementMeta(
          element
        ),
        content:
          text
      },
      responsiveStyle(
        {
          ...computedStyle,
          whiteSpace:
            computedStyle.whiteSpace ||
            (
              text.length <= 32
                ? "nowrap"
                : undefined
            )
        },
        device
      ),
      [],
      "footer-title"
    );
  }

  if (
    tag === "li"
  ) {
    const text =
      getOwnText(
        element
      );

    if (
      children.length
    ) {
      return makeBlock(
        "flex",
        {
          ...getElementMeta(
            element
          )
        },
        responsiveStyle(
          {
            ...computedStyle,
            display:
              computedStyle.display === "list-item"
                ? "block"
                : computedStyle.display || "block",
            listStyle:
              "none",
            listStyleType:
              "none"
          },
          device
        ),
        [
          ...(text
            ? [
                makeBlock(
                  "text",
                  {
                    content:
                      text
                  },
                  responsiveStyle(
                    {
                      color:
                        computedStyle.color,
                      fontSize:
                        computedStyle.fontSize,
                      fontWeight:
                        computedStyle.fontWeight,
                      lineHeight:
                        computedStyle.lineHeight,
                      whiteSpace:
                        text.length <= 24
                          ? "nowrap"
                          : computedStyle.whiteSpace
                    },
                    device
                  ),
                  [],
                  "footer-text"
                )
              ]
            : []),
          ...children
        ],
        "footer-list-item"
      );
    }

    const allText =
      normalizeText(
        element.textContent
      );

    if (
      !allText
    ) {
      return null;
    }

    return makeBlock(
      "text",
      {
        ...getElementMeta(
          element
        ),
        content:
          allText
      },
      responsiveStyle(
        {
          ...computedStyle,
          display:
            "block",
          listStyle:
            "none",
          listStyleType:
            "none"
        },
        device
      ),
      [],
      "footer-list-text"
    );
  }

  if (
    [
      "p",
      "span",
      "small",
      "strong",
      "em"
    ].includes(tag)
  ) {
    const ownText =
      getOwnText(
        element
      );

    if (
      children.length
    ) {
      return makeBlock(
        "flex",
        {
          ...getElementMeta(
            element
          )
        },
        responsiveStyle(
          computedStyle,
          device
        ),
        [
          ...(ownText
            ? [
                makeBlock(
                  "text",
                  {
                    content:
                      ownText
                  },
                  responsiveStyle(
                    {
                      color:
                        computedStyle.color,
                      fontSize:
                        computedStyle.fontSize,
                      fontWeight:
                        computedStyle.fontWeight,
                      lineHeight:
                        computedStyle.lineHeight,
                      letterSpacing:
                        computedStyle.letterSpacing,
                      textTransform:
                        computedStyle.textTransform,
                      textAlign:
                        computedStyle.textAlign,
                      whiteSpace:
                        ownText.length <= 24
                          ? "nowrap"
                          : computedStyle.whiteSpace
                    },
                    device
                  ),
                  [],
                  "footer-text"
                )
              ]
            : []),
          ...children
        ],
        "footer-inline-container"
      );
    }

    const text =
      normalizeText(
        element.textContent
      );

    if (
      !text
    ) {
      return null;
    }

    return makeBlock(
      "text",
      {
        ...getElementMeta(
          element
        ),
        content:
          text
      },
      responsiveStyle(
        {
          ...computedStyle,
          whiteSpace:
            text.length <= 24
              ? computedStyle.whiteSpace || "nowrap"
              : computedStyle.whiteSpace
        },
        device
      ),
      [],
      "footer-text"
    );
  }

  const ownText =
    getOwnText(
      element
    );

  const allChildren = [
    ...(ownText
      ? [
          makeBlock(
            "text",
            {
              content:
                ownText,
              tagName:
                "#text"
            },
            responsiveStyle(
              {
                color:
                  computedStyle.color,
                fontSize:
                  computedStyle.fontSize,
                fontWeight:
                  computedStyle.fontWeight,
                lineHeight:
                  computedStyle.lineHeight,
                letterSpacing:
                  computedStyle.letterSpacing,
                textTransform:
                  computedStyle.textTransform,
                textAlign:
                  computedStyle.textAlign,
                whiteSpace:
                  ownText.length <= 24
                    ? "nowrap"
                    : computedStyle.whiteSpace
              },
              device
            ),
            [],
            "footer-text"
          )
        ]
      : []),
    ...children
  ];

  if (
    !allChildren.length
  ) {
    return null;
  }

  const display =
    String(
      computedStyle.display || ""
    );

  const blockType =
    tag === "footer" ||
    tag === "section"
      ? "section"
      : display.includes("grid")
        ? "grid"
        : "flex";

  return makeBlock(
    blockType,
    {
      ...getElementMeta(
        element
      )
    },
    responsiveStyle(
      computedStyle,
      device
    ),
    allChildren,
    blockType === "section"
      ? "footer-section"
      : "footer-container",
    blockType === "section"
      ? {
          semanticType:
            "FOOTER"
        }
      : undefined
  );
};

const buildHtmlWithContext = (
  footerHtml: string,
  contextHtml?: string
): string => {
  if (
    !contextHtml?.trim()
  ) {
    return `
      <!doctype html>
      <html>
        <head></head>
        <body>
          ${footerHtml}
        </body>
      </html>
    `;
  }

  const parsed =
    new DOMParser().parseFromString(
      contextHtml,
      "text/html"
    );

  const headHtml =
    parsed.head?.innerHTML || "";

  const bodyClass =
    parsed.body?.getAttribute("class") || "";

  const bodyId =
    parsed.body?.getAttribute("id") || "";

  const bodyStyle =
    parsed.body?.getAttribute("style") || "";

  return `
    <!doctype html>
    <html>
      <head>
        ${headHtml}
      </head>
      <body
        class="${bodyClass}"
        id="${bodyId}"
        style="${bodyStyle}"
      >
        ${footerHtml}
      </body>
    </html>
  `;
};

const waitForIframeReady = async (
  iframeDocument: Document
) => {
  const fontsReady =
    (iframeDocument as any).fonts?.ready;

  if (
    fontsReady
  ) {
    try {
      await fontsReady;
    } catch {
      // ignore font loading errors
    }
  }

  const images =
    Array.from(
      iframeDocument.images || []
    );

  await Promise.all(
    images.map(
      async image => {
        try {
          if (
            image.decode
          ) {
            await image.decode();
          }
        } catch {
          // ignore image decode errors
        }
      }
    )
  );

  await new Promise(
    resolve =>
      setTimeout(
        resolve,
        250
      )
  );
};

const renderFooterAtDevice = async (
  footerHtml: string,
  contextHtml: string | undefined,
  device: Device
): Promise<Block | null> => {
  const iframe =
    document.createElement("iframe");

  iframe.style.position =
    "fixed";
  iframe.style.left =
    "-10000px";
  iframe.style.top =
    "-10000px";
  iframe.style.width =
    `${DEVICE_WIDTHS[device]}px`;
  iframe.style.height =
    device === "mobile"
      ? "2200px"
      : device === "tablet"
        ? "1800px"
        : "1400px";
  iframe.style.opacity =
    "0";
  iframe.style.pointerEvents =
    "none";

  document.body.appendChild(
    iframe
  );

  try {
    const iframeDocument =
      iframe.contentDocument;

    const iframeWindow =
      iframe.contentWindow;

    if (
      !iframeDocument ||
      !iframeWindow
    ) {
      return null;
    }

    iframeDocument.open();

    iframeDocument.write(
      buildHtmlWithContext(
        footerHtml,
        contextHtml
      )
    );

    iframeDocument.close();

    await waitForIframeReady(
      iframeDocument
    );

    const root =
      iframeDocument.querySelector("footer") ||
      iframeDocument.body.firstElementChild ||
      iframeDocument.body;

    if (
      !root
    ) {
      return null;
    }

    return convertElementToBlock(
      root,
      iframeWindow,
      device
    );

  } catch (error) {
    console.warn(
      "GENERIC_FOOTER_DEVICE_RENDER_FAILED",
      {
        device,
        error
      }
    );

    return null;

  } finally {
    iframe.remove();
  }
};

const mergeDeviceStyles = (
  base: Block,
  responsive: Block | null,
  device: Device
): Block => {
  if (
    !responsive
  ) {
    return base;
  }

  const baseAny =
    base as any;

  const responsiveAny =
    responsive as any;

  const responsiveStyleForDevice =
    responsiveAny.data?.style?.[device] || {};

  baseAny.data = {
    ...(baseAny.data || {}),
    props:
      baseAny.data?.props || {},
    style: {
      ...(baseAny.data?.style || {}),
      [device]:
        responsiveStyleForDevice
    }
  };

  baseAny.children =
    (baseAny.children || []).map(
      (
        child: Block,
        index: number
      ) =>
        responsiveAny.children?.[index]
          ? mergeDeviceStyles(
              child,
              responsiveAny.children[index],
              device
            )
          : child
    );

  return baseAny as Block;
};

const normalizeRootFooterBlock = (
  block: Block
): Block => {
  const current =
    block as any;

  const currentData =
    current.data || {};

  const currentStyle =
    currentData.style || {};

  const normalizeDeviceStyle = (
    input: Record<string, any> = {},
    device: Device = "desktop"
  ) => {
    const next = {
      ...input
    };

    const isResponsiveLayout =
      device !== "desktop";

    const width =
      isResponsiveLayout
        ? "100%"
        : next.width || "100%";

    const maxWidth =
      isResponsiveLayout
        ? "100%"
        : next.maxWidth &&
          next.maxWidth !== "none"
          ? next.maxWidth
          : "100%";

    const marginLeft =
      next.marginLeft || "auto";

    const marginRight =
      next.marginRight || "auto";

    return {
      ...next,
      width,
      maxWidth,
      marginLeft,
      marginRight,
      minWidth: next.minWidth || "0",
      boxSizing: next.boxSizing || "border-box",
      overflow:
        next.overflow === "hidden"
          ? "visible"
          : next.overflow || "visible"
    };
  };

  const sectionStyle =
    currentStyle.desktop || {};
  const containerStyle =
    (current.children?.[0] as any)?.data?.style?.desktop || {};

  if (
    typeof process !== "undefined" &&
    process.env.NODE_ENV !== "production"
  ) {
    console.info(
      "FOOTER_STYLE_DEBUG",
      {
        semanticType: "FOOTER",
        sectionStyle,
        containerStyle,
        gridStyle: null,
        computedMaxWidth:
          sectionStyle.maxWidth || containerStyle.maxWidth,
        computedMarginLeft:
          sectionStyle.marginLeft || containerStyle.marginLeft,
        computedMarginRight:
          sectionStyle.marginRight || containerStyle.marginRight,
        computedPadding:
          sectionStyle.padding || containerStyle.padding
      }
    );
  }

  return {
    ...current,
    type: "section",
    meta: {
      ...(current.meta || {}),
      semanticType:
        current.meta?.semanticType || "FOOTER"
    },
    data: {
      ...currentData,
      props: {
        ...(currentData.props || {})
      },
      style: {
        ...currentStyle,
        desktop: normalizeDeviceStyle(
          {
            ...(currentStyle.desktop || {}),
            width: "100%",
            maxWidth:
              (currentStyle.desktop || {}).maxWidth &&
              (currentStyle.desktop || {}).maxWidth !== "none"
                ? (currentStyle.desktop || {}).maxWidth
                : "100%",
            marginLeft: (currentStyle.desktop || {}).marginLeft || "auto",
            marginRight: (currentStyle.desktop || {}).marginRight || "auto",
            paddingLeft: (currentStyle.desktop || {}).paddingLeft,
            paddingRight: (currentStyle.desktop || {}).paddingRight,
            paddingTop: (currentStyle.desktop || {}).paddingTop,
            paddingBottom: (currentStyle.desktop || {}).paddingBottom,
            background: (currentStyle.desktop || {}).background,
            backgroundColor: (currentStyle.desktop || {}).backgroundColor,
            color: (currentStyle.desktop || {}).color
          },
          "desktop"
        ),
        tablet: normalizeDeviceStyle(
          {
            ...(currentStyle.tablet || {}),
            width: "100%",
            maxWidth: "100%",
            marginLeft: "auto",
            marginRight: "auto"
          },
          "tablet"
        ),
        mobile: normalizeDeviceStyle(
          {
            ...(currentStyle.mobile || {}),
            width: "100%",
            maxWidth: "100%",
            marginLeft: "auto",
            marginRight: "auto"
          },
          "mobile"
        )
      }
    },
    children: current.children || []
  } as Block;
};

export const footerHtmlToBlock = async (
  footerHtml: string,
  contextHtml?: string
): Promise<Block | null> => {
  if (
    !footerHtml?.trim()
  ) {
    return null;
  }

  const desktopBlock =
    await renderFooterAtDevice(
      footerHtml,
      contextHtml,
      "desktop"
    );

  if (
    !desktopBlock
  ) {
    return null;
  }

  const tabletBlock =
    await renderFooterAtDevice(
      footerHtml,
      contextHtml,
      "tablet"
    );

  const mobileBlock =
    await renderFooterAtDevice(
      footerHtml,
      contextHtml,
      "mobile"
    );

  let merged =
    desktopBlock;

  if (
    tabletBlock
  ) {
    merged =
      mergeDeviceStyles(
        merged,
        tabletBlock,
        "tablet"
      );
  }

  if (
    mobileBlock
  ) {
    merged =
      mergeDeviceStyles(
        merged,
        mobileBlock,
        "mobile"
      );
  }

  return normalizeRootFooterBlock(
    merged
  );
};