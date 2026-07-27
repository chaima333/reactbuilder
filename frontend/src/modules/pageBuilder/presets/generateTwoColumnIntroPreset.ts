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

    gap:
      computed.gap,

    columnGap:
      computed.columnGap,

    rowGap:
      computed.rowGap,

    gridTemplateColumns:
      computed.gridTemplateColumns,

    width:
      computed.width,

    maxWidth:
      computed.maxWidth,

    padding:
      computed.padding,

    margin:
      computed.margin,

    marginBottom:
      computed.marginBottom,

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

    color:
      computed.color,

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

    textTransform:
      computed.textTransform
  };
};

const cleanText = (
  value?: string | null
) =>
  value
    ?.replace(/\s+/g, " ")
    .trim() || "";

const findEyebrowElement = (
  column?: HTMLElement | null
) => {
  if (
    !column
  ) {
    return null;
  }

  const explicit =
    column.querySelector(
      ":scope > .eyebrow, :scope > .badge, :scope > .pill, :scope > [class*='eyebrow'], :scope > [class*='badge'], :scope > [class*='pill'], :scope > small"
    ) as HTMLElement | null;

  if (
    explicit
  ) {
    return explicit;
  }

  const titleElement =
    column.querySelector(
      ":scope > h1, :scope > h2, :scope > h3"
    );

  const fallback =
    Array.from(
      column.children
    ).find(
      child => {
        if (
          child === titleElement ||
          child.tagName === "P"
        ) {
          return false;
        }

        const text =
          cleanText(
            child.textContent
          );

        return (
          text.length > 0 &&
          text.length <= 40
        );
      }
    ) as HTMLElement | undefined;

  return fallback || null;
};

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

