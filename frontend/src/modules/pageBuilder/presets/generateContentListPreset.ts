import type {
  Block
} from "../types/page.types";

const getDesktopStyle = (
  element?: HTMLElement | null
) => {
  if (!element) {
    return {};
  }

  const computed =
    element.ownerDocument.defaultView
      ?.getComputedStyle(element) ||
    window.getComputedStyle(element);

  return {
    padding:
      computed.padding,

    margin:
      computed.margin,

    border:
      computed.border,

    borderRadius:
      computed.borderRadius,

    background:
      computed.background,

    backgroundColor:
      computed.backgroundColor,

    backgroundImage:
      computed.backgroundImage,

    fontSize:
      computed.fontSize,

    fontWeight:
      computed.fontWeight,

    lineHeight:
      computed.lineHeight,

    marginBottom:
      computed.marginBottom,

    borderBottom:
      computed.borderBottom,

    color:
      computed.color,

    width:
      computed.width,

    maxWidth:
      computed.maxWidth
  };
};

const normalizeCssColor = (
  value?: string
) =>
  (value || "")
    .replace(/\s+/g, "")
    .toLowerCase();

const isTransparentPaint = (
  value?: string
) => {
  const normalized =
    normalizeCssColor(
      value
    );

  return (
    !normalized ||
    normalized === "transparent" ||
    normalized === "none" ||
    normalized === "rgba(0,0,0,0)"
  );
};

const hasRealBackground = (
  style: Record<string, any>
) =>
  !isTransparentPaint(
    style.backgroundColor
  ) ||
  (
    style.backgroundImage &&
    style.backgroundImage !== "none"
  ) ||
  (
    style.background &&
    !isTransparentPaint(
      style.background
    ) &&
    style.background !== "none"
  );

const findNearestPaintStyle = (
  element?: HTMLElement | null
) => {
  let current =
    element || null;

  while (
    current &&
    current.tagName.toLowerCase() !== "html"
  ) {
    const style =
      getDesktopStyle(
        current
      );

    if (
      hasRealBackground(
        style
      )
    ) {
      return style;
    }

    current =
      current.parentElement;
  }

  return {};
};

const cleanListItemText = (
  value: string
) =>
  value
    .replace(
      /^(\s*(→|â†’)\s*)+/,
      ""
    )
    .trim();

