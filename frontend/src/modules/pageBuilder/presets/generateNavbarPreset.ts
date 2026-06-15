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

 const rawStyle =
  payload.rawStyle || {};

const isEmptyColor = (value?: string) =>
  !value ||
  value === "transparent" ||
  value === "rgba(0, 0, 0, 0)";

const navBg =
  !isEmptyColor(rawStyle.backgroundColor)
    ? rawStyle.backgroundColor
    : "#0b1220";
const navTextColor =
  rawStyle.color &&
  rawStyle.color !== "rgb(0, 0, 0)"
    ? rawStyle.color
    : "#ffffff";
   const ctaTextColor =
  rawStyle.ctaColor || "#0A0A0A";
const submenuBg =
  !isEmptyColor(rawStyle.submenuBackground)
    ? rawStyle.submenuBackground
    : navBg;

const ctaBg =
  !isEmptyColor(rawStyle.ctaBackground)
    ? rawStyle.ctaBackground
    : "linear-gradient(90deg,#E85D04,#F77F00,#FFAA3B)";

  const hasImportedBackground =
    rawStyle.backgroundColor &&
    rawStyle.backgroundColor !== "transparent" &&
    rawStyle.backgroundColor !== "rgba(0, 0, 0, 0)";

  const safeLogoImage =
    logo.image?.startsWith("http")
      ? logo.image
      : logo.image?.startsWith("/")
        ? logo.image
        : logo.image
          ? `/${logo.image}`
          : "";

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
          gap: "28px",
          width: "100%",
          paddingTop: "14px",
          paddingBottom: "14px",
          paddingLeft: "28px",
          paddingRight: "28px",
          flexWrap: "nowrap",
          overflow: "visible",
          background:navBg,
backgroundColor:
  navBg,
color:
  navTextColor,
          borderBottom:
            rawStyle.borderBottom ||
            "1px solid rgba(122,158,192,0.16)",
          boxShadow:
            rawStyle.boxShadow ||
            "0 12px 32px rgba(0,0,0,0.18)",
          backdropFilter:
            rawStyle.backdropFilter ||
            "blur(14px)"
        },

        tablet: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "18px",
          paddingTop: "12px",
          paddingBottom: "12px",
          paddingLeft: "20px",
          paddingRight: "20px",
          flexWrap: "wrap"
        },

        mobile: {
          flexDirection: "column",
          alignItems: "stretch",
          justifyContent: "flex-start",
          gap: "14px",
          paddingTop: "16px",
          paddingBottom: "16px",
          paddingLeft: "18px",
          paddingRight: "18px",
          flexWrap: "nowrap"
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
              width: "max-content",
maxWidth: "none",
flexShrink: 0,
              gap: "12px",
              flex: "0 0 auto",
              minWidth: "max-content",
              flexWrap: "nowrap",
              whiteSpace: "nowrap",
              overflow: "visible"
            },
            tablet: {
              flex: "0 0 auto"
            },
            mobile: {
              justifyContent: "center",
              width: "100%"
            }
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
                        width: "34px",
                        height: "34px",
                        objectFit: "contain"
                      },
                      tablet: {
                        width: "32px",
                        height: "32px"
                      },
                      mobile: {
                        width: "30px",
                        height: "30px"
                      }
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
                        display: "inline-block",
