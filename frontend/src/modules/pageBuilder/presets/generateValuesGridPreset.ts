

export const generateValuesGridPreset = (
  payload: any
) => {

  const uid =
  crypto.randomUUID();

  const items =

    payload.items
      .map(
        (
          item: any,
          index: number
        ) => {

          if (
            !item.title
          ) {

            return null;
          }

          return {

            id:
              `value-item-${uid}-${index}`,

            type:
              "gridItem",

            data: {

              props: {},

              style: {

                desktop: {

                  padding:
                    "24px",

                  border:
                    "1px solid rgba(0,0,0,0.08)",

                  borderRadius:
                    "16px"
                }
              }
            },

            children: [

              // =====================================
              // TITLE
              // =====================================

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

                      fontSize:
                        "24px",

                      fontWeight:
                        "200",

                      marginBottom:
                        "12px"
                    }
                  }
                },

                children: []
              },

              // =====================================
              // DESCRIPTION
              // =====================================

              item.description

                ? {

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

                          fontSize:
                            "16px",

                          lineHeight:
                            "1.6"
                        }
                      }
                    },

                    children: []
                  }

                : null
            ]

            .filter(
              (
                child: any
              ): child is any =>

                child !== null
            )
          };
        }
      )

      .filter(
        (
          item: any
        ): item is any =>

          item !== null
      );

console.log(
  "VALUES GRID RESULT",
  {
    sectionStyle:
      payload.sectionStyle,
    gridStyle:
      payload.gridStyle,
    columnCount:
      payload.columnCount
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

  payload.sectionStyle ||

  {
    desktop: { padding: "80px 40px"}
  }
      },
   children: [

  {

    id:
      `values-grid-${uid}`,

    type:
      "grid",

    data: {

      props: {},
style: {

  ...payload.gridStyle,

  desktop: {

    ...payload.gridStyle?.desktop,

    display: "grid",

    gridTemplateColumns:
      `repeat(${payload.columnCount || 5}, minmax(0,1fr))`
  },

tablet: {

  display: "grid",

  gridTemplateColumns:
    "repeat(2, minmax(0,1fr))"
},

mobile: {

  display: "grid",

  gridTemplateColumns:
    "repeat(1, minmax(0,1fr))"
}
      }
    },

    children:
      items
  }
]
  };
};