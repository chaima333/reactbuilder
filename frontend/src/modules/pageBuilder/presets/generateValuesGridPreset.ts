const normalizeStyle = (
  style: any = {}
) => ({
  desktop: {
    ...(style.desktop || {})
  },

  tablet: {
    ...(style.tablet || {})
  },

  mobile: {
    ...(style.mobile || {})
  }
});

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

const estimateValuesContainerWidth = (
  itemCount: number
) => {
  const estimated =
    itemCount * 260 +
    Math.max(
      0,
      itemCount - 1
    ) * 24;

  const clamped =
    Math.min(
      1420,
      Math.max(
        980,
        estimated
      )
    );

  return `${clamped}px`;
};

const resolveContainerMaxWidth = (
  payload: any,
  itemCount: number
) => {
  const containerDesktop =
    payload.containerStyle?.desktop || {};

  const sectionDesktop =
    payload.sectionStyle?.desktop || {};

  const gridDesktop =
    payload.gridStyle?.desktop || {};

  if (
    isUsefulMaxWidth(
      containerDesktop.maxWidth
    )
  ) {
    return containerDesktop.maxWidth;
  }

  if (
    isUsefulMaxWidth(
      gridDesktop.maxWidth
    )
  ) {
    return gridDesktop.maxWidth;
  }

  if (
    isUsefulMaxWidth(
      sectionDesktop.maxWidth
    )
  ) {
    return sectionDesktop.maxWidth;
  }

  return estimateValuesContainerWidth(
    itemCount
  );
};

const resolveDesktopGridColumns = (
  payload: any,
  itemCount: number
) => {
  const source =
    payload.gridStyle?.desktop
      ?.gridTemplateColumns;

  if (
    source &&
    source !== "none"
  ) {
    return source;
  }

  if (
    itemCount > 1 &&
    itemCount <= 5
  ) {
    return `repeat(${itemCount}, minmax(0, 1fr))`;
  }

  return "repeat(auto-fit, minmax(220px, 1fr))";
};

const createSectionStyle = (
  payload: any
) => {
  const source =
    normalizeStyle(
      payload.sectionStyle || {
        desktop: {
          padding:
            "80px 40px"
        }
      }
    );

  return {
    ...source,

    desktop: {
      ...source.desktop,

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
      ...source.tablet,

      width:
        "100%",

      maxWidth:
        "100%",

      boxSizing:
        "border-box"
    },

    mobile: {
      ...source.mobile,

      width:
        "100%",

      maxWidth:
        "100%",

      boxSizing:
        "border-box"
    }
  };
};