width: "max-content",
maxWidth: "none",
flexShrink: 0,
                        color: navTextColor,
                        fontWeight: "900",
                        fontSize: "17px",
                        letterSpacing: "0.11em",
                        lineHeight: "1",
                        textTransform: "uppercase",
                        whiteSpace: "nowrap",
                        wordBreak: "keep-all",
                        minWidth: "max-content"
                      },
                      tablet: {
                        fontSize: "16px"
                      },
                      mobile: {
                        fontSize: "15px",
                        textAlign: "center"
                        ,
                        whiteSpace: "nowrap"
                      }
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
            tablet: {
              flex: "1 1 100%",
              order: 3,
              justifyContent: "center"
            },
            mobile: {
              flex: "1 1 100%",
              width: "100%",
              justifyContent: "stretch"
            }
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
                  columnGap: "22px",
                  width: "100%",
                  maxWidth: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "visible"
                },
                tablet: {
                  columnGap: "16px",
                  rowGap: "10px"
                },
                mobile: {
                  flexDirection: "column",
                  alignItems: "stretch",
                  gap: "8px"
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
                      flex: "0 0 auto",
                      position: "relative"
                    },
                    tablet: {},
                    mobile: {
                      width: "100%"
                    }
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
                          color: navTextColor,
                          fontSize: "13px",
                          fontWeight: "700",
                          letterSpacing: "0.02em",
                          lineHeight: "1.2"
                        },
                        tablet: {
                          fontSize: "13px"
                        },
                        mobile: {
                          display: "block",
                          width: "100%",
                          paddingTop: "8px",
                          paddingBottom: "8px",
                          textAlign: "center",
                            color: navTextColor
                        }
                      }
                    },
                    children: []
                  },
                  ...(Array.isArray(link.children) && link.children.length
                    ? [
                        {
                          id: `navbar-submenu-${id}-${index}`,
                          type: "flex",
                          data: {
                            props: {},
                            style: {
                              desktop: {
  display: "flex",
  position: "absolute",
  top: "100%",
  left: "0",
  zIndex: 50,
  flexDirection: "column",
  gap: "8px",
  minWidth: "220px",
  paddingTop: "10px",
  paddingBottom: "10px",
  paddingLeft: "12px",
  paddingRight: "12px",
  marginTop: "8px",
  backgroundColor: submenuBg,
  border: rawStyle.borderBottom || "1px solid rgba(0,0,0,0.12)",
  borderRadius: "12px",
  boxShadow: rawStyle.boxShadow || "0 16px 34px rgba(0,0,0,0.18)"
},
                              tablet: {
                                marginTop: "6px"
                              },
                              mobile: {
                                marginTop: "4px",
                                backgroundColor: "rgba(255,255,255,0.04)"
                              }
                            }
                          },
                          children: link.children.map(
                            (
                              childLink: any,
                              childIndex: number
                            ) => ({
                              id: `navbar-submenu-link-item-${id}-${index}-${childIndex}`,
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
                                  id: `navbar-submenu-link-${id}-${index}-${childIndex}`,
                                  type: "link",
                                  data: {
                                    props: {
                                      label:
                                        childLink.label ||
                                        childLink.text ||
                                        "Link",
                                      href:
                                        childLink.href ||
                                        "#"
                                    },
                                    style: {
                                      desktop: {
                                        textDecoration: "none",
                                        color: navTextColor,
                                        fontSize: "12px",
                                        fontWeight: "650",
                                        whiteSpace: "nowrap"
                                      },
                                      tablet: {},
                                      mobile: {
                                        display: "block",
                                        textAlign: "center"
                                      }
                                    }
                                  },
                                  children: []
                                }
                              ]
                            })
                          )
                        }
                      ]
                    : [])
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
                  tablet: {
                    flex: "0 0 auto",
                    order: 2
                  },
                  mobile: {
                    width: "100%"
                  }
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
                        padding: "0 22px",
                        minHeight: "42px",
                        background: ctaBg,
                        backgroundColor: undefined,
                        color: ctaTextColor,
                        border: "1px solid rgba(247,127,0,0.9)",
                        fontWeight: "800",
                        fontSize: "13px",
                        boxShadow: "0 10px 24px rgba(247,127,0,0.22)"
                      },
                      tablet: {
                        minHeight: "40px",
                        padding: "0 18px"
                      },
                      mobile: {
                        display: "block",
                        width: "100%",
                        textAlign: "center",
                        minHeight: "42px",
                        lineHeight: "42px"
                      }
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
