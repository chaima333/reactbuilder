import { OfficeTablePayload } from "../runtime/importers/html/semanticContracts/OfficeTablePayload";

const withDesktopFallback = (
  fallback: Record<string, any>,
  extracted?: Record<string, any>
) => ({
  ...fallback,
  ...(extracted || {})
});

export const generateOfficeTablePreset = (
  payload: OfficeTablePayload
) => {
  const uid = crypto.randomUUID();

  const rows = (payload.items || []).map((item, index) => ({
    id: `office-row-${uid}-${index}`,
    type: "flexItem",

    data: {
      props: {},
      style: {
        desktop: {
          ...withDesktopFallback(
            {
              display: "grid",
              gridTemplateColumns: "280px 1fr",
              gap: "32px",
              padding: "32px 36px",
              boxSizing: "border-box"
            },
            item.rowStyle
          )
        },
        tablet: {
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "12px",
          width: "100%",
          boxSizing: "border-box"
        },
        mobile: {
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "12px",
          width: "100%",
          boxSizing: "border-box"
        }
      }
    },

    children: [
      {
        id: `office-name-${uid}-${index}`,
        type: "flex",
        data: {
          props: {},
          style: {
            desktop: {
              ...withDesktopFallback(
                {
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px"
                },
                item.nameStyle
              )
            },
            tablet: {
              display: "flex",
              flexDirection: "column"
            },
            mobile: {
              display: "flex",
              flexDirection: "column"
            }
          }
        },
        children: [
          {
            id: `office-title-item-${uid}-${index}`,
            type: "flexItem",
            data: {
              props: {},
              style: {
                desktop: {
                  width: "100%"
                }
              }
            },
            children: [
              {
                id: `office-title-${uid}-${index}`,
                type: "text",
                data: {
                  props: { content: item.title },
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
                id: `office-subtitle-item-${uid}-${index}`,
                type: "flexItem",
                data: {
                  props: {},
                  style: {
                    desktop: {
                      width: "100%"
                    }
                  }
                },
                children: [
                  {
                    id: `office-subtitle-${uid}-${index}`,
                    type: "text",
                    data: {
                      props: {
                        content: (item as any).subtitle
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
      },
      {
        id: `office-description-${uid}-${index}`,
        type: "text",
        data: {
          props: { content: item.description },
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
  }));

  const contentChildren = [
    {
      id: `office-header-${uid}`,
      type: "flex",
      data: {
        props: {},
        style: {
          desktop: {
            ...withDesktopFallback(
              {
                display: "flex",
                flexDirection: "column",
                gap: "18px",
                maxWidth: "760px",
                marginLeft: "auto",
                marginRight: "auto",
                marginBottom: "56px"
              },
              payload.headerStyle
            )
          },
          tablet: {
            display: "flex",
            flexDirection: "column",
            width: "100%",
            maxWidth: "100%"
          },
          mobile: {
            display: "flex",
            flexDirection: "column",
            width: "100%",
            maxWidth: "100%"
          }
        }
      },
      children: [
        payload.badge
          ? {
              id: `office-badge-${uid}`,
              type: "text",
              data: {
                props: { content: payload.badge },
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
              id: `office-heading-${uid}`,
              type: "text",
              data: {
                props: { content: payload.title },
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
              id: `office-head-description-${uid}`,
              type: "text",
              data: {
                props: { content: payload.description },
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
      id: `office-table-container-${uid}`,
      type: "flex",
      data: {
        props: {},
        style: {
          desktop: {
            ...withDesktopFallback(
              {
                display: "flex",
                flexDirection: "column",
                width: "100%",
                maxWidth: "1180px",
                marginLeft: "auto",
                marginRight: "auto",
                overflow: "hidden"
              },
              payload.tableStyle
            )
          },
          tablet: {
            display: "flex",
            flexDirection: "column",
            width: "100%",
            maxWidth: "100%"
          },
          mobile: {
            display: "flex",
            flexDirection: "column",
            width: "100%",
            maxWidth: "100%"
          }
        }
      },
      children: rows
    }
  ];

  const containerStyle = {
    desktop: {
      ...withDesktopFallback(
        {
          display: "flex",
          flexDirection: "column",
          width: "100%",
          marginLeft: "auto",
          marginRight: "auto"
        },
        payload.containerStyle
      )
    },
    tablet: {
      display: "flex",
      flexDirection: "column",
      width: "100%",
      maxWidth: "100%"
    },
    mobile: {
      display: "flex",
      flexDirection: "column",
      width: "100%",
      maxWidth: "100%"
    }
  };

  return {
    id: `office-table-section-${uid}`,
    type: "section",
    meta: {
      semanticType: "OFFICES_TABLE"
    },

   data: {
  props: {},
  style: {
    desktop: {
      ...withDesktopFallback(
        {
          padding: "96px 40px"
        },
        payload.sectionStyle
      )
    },
    tablet: {
      padding: "72px 24px"
    },
    mobile: {
      padding: "56px 20px"
    }
  }
},

children: [
  {
    id: `office-section-container-${uid}`,
    type: "flex",
    data: {
      props: {},
      style: containerStyle
    },
    children: contentChildren
  }
]
  };
};
