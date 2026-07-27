import type {
  Block
} from "../types/page.types";

const getDesktopStyle = (
  element?: HTMLElement | null
) => {
  if (
    !element
  ) {
    return {};
  }

  const computed =
    element.ownerDocument.defaultView
      ?.getComputedStyle(
        element
      ) ||
    window.getComputedStyle(
      element
    );

  return {
    display:
      computed.display,

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

    boxShadow:
      computed.boxShadow,

    fontSize:
      computed.fontSize,

    fontWeight:
      computed.fontWeight,

    lineHeight:
      computed.lineHeight,

    letterSpacing:
      computed.letterSpacing,

    textAlign:
      computed.textAlign,

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

const normalizeCssValue = (
  value?: string
) =>
  (value || "")
    .replace(/\s+/g, "")
    .toLowerCase();

const isTransparentColor = (
  value?: string
) => {
  const normalized =
    normalizeCssValue(
      value
    );

  return (
    !normalized ||
    normalized === "transparent" ||
    normalized === "none" ||
    normalized === "rgba(0,0,0,0)" ||
    /^rgba\([^)]*,0(\.0+)?\)$/.test(
      normalized
    )
  );
};

const hasRealBackground = (
  style: Record<string, any>
) =>
  !isTransparentColor(
    style.backgroundColor
  ) ||
  (
    style.backgroundImage &&
    style.backgroundImage !== "none"
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

const pickColor = (
  ...values: Array<string | undefined>
) => {
  for (
    const value of values
  ) {
    if (
      value &&
      !isTransparentColor(
        value
      )
    ) {
      return value;
    }
  }

  return "#f0f6ff";
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

const scalePx = (
  value: string | undefined,
  ratio: number,
  fallback: string
) => {
  const numeric =
    parseFloat(
      value || ""
    );

  if (
    !Number.isFinite(
      numeric
    ) ||
    numeric <= 0
  ) {
    return fallback;
  }

  return `${Math.round(
    numeric *
      ratio *
      100
  ) / 100}px`;
};

const isUsefulMaxWidth = (
  value?: string
) =>
  !!value &&
  value !== "none" &&
  value !== "100%" &&
  value !== "auto";

const isZeroPadding = (
  value?: string
) =>
  !value ||
  value === "0px" ||
  value === "0px 0px" ||
  value === "0px 0px 0px 0px";

export const generateContentListPreset = (
  semanticResult: any
): Block => {
  const payload =
    semanticResult?.payload ||
    semanticResult;

  const sourceElement =
    semanticResult?.claimedNode
      ?.element as HTMLElement | undefined;

  const sourceSection =
    sourceElement?.closest(
      "section, header, main, article"
    ) as HTMLElement | null;

  const sourceContainer =
    sourceElement?.closest(
      ".container, [class*='container'], .inner, [class*='inner'], .wrap, [class*='wrap']"
    ) as HTMLElement | null;

  const titleElement =
    sourceElement?.querySelector(
      ":scope > h2, :scope > h3, h2, h3"
    ) as HTMLElement | null;

  const descElement =
    sourceElement?.querySelector(
      ":scope > p, p"
    ) as HTMLElement | null;

  const listItems =
    sourceElement
      ? Array.from(
          sourceElement.querySelectorAll(
            ":scope > ul > li, :scope > ol > li, ul > li, ol > li"
          )
        ) as HTMLElement[]
      : [];

  const sourceStyle =
    getDesktopStyle(
      sourceElement
    );

  const sectionStyle =
    getDesktopStyle(
      sourceSection || sourceElement
    );

  const containerStyle =
    getDesktopStyle(
      sourceContainer
    );

const outerPaintStyle =
  findNearestPaintStyle(
    sourceSection &&
    sourceSection !== sourceElement
      ? sourceSection
      : sourceElement?.parentElement
  );

const cardHasOwnBackground =
  hasRealBackground(
    sourceStyle
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

  const resolvedMaxWidth =
    isUsefulMaxWidth(
      containerStyle.maxWidth
    )
      ? containerStyle.maxWidth
      : isUsefulMaxWidth(
          sourceStyle.maxWidth
        )
        ? sourceStyle.maxWidth
        : "1180px";

  const sectionPadding =
    !isZeroPadding(
      sectionStyle.padding
    )
      ? sectionStyle.padding
      : !isZeroPadding(
          sourceStyle.padding
        )
        ? sourceStyle.padding
        : "96px 40px";

const sectionColor =
  pickColor(
    sourceStyle.color,
    sectionStyle.color,
    outerPaintStyle.color,
    "#f0f6ff"
  );

  const titleColor =
    pickColor(
      titleStyle.color,
      sectionColor
    );

  const descColor =
    pickColor(
      descStyle.color,
      sectionColor,
      titleColor
    );

  const itemColor =
    pickColor(
      firstItemStyle.color,
      descColor,
      titleColor
    );

  const borderColor =
    firstItemStyle.borderBottom &&
    firstItemStyle.borderBottom !== "0px none rgb(0, 0, 0)"
      ? firstItemStyle.borderBottom
      : "1px solid rgba(122, 158, 192, 0.22)";

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
            sectionPadding,

          margin:
            sectionStyle.margin,

          border:
            sectionStyle.border,

          borderRadius:
            sectionStyle.borderRadius,

          background:
  outerPaintStyle.background,

backgroundColor:
  outerPaintStyle.backgroundColor,

backgroundImage:
  outerPaintStyle.backgroundImage,

          color:
            sectionColor,

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
          padding:
            "72px 28px",

         background:
  outerPaintStyle.background,

backgroundColor:
  outerPaintStyle.backgroundColor,

backgroundImage:
  outerPaintStyle.backgroundImage,

          color:
            sectionColor,

          width:
            "100%",

          maxWidth:
            "100%",

          boxSizing:
            "border-box",

          overflow:
            "visible"
        },

        mobile: {
          padding:
            "52px 20px",
background:
  outerPaintStyle.background,

backgroundColor:
  outerPaintStyle.backgroundColor,

backgroundImage:
  outerPaintStyle.backgroundImage,
          color:
            sectionColor,

          width:
            "100%",

          maxWidth:
            "100%",

          boxSizing:
            "border-box",

          overflow:
            "visible"
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

              alignItems:
                "stretch",

              gap:
                "18px",

              width:
                "100%",

              maxWidth:
                resolvedMaxWidth,

              marginLeft:
                "auto",

              marginRight:
                "auto",

              boxSizing:
                "border-box"
            },

            tablet: {
              display:
                "flex",

              flexDirection:
                "column",

              alignItems:
                "stretch",

              gap:
                "16px",

              width:
                "100%",

              maxWidth:
                "100%",

              marginLeft:
                "auto",

              marginRight:
                "auto",

              boxSizing:
                "border-box"
            },

            mobile: {
              display:
                "flex",

              flexDirection:
                "column",

              alignItems:
                "stretch",

              gap:
                "14px",

              width:
                "100%",

              maxWidth:
                "100%",

              marginLeft:
                "auto",

              marginRight:
                "auto",

              boxSizing:
                "border-box"
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
                  display:
                    "flex",
                    padding:
  sourceStyle.padding &&
  sourceStyle.padding !== "0px"
    ? sourceStyle.padding
    : "0",

background:
  cardHasOwnBackground
    ? sourceStyle.background
    : undefined,

backgroundColor:
  cardHasOwnBackground
    ? sourceStyle.backgroundColor
    : undefined,

backgroundImage:
  cardHasOwnBackground
    ? sourceStyle.backgroundImage
    : undefined,

border:
  sourceStyle.border,

borderRadius:
  sourceStyle.borderRadius,

boxShadow:
  sourceStyle.boxShadow,

                  flexDirection:
                    "column",

                  alignItems:
                    "stretch",

                  width:
                    "100%",

                  maxWidth:
                    "100%",

                  boxSizing:
                    "border-box"
                },

                tablet: {
                  display:
                    "flex",

                  flexDirection:
                    "column",

                  alignItems:
                    "stretch",
padding:
  sourceStyle.padding &&
  sourceStyle.padding !== "0px"
    ? "32px 24px"
    : "0",
                  width:
                    "100%",

                  maxWidth:
                    "100%",

                  boxSizing:
                    "border-box"
                },

                mobile: {
                  display:
                    "flex",

                  flexDirection:
                    "column",
padding:
  sourceStyle.padding &&
  sourceStyle.padding !== "0px"
    ? "24px 18px"
    : "0",
                  alignItems:
                    "stretch",

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
                        "48px",

                      fontWeight:
                        titleStyle.fontWeight ||
                        "800",

                      lineHeight:
                        titleStyle.lineHeight ||
                        "1.12",

                      letterSpacing:
                        titleStyle.letterSpacing,

                      textAlign:
                        titleStyle.textAlign ||
                        "left",

                      margin:
                        "0",

                      marginBottom:
                        titleStyle.marginBottom ||
                        "10px",

                      color:
                        titleColor,

                      whiteSpace:
                        "normal",

                      wordBreak:
                        "normal",

                      overflowWrap:
                        "break-word"
                    },

                    tablet: {
                      fontSize:
                        scalePx(
                          titleStyle.fontSize,
                          0.72,
                          "38px"
                        ),

                      lineHeight:
                        "1.15",

                      margin:
                        "0",

                      marginBottom:
                        "8px",

                      color:
                        titleColor,

                      whiteSpace:
                        "normal",

                      wordBreak:
                        "normal",

                      overflowWrap:
                        "break-word"
                    },

                    mobile: {
                      fontSize:
                        scalePx(
                          titleStyle.fontSize,
                          0.54,
                          "30px"
                        ),

                      lineHeight:
                        "1.18",

                      margin:
                        "0",

                      marginBottom:
                        "8px",

                      color:
                        titleColor,

                      whiteSpace:
                        "normal",

                      wordBreak:
                        "normal",

                      overflowWrap:
                        "break-word"
                    }
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
                              "17px",

                            fontWeight:
                              descStyle.fontWeight ||
                              "400",

                            lineHeight:
                              descStyle.lineHeight ||
                              "1.65",

                            maxWidth:
                              descStyle.maxWidth &&
                              descStyle.maxWidth !== "none"
                                ? descStyle.maxWidth
                                : "760px",

                            margin:
                              "0",

                            marginBottom:
                              descStyle.marginBottom ||
                              "30px",

                            color:
                              descColor,

                            whiteSpace:
                              "normal",

                            overflowWrap:
                              "break-word"
                          },

                          tablet: {
                            fontSize:
                              "16px",

                            lineHeight:
                              "1.6",

                            maxWidth:
                              "100%",

                            margin:
                              "0",

                            marginBottom:
                              "24px",

                            color:
                              descColor,

                            whiteSpace:
                              "normal",

                            overflowWrap:
                              "break-word"
                          },

                          mobile: {
                            fontSize:
                              "15px",

                            lineHeight:
                              "1.6",

                            maxWidth:
                              "100%",

                            margin:
                              "0",

                            marginBottom:
                              "22px",

                            color:
                              descColor,

                            whiteSpace:
                              "normal",

                            overflowWrap:
                              "break-word"
                          }
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
                        display:
                          "block",

                        width:
                          "100%",

                        maxWidth:
                          "100%",

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
                          firstItemStyle.padding &&
                          firstItemStyle.padding !== "0px"
                            ? firstItemStyle.padding
                            : "16px 0",

                        borderBottom:
                          index ===
                          items.length - 1
                            ? "none"
                            : borderColor,

                        color:
                          itemColor,

                        margin:
                          "0",

                        boxSizing:
                          "border-box",

                        whiteSpace:
                          "normal",

                        overflowWrap:
                          "break-word"
                      },

                      tablet: {
                        display:
                          "block",

                        width:
                          "100%",

                        maxWidth:
                          "100%",

                        fontSize:
                          "15px",

                        lineHeight:
                          "1.65",

                        padding:
                          "14px 0",

                        borderBottom:
                          index ===
                          items.length - 1
                            ? "none"
                            : borderColor,

                        color:
                          itemColor,

                        margin:
                          "0",

                        boxSizing:
                          "border-box",

                        whiteSpace:
                          "normal",

                        overflowWrap:
                          "break-word"
                      },

                      mobile: {
                        display:
                          "block",

                        width:
                          "100%",

                        maxWidth:
                          "100%",

                        fontSize:
                          "14px",

                        lineHeight:
                          "1.6",

                        padding:
                          "13px 0",

                        borderBottom:
                          index ===
                          items.length - 1
                            ? "none"
                            : borderColor,

                        color:
                          itemColor,

                        margin:
                          "0",

                        boxSizing:
                          "border-box",

                        whiteSpace:
                          "normal",

                        overflowWrap:
                          "break-word"
                      }
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