export const generateContentListPreset = (
  semanticResult: any
): Block => {
  const payload =
    semanticResult?.payload ||
    semanticResult;

  const sourceElement =
    semanticResult?.claimedNode
      ?.element as HTMLElement | undefined;

  const titleElement =
    sourceElement?.querySelector(
      ":scope > h2, :scope > h3"
    ) as HTMLElement | null;

  const descElement =
    sourceElement?.querySelector(
      ":scope > p"
    ) as HTMLElement | null;

  const listItems =
    sourceElement
      ? Array.from(
          sourceElement.querySelectorAll(
            ":scope > ul > li, :scope > ol > li"
          )
        ) as HTMLElement[]
      : [];

  const sourceStyle =
    getDesktopStyle(
      sourceElement
    );

  const paintStyle =
    hasRealBackground(
      sourceStyle
    )
      ? sourceStyle
      : findNearestPaintStyle(
          sourceElement
        );

  const titleStyle =
    getDesktopStyle(
      titleElement
    );

  const descStyle =
    getDesktopStyle(
      descElement
    );

  const firstItemStyle =
    getDesktopStyle(
      listItems[0]
    );

  const items =
    Array.isArray(
      payload.items
    )
      ? payload.items
      : [];

  const id =
    crypto.randomUUID();

  const titleColor =
    titleStyle.color ||
    paintStyle.color ||
    sourceStyle.color ||
    "#ffffff";

  const descColor =
    descStyle.color ||
    titleColor;

  const itemColor =
    firstItemStyle.color ||
    descColor;

  return {
    id:
      `content-list-section-${id}`,

    type:
      "section",

    meta: {
      semanticType:
        "CONTENT_LIST_SECTION"
    },

    data: {
      props: {},

      style: {
        desktop: {
          padding:
            sourceStyle.padding &&
            sourceStyle.padding !== "0px"
              ? sourceStyle.padding
              : "72px 40px",

          margin:
            sourceStyle.margin,

          borderRadius:
            sourceStyle.borderRadius,

          border:
            sourceStyle.border,

          background:
            paintStyle.background ||
            sourceStyle.background,

          backgroundColor:
            paintStyle.backgroundColor ||
            sourceStyle.backgroundColor,

          backgroundImage:
            paintStyle.backgroundImage ||
            sourceStyle.backgroundImage,

          color:
            paintStyle.color ||
            sourceStyle.color ||
            titleColor,

          width:
            "100%",

          maxWidth:
            "100%",

          boxSizing:
            "border-box",

          overflow:
            "visible"
        },

        tablet: {
          width:
            "100%",

          maxWidth:
            "100%",

          boxSizing:
            "border-box"
        },

        mobile: {
          width:
            "100%",

          maxWidth:
            "100%",

          boxSizing:
            "border-box"
        }
      }
    },

    children: [
      {
        id:
          `content-list-flex-${id}`,

        type:
          "flex",

        data: {
          props: {},

          style: {
            desktop: {
              display:
                "flex",

              flexDirection:
                "column",

              gap:
                "16px",

              width:
                "100%",

              maxWidth:
                sourceStyle.maxWidth &&
                sourceStyle.maxWidth !== "none" &&
                sourceStyle.maxWidth !== "100%"
                  ? sourceStyle.maxWidth
                  : "1180px",

              marginLeft:
                "auto",

              marginRight:
                "auto",

              boxSizing:
                "border-box"
            },

            tablet: {
              width:
                "100%",

              maxWidth:
                "100%"
            },

            mobile: {
              width:
                "100%",

              maxWidth:
                "100%"
            }
          }
        },

        children: [
          {
            id:
              `content-list-item-${id}`,

            type:
              "flexItem",

            data: {
              props: {},

              style: {
                desktop: {
                  width:
                    "100%",

                  maxWidth:
                    "100%",

                  boxSizing:
                    "border-box"
                },

                tablet: {},

                mobile: {}
              }
            },

            children: [
              {
                id:
                  `content-list-title-${id}`,

                type:
                  "title",

                data: {
                  props: {
                    content:
                      payload.title || ""
                  },

                  style: {
                    desktop: {
                      fontSize:
                        titleStyle.fontSize ||
                        "32px",

                      fontWeight:
                        titleStyle.fontWeight ||
                        "700",

                      lineHeight:
                        titleStyle.lineHeight ||
                        "1.15",

                      margin:
                        "0",

                      marginBottom:
                        titleStyle.marginBottom ||
                        "8px",

                      color:
                        titleColor
                    },

                    tablet: {},

                    mobile: {}
                  }
                },

                children: []
              },

              ...(payload.description
                ? [
                    {
                      id:
                        `content-list-desc-${id}`,

                      type:
                        "text",

                      data: {
                        props: {
                          content:
                            payload.description
                        },

                        style: {
                          desktop: {
                            fontSize:
                              descStyle.fontSize ||
                              "16px",

                            fontWeight:
                              descStyle.fontWeight,

                            lineHeight:
                              descStyle.lineHeight ||
                              "1.6",

                            margin:
                              "0",

                            marginBottom:
                              descStyle.marginBottom ||
                              "32px",

                            color:
                              descColor
                          },

                          tablet: {},

                          mobile: {}
                        }
                      },

                      children: []
                    }
                  ]
                : []),

              ...items.map(
                (
                  item: string,
                  index: number
                ) => ({
                  id:
                    `content-list-row-${id}-${index}`,

                  type:
                    "text",

                  data: {
                    props: {
                      content:
                        `→ ${cleanListItemText(
                          item
                        )}`
                    },

                    style: {
                      desktop: {
                        fontSize:
                          firstItemStyle.fontSize ||
                          "16px",

                        fontWeight:
                          firstItemStyle.fontWeight ||
                          "400",

                        lineHeight:
                          firstItemStyle.lineHeight ||
                          "1.7",

                        padding:
                          firstItemStyle.padding ||
                          "14px 0",

                        borderBottom:
                          index ===
                          items.length - 1
                            ? "none"
                            : firstItemStyle.borderBottom,

                        color:
                          itemColor,

                        margin:
                          "0"
                      },

                      tablet: {},

                      mobile: {}
                    }
                  },

                  children: []
                })
              )
            ]
          }
        ]
      }
    ]
  };
};