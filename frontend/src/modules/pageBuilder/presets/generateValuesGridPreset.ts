



export const generateValuesGridPreset = (payload: any) => {
  const uid = crypto.randomUUID();

  console.log(
  "VALUES_GRID_PAYLOAD_FIRST_ITEM",
  payload.items?.[0]
);


  const items = (payload.items || [])
    .map((item: any, index: number) => {

      console.log(
  "VALUES_GRID_ITEM_STYLE",
  item.cardStyle
);
      if (!item.title) return null;

      return {
        id: `value-item-${uid}-${index}`,
        type: "gridItem",
        data: {
          props: {},
          style: {
            desktop: item.cardStyle || {}
          }
        },
        children: [
          item.eyebrow
            ? {
                id: `value-eyebrow-${uid}-${index}`,
                type: "text",
                data: {
                  props: { content: item.eyebrow },
                  style: { desktop: item.eyebrowStyle || {} }
                },
                children: []
              }
            : null,
          {
            id: `value-title-${uid}-${index}`,
            type: "text",
            data: {
              props: { content: item.title },
              style: { desktop: item.titleStyle || {} }
            },
            children: []
          },
          item.description
            ? {
                id: `value-description-${uid}-${index}`,
                type: "text",
                data: {
                  props: { content: item.description },
                  style: { desktop: item.descriptionStyle || {} }
                },
                children: []
              }
            : null,
          item.cta
            ? {
                id: `value-cta-${uid}-${index}`,
                type: "text",
                data: {
                  props: { content: item.cta },
                  style: { desktop: item.ctaStyle || {} }
                },
                children: []
              }
            : null
        ].filter((child: any) => child !== null)
      };
    })
    .filter((item: any) => item !== null);
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
      ...(payload.title
        ? [
            {
              id: `values-grid-header-${uid}`,
              type: "flex",
              data: {
                props: {},
                style: payload.headerStyle || {
                  desktop: {
                    flexDirection: "column",
                    gap: "12px",
                    marginBottom: "32px"
                  }
                }
              },
              children: [
                ...(payload.eyebrow
                  ? [
                      {
                        id: `values-grid-eyebrow-${uid}`,
                        type: "text",
                        data: {
                          props: { content: payload.eyebrow },
                          style: { desktop: payload.eyebrowStyle || {} }
                        },
                        children: []
                      }
                    ]
                  : []),
                {
                  id: `values-grid-title-${uid}`,
                  type: "title",
                  data: {
                    props: { content: payload.title },
                    style: { desktop: payload.titleStyle || {} }
                  },
                  children: []
                }
              ]
            }
          ]
        : []),
      {
        id: `values-grid-${uid}`,
        type: "grid",
        data: {
          props: {},
          style: {
            ...payload.gridStyle,
            desktop: {
              display: "grid",
              gridTemplateColumns: `repeat(${payload.columnCount || 5}, minmax(0,1fr))`,
              ...payload.gridStyle?.desktop
            },
            tablet: {
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0,1fr))",
              ...payload.gridStyle?.tablet
            },
            mobile: {
              display: "grid",
              gridTemplateColumns: "repeat(1, minmax(0,1fr))",
              ...payload.gridStyle?.mobile
            }
          }
        },
        children: items
      }
    ]
  };
};