export const generateTwoColumnIntroPreset = (
  semanticResult: any
): Block => {
  const payload =
    semanticResult?.payload ||
    semanticResult;

  const sourceElement =
    semanticResult?.claimedNode
      ?.element as HTMLElement | undefined;

  const columns =
    Array.isArray(
      payload.columns
    )
      ? payload.columns
      : [];

  const sourceStyle =
    getDesktopStyle(
      sourceElement
    );

  const sourceColumns =
    sourceElement
      ? Array.from(
          sourceElement.children
        ) as HTMLElement[]
      : [];

  const id =
    crypto.randomUUID();

  return {
    id:
      `two-column-intro-${id}`,

    type:
      "section",

    meta: {
      semanticType:
        "TWO_COLUMN_INTRO"
    },

    data: {
      props: {},

      style: {
        desktop: {
          padding:
            sourceStyle.padding &&
            sourceStyle.padding !== "0px"
              ? sourceStyle.padding
              : "0px",

          width:
            "100%",

          boxSizing:
            "border-box"
        },

        tablet: {
          padding:
            "72px 28px",

          width:
            "100%",

          boxSizing:
            "border-box"
        },

        mobile: {
          padding:
            "52px 20px",

          width:
            "100%",

          boxSizing:
            "border-box"
        }
      }
    },

    children: [
      {
        id:
          `two-column-grid-${id}`,

        type:
          "grid",

        data: {
          props: {},

          style: {
            desktop: {
              display:
                "grid",

              gridTemplateColumns:
                sourceStyle.gridTemplateColumns &&
                sourceStyle.gridTemplateColumns !== "none"
                  ? sourceStyle.gridTemplateColumns
                  : "repeat(2, minmax(0, 1fr))",

              gap:
                sourceStyle.gap ||
                sourceStyle.columnGap ||
                "48px",

              width:
                "100%",

              maxWidth:
                sourceStyle.width &&
                sourceStyle.width !== "auto"
                  ? sourceStyle.width
                  : "1180px",

              marginLeft:
                "auto",

              marginRight:
                "auto",

              boxSizing:
                "border-box"
            },

            tablet: {
              display:
                "grid",

              gridTemplateColumns:
                "1fr",

              gap:
                "48px",

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
                "grid",

              gridTemplateColumns:
                "1fr",

              gap:
                "36px",

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

        children:
          columns.map(
            (
              column: any,
              index: number
            ) => {
              const sourceColumn =
                sourceColumns[index];

              const eyebrowElement =
                findEyebrowElement(
                  sourceColumn
                );

              const titleElement =
                sourceColumn?.querySelector(
                  "h1,h2,h3"
                ) as HTMLElement | null;

              const textElement =
                sourceColumn?.querySelector(
                  "p"
                ) as HTMLElement | null;

              const eyebrowStyle =
                getDesktopStyle(
                  eyebrowElement
                );

              const titleStyle =
                getDesktopStyle(
                  titleElement
                );

              const textStyle =
                getDesktopStyle(
                  textElement
                );

              const eyebrowText =
                cleanText(
                  column.eyebrow
                ) ||
                cleanText(
                  eyebrowElement?.textContent
                );

              return {
                id:
                  `two-column-item-${id}-${index}`,

                type:
                  "gridItem",

                data: {
                  props: {},

                  style: {
                    desktop: {
                      width:
                        "100%",

                      minWidth:
                        "0",

                      display:
                        "flex",

                      flexDirection:
                        "column",

                      alignItems:
                        "flex-start",

                      gap:
                        "18px",

                      boxSizing:
                        "border-box"
                    },

                    tablet: {
                      width:
                        "100%",

                      minWidth:
                        "0",

                      display:
                        "flex",

                      flexDirection:
                        "column",

                      alignItems:
                        "flex-start",

                      gap:
                        "16px",

                      boxSizing:
                        "border-box"
                    },

                    mobile: {
                      width:
                        "100%",

                      minWidth:
                        "0",

                      display:
                        "flex",

                      flexDirection:
                        "column",

                      alignItems:
                        "flex-start",

                      gap:
                        "14px",

                      boxSizing:
                        "border-box"
                    }
                  }
                },

                children: [
                  ...(eyebrowText
                    ? [
                        {
                          id:
                            `two-column-eyebrow-${id}-${index}`,

                          type:
                            "text",

                          data: {
                            props: {
                              content:
                                eyebrowText
                            },

                            style: {
                              desktop: {
                                display:
                                  "inline-flex",

                                width:
                                  "max-content",

                                minWidth:
                                  "max-content",

                                maxWidth:
                                  "none",

                                padding:
                                  eyebrowStyle.padding &&
                                  eyebrowStyle.padding !== "0px"
                                    ? eyebrowStyle.padding
                                    : "8px 16px",

                                border:
                                  eyebrowStyle.border &&
                                  !eyebrowStyle.border.startsWith("0px")
                                    ? eyebrowStyle.border
                                    : index === 0
                                      ? "1px solid rgba(247, 127, 0, 0.55)"
                                      : "1px solid rgba(10, 132, 255, 0.55)",

                                borderRadius:
                                  eyebrowStyle.borderRadius &&
                                  eyebrowStyle.borderRadius !== "0px"
                                    ? eyebrowStyle.borderRadius
                                    : "999px",

                                background:
                                  eyebrowStyle.background,

                                backgroundColor:
                                  eyebrowStyle.backgroundColor,

                                color:
                                  eyebrowStyle.color ||
                                  (
                                    index === 0
                                      ? "#f7a531"
                                      : "#38b6ff"
                                  ),

                                fontSize:
                                  eyebrowStyle.fontSize ||
                                  "12px",

                                fontWeight:
                                  eyebrowStyle.fontWeight ||
                                  "700",

                                lineHeight:
                                  eyebrowStyle.lineHeight ||
                                  "1",

                                letterSpacing:
                                  eyebrowStyle.letterSpacing ||
                                  "3px",

                                textTransform:
                                  eyebrowStyle.textTransform ||
                                  "uppercase",

                                whiteSpace:
                                  "nowrap",

                                margin:
                                  eyebrowStyle.margin,

                                marginBottom:
                                  eyebrowStyle.marginBottom ||
                                  "12px"
                              },

                              tablet: {
                                display:
                                  "inline-flex",

                                width:
                                  "max-content",

                                minWidth:
                                  "max-content",

                                maxWidth:
                                  "none",

                                padding:
                                  "7px 14px",

                                borderRadius:
                                  "999px",

                                fontSize:
                                  "11px",

                                letterSpacing:
                                  "2.5px",

                                whiteSpace:
                                  "nowrap"
                              },

                              mobile: {
                                display:
                                  "inline-flex",

                                width:
                                  "max-content",

                                minWidth:
                                  "max-content",

                                maxWidth:
                                  "none",

                                padding:
                                  "7px 12px",

                                borderRadius:
                                  "999px",

                                fontSize:
                                  "10px",

                                letterSpacing:
                                  "2px",

                                whiteSpace:
                                  "nowrap"
                              }
                            }
                          },

                          children: []
                        }
                      ]
                    : []),

                  {
                    id:
                      `two-column-title-${id}-${index}`,

                    type:
                      "title",

                    data: {
                      props: {
                        content:
                          column.title || ""
                      },

                      style: {
                        desktop: {
                          fontSize:
                            titleStyle.fontSize ||
                            "42px",

                          fontWeight:
                            titleStyle.fontWeight ||
                            "700",

                          lineHeight:
                            titleStyle.lineHeight ||
                            "1.1",

                          letterSpacing:
                            titleStyle.letterSpacing ||
                            "-0.025em",

                          textAlign:
                            titleStyle.textAlign,

                          color:
                            titleStyle.color,

                          margin:
                            titleStyle.margin,

                          marginBottom:
                            titleStyle.marginBottom,

                          whiteSpace:
                            "normal",

                          overflowWrap:
                            "break-word"
                        },

                        tablet: {
                          fontSize:
                            scalePx(
                              titleStyle.fontSize,
                              0.78,
                              "36px"
                            ),

                          lineHeight:
                            "1.15",

                          whiteSpace:
                            "normal",

                          overflowWrap:
                            "break-word"
                        },

                        mobile: {
                          fontSize:
                            scalePx(
                              titleStyle.fontSize,
                              0.62,
                              "30px"
                            ),

                          lineHeight:
                            "1.18",

                          whiteSpace:
                            "normal",

                          overflowWrap:
                            "break-word"
                        }
                      }
                    },

                    children: []
                  },

                  {
                    id:
                      `two-column-text-${id}-${index}`,

                    type:
                      "text",

                    data: {
                      props: {
                        content:
                          column.text || ""
                      },

                      style: {
                        desktop: {
                          fontSize:
                            textStyle.fontSize ||
                            "16px",

                          fontWeight:
                            textStyle.fontWeight,

                          lineHeight:
                            textStyle.lineHeight ||
                            "1.75",

                          maxWidth:
                            textStyle.maxWidth &&
                            textStyle.maxWidth !== "none"
                              ? textStyle.maxWidth
                              : "560px",

                          textAlign:
                            textStyle.textAlign,

                          color:
                            textStyle.color,

                          margin:
                            textStyle.margin,

                          whiteSpace:
                            "normal",

                          overflowWrap:
                            "break-word"
                        },

                        tablet: {
                          fontSize:
                            "16px",

                          lineHeight:
                            "1.65",

                          maxWidth:
                            "100%",

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
              };
            }
          )
      }
    ]
  };
};