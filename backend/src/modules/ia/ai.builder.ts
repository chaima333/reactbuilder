// ai.builder.ts

import { PageBlock } from "../pages/types/page.types";
import { CATEGORY_TEMPLATES, SectionConfig, SectionKind, TemplateConfig } from "./ai.templates";
import { GeneratedPage } from "./ai.types";

const makeId = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 9)}`;

const responsiveStyle = (desktop: Record<string, any> = {}) => ({
  desktop,
  tablet: {},
  mobile: {}
});

// ============================================
// BLOCK BUILDERS (LES COMPOSANTS)
// ============================================

const titleBlock = (text: string, style: Record<string, any> = {}): PageBlock => ({
  id: makeId("title"),
  type: "title",
  data: {
    props: { content: text, text },
    style: responsiveStyle({
      fontSize: "44px",
      fontWeight: "800",
      textAlign: "center",
      marginBottom: "16px",
      ...style
    })
  },
  children: []
});

const flexItemBlock = (children: PageBlock[]): PageBlock => ({
  id: makeId("flex-item"),
  type: "flexItem",
  data: { props: {}, style: responsiveStyle({ width: "100%" }) },
  children
});

const flexBlock = (children: PageBlock[]): PageBlock => ({
  id: makeId("flex"),
  type: "flex",
  data: {
    props: {},
    style: responsiveStyle({
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "16px",
      width: "100%"
    })
  },
  children
});

const textBlock = (text: string, style: Record<string, any> = {}): PageBlock => ({
  id: makeId("text"),
  type: "text",
  data: {
    props: { text, content: text },
    style: responsiveStyle({
      fontSize: "18px",
      textAlign: "center",
      marginBottom: "24px",
      ...style
    })
  },
  children: []
});

const buttonBlock = (label: string): PageBlock => ({
  id: makeId("button"),
  type: "button",
  data: {
    props: { label },
    style: responsiveStyle({
      display: "block",
      margin: "0 auto",
      padding: "12px 32px",
      backgroundColor: "#2563eb",
      color: "#ffffff",
      border: "none",
      borderRadius: "8px",
      fontSize: "16px",
      fontWeight: "600",
      cursor: "pointer"
    })
  },
  children: []
});

const imageBlock = (src: string, alt: string = "Hero image"): PageBlock => ({
  id: makeId("image"),
  type: "image",
  data: {
    props: {
      url: src,
      src,
      alt
    },
    style: responsiveStyle({
      width: "100%",
      maxWidth: "600px",
      height: "auto",
      borderRadius: "12px",
      boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
    })
  },
  children: []
});

const sectionBlock = (
  children: PageBlock[],
  style: Record<string, any> = {}
): PageBlock => ({
  id: makeId("section"),
  type: "section",
  data: {
    props: {},
    style: responsiveStyle({
      padding: "80px 40px",
      backgroundColor: "#ffffff",
      ...style
    })
  },
  children: [
    flexBlock(children.map((child) => flexItemBlock([child])))
  ]
});

const gridItemBlock = (children: PageBlock[]): PageBlock => ({
  id: makeId("grid-item"),
  type: "gridItem",
  data: {
    props: {},
    style: responsiveStyle({})
  },
  children
});

// ============================================
// FEATURE CARD HELPER
// ============================================

const featureCard = (text: string): PageBlock => {
  const [title, description, button] = text.split("|");

  return {
    id: makeId("feature"),
    type: "flex",
    data: {
      props: {},
      style: responsiveStyle({
        padding: "28px",
        border: "1px solid #e5e7eb",
        borderRadius: "18px",
        backgroundColor: "#ffffff",
        minHeight: "190px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "14px",
        boxShadow: "0 12px 30px rgba(0,0,0,0.12)"
      })
    },
    children: [
      textBlock(title || text, {
        fontSize: "20px",
        fontWeight: "800",
        color: "#0f172a",
        marginBottom: "0"
      }),
      ...(description
        ? [
            textBlock(description, {
              fontSize: "15px",
              color: "#64748b",
              lineHeight: "1.6",
              marginBottom: "0"
            })
          ]
        : []),
      ...(button
        ? [
            buttonBlock(button)
          ]
        : [])
    ]
  };
};

// ============================================
// FAQ BUILDER
// ============================================

const buildFAQ = (config: SectionConfig): PageBlock => {
  const items = config.items || [];
  
  const faqBlocks: PageBlock[] = items.map((item) => {
    const [question, answer] = item.split("|");
    
    return {
      id: makeId("faq-item"),
      type: "flex",
      data: {
        props: {},
        style: responsiveStyle({
          padding: "24px",
          borderBottom: "1px solid #e5e7eb",
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          marginBottom: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          width: "100%",
           maxWidth: "900px",
           margin: "0 auto",
          marginLeft: "auto",
          marginRight: "auto",
        })
      },
      children: [
        {
          id: makeId("faq-question"),
          type: "text",
          data: {
            props: { text: `❓ ${question || item}` },
            style: responsiveStyle({
              fontSize: "18px",
              fontWeight: "700",
              color: "#0f172a",
              textAlign: "left",
              marginBottom: "4px"
            })
          },
          children: []
        },
        {
          id: makeId("faq-answer"),
          type: "text",
          data: {
            props: { text: answer || "" },
            style: responsiveStyle({
              fontSize: "16px",
              color: "#64748b",
              textAlign: "left",
              lineHeight: "1.6",
              marginBottom: "0",
              paddingLeft: "4px"
            })
          },
          children: []
        }
      ]
    };
  });

  const faqContainer: PageBlock = {
    id: makeId("faq-container"),
    type: "flex",
    data: {
      props: {},
      style: responsiveStyle({
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "8px",
        maxWidth: "900px",
        margin: "0 auto",
        width: "100%",
        alignSelf: "center",
      })
    },
    children: faqBlocks
  };

  return sectionBlock(
    [
      titleBlock(config.title, {
        fontSize: "38px",
        marginBottom: "16px"
      }),
      textBlock(config.text, {
        fontSize: "18px",
        marginBottom: "40px"
      }),
      faqContainer
    ],
    {
      backgroundColor: config.style?.backgroundColor || "#f8fafc",
      padding: "80px 40px",
      textAlign: "center"
    }
  );
};

// ============================================
// NAVBAR BUILDER
// ============================================

const buildNavbar = (config: SectionConfig): PageBlock => {
  const id = makeId("navbar");
  
  const color = config.style?.color || "#111827";
  const bgColor = config.style?.backgroundColor || "#111010";

  const links =
    config.navigationItems?.length
      ? config.navigationItems
      : (config.items || ["Home", "Services", "About", "Contact"]).map(
          (label) => ({
            label,
            href: "#"
          })
        );

  return {
    id,
    type: "navbar",
    data: {
      props: {},
      style: responsiveStyle({
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        display: "flex",
        maxWidth: "none", 
        margin: "0", 
        paddingTop: "14px",
        boxSizing: "border-box",
        paddingBottom: "14px",
        paddingLeft: "28px",
        paddingRight: "28px",
        flexWrap: "wrap",
        gap: "18px",
        overflow: "visible",
        backgroundColor: bgColor,
        color: color,
        whiteSpace: "nowrap",
        minWidth: "160px",
        borderBottom: "1px solid rgba(0,0,0,0.08)"
      })
    },
    children: [
      {
        id: makeId("navbar-logo-item"),
        type: "flexItem",
        data: {
          props: {},
          style: responsiveStyle({
            display: "flex",
            alignItems: "center",
            width: "max-content",
            flex: "0 0 auto",
            whiteSpace: "nowrap"
          })
        },
        children: [
          {
            id: makeId("navbar-logo-text"),
            type: "text",
            data: {
              props: {
                content: config.title,
                text: config.title
              },
              style: responsiveStyle({
                color: color,
                fontWeight: "900",
                fontSize: "24px", 
                letterSpacing: "0.04em",
                whiteSpace: "nowrap",
                marginBottom: "0"
              })
            },
            children: []
          }
        ]
      },
      {
        id: makeId("navbar-links-item"),
        type: "flexItem",
        data: {
          props: {},
          style: responsiveStyle({
            flex: "1 1 auto",
            minWidth: "0",
            display: "flex",
            justifyContent: "center"
          })
        },
        children: [
          {
            id: makeId("navbar-links-flex"),
            type: "flex",
            data: {
              props: {},
              style: responsiveStyle({
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                columnGap: "18px",
                rowGap: "10px",
                alignItems: "center",
                justifyContent: "center",
                width: "100%"
              })
            },
            children: links.map((link, index) => ({
              id: makeId(`navbar-link-item-${index}`),
              type: "flexItem",
              data: {
                props: {},
                style: responsiveStyle({
                  flex: "0 0 auto"
                })
              },
              children: [
                {
                  id: makeId(`navbar-link-${index}`),
                  type: "link",
                  data: {
                    props: {
                      label: link.label,
                      href: link.href
                    },
                    style: responsiveStyle({
                      textDecoration: "none",
                      color: color,
                      fontSize: "15px",
                      fontWeight: "700",
                      whiteSpace: "nowrap",
                      transition: "color 0.2s ease",
                      display: "inline-block",
                      marginRight: "24px"
                    })
                  },
                  children: []
                }
              ]
            }))
          }
        ]
      },
      ...(config.cta
        ? [
            {
              id: makeId("navbar-cta-item"),
              type: "flexItem",
              data: {
                props: {},
                style: responsiveStyle({
                  flex: "0 0 auto"
                })
              },
              children: [
                {
                  id: makeId("navbar-cta"),
                  type: "button",
                  data: {
                    props: {
                      label: config.cta,
                      href: config.ctaHref || "#"
                    },
                    style: responsiveStyle({
                      borderRadius: "999px",
                      padding: "10px 24px",
                      backgroundColor: "#2563eb",
                      color: "#ffffff",
                      border: "none",
                      fontWeight: "700",
                      fontSize: "14px",
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    })
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

// ============================================
// HERO BUILDER (b Image Block + Flex)
// ============================================

const buildHero = (config: SectionConfig): PageBlock => {
  const bgColor = config.style?.backgroundColor || "#f8fafc";
  const color = config.style?.color || "#0f172a";
  const titleSize = config.style?.titleSize || "48px";
  
  const imageUrl =
  config.resolvedImage ||
  config.image ||
  "https://via.placeholder.com/600x400/2563eb/ffffff?text=Hero+Image";

  // Left: Content, Right: Image
  const heroRow: PageBlock = {
    id: makeId("hero-row"),
    type: "flex",
    data: {
      props: {},
      style: responsiveStyle({
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: "48px",
        maxWidth: "1200px",
        width: "100%",
        margin: "0 auto",
        flexWrap: "wrap"
      })
    },
    children: [
      // Left side - Content
      {
        id: makeId("hero-content"),
        type: "flexItem",
        data: {
          props: {},
          style: responsiveStyle({
            flex: "1 1 45%",
            minWidth: "300px",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "16px"
          })
        },
        children: [
          {
            id: makeId("hero-title"),
            type: "title",
            data: {
              props: { content: config.title, text: config.title },
              style: responsiveStyle({
                fontSize: titleSize,
                fontWeight: "800",
                color: color,
                textAlign: "left",
                marginBottom: "0"
              })
            },
            children: []
          },
          ...(config.text?.trim() ? [
            {
              id: makeId("hero-text"),
              type: "text",
              data: {
                props: { text: config.text },
                style: responsiveStyle({
                  fontSize: "20px",
                  color: "#64748b",
                  textAlign: "left",
                  marginBottom: "0"
                })
              },
              children: []
            }
          ] : []),
          ...(config.cta ? [
            {
              id: makeId("hero-button"),
              type: "button",
              data: {
                props: { label: config.cta },
                style: responsiveStyle({
                  display: "inline-block",
                  margin: "0",
                  padding: "12px 32px",
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer"
                })
              },
              children: []
            }
          ] : [])
        ]
      },
      // Right side - Image
      {
        id: makeId("hero-image-item"),
        type: "flexItem",
        data: {
          props: {},
          style: responsiveStyle({
            flex: "1 1 45%",
            minWidth: "300px"
          })
        },
        children: [
          imageBlock(imageUrl, "Hero image")
        ]
      }
    ]
  };

  return {
    id: makeId("hero-section"),
    type: "section",
    data: {
      props: {},
      style: responsiveStyle({
        backgroundColor: bgColor,
        padding: "80px 40px",
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center"
      })
    },
    children: [heroRow]
  };
};

// ============================================
// MISSION BUILDER
// ============================================

const buildMission = (config: SectionConfig): PageBlock => {
  return sectionBlock(
    [
      titleBlock(config.title, {
        fontSize: "38px",
        marginBottom: "24px"
      }),
      textBlock(config.text, {
        fontSize: "24px",
        maxWidth: "1000px",
        margin: "0 auto",
        lineHeight:"1.8"
      })
    ],
    {
      backgroundColor: config.style?.backgroundColor || "#f8fafc",
      padding: "80px 40px",
      textAlign: "center"
    }
  );
};

// ============================================
// FEATURES BUILDER
// ============================================

const buildFeatures = (config: SectionConfig): PageBlock => {
  const items = config.items || [];
  
  const featureBlocks: PageBlock[] = items.map((item) =>
    gridItemBlock([
      featureCard(item)
    ])
  );

  const featuresContainer: PageBlock = {
    id: makeId("features-grid"),
    type: "grid",
    data: {
      props: {},
      style: responsiveStyle({
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(220px, 1fr))",
        gap: "24px",
        maxWidth: "720px",
        margin: "0 auto",
        justifyContent: "center"
      })
    },
    children: featureBlocks
  };

  return sectionBlock(
    [
      titleBlock(config.title, {
        fontSize: "38px",
        marginBottom: "16px"
      }),
      textBlock(config.text, {
        fontSize: "18px",
        marginBottom: "40px"
      }),
      featuresContainer
    ],
    {
      backgroundColor: config.style?.backgroundColor || "#ffffff",
      padding: "80px 40px",
      textAlign: "center"
    }
  );
};

// ============================================
// SERVICES BUILDER (FIXED - Canonical Tree)
// ============================================

const buildServices = (config: SectionConfig): PageBlock => {
  const items = config.items || [];
  
  const serviceBlocks: PageBlock[] = items.map((item) => {
    const parts = item.split('|');
    const iconTitle = parts[0] || item;
    const description = parts[1] || '';
    
    const iconMatch = iconTitle.match(/^([\u{1F000}-\u{1FFFF}]|[\u2600-\u27BF]|[\u{2700}-\u{27BF}])\s*(.+)/u);
    const icon = iconMatch ? iconMatch[1] : '📌';
    const title = iconMatch ? iconMatch[2] : iconTitle;
    
    // Service Card Content
    const cardContent: PageBlock = flexBlock([
      {
        id: makeId("service-icon"),
        type: "text",
        data: {
          props: { text: icon },
          style: responsiveStyle({
            fontSize: "40px",
            textAlign: "center",
            marginBottom: "8px"
          })
        },
        children: []
      },
      {
        id: makeId("service-title"),
        type: "text",
        data: {
          props: { text: title },
          style: responsiveStyle({
            fontSize: "18px",
            fontWeight: "700",
            textAlign: "center",
            marginBottom: "8px",
            color: "#0f172a"
          })
        },
        children: []
      },
      {
        id: makeId("service-desc"),
        type: "text",
        data: {
          props: { text: description },
          style: responsiveStyle({
            fontSize: "14px",
            textAlign: "center",
            color: "#64748b",
            lineHeight: "1.5"
          })
        },
        children: []
      }
    ]);
    
    return gridItemBlock([cardContent]);
  });

  const servicesContainer: PageBlock = {
    id: makeId("services-grid"),
    type: "grid",
    data: {
      props: {},
      style: responsiveStyle({
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "24px",
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "20px"
      })
    },
    children: serviceBlocks
  };

  return sectionBlock(
    [
      titleBlock(config.title, {
        fontSize: "38px",
        marginBottom: "16px"
      }),
      textBlock(config.text, {
        fontSize: "18px",
        marginBottom: "40px"
      }),
      servicesContainer
    ],
    {
      backgroundColor: config.style?.backgroundColor || "#f8fafc",
      padding: "80px 40px",
      textAlign: "center"
    }
  );
};

// ============================================
// TESTIMONIAL BUILDER (FIXED - Canonical Tree)
// ============================================

const buildTestimonial = (config: SectionConfig): PageBlock => {
  const items = config.items || [];

  if (items.length > 0) {
    const testimonialBlocks: PageBlock[] = items.map((item) => {
      const parts = item.split("|");
      const stars = parts[0] || "★★★★★";
      const quote = parts[1] || item;
      const author = parts[2] || "Client";

      const cardContent: PageBlock = {
        id: makeId("testimonial-card"),
        type: "flex",
        data: {
          props: {},
          style: responsiveStyle({
            padding: "32px",
            borderRadius: "20px",
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
            minHeight: "260px",
            boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: "16px"
          })
        },
        children: [
          {
            id: makeId("testimonial-stars"),
            type: "text",
            data: {
              props: { text: stars },
              style: responsiveStyle({
                fontSize: "28px",
                letterSpacing: "4px",
                textAlign: "center",
                color: "#f59e0b",
                marginBottom: "4px"
              })
            },
            children: []
          },
          {
            id: makeId("testimonial-quote"),
            type: "text",
            data: {
              props: { text: `"${quote}"` },
              style: responsiveStyle({
                fontSize: "18px",
                textAlign: "center",
                color: "#0f172a",
                fontStyle: "italic",
                lineHeight: "1.8",
                maxWidth: "280px",
                marginBottom: "0"
              })
            },
            children: []
          },
          {
            id: makeId("testimonial-author"),
            type: "text",
            data: {
              props: { text: `— ${author}` },
              style: responsiveStyle({
                fontSize: "15px",
                textAlign: "center",
                fontWeight: "700",
                color: "#64748b",
                marginTop: "8px"
              })
            },
            children: []
          }
        ]
      };

      return gridItemBlock([cardContent]);
    });

    const testimonialContainer: PageBlock = {
      id: makeId("testimonial-grid"),
      type: "grid",
      data: {
        props: {},
        style: responsiveStyle({
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
          gap: "28px",
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "20px"
        })
      },
      children: testimonialBlocks
    };

    return sectionBlock(
      [
        titleBlock(config.title, {
          fontSize: "42px",
          marginBottom: "16px"
        }),
        textBlock(config.text, {
          fontSize: "20px",
          marginBottom: "44px"
        }),
        testimonialContainer
      ],
      {
        backgroundColor: config.style?.backgroundColor || "#f0f9ff",
        padding: "90px 40px",
        textAlign: "center"
      }
    );
  }

  return sectionBlock(
    [
      titleBlock(config.title, {
        fontSize: "38px",
        marginBottom: "16px"
      }),
      textBlock(`"${config.text}"`, {
        fontSize: "24px",
        fontStyle: "italic",
        maxWidth: "800px",
        margin: "0 auto",
        lineHeight: "1.6"
      }),
      textBlock("— Satisfied Client", {
        fontSize: "16px",
        fontWeight: "600",
        marginTop: "8px"
      })
    ],
    {
      backgroundColor: config.style?.backgroundColor || "#f0f9ff",
      padding: "80px 40px",
      textAlign: "center"
    }
  );
};

// ============================================
// STATS BUILDER (FIXED - Canonical Tree)
// ============================================

const buildStats = (config: SectionConfig): PageBlock => {
  const items = config.items || [];
  
  const statBlocks: PageBlock[] = items.map((item) => {
    const parts = item.split('|');
    const number = parts[0] || item;
    const label = parts[1] || '';
    
    const cardContent = flexBlock([
      {
        id: makeId("stat-number"),
        type: "text",
        data: {
          props: { text: number },
          style: responsiveStyle({
            fontSize: "58px",
            fontWeight: "800",
            textAlign: "center",
            color: "#2563eb",
            marginBottom: "4px"
          })
        },
        children: []
      },
      {
        id: makeId("stat-label"),
        type: "text",
        data: {
          props: { text: label },
          style: responsiveStyle({
            fontSize: "16px",
            textAlign: "center",
            color: "#64748b",
            fontWeight: "500"
          })
        },
        children: []
      }
    ]);
    
    return gridItemBlock([cardContent]);
  });
  
  const statsContainer: PageBlock = {
    id: makeId("stats-grid"),
    type: "grid",
    data: {
      props: {},
      style: responsiveStyle({
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "32px",
        maxWidth: "900px",
        margin: "0 auto",
        padding: "20px"
      })
    },
    children: statBlocks
  };
  
  return sectionBlock(
    [
      titleBlock(config.title, {
        fontSize: "38px",
        marginBottom: "16px"
      }),
      textBlock(config.text, {
        fontSize: "18px",
        marginBottom: "40px"
      }),
      statsContainer
    ],
    {
      backgroundColor: config.style?.backgroundColor || "#ffffff",
      padding: "80px 40px",
      textAlign: "center"
    }
  );
};

// ============================================
// CTA BUILDER
// ============================================

const buildCTA = (config: SectionConfig): PageBlock => {
  const bgColor = config.style?.backgroundColor || "#0f172a";
  const color = config.style?.color || "#ffffff";
  
  return sectionBlock(
    [
      titleBlock(config.title, {
        fontSize: "42px",
        color,
        marginBottom: "16px"
      }),
      textBlock(config.text, {
        color,
        fontSize: "20px",
        marginBottom: "32px"
      }),
      ...(config.cta ? [buttonBlock(config.cta)] : [])
    ],
    {
      backgroundColor: bgColor,
      color,
      padding: "100px 40px",
      textAlign: "center",
      minHeight: "500px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      borderRadius:"24px"
    }
  );
};

// ============================================
// FOOTER BUILDER (5 Colonnes - b Social)
// ============================================

const buildFooter = (config: SectionConfig): PageBlock => {
  const bgColor = config.style?.backgroundColor || "#0f172a";
  const color = config.style?.color || "#ffffff";
  
  const brandName = config.title || "Brand";
  
  // Parse items: first part = links, second part = social
  const items = config.items || [];
  const linksStr = items[0] || "About|Services|Contact|Privacy";
  const socialStr = items[1] || "LinkedIn|Facebook|Instagram|Twitter";
  
  const footerLinks = linksStr.split('|');
  const socialLinks = socialStr.split('|');
  
  const columns = [
    {
      title: brandName,
      items: [
        config.text || "Building the future, one project at a time."
      ]
    },
    {
      title: "Company",
      items: footerLinks
    },
    {
      title: "Resources",
      items: ["Help Center", "Documentation", "API", "Community"]
    },
    {
      title: "Contact",
      items: ["contact@example.com", "+216 XX XXX XXX", "Tunis, Tunisia"]
    },
    {
      title: "Follow Us",
      items: socialLinks.map(s => `🔗 ${s}`)
    }
  ];

  const gridChildren: PageBlock[] = columns.map((col) => {
    const itemBlocks: PageBlock[] = [
      {
        id: makeId("footer-col-title"),
        type: "text",
        data: {
          props: { text: col.title },
          style: responsiveStyle({
            fontSize: "16px",
            fontWeight: "700",
            color: color,
            textAlign: "left",
            marginBottom: "12px"
          })
        },
        children: []
      },
      ...col.items.map((item) => ({
        id: makeId("footer-col-item"),
        type: "link",
        data: {
          props: { label: item, href: "#" },
          style: responsiveStyle({
            fontSize: "14px",
            color: "#94a3b8",
            textDecoration: "none",
            textAlign: "left",
            display: "block",
            marginBottom: "8px",
            transition: "color 0.2s ease"
          })
        },
        children: []
      }))
    ];

    return gridItemBlock(itemBlocks);
  });

  const footerGrid: PageBlock = {
    id: makeId("footer-grid"),
    type: "grid",
    data: {
      props: {},
      style: responsiveStyle({
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: "32px",
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "0 20px",
        width: "100%"
      })
    },
    children: gridChildren
  };

  const copyrightText = `© ${new Date().getFullYear()} ${brandName}. All rights reserved.`;

  return {
    id: makeId("footer-section"),
    type: "section",
    data: {
      props: {},
      style: responsiveStyle({
        backgroundColor: bgColor,
        borderTop: "1px solid #1e293b",
        padding: "60px 40px 40px 40px"
      })
    },
    children: [
      flexBlock([
        flexItemBlock([footerGrid]),
        flexItemBlock([
          {
            id: makeId("footer-copyright"),
            type: "text",
            data: {
              props: { text: copyrightText },
              style: responsiveStyle({
                fontSize: "13px",
                color: "#64748b",
                textAlign: "center",
                maxWidth: "1200px",
                margin: "0 auto",
                padding: "0 20px"
              })
            },
            children: []
          }
        ])
      ])
    ]
  };
};

// ============================================
// CONTACT FORM BUILDER
// ============================================

const buildContactForm = (): PageBlock => {
  const fields = [
    { name: "name", type: "text", label: "Full Name", required: true },
    { name: "email", type: "email", label: "Email Address", required: true },
    { name: "subject", type: "text", label: "Subject", required: false },
    { name: "message", type: "textarea", label: "Message", required: true },
  ];

  const fieldBlocks: PageBlock[] = fields.map((field) => ({
    id: makeId(`form-field-${field.name}`),
    type: field.type === "textarea" ? "textarea" : "input",
    data: {
      props: {
        name: field.name,
        placeholder: field.label,
        required: field.required,
        type: field.type,
        label: field.label,
      },
      style: responsiveStyle({
        width: "100%",
        padding: "12px 16px",
        fontSize: "16px",
        border: "1px solid #d1d5db",
        borderRadius: "8px",
        marginBottom: "16px",
        backgroundColor: "#ffffff",
        color: "#0f172a",
        "&:focus": {
          borderColor: "#2563eb",
          outline: "none",
          boxShadow: "0 0 0 3px rgba(37,99,235,0.1)",
        },
      }),
    },
    children: [],
  }));

  const formContainer: PageBlock = {
    id: makeId("contact-form-container"),
    type: "flex",
    data: {
      props: {},
      style: responsiveStyle({
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        width: "100%",
        maxWidth: "500px",
        margin: "0 auto",
      }),
    },
    children: [
      ...fieldBlocks,
      {
        id: makeId("form-submit"),
        type: "button",
        data: {
          props: {
            label: "Send Message",
            type: "submit",
          },
          style: responsiveStyle({
            padding: "14px 32px",
            backgroundColor: "#2563eb",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "background-color 0.2s ease",
            "&:hover": {
              backgroundColor: "#1d4ed8",
            },
          }),
        },
        children: [],
      },
    ],
  };

  return {
    id: makeId("contact-form-section"),
    type: "section",
    data: {
      props: {},
      style: responsiveStyle({
        backgroundColor: "#ffffff",
        padding: "60px 40px",
        borderRadius: "12px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        maxWidth: "600px",
        margin: "0 auto",
        width: "100%",
      }),
    },
    children: [flexItemBlock([formContainer])],
  };
};

// ============================================
// CONTACT INFO BUILDER
// ============================================

const buildContactInfo = (): PageBlock => {
  const infoItems = [
    { icon: "📍", label: "Address", value: "123 Business Street, Tunis, Tunisia" },
    { icon: "📞", label: "Phone", value: "+216 XX XXX XXX" },
    { icon: "✉️", label: "Email", value: "contact@example.com" },
    { icon: "🕐", label: "Hours", value: "Mon - Fri: 9:00 - 18:00" },
  ];

  const infoBlocks: PageBlock[] = infoItems.map((item) =>
    flexItemBlock([
      {
        id: makeId(`contact-info-${item.label}`),
        type: "flex",
        data: {
          props: {},
          style: responsiveStyle({
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "12px",
            padding: "16px",
            backgroundColor: "#f8fafc",
            borderRadius: "8px",
            width: "100%",
          }),
        },
        children: [
          {
            id: makeId(`contact-info-icon-${item.label}`),
            type: "text",
            data: {
              props: { text: item.icon },
              style: responsiveStyle({
                fontSize: "24px",
                flexShrink: 0,
              }),
            },
            children: [],
          },
          {
            id: makeId(`contact-info-text-${item.label}`),
            type: "flex",
            data: {
              props: {},
              style: responsiveStyle({
                display: "flex",
                flexDirection: "column",
                gap: "2px",
              }),
            },
            children: [
              {
                id: makeId(`contact-info-label-${item.label}`),
                type: "text",
                data: {
                  props: { text: item.label },
                  style: responsiveStyle({
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }),
                },
                children: [],
              },
              {
                id: makeId(`contact-info-value-${item.label}`),
                type: "text",
                data: {
                  props: { text: item.value },
                  style: responsiveStyle({
                    fontSize: "16px",
                    fontWeight: "500",
                    color: "#0f172a",
                  }),
                },
                children: [],
              },
            ],
          },
        ],
      },
    ])
  );

  const infoContainer: PageBlock = {
    id: makeId("contact-info-container"),
    type: "flex",
    data: {
      props: {},
      style: responsiveStyle({
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        width: "100%",
        maxWidth: "500px",
        margin: "0 auto",
      }),
    },
    children: infoBlocks,
  };

  return {
    id: makeId("contact-info-section"),
    type: "section",
    data: {
      props: {},
      style: responsiveStyle({
        backgroundColor: "#ffffff",
        padding: "40px",
        borderRadius: "12px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        maxWidth: "600px",
        margin: "0 auto",
        width: "100%",
      }),
    },
    children: [flexItemBlock([infoContainer])],
  };
};

// ============================================
// MAP BUILDER
// ============================================

const buildMap = (): PageBlock => {
  return {
    id: makeId("map-section"),
    type: "section",
    data: {
      props: {},
      style: responsiveStyle({
        backgroundColor: "#f8fafc",
        padding: "40px",
        borderRadius: "12px",
        maxWidth: "600px",
        margin: "0 auto",
        width: "100%",
        minHeight: "300px",
      }),
    },
    children: [
      flexItemBlock([
        {
          id: makeId("map-placeholder"),
          type: "text",
          data: {
            props: {
              text: "🗺️ Interactive Map",
            },
            style: responsiveStyle({
              fontSize: "18px",
              fontWeight: "600",
              color: "#64748b",
              textAlign: "center",
              padding: "40px",
              backgroundColor: "#f1f5f9",
              borderRadius: "8px",
              width: "100%",
            }),
          },
          children: [],
        },
      ]),
    ],
  };
};

// ============================================
// MAIN BUILDER (SWITCH B KIND)
// ============================================

export function buildSectionFromConfig(
  config: SectionConfig
): PageBlock {
  switch (config.kind) {
    case "navbar":
      return buildNavbar(config);
    case "hero":
      return buildHero(config);
    case "mission":
      return buildMission(config);
    case "features":
      return buildFeatures(config);
    case "services":
      return buildServices(config);
    case "testimonial":
      return buildTestimonial(config);
    case "stats":
      return buildStats(config);
    case "cta":
      return buildCTA(config);
    case "footer":
      return buildFooter(config);
    case "faq":
      return buildFAQ(config);
    default:
      return buildMission(config);
  }
}

// ============================================
// ENRICH SECTION WITH AI CONTENT
// ============================================

const enrichSection = (
  section: SectionConfig,
  aiContent: any,
  heroImageUrl?: string,
  navigationItems: Array<{ label: string; href: string }> = []
): SectionConfig => {
  if (section.kind === "navbar") {
    const contactLink = navigationItems.find(
      (item) => item.label.toLowerCase() === "contact"
    );

    return {
      ...section,
      title: aiContent?.title || section.title,
      navigationItems,
      ctaHref: contactLink?.href || section.ctaHref
    };
  }

  if (section.kind === "footer") {
    return {
      ...section,
      title: aiContent?.title || section.title,
    };
  }

  if (section.kind === "hero") {
    return {
      ...section,
      title: aiContent?.heroTitle || section.title,
      text: aiContent?.heroText || section.text,
      resolvedImage: heroImageUrl || section.image,
    };
  }

  if (section.kind === "mission") {
    return {
      ...section,
      title: aiContent?.missionTitle || section.title,
      text: aiContent?.missionText || section.text,
    };
  }

  if (section.kind === "features" && aiContent?.features?.length) {
    return {
      ...section,
      items: aiContent.features,
    };
  }

  if (section.kind === "faq" && aiContent?.faqs?.length) {
    return {
      ...section,
      items: aiContent.faqs,
    };
  }

  if (section.kind === "services" && aiContent?.services?.length) {
    return {
      ...section,
      items: aiContent.services.map(
        (service: string) => `📌 ${service}|Professional ${service.toLowerCase()} services.`
      ),
    };
  }

  if (section.kind === "stats" && aiContent?.stats?.length) {
    return {
      ...section,
      items: aiContent.stats.map((stat: any) => `${stat.value}|${stat.label}`),
    };
  }

  if (section.kind === "testimonial" && aiContent?.testimonials?.length) {
    return {
      ...section,
      items: aiContent.testimonials.map((item: string) => {
        const [quote, author] = item.split("|");
        return `★★★★★|${quote}|${author || "Client"}`;
      }),
    };
  }

  if (section.kind === "cta") {
    return {
      ...section,
      title: aiContent?.ctaTitle || section.title,
      text: aiContent?.ctaText || section.text,
    };
  }

  return section;
};

// ============================================
// GENERATE HOME BLOCKS
// ============================================

export const generateHomeBlocks = (
  category: string,
  aiContent: any,
  heroImageUrl?: string,
  navigationItems: Array<{ label: string; href: string }> = []
): PageBlock[] => {
  const template = CATEGORY_TEMPLATES[category] ?? CATEGORY_TEMPLATES["Corporate"];
  
const homeKinds: SectionKind[] = [
  "navbar",
  "hero",
  "mission",
  "features",
  "services",
  "testimonial",
  "stats",
  "faq",
  "cta",
  "footer"
];  
  const sections = template.sections
    .filter((section) => homeKinds.includes(section.kind))
    .map((section) => enrichSection(section, aiContent, heroImageUrl, navigationItems));
  
  return sections.map((section) => buildSectionFromConfig(section));
};

// ============================================
// GENERATE ABOUT BLOCKS
// ============================================

export const generateAboutBlocks = (
  category: string,
  aiContent: any,
  heroImageUrl?: string,
  navigationItems: Array<{ label: string; href: string }> = []
): PageBlock[] => {
  const template = CATEGORY_TEMPLATES[category] ?? CATEGORY_TEMPLATES["Corporate"];
  
  // About: navbar + mission + features + testimonial + stats + footer + faq
  const aboutKinds: SectionKind[] = ["navbar", "mission", "features", "testimonial", "stats", "faq", "footer"];
  
  const sections = template.sections
    .filter((section) => aboutKinds.includes(section.kind))
    .map((section) => enrichSection(section, aiContent, heroImageUrl, navigationItems));
  
  return sections.map((section) => buildSectionFromConfig(section));
};

// ============================================
// GENERATE SERVICES BLOCKS
// ============================================

export const generateServicesBlocks = (
  category: string,
  aiContent: any,
  heroImageUrl?: string,
  navigationItems: Array<{ label: string; href: string }> = []
): PageBlock[] => {
  const template = CATEGORY_TEMPLATES[category] ?? CATEGORY_TEMPLATES["Corporate"];
  
  // Services: navbar + hero + services + features + cta + footer + faq
  const servicesKinds: SectionKind[] = ["navbar", "hero", "services", "features", "cta", "faq", "footer"];
  
  const sections = template.sections
    .filter((section) => servicesKinds.includes(section.kind))
    .map((section) => enrichSection(section, aiContent, heroImageUrl, navigationItems));
  
  return sections.map((section) => buildSectionFromConfig(section));
};

// ============================================
// GENERATE CONTACT BLOCKS
// ============================================

export const generateContactBlocks = (
  category: string,
  aiContent: any,
  heroImageUrl?: string,
  navigationItems: Array<{ label: string; href: string }> = []
): PageBlock[] => {
  const template = CATEGORY_TEMPLATES[category] ?? CATEGORY_TEMPLATES["Corporate"];

  const buildTemplateSection = (kind: SectionKind): PageBlock | undefined => {
    const section = template.sections.find((item) => item.kind === kind);

    return section
      ? buildSectionFromConfig(
          enrichSection(section, aiContent, heroImageUrl, navigationItems)
        )
      : undefined;
  };

  const navbar = buildTemplateSection("navbar");
  const hero = buildTemplateSection("hero");
  const cta = buildTemplateSection("cta");
  const footer = buildTemplateSection("footer");
  const faq = buildTemplateSection("faq");

  const orderedBlocks = [
    { label: "navbar", block: navbar },
    { label: "hero", block: hero },
    { label: "contact-form", block: buildContactForm() },
    { label: "contact-info", block: buildContactInfo() },
    { label: "map", block: buildMap() },
    { label: "faq", block: faq },
    { label: "cta", block: cta },
    { label: "footer", block: footer }
  ].filter(
    (item): item is { label: string; block: PageBlock } =>
      Boolean(item.block)
  );

  const contactBlocks = orderedBlocks.map((item) => item.block);

  console.log(
    "CONTACT_BLOCK_ORDER",
    orderedBlocks.map((item) => item.label)
  );
  console.log(
    "NAVBAR_BLOCK_COUNT",
    contactBlocks.filter((block) => block.type === "navbar").length
  );

  return contactBlocks;
};

const generateSpecializedBlocks = (
  category: string,
  aiContent: any,
  heroImageUrl: string | undefined,
  navigationItems: Array<{ label: string; href: string }>,
  overrides: Partial<Record<SectionKind, Partial<SectionConfig>>>,
  kinds: SectionKind[]
): PageBlock[] => {
  const template = CATEGORY_TEMPLATES[category] ?? CATEGORY_TEMPLATES["Corporate"];

  return template.sections
    .filter((section) => kinds.includes(section.kind))
    .map((section) =>
      enrichSection(section, aiContent, heroImageUrl, navigationItems)
    )
    .map((section) => ({
      ...section,
      ...(overrides[section.kind] || {})
    }))
    .map((section) => buildSectionFromConfig(section));
};

export const generateSolutionsBlocks = (
  category: string,
  aiContent: any,
  heroImageUrl?: string,
  navigationItems: Array<{ label: string; href: string }> = []
): PageBlock[] =>
  generateSpecializedBlocks(
    category,
    aiContent,
    heroImageUrl,
    navigationItems,
    {
      hero: {
        title: `${aiContent?.title || category} Solutions`,
        text: "Explore practical solutions designed around your workflows, customers, and growth goals."
      },
      services: {
        title: "Solutions Built for Real Work",
        text: "Choose focused capabilities that solve concrete business problems."
      },
      features: {
        title: "What You Can Achieve",
        text: "Turn complex processes into reliable, scalable outcomes."
      },
      cta: {
        title: "Find the Right Solution",
        text: "Talk with our team about the outcome you need."
      }
    },
    ["navbar", "hero", "services", "features", "testimonial", "cta", "faq", "footer"]
  );

export const generatePricingBlocks = (
  category: string,
  aiContent: any,
  heroImageUrl?: string,
  navigationItems: Array<{ label: string; href: string }> = []
): PageBlock[] =>
  generateSpecializedBlocks(
    category,
    aiContent,
    heroImageUrl,
    navigationItems,
    {
      hero: {
        title: "Simple, Scalable Pricing",
        text: "Start with the plan that fits today and upgrade as your needs grow."
      },
      services: {
        title: "Choose Your Plan",
        text: "Clear options for teams at every stage.",
        items: [
          "Starter|Essential tools for individuals and small teams.",
          "Growth|Advanced workflows for growing organizations.",
          "Scale|Enterprise controls, support, and customization."
        ]
      },
      features: {
        title: "Included in Every Plan",
        text: "Core capabilities, secure infrastructure, and room to grow."
      },
      cta: {
        title: "Need a Custom Plan?",
        text: "Contact us for volume pricing and tailored requirements."
      }
    },
    ["navbar", "hero", "services", "features", "cta", "faq", "footer"]
  );

export const generateIntegrationsBlocks = (
  category: string,
  aiContent: any,
  heroImageUrl?: string,
  navigationItems: Array<{ label: string; href: string }> = []
): PageBlock[] =>
  generateSpecializedBlocks(
    category,
    aiContent,
    heroImageUrl,
    navigationItems,
    {
      hero: {
        title: "Connect Your Essential Tools",
        text: "Bring your existing stack together with secure, flexible integrations."
      },
      services: {
        title: "Popular Integrations",
        text: "Connect the systems your team already relies on.",
        items: [
          "CRM|Keep customer data synchronized across your workflow.",
          "Analytics|Send trusted product and business data to your reporting tools.",
          "Collaboration|Turn events into notifications and team actions.",
          "Developer API|Build custom connections with documented APIs and webhooks."
        ]
      },
      features: {
        title: "Built to Connect",
        text: "Reliable synchronization, secure access, and developer-friendly extensibility."
      },
      cta: {
        title: "Do Not See Your Tool?",
        text: "Ask about a custom integration for your stack."
      }
    },
    ["navbar", "hero", "services", "features", "stats", "cta", "faq", "footer"]
  );

export const generatePageBlocksByType = (
  pageType: string,
  category: string,
  aiContent: any,
  heroImageUrl?: string,
  navigationItems: Array<{ label: string; href: string }> = [],
  pageTitle?: string,
  generatedBlocks: PageBlock[] = []
): PageBlock[] => {
  switch (pageType) {
    case "home": {
      if (generatedBlocks.length === 0) {
        throw new Error("HOME_GENERATED_BLOCKS_REQUIRED");
      }

      return generatedBlocks;
    }
    case "about":
      return generateAboutBlocks(category, aiContent, heroImageUrl, navigationItems);
    case "services":
      return generateServicesBlocks(category, aiContent, heroImageUrl, navigationItems);
    case "contact":
      return generateContactBlocks(category, aiContent, heroImageUrl, navigationItems);
    case "solutions":
      return generateSolutionsBlocks(category, aiContent, heroImageUrl, navigationItems);
    case "pricing":
      return generatePricingBlocks(category, aiContent, heroImageUrl, navigationItems);
    case "integrations":
      return generateIntegrationsBlocks(category, aiContent, heroImageUrl, navigationItems);
    default:
      return generateSpecializedBlocks(
        category,
        aiContent,
        heroImageUrl,
        navigationItems,
        {
          hero: {
            title: pageTitle || pageType,
            text: `Explore our ${pageTitle || pageType} resources and capabilities.`
          }
        },
        ["navbar", "hero", "features", "cta", "faq", "footer"]
      );
  }
};

// ============================================
// BUILD FULL PAGE
// ============================================

export function buildPageFromTemplate(
  template: TemplateConfig,
  prompt: string,
  aiContent: any,
  heroImageUrl?: string,
  navigationItems: Array<{ label: string; href: string }> = []
): PageBlock[] {
  const pageTitle =
    aiContent?.title || template.defaultTitle;

const homeKinds: SectionKind[] = [
  "navbar",
  "hero",
  "mission",
  "features",
  "services",
  "testimonial",
  "stats",
  "faq",
  "cta",
  "footer"
];

  const sections = template.sections
    .filter((section) => homeKinds.includes(section.kind))
    .map((section) => {
    if (section.kind === "navbar") {
      const contactLink = navigationItems.find(
        (item) => item.label.toLowerCase() === "contact"
      );

      return {
        ...section,
        title: pageTitle,
        navigationItems,
        ctaHref: contactLink?.href || section.ctaHref
      };
    }

    if (section.kind === "footer") {
      return {
        ...section,
        title: pageTitle
      };
    }

    if (section.kind === "hero") {
      return {
        ...section,
        title: aiContent?.heroTitle || section.title || pageTitle,
        text: aiContent?.heroText || section.text || prompt,
        resolvedImage: heroImageUrl || section.image
      };
    }

    if (section.kind === "mission") {
      return {
        ...section,
        title: aiContent?.missionTitle || section.title,
        text: aiContent?.missionText || section.text
      };
    }

    if (section.kind === "features" && aiContent?.features?.length) {
      return {
        ...section,
        items: aiContent.features
      };
    }

    if (section.kind === "faq" && aiContent?.faqs?.length) {
      return {
        ...section,
        items: aiContent.faqs
      };
    }

    if (section.kind === "services" && aiContent?.services?.length) {
      return {
        ...section,
        items: aiContent.services.map(
          (service: string) => `📌 ${service}|Professional ${service.toLowerCase()} services.`
        )
      };
    }

    if (section.kind === "stats" && aiContent?.stats?.length) {
      return {
        ...section,
        items: aiContent.stats.map(
          (stat: any) => `${stat.value}|${stat.label}`
        )
      };
    }

    if (section.kind === "testimonial" && aiContent?.testimonials?.length) {
      return {
        ...section,
        items: aiContent.testimonials.map(
          (item: string) => {
            const [quote, author] = item.split("|");
            return `★★★★★|${quote}|${author || "Client"}`;
          }
        )
      };
    }

    if (section.kind === "cta") {
      return {
        ...section,
        title: aiContent?.ctaTitle || section.title,
        text: aiContent?.ctaText || section.text
      };
    }

    return section;
    });

  return sections.map((section) => buildSectionFromConfig(section));
}

// ============================================
// GENERATE TEMPLATE
// ============================================

export function generateTemplate(
  category: string,
  prompt: string,
  aiContent: any,
  heroImageUrl?: string,
  navigationItems: Array<{ label: string; href: string }> = []
): GeneratedPage {
  const template =
    CATEGORY_TEMPLATES[category] ??
    CATEGORY_TEMPLATES["Corporate"];

  const blocks =
    buildPageFromTemplate(
      template,
      prompt,
      aiContent,
      heroImageUrl,
      navigationItems
    );

  return {
    title:
      aiContent?.title ||
      template.defaultTitle,
    blocks
  };
}

// ============================================
// EXPORTS
// ============================================

export {
  buildNavbar,
  buildHero,
  buildMission,
  buildFeatures,
  buildServices,
  buildTestimonial,
  buildStats,
  buildCTA,
  buildFooter,
  buildContactForm,
  buildContactInfo,
  buildMap,
  buildFAQ,
  featureCard,
  enrichSection,
};