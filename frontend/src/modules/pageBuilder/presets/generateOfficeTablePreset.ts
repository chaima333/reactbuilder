import { OfficeTablePayload } from "../runtime/importers/html/semanticContracts/OfficeTablePayload";

const DEFAULT_OFFICE_CONTAINER_MAX_WIDTH =
  "1180px";

const withDesktopFallback = (
  fallback: Record<string, any>,
  extracted?: Record<string, any>
) => ({
  ...fallback,
  ...(extracted || {})
});

const getDesktopStyle = (
  style?: Record<string, any>
) =>
  style?.desktop || style || {};

const isUsefulMaxWidth = (
  value?: any
) => {
  const text =
    String(value || "").trim();

  return (
    !!text &&
    text !== "none" &&
    text !== "auto" &&
    text !== "100%" &&
    text !== "100vw"
  );
};

const resolveOfficeMaxWidth = (
  payload: OfficeTablePayload
) => {
  const containerDesktop =
    getDesktopStyle(
      payload.containerStyle as any
    );

  const tableDesktop =
    getDesktopStyle(
      payload.tableStyle as any
    );

  const sectionDesktop =
    getDesktopStyle(
      payload.sectionStyle as any
    );

  if (
    isUsefulMaxWidth(
      containerDesktop.maxWidth
    )
  ) {
    return containerDesktop.maxWidth;
  }

  if (
    isUsefulMaxWidth(
      tableDesktop.maxWidth
    )
  ) {
    return tableDesktop.maxWidth;
  }

  if (
    isUsefulMaxWidth(
      sectionDesktop.maxWidth
    )
  ) {
    return sectionDesktop.maxWidth;
  }

  return DEFAULT_OFFICE_CONTAINER_MAX_WIDTH;
};

const resolveContainerStyle = (
  payload: OfficeTablePayload,
  fallback: Record<string, any> = {}
) => {
  const desktop =
    getDesktopStyle(
      payload.containerStyle as any
    );
    const cleanedDesktop = {
  ...desktop
};

delete cleanedDesktop.margin;
delete cleanedDesktop.marginLeft;
delete cleanedDesktop.marginRight;

  return {
    desktop: {
      ...fallback,
      ...cleanedDesktop,

      display:
        desktop.display ||
        fallback.display ||
        "flex",

      flexDirection:
        desktop.flexDirection ||
        fallback.flexDirection ||
        "column",

      width:
        "100%",

      maxWidth:
        resolveOfficeMaxWidth(
          payload
        ),

      marginLeft:
        "auto",

      marginRight:
        "auto",

      boxSizing:
        "border-box",

      minWidth:
        "0",

      overflow:
        "visible"
    },

    tablet: {
      width:
        "100%",

      maxWidth:
        "100%",

      marginLeft:
        "auto",

      marginRight:
        "auto",

      boxSizing:
        "border-box",

      minWidth:
        "0",

      overflow:
        "visible"
    },

    mobile: {
      width:
        "100%",

      maxWidth:
        "100%",

      marginLeft:
        "auto",

      marginRight:
        "auto",

      boxSizing:
        "border-box",

      minWidth:
        "0",

      overflow:
        "visible"
    }
  };
};

const resolveSectionStyle = (
  payload: OfficeTablePayload
) => {
  const desktop =
    getDesktopStyle(
      payload.sectionStyle as any
    );

  return {
    desktop: {
      ...withDesktopFallback(
        {
          padding:
            "96px 40px"
        },
        desktop
      ),

      width:
        "100%",

      maxWidth:
        "100%",

      minWidth:
        "0",

      boxSizing:
        "border-box",

      overflow:
        "visible"
    },

    tablet: {
      padding:
        "72px 24px",

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
        "56px 20px",

      width:
        "100%",

      maxWidth:
        "100%",

      boxSizing:
        "border-box",

      overflow:
        "visible"
    }
  };
};

