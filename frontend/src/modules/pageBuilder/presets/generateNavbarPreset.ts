// presets/navbarPreset.ts

import {
  SerializedBlock
} from "../runtime/importers/html/semanticMatchers";

export const generateNavbarPreset = (
  payload: any = {}
): SerializedBlock => {
  const id =
    crypto.randomUUID();

  const logo =
    payload.logo || {};

  const links =
    Array.isArray(payload.links)
      ? payload.links
      : [];

  const cta =
    payload.cta || null;
  const safeLogoImage =
  logo.image?.startsWith("http")
    ? logo.image
    : logo.image?.startsWith("/")
      ? logo.image
      : logo.image
        ? `/${logo.image}`
        : "";
console.log(
  "🔥 NAVBAR_PRESET_GENERATED",
  payload
);
console.log(
  "NAVBAR_CHILDREN",
  {
    logo,
    linksCount: links.length,
    hasCta: !!cta
  }
);
  return {
    id:
      `navbar-${id}`,

    type:
      "navbar",

    data: {
      props: {},

      style: {
      desktop: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "24px",
  width: "100%",
  paddingTop: "16px",
  paddingBottom: "16px",
  paddingLeft: "24px",
  paddingRight: "24px",
  flexWrap: "nowrap",
  overflow: "visible"
},

        tablet: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px"
        },

        mobile: {
          flexDirection: "column",
          alignItems: "stretch",
          justifyContent: "flex-start",
          gap: "12px"
        }
      }
    },

    children: [
      {
        id: `navbar-logo-item-${id}`,
        type: "flexItem",
        data: {
          props: {},
          style: {
            desktop: {
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flex: "0 0 auto"
            },
            tablet: {},
            mobile: {}
          }
        },
        children: [
          ...(safeLogoImage
            ? [
                {
                  id: `navbar-logo-image-${id}`,
                  type: "image",
                  data: {
                    props: {
                      url: safeLogoImage,
                      alt: logo.text || "Logo"
                    },
                    style: {
                      desktop: {
                        width: "36px",
                        height: "36px",
                        objectFit: "contain"
                      },
                      tablet: {},
                      mobile: {}
                    }
                  },
                  children: []
                }
              ]
            : []),

          ...(logo.text
            ? [
                {
                  id: `navbar-logo-text-${id}`,
                  type: "text",
                  data: {
                    props: {
                      content: logo.text
                    },
                    style: {
                      desktop: {
                        fontWeight: "800",
                        fontSize: "18px",
                        letterSpacing: "0.08em"
                      },
                      tablet: {},
                      mobile: {}
                    }
                  },
                  children: []
                }
              ]
            : [])
        ]
      },

      {
        id: `navbar-links-item-${id}`,
        type: "flexItem",
        data: {
          props: {},
          style: {
            desktop: {
             flex: "1 1 0",
minWidth: 0,
display: "flex",
justifyContent: "center"
            },
            tablet: {},
            mobile: {}
          }
        },
        children: [
          {
            id: `navbar-links-flex-${id}`,
            type: "flex",
            data: {
              props: {},
              style: {
  desktop: {
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  rowGap: "10px",
  columnGap: "14px",
  width: "100%",
  maxWidth: "100%",
  alignItems: "center",
  justifyContent: "center",
  overflow: "visible"
},
                tablet: {
                  gap: "14px"
                },
                mobile: {
                  flexDirection: "column",
                  alignItems: "stretch",
                  gap: "10px"
                }
              }
            },
            children: links.map(
              (
                link: any,
                index: number
              ) => ({
                id: `navbar-link-item-${id}-${index}`,
                type: "flexItem",
                data: {
                  props: {},
                  style: {
                    desktop: {
                      flex: "0 0 auto"
                    },
                    tablet: {},
                    mobile: {}
                  }
                },
                children: [
                  {
                    id: `navbar-link-${id}-${index}`,
                    type: "link",
                    data: {
                      props: {
                        label:
                          link.label ||
                          link.text ||
                          "Link",

                        href:
                          link.href ||
                          "#"
                      },
                      style: {
                        desktop: {
                          textDecoration: "none",
                          color: "inherit",
                          fontSize: "13px",
                          fontWeight: "600"
                        },
                        tablet: {},
                        mobile: {}
                      }
                    },
                    children: []
                  }
                ]
              })
            )
          }
        ]
      },

      ...(cta?.label
        ? [
            {
              id: `navbar-cta-item-${id}`,
              type: "flexItem",
              data: {
                props: {},
                style: {
                  desktop: {
                    flex: "0 0 auto"
                  },
                  tablet: {},
                  mobile: {}
                }
              },
              children: [
                {
                  id: `navbar-cta-${id}`,
                  type: "button",
                  data: {
                    props: {
                      label:
                        cta.label,

                      href:
                        cta.href ||
                        "#"
                    },
                    style: {
                      desktop: {
                        borderRadius: "999px",
                        padding: "0 20px",
                        minHeight: "44px"
                      },
                      tablet: {},
                      mobile: {}
                    }
                  },
                  children: []
                }
              ]
            }
          ]
        : [])
    ]
  };
};