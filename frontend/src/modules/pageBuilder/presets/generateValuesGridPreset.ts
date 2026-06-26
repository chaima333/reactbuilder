export const generateValuesGridPreset = (payload: any) => {
  const uid = crypto.randomUUID();

  const items = (payload.items || [])
  .map((item: any, index: number) => {
    if (!item.title) return null;

    return {
      id: `value-item-${uid}-${index}`,
      type: "gridItem",
      data: {
        props: {},
        style: {
          desktop: {
            ...(item.cardStyle?.desktop || item.cardStyle || {}),
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center"
          },
          tablet: {
            ...(item.cardStyle?.tablet || {})
          },
          mobile: {
            ...(item.cardStyle?.mobile || {})
          }
        }
      },
      children: [
        item.eyebrow && {
          id: `value-eyebrow-${uid}-${index}`,
          type: "text",
          data: {
            props: {
              content: item.eyebrow
            },
            style: {
              desktop: {
                ...(item.eyebrowStyle?.desktop ||
                  item.eyebrowStyle ||
                  {}),
                width: "100%",
                textAlign: "center"
              },
              tablet: {},
              mobile: {}
            }
          },
          children: []
        },

        {
          id: `value-title-${uid}-${index}`,
          type: "text",
          data: {
            props: {
              content: item.title
            },
            style: {
              desktop: {
                ...(item.titleStyle?.desktop ||
                  item.titleStyle ||
                  {}),
                width: "100%",
                textAlign: "center"
              },
              tablet: {},
              mobile: {}
            }
          },
          children: []
        },

        item.description && {
          id: `value-description-${uid}-${index}`,
          type: "text",
          data: {
            props: {
              content: item.description
            },
            style: {
              desktop: {
                ...(item.descriptionStyle?.desktop ||
                  item.descriptionStyle ||
                  {}),
                width: "100%",
                textAlign: "center"
              },
              tablet: {},
              mobile: {}
            }
          },
          children: []
        }
      ].filter(Boolean)
    };
  })
  .filter(Boolean);

  const headerChildren = [
    payload.eyebrow && {
      id: `values-grid-eyebrow-${uid}`,
      type: "text",
      data: {
        props: { content: payload.eyebrow },
        style: payload.eyebrowStyle || { desktop: {} }
      },
      children: []
    },
    payload.title && {
      id: `values-grid-title-${uid}`,
      type: "title",
      data: {
        props: { content: payload.title },
        style: payload.titleStyle || { desktop: {} }
      },
      children: []
    },
    payload.description && {
      id: `values-grid-description-${uid}`,
      type: "text",
      data: {
        props: { content: payload.description },
        style: payload.descriptionStyle || { desktop: {} }
      },
      children: []
    }
  ].filter(Boolean);

  const headerBlock = headerChildren.length
    ? {
        id: `values-grid-header-${uid}`,
        type: "flex",
        data: {
          props: {},
          style: payload.headerStyle || {
            desktop: {
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              textAlign: "left",
              gap: "12px",
              marginBottom: "64px"
            }
          }
        },
        children: [
          {
            id: `values-grid-header-inner-${uid}`,
            type: "flexItem",
            data: {
              props: {},
              style: {
                desktop: {
                  width: "100%"
                }
              }
            },
            children: headerChildren
          }
        ]
      }
    : null;

  const gridBlock = {
  id: `values-grid-${uid}`,
  type: "grid",
  data: {
    props: {},
    style: {
      desktop: {
        display: "grid",
        width: "100%",
        gridTemplateColumns:
          payload.gridStyle?.desktop?.gridTemplateColumns ||
          "repeat(auto-fit, minmax(220px, 1fr))",

        gap:
          payload.gridStyle?.desktop?.gap ||
          payload.gridStyle?.gap ||
          "16px",

        justifyItems: "stretch",
        alignItems: "stretch"
      },

      tablet: {
        display: "grid",
        width: "100%",
        gridTemplateColumns:
          payload.gridStyle?.tablet?.gridTemplateColumns ||
          "repeat(2, minmax(220px,1fr))",

        gap:
          payload.gridStyle?.tablet?.gap ||
          payload.gridStyle?.desktop?.gap ||
          "16px",

        justifyItems: "stretch",
        alignItems: "stretch"
      },

      mobile: {
        display: "grid",
        width: "100%",
        gridTemplateColumns: "1fr",

        gap:
          payload.gridStyle?.mobile?.gap ||
          payload.gridStyle?.desktop?.gap ||
          "16px",

        justifyItems: "stretch",
        alignItems: "stretch"
      }
    }
  },

  children: items
};

 const containerDesktop = {
  ...(payload.containerStyle?.desktop || {})
};

delete containerDesktop.margin;
delete containerDesktop.marginTop;
delete containerDesktop.marginBottom;
delete containerDesktop.marginLeft;
delete containerDesktop.marginRight;

const containerStyle = {
  ...(payload.containerStyle || {}),
  desktop: {
    ...containerDesktop,
    display: "flex",
    flexDirection: "column",
    width: "100%",
    maxWidth:
      containerDesktop.maxWidth || "1180px",
    marginLeft: "auto",
    marginRight: "auto"
  },
}

  return {
    id: `values-grid-section-${uid}`,
    type: "section",
    meta: {
      semanticType: "VALUES_GRID"
    },
    data: {
      props: {},
      style: payload.sectionStyle || {
        desktop: { padding: "80px 40px" }
      }
    },
    children: [
      {
        id: `values-grid-container-${uid}`,
        type: "flex",
        data: {
          props: {},
          style: containerStyle
        },
        children: [
          headerBlock && {
            id: `values-grid-header-item-${uid}`,
            type: "flexItem",
            data: {
              props: {},
              style: {
                desktop: { width: "100%" }
              }
            },
            children: [headerBlock]
          },
          {
            id: `values-grid-content-item-${uid}`,
            type: "flexItem",
            data: {
              props: {},
              style: {
                desktop: { width: "100%" }
              }
            },
            children: [gridBlock]
          }
        ].filter(Boolean)
      }
    ]
  };
};