const resolveHeaderStyle = (
  payload: OfficeTablePayload
) => {
  const desktop =
    getDesktopStyle(
      payload.headerStyle as any
    );

  return {
    desktop: {
      ...withDesktopFallback(
        {
          display:
            "flex",

          flexDirection:
            "column",

          alignItems:
            "flex-start",

          textAlign:
            "left",

          gap:
            "18px",

          maxWidth:
            "760px",

          marginBottom:
            "56px"
        },
        desktop
      ),

      width:
        "100%",

      boxSizing:
        "border-box",

      overflow:
        "visible"
    },

    tablet: {
      display:
        "flex",

      flexDirection:
        "column",

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

      width:
        "100%",

      maxWidth:
        "100%",

      boxSizing:
        "border-box"
    }
  };
};

const resolveTableStyle = (
  payload: OfficeTablePayload
) => {
  const desktop =
    getDesktopStyle(
      payload.tableStyle as any
    );

  return {
    desktop: {
      ...withDesktopFallback(
        {
          display:
            "flex",

          flexDirection:
            "column"
        },
        desktop
      ),

      width:
        "100%",

      maxWidth:
        "100%",

      marginLeft:
        "0",

      marginRight:
        "0",

      overflow:
        "hidden",

      boxSizing:
        "border-box",

      minWidth:
        "0"
    },

    tablet: {
      display:
        "flex",

      flexDirection:
        "column",

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

      width:
        "100%",

      maxWidth:
        "100%",

      boxSizing:
        "border-box"
    }
  };
};