const createContainerStyle = (
  payload: any,
  itemCount: number
) => {
  const source =
    normalizeStyle(
      payload.containerStyle
    );

  const desktop =
    {
      ...source.desktop
    };

  delete desktop.margin;
  delete desktop.marginTop;
  delete desktop.marginBottom;

  return {
    ...source,

    desktop: {
      ...desktop,

      display:
        "flex",

      flexDirection:
        "column",

      alignItems:
        "stretch",

      width:
        "100%",

      maxWidth:
        resolveContainerMaxWidth(
          payload,
          itemCount
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
      ...source.tablet,

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
        "0"
    },

    mobile: {
      ...source.mobile,

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
        "0"
    }
  };
};

export const generateValuesGridPreset = (
  payload: any
) => {
  const uid =
    crypto.randomUUID();

  const rawItems =
    payload.items || [];

  const validItems =
    rawItems.filter(
      (item: any) =>
        !!item?.title
    );

  const items =
    validItems.map(
      (
        item: any,
        index: number
      ) => ({
        id:
          `value-item-${uid}-${index}`,

        type:
          "gridItem",

        data: {
          props: {},

          style: {
            desktop: {
              ...(item.cardStyle?.desktop ||
                item.cardStyle ||
                {}),

              width:
                "100%",

              height:
                "100%",

              display:
                "flex",

              flexDirection:
                "column",

              alignItems:
                "center",

              justifyContent:
                "center",

              textAlign:
                "center",

              boxSizing:
                "border-box",

              overflow:
                "visible"
            },

            tablet: {
              ...(item.cardStyle?.tablet || {}),

              width:
                "100%",

              boxSizing:
                "border-box"
            },

            mobile: {
              ...(item.cardStyle?.mobile || {}),

              width:
                "100%",

              boxSizing:
                "border-box"
            }
          }
        },

        children: [
          item.eyebrow && {
            id:
              `value-eyebrow-${uid}-${index}`,

            type:
              "text",

            data: {
              props: {
                content:
                  item.eyebrow
              },

              style: {
                desktop: {
                  ...(item.eyebrowStyle?.desktop ||
                    item.eyebrowStyle ||
                    {}),

                  width:
                    "100%",

                  textAlign:
                    "center"
                },

                tablet: {
                  ...(item.eyebrowStyle?.tablet || {})
                },

                mobile: {
                  ...(item.eyebrowStyle?.mobile || {})
                }
              }
            },

            children: []
          },

          {
            id:
              `value-title-${uid}-${index}`,

            type:
              "text",

            data: {
              props: {
                content:
                  item.title
              },

              style: {
                desktop: {
                  ...(item.titleStyle?.desktop ||
                    item.titleStyle ||
                    {}),

                  width:
                    "100%",

                  textAlign:
                    "center"
                },

                tablet: {
                  ...(item.titleStyle?.tablet || {})
                },

                mobile: {
                  ...(item.titleStyle?.mobile || {})
                }
              }
            },

            children: []
          },

          item.description && {
            id:
              `value-description-${uid}-${index}`,

            type:
              "text",

            data: {
              props: {
                content:
                  item.description
              },

              style: {
                desktop: {
                  ...(item.descriptionStyle?.desktop ||
                    item.descriptionStyle ||
                    {}),

                  width:
                    "100%",

                  textAlign:
                    "center"
                },

                tablet: {
                  ...(item.descriptionStyle?.tablet || {})
                },

                mobile: {
                  ...(item.descriptionStyle?.mobile || {})
                }
              }
            },

            children: []
          }
        ].filter(Boolean)
      })
    );

  const headerChildren = [
    payload.eyebrow && {
      id:
        `values-grid-eyebrow-${uid}`,

      type:
        "text",

      data: {
        props: {
          content:
            payload.eyebrow
        },

        style:
          payload.eyebrowStyle || {
            desktop: {}
          }
      },

      children: []
    },

    payload.title && {
      id:
        `values-grid-title-${uid}`,

      type:
        "title",

      data: {
        props: {
          content:
            payload.title,

          ...(payload.titleSegments?.length
            ? {
                segments:
                  payload.titleSegments
              }
            : {})
        },

        style:
          payload.titleStyle || {
            desktop: {}
          }
      },

      children: []
    },

    payload.description && {
      id:
        `values-grid-description-${uid}`,

      type:
        "text",

      data: {
        props: {
          content:
            payload.description
        },

        style:
          payload.descriptionStyle || {
            desktop: {}
          }
      },

      children: []
    }
  ].filter(Boolean);

  const headerBlock =
    headerChildren.length
      ? {
          id:
            `values-grid-header-${uid}`,

          type:
            "flex",

          data: {
            props: {},

            style:
              payload.headerStyle || {
                desktop: {
                  display:
                    "flex",

                  flexDirection:
                    "column",

                  alignItems:
                    "flex-start",

                  textAlign:
                    "left",

                  gap:
                    "12px",

                  marginBottom:
                    "64px"
                },

                tablet: {},

                mobile: {}
              }
          },

          children: [
            {
              id:
                `values-grid-header-inner-${uid}`,

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

                    minWidth:
                      "0"
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

              children:
                headerChildren
            }
          ]
        }
      : null;

  const gridBlock = {
    id:
      `values-grid-${uid}`,

    type:
      "grid",

    data: {
      props: {},

      style: {
        desktop: {
          ...(payload.gridStyle?.desktop || {}),

          display:
            "grid",

          width:
            "100%",

          maxWidth:
            "100%",

          gridTemplateColumns:
            resolveDesktopGridColumns(
              payload,
              items.length
            ),

          gap:
            payload.gridStyle?.desktop?.gap ||
            payload.gridStyle?.gap ||
            "24px",

          justifyItems:
            "stretch",

          alignItems:
            "stretch",

          boxSizing:
            "border-box",

          minWidth:
            "0",

          overflow:
            "visible"
        },

        tablet: {
          ...(payload.gridStyle?.tablet || {}),

          display:
            "grid",

          width:
            "100%",

          maxWidth:
            "100%",

          gridTemplateColumns:
            payload.gridStyle?.tablet
              ?.gridTemplateColumns ||
            "repeat(2, minmax(0, 1fr))",

          gap:
            payload.gridStyle?.tablet?.gap ||
            payload.gridStyle?.desktop?.gap ||
            "20px",

          justifyItems:
            "stretch",

          alignItems:
            "stretch",

          boxSizing:
            "border-box"
        },

        mobile: {
          ...(payload.gridStyle?.mobile || {}),

          display:
            "grid",

          width:
            "100%",

          maxWidth:
            "100%",

          gridTemplateColumns:
            "1fr",

          gap:
            payload.gridStyle?.mobile?.gap ||
            payload.gridStyle?.desktop?.gap ||
            "16px",

          justifyItems:
            "stretch",

          alignItems:
            "stretch",

          boxSizing:
            "border-box"
        }
      }
    },

    children:
      items
  };

  const sectionStyle =
    createSectionStyle(
      payload
    );

  const containerStyle =
    createContainerStyle(
      payload,
      items.length
    );

  console.log(
    "VALUES_GRID_PRESET_STYLE",
    {
      sectionDesktop:
        sectionStyle.desktop,

      containerDesktop:
        containerStyle.desktop,

      gridDesktop:
        gridBlock.data.style.desktop
    }
  );

  return {
    id:
      `values-grid-section-${uid}`,

    type:
      "section",

    meta: {
      semanticType:
        "VALUES_GRID"
    },

    data: {
      props: {},

      style:
        sectionStyle
    },

    children: [
      {
        id:
          `values-grid-container-${uid}`,

        type:
          "flex",

        data: {
          props: {},

          style:
            containerStyle
        },

        children: [
          headerBlock && {
            id:
              `values-grid-header-item-${uid}`,

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

                  minWidth:
                    "0"
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
              headerBlock
            ]
          },

          {
            id:
              `values-grid-content-item-${uid}`,

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

                  minWidth:
                    "0"
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
              gridBlock
            ]
          }
        ].filter(Boolean)
      }
    ]
  };
};