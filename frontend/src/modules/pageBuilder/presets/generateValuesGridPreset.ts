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
            ...(item.cardStyle || { desktop: {} })
          }
        },
        children: [
          item.eyebrow && {
            id: `value-eyebrow-${uid}-${index}`,
            type: "text",
            data: {
              props: { content: item.eyebrow },
              style: item.eyebrowStyle || { desktop: {} }
            },
            children: []
          },
          {
            id: `value-title-${uid}-${index}`,
            type: "text",
            data: {
              props: { content: item.title },
              style: item.titleStyle || { desktop: {} }
            },
            children: []
          },
          item.description && {
            id: `value-description-${uid}-${index}`,
            type: "text",
            data: {
              props: { content: item.description },
              style: item.descriptionStyle || { desktop: {} }
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
        ...payload.gridStyle,
        desktop: {
          ...payload.gridStyle?.desktop,
          display: "grid",
          width: "100%",
          gridTemplateColumns:
            payload.gridStyle?.desktop?.gridTemplateColumns ||
            "repeat(auto-fit, minmax(0, 1fr))",
          gap:
            payload.gridStyle?.desktop?.gap ||
            payload.gridStyle?.gap ||
            "16px"
        },
        tablet: {
          ...payload.gridStyle?.tablet,
          display: "grid",
          gridTemplateColumns:
            payload.gridStyle?.tablet?.gridTemplateColumns ||
            payload.gridStyle?.desktop?.gridTemplateColumns ||
            "repeat(auto-fit, minmax(0, 1fr))",
          width: "100%"
        },
        mobile: {
          ...payload.gridStyle?.mobile,
          display: "grid",
          gridTemplateColumns:
            payload.gridStyle?.mobile?.gridTemplateColumns ||
            "1fr",
          width: "100%"
        }
      }
    },
    children: items
  };

  const containerStyle = {
    ...(payload.containerStyle || {}),
    desktop: {
      display: "flex",
      flexDirection: "column",
      width: "100%",
      marginLeft: "auto",
      marginRight: "auto",
      ...(payload.containerStyle?.desktop || {})
    },
    tablet: {
      ...(payload.containerStyle?.tablet || {}),
      width: "100%",
      maxWidth: "100%"
    },
    mobile: {
      ...(payload.containerStyle?.mobile || {}),
      width: "100%",
      maxWidth: "100%"
    }
  };

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