export const generateOfficeTablePreset = (
  payload: OfficeTablePayload
) => {
  const uid =
    crypto.randomUUID();

  const rows =
    (payload.items || []).map(
      (
        item,
        index
      ) => {
        const rowDesktop =
          item.rowStyle?.desktop ||
          item.rowStyle ||
          {};

        const sourceColumns =
          rowDesktop.gridTemplateColumns &&
          rowDesktop.gridTemplateColumns !== "none"
            ? rowDesktop.gridTemplateColumns
            : "max-content minmax(0, 1fr)";

        return {
          id:
            `office-row-${uid}-${index}`,

          type:
            "grid",

          data: {
            props: {},

            style: {
              desktop: {
                ...rowDesktop,

                display:
                  "grid",

                gridTemplateColumns:
                  sourceColumns,

                columnGap:
                  rowDesktop.columnGap ||
                  rowDesktop.gap ||
                  "clamp(24px, 5vw, 96px)",

                rowGap:
                  rowDesktop.rowGap ||
                  "12px",

                alignItems:
                  rowDesktop.alignItems ||
                  "center",

                width:
                  "100%",

                maxWidth:
                  "100%",

                minWidth:
                  "0",

                boxSizing:
                  "border-box",

                overflow:
                  "visible"
              },

              tablet: {
                ...(item.rowStyle?.tablet || {}),

                display:
                  "grid",

                gridTemplateColumns:
                  "1fr",

                gap:
                  "12px",

                width:
                  "100%",

                maxWidth:
                  "100%",

                boxSizing:
                  "border-box"
              },

              mobile: {
                ...(item.rowStyle?.mobile || {}),

                display:
                  "grid",

                gridTemplateColumns:
                  "1fr",

                gap:
                  "12px",

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
                `office-left-cell-${uid}-${index}`,

              type:
                "gridItem",

              data: {
                props: {},

                style: {
                  desktop: {
                    minWidth:
                      "0",

                    boxSizing:
                      "border-box"
                  },

                  tablet: {
                    width:
                      "100%"
                  },

                  mobile: {
                    width:
                      "100%"
                  }
                }
              },

              children: [
                {
                  id:
                    `office-name-${uid}-${index}`,

                  type:
                    "flex",

                  data: {
                    props: {},

                    style: {
                      desktop: {
                        ...withDesktopFallback(
                          {
                            display:
                              "flex",

                            flexDirection:
                              "column",

                            gap:
                              "6px"
                          },
                          item.nameStyle
                        )
                      },

                      tablet: {
                        display:
                          "flex",

                        flexDirection:
                          "column"
                      },

                      mobile: {
                        display:
                          "flex",

                        flexDirection:
                          "column"
                      }
                    }
                  },

                  children: [
                    {
                      id:
                        `office-title-item-${uid}-${index}`,

                      type:
                        "flexItem",

                      data: {
                        props: {},

                        style: {
                          desktop: {
                            width:
                              "100%"
                          }
                        }
                      },

                      children: [
                        {
                          id:
                            `office-title-${uid}-${index}`,

                          type:
                            "text",

                          data: {
                            props: {
                              content:
                                item.title
                            },

                            style: {
                              desktop: {
                                ...withDesktopFallback(
                                  {},
                                  item.titleStyle
                                )
                              }
                            }
                          },

                          children: []
                        }
                      ]
                    },

                    (item as any).subtitle
                      ? {
                          id:
                            `office-subtitle-item-${uid}-${index}`,

                          type:
                            "flexItem",

                          data: {
                            props: {},

                            style: {
                              desktop: {
                                width:
                                  "100%"
                              }
                            }
                          },

                          children: [
                            {
                              id:
                                `office-subtitle-${uid}-${index}`,

                              type:
                                "text",

                              data: {
                                props: {
                                  content:
                                    (item as any).subtitle
                                },

                                style: {
                                  desktop: {
                                    ...withDesktopFallback(
                                      {},
                                      item.subtitleStyle
                                    )
                                  }
                                }
                              },

                              children: []
                            }
                          ]
                        }
                      : null
                  ].filter(Boolean)
                }
              ]
            },

            {
              id:
                `office-right-cell-${uid}-${index}`,

              type:
                "gridItem",

              data: {
                props: {},

                style: {
                  desktop: {
                    minWidth:
                      "0",

                    boxSizing:
                      "border-box"
                  },

                  tablet: {
                    width:
                      "100%"
                  },

                  mobile: {
                    width:
                      "100%"
                  }
                }
              },

              children: [
                {
                  id:
                    `office-description-${uid}-${index}`,

                  type:
                    "text",

                  data: {
                    props: {
                      content:
                        item.description
                    },

                    style: {
                      desktop: {
                        ...withDesktopFallback(
                          {},
                          item.descriptionStyle
                        )
                      }
                    }
                  },

                  children: []
                }
              ]
            }
          ]
        };
      }
    );

  const contentChildren = [
    {
      id:
        `office-header-${uid}`,

      type:
        "flex",

      data: {
        props: {},

        style:
          resolveHeaderStyle(
            payload
          )
      },

      children: [
        payload.badge
          ? {
              id:
                `office-badge-${uid}`,

              type:
                "text",

              data: {
                props: {
                  content:
                    payload.badge
                },

                style: {
                  desktop: {
                    ...withDesktopFallback(
                      {},
                      payload.badgeStyle
                    )
                  }
                }
              },

              children: []
            }
          : null,

        payload.title
          ? {
              id:
                `office-heading-${uid}`,

              type:
                "text",

              data: {
                props: {
                  content:
                    payload.title
                },

                style: {
                  desktop: {
                    ...withDesktopFallback(
                      {},
                      payload.titleStyle
                    )
                  }
                }
              },

              children: []
            }
          : null,

        payload.description
          ? {
              id:
                `office-head-description-${uid}`,

              type:
                "text",

              data: {
                props: {
                  content:
                    payload.description
                },

                style: {
                  desktop: {
                    ...withDesktopFallback(
                      {},
                      payload.descriptionStyle
                    )
                  }
                }
              },

              children: []
            }
          : null
      ].filter(Boolean)
    },

    {
      id:
        `office-table-container-${uid}`,

      type:
        "flex",

      data: {
        props: {},

        style:
          resolveTableStyle(
            payload
          )
      },

      children:
        rows
    }
  ];

  const containerStyle =
    resolveContainerStyle(
      payload,
      {
        display:
          "flex",

        flexDirection:
          "column",

        width:
          "100%"
      }
    );

  console.log(
    "OFFICE_TABLE_STYLE_DEBUG",
    {
      sectionDesktop:
        resolveSectionStyle(
          payload
        ).desktop,

      containerDesktop:
        containerStyle.desktop,

      tableDesktop:
        resolveTableStyle(
          payload
        ).desktop
    }
  );

  return {
    id:
      `office-table-section-${uid}`,

    type:
      "section",

    meta: {
      semanticType:
        "OFFICES_TABLE"
    },

    data: {
      props: {},

      style:
        resolveSectionStyle(
          payload
        )
    },

    children: [
      {
        id:
          `office-section-container-${uid}`,

        type:
          "flex",

        data: {
          props: {},

          style:
            containerStyle
        },

        children:
          contentChildren
      }
    ]
  };
};