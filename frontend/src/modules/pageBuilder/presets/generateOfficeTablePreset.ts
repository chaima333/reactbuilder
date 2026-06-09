import { OfficeTablePayload } from "../runtime/importers/html/semanticContracts/OfficeTablePayload";

export const generateOfficeTablePreset = (
  payload: OfficeTablePayload
) => {

  const uid =
    crypto.randomUUID();

  const rows =

    payload.items
      .map(
        (
          item,
          index
        ) => {

          return {

            id:
              `office-row-${uid}-${index}`,

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

                      fontSize:
                        "24px",

                      fontWeight:
                        "700",

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

                      fontSize:
                        "16px",

                      lineHeight:
                        "1.6"
                    }
                  }
                },

                children: []
              }
            ]
          };
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

      style: {

        desktop: {

          padding:
            "80px 40px"
        }
      }
    },

    children: [

      {

        id:
          `office-table-grid-${uid}`,

        type:
          "grid",

        data: {

          props: {},

          style: {

            desktop: {

              display:
                "grid",

              gridTemplateColumns:
                "repeat(2,1fr)",

              gap:
                "24px"
            }
          }
        },

        children:
          rows
      }
    ]
  };
};