// ai.builder.ts

import { PageBlock } from "../pages/types/page.types";
import { CATEGORY_TEMPLATES, SectionConfig, SectionKind, TemplateConfig } from "./ai.templates";
import { applyDesignSystemToBlocks, generateDesignSystem } from "./designSystem.generator";

const makeId = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 9)}`;

const cleanStyle = (
  style: Record<string, any>
) =>
  Object.fromEntries(
    Object.entries(style).filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        value !== ""
    )
  );

const scalePx = (
  value: any,
  factor: number,
  min: number
) => {
  if (
    typeof value !== "string" ||
    !value.endsWith("px")
  ) {
    return undefined;
  }

  const number =
    Number(
      value.replace("px", "")
    );

  if (
    Number.isNaN(number)
  ) {
    return undefined;
  }

  return `${Math.max(
    Math.round(number * factor),
    min
  )}px`;
};

const responsiveStyle = (
  desktop: Record<string, any> = {},
  tablet: Record<string, any> = {},
  mobile: Record<string, any> = {}
) => {
  const isGrid =
    desktop.display === "grid";

  const isRowFlex =
    desktop.display === "flex" &&
    desktop.flexDirection === "row";

  return {
    desktop,

    tablet: cleanStyle({
      ...(isGrid
        ? {
            gridTemplateColumns:
              "repeat(2, minmax(0, 1fr))"
          }
        : {}),

      ...(isRowFlex
        ? {
            flexDirection: "column",
            alignItems: "center"
          }
        : {}),

      fontSize:
        scalePx(
          desktop.fontSize,
          0.85,
          14
        ),
      maxWidth: "100%",

      ...tablet
    }),

    mobile: cleanStyle({
      ...(isGrid
        ? {
            gridTemplateColumns: "1fr"
          }
        : {}),

      ...(isRowFlex
        ? {
            flexDirection: "column",
            alignItems: "center"
          }
        : {}),

      fontSize:
        scalePx(
          desktop.fontSize,
          0.75,
          12
        ),
      maxWidth: "100%",

      ...mobile
    })
  };
};
// ============================================
// BLOCK BUILDERS (LES COMPOSANTS DE BASE)
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
      width: "100%",
      maxWidth: "100%"
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
      backgroundColor: "#667189",
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
    style: responsiveStyle(
  {
    padding: "80px 40px",
    backgroundColor: "#ffffff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    ...style
  },
  {
    padding: "64px 28px"
  },
  {
    padding: "48px 18px"
  }
)
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
// NOUVEAUX BUILDERS SPÉCIFIQUES
// ============================================

// 1. TEAM BUILDER
const buildTeam = (config: SectionConfig): PageBlock => {
  const items = config.items || [];
  
  const teamBlocks: PageBlock[] = items.map((item) => {
    const [name, role, bio, image] = item.split("|");
    
    return gridItemBlock([
      {
        id: makeId("team-card"),
        type: "flex",
        data: {
          props: {},
          style: responsiveStyle({
            padding: "24px",
            borderRadius: "16px",
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
            textAlign: "center"
          })
        },
        children: [
          {
            id: makeId("team-avatar"),
            type: "image",
            data: {
              props: {
                url: image || `https://ui-avatars.com/api/?name=${name}&background=2563eb&color=fff&size=128`,
                alt: name
              },
              style: responsiveStyle({
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                marginBottom: "8px"
              })
            },
            children: []
          },
          {
            id: makeId("team-name"),
            type: "text",
            data: {
              props: { text: name },
              style: responsiveStyle({
                fontSize: "20px",
                fontWeight: "700",
                color: "#0f172a",
                marginBottom: "0"
              })
            },
            children: []
          },
          {
            id: makeId("team-role"),
            type: "text",
            data: {
              props: { text: role || "Team Member" },
              style: responsiveStyle({
                fontSize: "14px",
                color: "#2563eb",
                fontWeight: "600",
                marginBottom: "0"
              })
            },
            children: []
          },
          {
            id: makeId("team-bio"),
            type: "text",
            data: {
              props: { text: bio || "" },
              style: responsiveStyle({
                fontSize: "14px",
                color: "#64748b",
                marginBottom: "0",
                lineHeight: "1.6"
              })
            },
            children: []
          }
        ]
      }
    ]);
  });

  const teamContainer: PageBlock = {
    id: makeId("team-grid"),
    type: "grid",
    data: {
      props: {},
      style: responsiveStyle({
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "32px",
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "20px"
      })
    },
    children: teamBlocks
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
      teamContainer
    ],
    {
      backgroundColor: config.style?.backgroundColor || "#f8fafc",
      padding: "80px 40px",
      textAlign: "center"
    }
  );
};

// 2. VALUES BUILDER
const buildValues = (config: SectionConfig): PageBlock => {
  const items = config.items || [];
  
  const valuesBlocks: PageBlock[] = items.map((item) => {
    const [title, description, icon] = item.split("|");
    
    return gridItemBlock([
      {
        id: makeId("value-card"),
        type: "flex",
        data: {
          props: {},
          style: responsiveStyle({
            padding: "32px",
            borderRadius: "16px",
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
            textAlign: "center",
            minHeight: "200px"
          })
        },
        children: [
          {
            id: makeId("value-icon"),
            type: "text",
            data: {
              props: { text: icon || "⭐" },
              style: responsiveStyle({
                fontSize: "48px",
                marginBottom: "0"
              })
            },
            children: []
          },
          {
            id: makeId("value-title"),
            type: "text",
            data: {
              props: { text: title || item },
              style: responsiveStyle({
                fontSize: "20px",
                fontWeight: "700",
                color: "#0f172a",
                marginBottom: "0"
              })
            },
            children: []
          },
          {
            id: makeId("value-desc"),
            type: "text",
            data: {
              props: { text: description || "" },
              style: responsiveStyle({
                fontSize: "15px",
                color: "#64748b",
                marginBottom: "0",
                lineHeight: "1.6"
              })
            },
            children: []
          }
        ]
      }
    ]);
  });

  const valuesContainer: PageBlock = {
    id: makeId("values-grid"),
    type: "grid",
    data: {
      props: {},
      style: responsiveStyle({
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "24px",
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "20px"
      })
    },
    children: valuesBlocks
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
      valuesContainer
    ],
    {
      backgroundColor: config.style?.backgroundColor || "#ffffff",
      padding: "80px 40px",
      textAlign: "center"
    }
  );
};

// 3. STORY BUILDER
const buildStory = (config: SectionConfig): PageBlock => {
  const paragraphs = config.text?.split("\n\n") || [config.text || ""];
  
  const storyBlocks = paragraphs.map((paragraph, index) => ({
    id: makeId(`story-paragraph-${index}`),
    type: "text",
    data: {
      props: { text: paragraph },
      style: responsiveStyle({
        fontSize: "18px",
        color: "#334155",
        lineHeight: "1.8",
        textAlign: "left",
        maxWidth: "800px",
        margin: "0 auto",
        marginBottom: index === paragraphs.length - 1 ? "0" : "24px"
      })
    },
    children: []
  }));

  return sectionBlock(
    [
      titleBlock(config.title, {
        fontSize: "38px",
        marginBottom: "24px"
      }),
      ...storyBlocks
    ],
    {
      backgroundColor: config.style?.backgroundColor || "#f8fafc",
      padding: "80px 40px"
    }
  );
};

// 4. PRICING BUILDER
const buildPricing = (config: SectionConfig): PageBlock => {
  const items = config.items || [];
  
  const pricingBlocks: PageBlock[] = items.map((item) => {
    const [plan, price, features, cta] = item.split("|");
    const featureList = features?.split(",") || [];
    
    return gridItemBlock([
      {
        id: makeId("pricing-card"),
        type: "flex",
        data: {
          props: {},
          style: responsiveStyle({
            padding: "32px",
            borderRadius: "16px",
            backgroundColor: "#ffffff",
            border: "2px solid #e5e7eb",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            height: "100%",
            minHeight: "400px"
          })
        },
        children: [
          {
            id: makeId("pricing-plan"),
            type: "text",
            data: {
              props: { text: plan || item },
              style: responsiveStyle({
                fontSize: "24px",
                fontWeight: "700",
                color: "#0f172a",
                textAlign: "center",
                marginBottom: "0"
              })
            },
            children: []
          },
          {
            id: makeId("pricing-price"),
            type: "text",
            data: {
              props: { text: price || "Contact us" },
              style: responsiveStyle({
                fontSize: "36px",
                fontWeight: "800",
                color: "#2563eb",
                textAlign: "center",
                marginBottom: "0"
              })
            },
            children: []
          },
          {
            id: makeId("pricing-features"),
            type: "flex",
            data: {
              props: {},
              style: responsiveStyle({
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                width: "100%",
                flex: "1"
              })
            },
            children: featureList.map((feature) => ({
              id: makeId("pricing-feature"),
              type: "text",
              data: {
                props: { text: `✓ ${feature.trim()}` },
                style: responsiveStyle({
                  fontSize: "14px",
                  color: "#64748b",
                  textAlign: "left",
                  marginBottom: "0"
                })
              },
              children: []
            }))
          },
          {
            id: makeId("pricing-cta"),
            type: "button",
            data: {
              props: { label: cta || "Get Started" },
              style: responsiveStyle({
                width: "100%",
                padding: "12px",
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
        ]
      }
    ]);
  });

  const pricingContainer: PageBlock = {
    id: makeId("pricing-grid"),
    type: "grid",
    data: {
      props: {},
      style: responsiveStyle({
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "32px",
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "20px"
      })
    },
    children: pricingBlocks
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
      pricingContainer
    ],
    {
      backgroundColor: config.style?.backgroundColor || "#f8fafc",
      padding: "80px 40px",
      textAlign: "center"
    }
  );
};

// 5. RESERVATION BUILDER
const buildReservation = (
  config: SectionConfig
): PageBlock => {
  const fields = [
    {
      name: "name",
      type: "text",
      label: "Full Name",
      required: true
    },
    {
      name: "email",
      type: "email",
      label: "Email Address",
      required: true
    },
    {
      name: "phone",
      type: "tel",
      label: "Phone Number",
      required: true
    },
    {
      name: "date",
      type: "date",
      label: "Preferred Date",
      required: true
    },
    {
      name: "time",
      type: "time",
      label: "Preferred Time",
      required: true
    },
    {
      name: "guests",
      type: "number",
      label: "Number of Guests",
      required: true
    },
    {
      name: "message",
      type: "textarea",
      label: "Special Requests",
      required: false
    }
  ];

  const fieldBlocks: PageBlock[] =
    fields.map((field) => ({
      id: makeId(
        `reservation-field-${field.name}`
      ),
      type:
        field.type === "textarea"
          ? "textarea"
          : "input",
      data: {
        props: {
          name: field.name,
          placeholder: field.label,
          required: field.required,
          type: field.type,
          label: field.label
        },
        style: responsiveStyle(
          {
            width: "100%",
            minHeight:
              field.type === "textarea"
                ? "130px"
                : "52px",
            padding: "14px 16px",
            fontSize: "15px",
            border: "1px solid #cbd5e1",
            borderRadius: "14px",
            marginBottom: "0",
            backgroundColor: "#ffffff",
            color: "#0f172a",
            boxSizing: "border-box",
            outline: "none"
          },
          {},
          {
            minHeight:
              field.type === "textarea"
                ? "120px"
                : "50px"
          }
        )
      },
      children: []
    }));

  const formGrid: PageBlock = {
    id: makeId("reservation-form-grid"),
    type: "grid",
    data: {
      props: {},
      style: responsiveStyle(
        {
          display: "grid",
          gridTemplateColumns:
            "repeat(2, minmax(0, 1fr))",
          gap: "16px",
          width: "100%"
        },
        {
          gridTemplateColumns: "1fr",
          gap: "14px"
        },
        {
          gridTemplateColumns: "1fr",
          gap: "12px"
        }
      )
    },
    children: fieldBlocks.map((fieldBlock) =>
      gridItemBlock([fieldBlock])
    )
  };

  const reservationCard: PageBlock = {
    id: makeId("reservation-card"),
    type: "flex",
    data: {
      props: {},
      style: responsiveStyle(
        {
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          justifyContent: "center",
          gap: "18px",
          width: "100%",
          maxWidth: "760px",
          margin: "0 auto",
          backgroundColor: "#ffffff",
          padding: "52px",
          borderRadius: "24px",
          border: "1px solid #e5e7eb",
          boxShadow:
            "0 22px 55px rgba(15,23,42,0.12)",
          boxSizing: "border-box"
        },
        {
          maxWidth: "680px",
          padding: "42px"
        },
        {
          maxWidth: "100%",
          padding: "28px 20px",
          borderRadius: "18px"
        }
      )
    },
    children: [
      titleBlock(
        config.title || "Make a Reservation",
        {
          fontSize: "34px",
          fontWeight: "900",
          textAlign: "center",
          marginBottom: "4px",
          color: "#0f172a"
        }
      ),

      textBlock(
        config.text ||
          "Fill in the details below and our team will confirm your reservation shortly.",
        {
          fontSize: "16px",
          color: "#64748b",
          textAlign: "center",
          lineHeight: "1.7",
          marginBottom: "14px"
        }
      ),

      formGrid,

      {
        id: makeId("reservation-submit"),
        type: "button",
        data: {
          props: {
            label: "Book Now",
            type: "submit"
          },
          style: responsiveStyle(
            {
              alignSelf: "center",
              padding: "14px 36px",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              border: "none",
              borderRadius: "14px",
              fontSize: "16px",
              fontWeight: "800",
              cursor: "pointer",
              boxShadow:
                "0 14px 30px rgba(37,99,235,0.28)"
            },
            {},
            {
              width: "100%",
              maxWidth: "260px"
            }
          )
        },
        children: []
      }
    ]
  };

  return {
    id: makeId("reservation-section"),
    type: "section",
    data: {
      props: {},
      style: responsiveStyle(
        {
          width: "100%",
          minHeight: "70vh",
          padding: "100px 40px",
          backgroundColor:
            config.style?.backgroundColor ||
            "#f8fafc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxSizing: "border-box"
        },
        {
          padding: "76px 28px",
          minHeight: "auto"
        },
        {
          padding: "56px 18px",
          minHeight: "auto"
        }
      )
    },
    children: [
      {
        id: makeId("reservation-section-flex"),
        type: "flex",
        data: {
          props: {},
          style: responsiveStyle({
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            maxWidth: "1100px",
            margin: "0 auto"
          })
        },
        children: [
          {
            id: makeId("reservation-section-item"),
            type: "flexItem",
            data: {
              props: {},
              style: responsiveStyle({
                width: "100%",
                display: "flex",
                justifyContent: "center"
              })
            },
            children: [
              reservationCard
            ]
          }
        ]
      }
    ]
  };
};
// 6. INTEGRATIONS BUILDER
const buildIntegrations = (config: SectionConfig): PageBlock => {
  const items = config.items || [];
  
  const integrationBlocks: PageBlock[] = items.map((item) => {
    const [name, description, logo] = item.split("|");
    
    return gridItemBlock([
      {
        id: makeId("integration-card"),
        type: "flex",
        data: {
          props: {},
          style: responsiveStyle({
            padding: "24px",
            borderRadius: "16px",
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
            textAlign: "center",
            minHeight: "160px"
          })
        },
        children: [
          {
            id: makeId("integration-logo"),
            type: "text",
            data: {
              props: { text: logo || "🔌" },
              style: responsiveStyle({
                fontSize: "48px",
                marginBottom: "0"
              })
            },
            children: []
          },
          {
            id: makeId("integration-name"),
            type: "text",
            data: {
              props: { text: name || item },
              style: responsiveStyle({
                fontSize: "18px",
                fontWeight: "700",
                color: "#0f172a",
                marginBottom: "0"
              })
            },
            children: []
          },
          {
            id: makeId("integration-desc"),
            type: "text",
            data: {
              props: { text: description || "" },
              style: responsiveStyle({
                fontSize: "14px",
                color: "#64748b",
                marginBottom: "0",
                lineHeight: "1.6"
              })
            },
            children: []
          }
        ]
      }
    ]);
  });

  const integrationContainer: PageBlock = {
    id: makeId("integration-grid"),
    type: "grid",
    data: {
      props: {},
      style: responsiveStyle({
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "24px",
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "20px"
      })
    },
    children: integrationBlocks
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
      integrationContainer
    ],
    {
      backgroundColor: config.style?.backgroundColor || "#f8fafc",
      padding: "80px 40px",
      textAlign: "center"
    }
  );
};

// 7. TIMELINE BUILDER
const buildTimeline = (config: SectionConfig): PageBlock => {
  const items = config.items || [];
  
  const timelineBlocks: PageBlock[] = items.map((item, index) => {
    const [year, title, description] = item.split("|");
    const isEven = index % 2 === 0;
    
    return {
      id: makeId(`timeline-item-${index}`),
      type: "flex",
      data: {
        props: {},
        style: responsiveStyle({
          display: "flex",
          flexDirection: isEven ? "row" : "row-reverse",
          alignItems: "center",
          justifyContent: "center",
          gap: "32px",
          width: "100%",
          maxWidth: "800px",
          margin: "0 auto",
          padding: "20px 0",
          borderLeft: index === 0 ? "none" : "2px solid #e5e7eb",
          position: "relative"
        })
      },
      children: [
        {
          id: makeId(`timeline-year-${index}`),
          type: "flexItem",
          data: {
            props: {},
            style: responsiveStyle({
              flex: "0 0 100px",
              textAlign: isEven ? "right" : "left"
            })
          },
          children: [
            {
              id: makeId(`timeline-year-text-${index}`),
              type: "text",
              data: {
                props: { text: year || `Year ${index + 1}` },
                style: responsiveStyle({
                  fontSize: "24px",
                  fontWeight: "800",
                  color: "#2563eb",
                  marginBottom: "0"
                })
              },
              children: []
            }
          ]
        },
        {
          id: makeId(`timeline-content-${index}`),
          type: "flexItem",
          data: {
            props: {},
            style: responsiveStyle({
              flex: "1",
              padding: "20px",
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              border: "1px solid #e5e7eb"
            })
          },
          children: [
            {
              id: makeId(`timeline-title-${index}`),
              type: "text",
              data: {
                props: { text: title || "" },
                style: responsiveStyle({
                  fontSize: "18px",
                  fontWeight: "700",
                  color: "#0f172a",
                  textAlign: "left",
                  marginBottom: "8px"
                })
              },
              children: []
            },
            {
              id: makeId(`timeline-desc-${index}`),
              type: "text",
              data: {
                props: { text: description || "" },
                style: responsiveStyle({
                  fontSize: "15px",
                  color: "#64748b",
                  textAlign: "left",
                  marginBottom: "0",
                  lineHeight: "1.6"
                })
              },
              children: []
            }
          ]
        }
      ]
    };
  });

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
      ...timelineBlocks
    ],
    {
      backgroundColor: config.style?.backgroundColor || "#f8fafc",
      padding: "80px 40px"
    }
  );
};

// ============================================
// BUILDERS EXISTANTS (CONSERVÉS)
// ============================================

const buildNavbar = (config: SectionConfig): PageBlock => {
  const id = makeId("navbar");

  const color = "#0f172a";
  const bgColor = "#ffffff";

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
      style: responsiveStyle(
        {
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          maxWidth: "none",
          margin: "0",
          paddingTop: "14px",
          paddingBottom: "14px",
          paddingLeft: "28px",
          paddingRight: "28px",
          boxSizing: "border-box",
          flexWrap: "wrap",
          gap: "18px",
          overflow: "visible",
          backgroundColor: bgColor,
          color,
          whiteSpace: "nowrap",
          borderBottom: "1px solid rgba(0,0,0,0.08)"
        },
        {
          flexDirection: "row",
          paddingLeft: "22px",
          paddingRight: "22px",
          gap: "14px"
        },
        {
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          paddingLeft: "18px",
          paddingRight: "18px",
          paddingTop: "18px",
          paddingBottom: "18px",
          gap: "14px",
          whiteSpace: "normal"
        }
      )
    },
    children: [
      {
        id: makeId("navbar-logo-item"),
        type: "flexItem",
        data: {
          props: {},
          style: responsiveStyle(
            {
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              width: "max-content",
              flex: "0 0 auto",
              whiteSpace: "nowrap"
            },
            {
              justifyContent: "flex-start"
            },
            {
              justifyContent: "center",
              width: "100%"
            }
          )
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
              style: responsiveStyle(
                {
                  color,
                  fontWeight: "900",
                  fontSize: "24px",
                  letterSpacing: "0.02em",
                  whiteSpace: "nowrap",
                  marginBottom: "0",
                  textAlign: "left"
                },
                {
                  fontSize: "22px",
                  textAlign: "left"
                },
                {
                  fontSize: "22px",
                  textAlign: "center"
                }
              )
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
          style: responsiveStyle(
            {
              flex: "1 1 auto",
              minWidth: "0",
              display: "flex",
              justifyContent: "center"
            },
            {
              justifyContent: "center"
            },
            {
              width: "100%",
              justifyContent: "center"
            }
          )
        },
        children: [
          {
            id: makeId("navbar-links-flex"),
            type: "flex",
            data: {
              props: {},
              style: responsiveStyle(
                {
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "wrap",
                  columnGap: "18px",
                  rowGap: "10px",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%"
                },
                {
                  flexDirection: "row",
                  columnGap: "14px",
                  rowGap: "8px"
                },
                {
                  flexDirection: "column",
                  flexWrap: "nowrap",
                  gap: "8px",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%"
                }
              )
            },
            children: links.map((link, index) => ({
              id: makeId(`navbar-link-item-${index}`),
              type: "flexItem",
              data: {
                props: {},
                style: responsiveStyle(
                  {
                    flex: "0 0 auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  },
                  {},
                  {
                    width: "100%",
                    textAlign: "center",
                    justifyContent: "center"
                  }
                )
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
                    style: responsiveStyle(
                      {
                        textDecoration: "none",
                        color,
                        fontSize: "15px",
                        fontWeight: "700",
                        whiteSpace: "nowrap",
                        display: "inline-block",
                        marginRight: "22px",
                        padding: "6px 0"
                      },
                      {
                        fontSize: "14px",
                        marginRight: "14px"
                      },
                      {
                        fontSize: "15px",
                        textAlign: "center",
                        whiteSpace: "normal",
                        marginRight: "0",
                        padding: "4px 0"
                      }
                    )
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
                style: responsiveStyle(
                  {
                    flex: "0 0 auto"
                  },
                  {},
                  {
                    width: "100%",
                    display: "flex",
                    justifyContent: "center"
                  }
                )
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
                    style: responsiveStyle(
                      {
                        borderRadius: "999px",
                        padding: "10px 22px",
                        backgroundColor: "#2563eb",
                        color: "#ffffff",
                        border: "none",
                        fontWeight: "700",
                        fontSize: "14px",
                        cursor: "pointer"
                      },
                      {
                        fontSize: "14px",
                        padding: "9px 20px"
                      },
                      {
                        fontSize: "14px",
                        padding: "10px 22px",
                        width: "auto",
                        maxWidth: "220px"
                      }
                    )
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

const buildHero = (config: SectionConfig): PageBlock => {
  const bgColor = config.style?.backgroundColor || "#f8fafc";
  const color = config.style?.color || "#0f172a";
  const titleSize = config.style?.titleSize || "48px";
  
  const imageUrl =
  config.resolvedImage ||
  config.image ||
  "https://via.placeholder.com/600x400/2563eb/ffffff?text=Hero+Image";

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
      style: responsiveStyle(
  {
    backgroundColor: bgColor,
    padding: "80px 40px",
    minHeight: "60vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center"
  },
  {
    padding: "64px 28px",
    minHeight: "auto"
  },
  {
    padding: "48px 18px",
    minHeight: "auto"
  }
)
    },
    children: [heroRow]
  };
};

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

const buildServices = (config: SectionConfig): PageBlock => {
  const items = config.items || [];
  
  const serviceBlocks: PageBlock[] = items.map((item) => {
    const parts = item.split('|');
    const iconTitle = parts[0] || item;
    const description = parts[1] || '';
    
    const iconMatch = iconTitle.match(/^([\u{1F000}-\u{1FFFF}]|[\u2600-\u27BF]|[\u{2700}-\u{27BF}])\s*(.+)/u);
    const icon = iconMatch ? iconMatch[1] : '📌';
    const title = iconMatch ? iconMatch[2] : iconTitle;
    
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

const buildFooter = (config: SectionConfig): PageBlock => {
  const bgColor = config.style?.backgroundColor || "#0f172a";
  const color = config.style?.color || "#ffffff";
  
  const brandName = config.title || "Brand";
  
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
      style: responsiveStyle(
  {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: "32px",
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 20px",
    width: "100%"
  },
  {
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "28px",
    padding: "0 12px"
  },
  {
    gridTemplateColumns: "1fr",
    gap: "24px",
    padding: "0",
    textAlign: "center"
  }
)
    },
    children: gridChildren
  };

  const copyrightText = `© ${new Date().getFullYear()} ${brandName}. All rights reserved.`;

  return {
    id: makeId("footer-section"),
    type: "footer",
    data: {
      props: {},
     style: responsiveStyle(
  {
    backgroundColor: bgColor,
    borderTop: "1px solid #1e293b",
    padding: "60px 40px 40px 40px"
  },
  {
    padding: "52px 28px 36px 28px"
  },
  {
    padding: "44px 20px 32px 20px"
  }
)
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

const buildFAQ = (config: SectionConfig): PageBlock => {
  const items =
    config.items || [];

  const faqBlocks: PageBlock[] =
    items.map((item) => {
      const [question, answer] =
        item.split("|");

      const faqCard: PageBlock = {
        id: makeId("faq-item-card"),
        type: "flex",
        data: {
          props: {},
          style: responsiveStyle(
            {
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              width: "100%",
              maxWidth: "820px",
              padding: "22px 26px",
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "14px",
              boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
              boxSizing: "border-box"
            },
            {},
            {
              maxWidth: "100%",
              padding: "18px"
            }
          )
        },
        children: [
          textBlock(question || item, {
            fontSize: "18px",
            fontWeight: "800",
            color: "#0f172a",
            textAlign: "left",
            marginBottom: "0"
          }),

          textBlock(answer || "", {
            fontSize: "15px",
            color: "#64748b",
            textAlign: "left",
            lineHeight: "1.7",
            marginBottom: "0"
          })
        ]
      };

      return {
        id: makeId("faq-item-wrapper"),
        type: "flexItem",
        data: {
          props: {},
          style: responsiveStyle(
            {
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            },
            {},
            {
              width: "100%"
            }
          )
        },
        children: [faqCard]
      };
    });

  const faqContainer: PageBlock = {
    id: makeId("faq-container"),
    type: "flex",
    data: {
      props: {},
      style: responsiveStyle(
        {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          width: "100%",
          maxWidth: "900px",
          margin: "0 auto",
          boxSizing: "border-box"
        },
        {},
        {
          maxWidth: "100%"
        }
      )
    },
    children: faqBlocks
  };

  return sectionBlock(
    [
      titleBlock(config.title || "Frequently Asked Questions", {
        fontSize: "38px",
        fontWeight: "900",
        marginBottom: "12px",
        textAlign: "center"
      }),

      textBlock(config.text || "Find answers to common questions.", {
        fontSize: "16px",
        color: "#64748b",
        marginBottom: "42px",
        textAlign: "center"
      }),

      faqContainer
    ],
    {
      backgroundColor: config.style?.backgroundColor || "#f8fafc",
      padding: "90px 40px",
      textAlign: "center"
    }
  );
};
// ============================================
// CONTACT LAYOUT (CONSERVÉ)
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
        minHeight: field.type === "textarea" ? "150px" : "52px",
        padding: "14px 16px",
        fontSize: "15px",
        border: "1px solid #cbd5e1",
        borderRadius: "10px",
        marginBottom: "0",
        backgroundColor: "#ffffff",
        color: "#0f172a",
        boxSizing: "border-box",
        outline: "none",
      }),
    },
    children: [],
  }));

  return {
    id: makeId("contact-form-card"),
    type: "flex",
    data: {
      props: {},
      style: responsiveStyle({
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        width: "100%",
        maxWidth: "640px",
        margin: "0 auto",
        backgroundColor: "#ffffff",
        padding: "48px",
        borderRadius: "20px",
        border: "1px solid #e5e7eb",
        boxShadow: "0 16px 40px rgba(15,23,42,0.08)",
        boxSizing: "border-box",
      }),
    },
    children: [
      textBlock("Send us a Message", {
        fontSize: "32px",
        fontWeight: "800",
        color: "#0f172a",
        textAlign: "left",
        marginBottom: "4px"
      }),

      textBlock("Fill out the form and our team will get back to you shortly.", {
        fontSize: "16px",
        color: "#64748b",
        textAlign: "left",
        lineHeight: "1.7",
        marginBottom: "18px"
      }),

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
            alignSelf: "flex-start",
            padding: "14px 32px",
            backgroundColor: "#2563eb",
            color: "#ffffff",
            border: "none",
            borderRadius: "10px",
            fontSize: "16px",
            fontWeight: "700",
            cursor: "pointer",
            boxShadow: "0 10px 24px rgba(37,99,235,0.25)"
          }),
        },
        children: [],
      },
    ],
  };
};

const buildContactInfo = (): PageBlock => {
  const contactCards = [
    {
      title: "Email",
      lines: [
        "contact@example.com",
        "partners@example.com"
      ]
    },
    {
      title: "Phone",
      lines: [
        "+216 XX XXX XXX",
        "+33 X XX XX XX XX"
      ]
    },
    {
      title: "Main Office",
      lines: [
        "TN HQ — Tunis",
        "Immeuble Molka, Rue de la Bourse"
      ]
    },
    {
      title: "Working Hours",
      lines: [
        "Monday to Friday",
        "9:00 AM - 6:00 PM"
      ]
    },
    {
      title: "Social",
      lines: [
        "LinkedIn — /company/example",
        "X / Twitter — @example"
      ]
    }
  ];

  const cardBlocks: PageBlock[] = contactCards.map((card) =>
    flexItemBlock([
      {
        id: makeId("contact-info-item-card"),
        type: "flex",
        data: {
          props: {},
          style: responsiveStyle({
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            width: "100%",
            padding: "24px",
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "14px",
            boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
            boxSizing: "border-box"
          })
        },
        children: [
          textBlock(card.title, {
            fontSize: "18px",
            fontWeight: "700",
            color: "#0f172a",
            textAlign: "left",
            marginBottom: "6px"
          }),

          ...card.lines.map((line) =>
            textBlock(line, {
              fontSize: "15px",
              color: "#64748b",
              textAlign: "left",
              marginBottom: "0",
              lineHeight: "1.7"
            })
          )
        ]
      }
    ])
  );

  return {
    id: makeId("contact-info-card"),
    type: "flex",
    data: {
      props: {},
      style: responsiveStyle({
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        width: "100%",
        maxWidth: "680px",
        margin: "0 auto",
        backgroundColor: "#f8fafc",
        padding: "48px",
        borderRadius: "20px",
        boxSizing: "border-box"
      })
    },
    children: [
      textBlock("Get in Touch", {
        fontSize: "34px",
        fontWeight: "800",
        color: "#0f172a",
        textAlign: "left",
        marginBottom: "6px"
      }),

      textBlock(
        "Reach out to our team for questions, partnerships, or support.",
        {
          fontSize: "16px",
          color: "#64748b",
          textAlign: "left",
          lineHeight: "1.7",
          marginBottom: "24px"
        }
      ),

      ...cardBlocks
    ]
  };
};

const buildContactLayout = (): PageBlock => ({
  id: makeId("contact-layout-section"),
  type: "section",
  data: {
    props: {},
    style: responsiveStyle({
      backgroundColor: "#f8fafc",
      padding: "90px 40px"
    })
  },
  children: [
    {
      id: makeId("contact-layout-flex"),
      type: "flex",
      data: {
        props: {},
        style: responsiveStyle({
          display: "flex",
          flexDirection: "row",
          gap: "56px",
          alignItems: "flex-start",
          justifyContent: "center",
          maxWidth: "1200px",
          margin: "0 auto",
          width: "100%",
          flexWrap: "wrap"
        })
      },
      children: [
        {
          id: makeId("contact-info-item"),
          type: "flexItem",
          data: {
            props: {},
            style: responsiveStyle({
              flex: "1.1 1 480px",
              maxWidth: "620px"
            })
          },
          children: [buildContactInfo()]
        },
        {
          id: makeId("contact-form-item"),
          type: "flexItem",
          data: {
            props: {},
            style: responsiveStyle({
              flex: "0.9 1 420px",
              maxWidth: "560px"
            })
          },
          children: [buildContactForm()]
        }
      ]
    }
  ]
});
// ============================================
// MAIN BUILDER (SWITCH AVEC NOUVEAUX BUILDERS)
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
    // NOUVEAUX BUILDERS
    case "team":
      return buildTeam(config);
    case "values":
      return buildValues(config);
    case "story":
      return buildStory(config);
    case "pricing":
      return buildPricing(config);
    case "reservation":
      return buildReservation(config);
    case "integrations":
      return buildIntegrations(config);
    case "timeline":
      return buildTimeline(config);
    default:
      return buildMission(config);
  }
}

// ============================================
// ENRICH SECTION AVEC AI CONTENT
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

  // NOUVEAUX KINDS
  if (section.kind === "team" && aiContent?.team?.length) {
    return {
      ...section,
      items: aiContent.team,
    };
  }

  if (section.kind === "values" && aiContent?.values?.length) {
    return {
      ...section,
      items: aiContent.values,
    };
  }

  if (section.kind === "story") {
    return {
      ...section,
      text: aiContent?.storyText || section.text,
    };
  }

  if (section.kind === "pricing" && aiContent?.pricing?.length) {
    return {
      ...section,
      items: aiContent.pricing,
    };
  }

  if (section.kind === "timeline" && aiContent?.timeline?.length) {
    return {
      ...section,
      items: aiContent.timeline,
    };
  }

  if (section.kind === "integrations" && aiContent?.integrations?.length) {
    return {
      ...section,
      items: aiContent.integrations,
    };
  }

  return section;
};

// ============================================
// NOUVELLES STRUCTURES DE PAGES
// ============================================

// HOME
const HOME_KINDS: SectionKind[] = [
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

// ABOUT - sans FAQ, avec Story, Values, Team
const ABOUT_KINDS: SectionKind[] = [
  "navbar",
  "mission",
  "story",
  "values",
  "team",
  "stats",
  "testimonial",
  "footer"
];

// SERVICES - sans Testimonial
const SERVICES_KINDS: SectionKind[] = [
  "navbar",
  "hero",
  "services",
  "features",
  "stats",
  "cta",
  "faq",
  "footer"
];

// SOLUTIONS - sans Testimonial ni FAQ
const SOLUTIONS_KINDS: SectionKind[] = [
  "navbar",
  "hero",
  "services",
  "features",
  "stats",
  "cta",
  "footer"
];

// CONTACT - sans Hero ni CTA, avec Map et FAQ
const CONTACT_KINDS: SectionKind[] = [
  "navbar",
  "faq",
  "footer"
];

// PRICING - spécifique
const PRICING_KINDS: SectionKind[] = [
  "navbar",
  "hero",
  "pricing",
  "features",
  "faq",
  "cta",
  "footer"
];

// RESERVATION
const RESERVATION_KINDS: SectionKind[] = [
  "navbar",
  "hero",
  "reservation",
  "faq",
  "footer"
];

// INTEGRATIONS
const INTEGRATIONS_KINDS: SectionKind[] = [
  "navbar",
  "hero",
  "integrations",
  "features",
  "cta",
  "footer"
];

// ============================================
// GENERATEURS DE PAGES
// ============================================

const generateSpecializedBlocks = (
  category: string,
  aiContent: any,
  heroImageUrl: string | undefined,
  navigationItems: Array<{ label: string; href: string }>,
  overrides: Partial<Record<SectionKind, Partial<SectionConfig>>>,
  kinds: SectionKind[]
): PageBlock[] => {
  const template =
    CATEGORY_TEMPLATES[category] ??
    CATEGORY_TEMPLATES["Corporate"];

  const fallbackSections: SectionConfig[] = [
    {
      kind: "story",
      title: "Our Story",
      text: "We started with a clear mission: deliver better experiences, stronger results, and long-term value."
    },
    {
      kind: "values",
      title: "Our Values",
      text: "The principles that guide our work.",
      items: [
        "Quality|We focus on reliable outcomes.|⭐",
        "Trust|We build long-term relationships.|🤝",
        "Innovation|We improve continuously.|🚀"
      ]
    },
    {
      kind: "team",
      title: "Meet Our Team",
      text: "The people behind our work.",
      items: [
        "Sarah Ali|Founder|Leads vision and strategy.",
        "Omar Ben|Operations Lead|Ensures smooth delivery.",
        "Maya Trabelsi|Customer Success|Supports clients daily."
      ]
    },
    {
      kind: "reservation",
      title: "Make a Reservation",
      text: "Choose your date, time, and number of guests."
    },
    {
      kind: "pricing",
      title: "Choose Your Plan",
      text: "Clear options for different needs.",
      items: [
        "Starter|$29/mo|Core features, Basic support, 5 users|Get Started",
        "Growth|$79/mo|Advanced workflows, Priority support, 20 users|Start Free Trial",
        "Scale|$199/mo|Enterprise controls, Dedicated support, Unlimited users|Contact Sales"
      ]
    },
    {
      kind: "integrations",
      title: "Popular Integrations",
      text: "Connect the tools your team already uses.",
      items: [
        "CRM|Keep customer data synchronized.|📊",
        "Analytics|Send trusted data to reports.|📈",
        "Collaboration|Turn events into team actions.|💬",
        "Developer API|Build custom connections.|🔌"
      ]
    },
  ];

  const mergedSections = [
    ...template.sections,
    ...fallbackSections.filter(
      (fallback) =>
        !template.sections.some(
          (section) => section.kind === fallback.kind
        )
    )
  ];
return kinds
  .map((kind) =>
    mergedSections.find((section) => section.kind === kind)
  )
  .filter((section): section is SectionConfig => Boolean(section))
    .map((section) =>
      enrichSection(section, aiContent, heroImageUrl, navigationItems)
    )
    .map((section) => ({
      ...section,
      ...(overrides[section.kind] || {})
    }))
    .map((section) => buildSectionFromConfig(section));
};

export const generateHomeBlocks = (
  category: string,
  aiContent: any,
  heroImageUrl?: string,
  navigationItems: Array<{ label: string; href: string }> = []
): PageBlock[] => {
  const template = CATEGORY_TEMPLATES[category] ?? CATEGORY_TEMPLATES["Corporate"];

  return template.sections
    .filter((section) => HOME_KINDS.includes(section.kind))
    .map((section) => enrichSection(section, aiContent, heroImageUrl, navigationItems))
    .map((section) => buildSectionFromConfig(section));
};

export const generateAboutBlocks = (
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
        title: aiContent?.heroTitle || "About Us",
        text: aiContent?.heroText || "Learn more about our story and values."
      }
    },
    ABOUT_KINDS
  );

export const generateServicesBlocks = (
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
        title: aiContent?.heroTitle || "Our Services",
        text: aiContent?.heroText || "Explore our comprehensive service offerings."
      }
    },
    SERVICES_KINDS
  );

export const generateContactBlocks = (
  category: string,
  aiContent: any,
  heroImageUrl?: string,
  navigationItems: Array<{ label: string; href: string }> = []
): PageBlock[] => {
  const template =
    CATEGORY_TEMPLATES[category] ??
    CATEGORY_TEMPLATES["Corporate"];

  const getSection = (kind: SectionKind): SectionConfig | undefined => {
    return template.sections.find((item) => item.kind === kind);
  };

  const buildTemplateSection = (kind: SectionKind): PageBlock | undefined => {
    const section = getSection(kind);

    return section
      ? buildSectionFromConfig(
          enrichSection(section, aiContent, heroImageUrl, navigationItems)
        )
      : undefined;
  };

  const navbar = buildTemplateSection("navbar");
  const footer = buildTemplateSection("footer");
  
  // FAQ من التمبليت مع enrich
  const faqSection = getSection("faq");
  const faq = faqSection
    ? buildSectionFromConfig(
        enrichSection(faqSection, aiContent, heroImageUrl, navigationItems)
      )
    : undefined;

  // نرجعوهم بالترتيب الصحيح
  const blocks: PageBlock[] = [];

  if (navbar) blocks.push(navbar);
  
  // Contact Layout مباشرة
  blocks.push(buildContactLayout());
  
  // FAQ بعد Contact Layout
  if (faq) blocks.push(faq);
  
  // Footer في آخر
  if (footer) blocks.push(footer);

  return blocks;
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
        title: aiContent?.heroTitle || `${aiContent?.title || category} Solutions`,
        text: aiContent?.heroText || "Explore practical solutions designed around your workflows, customers, and growth goals."
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
    SOLUTIONS_KINDS
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
        title: aiContent?.heroTitle || "Simple, Scalable Pricing",
        text: aiContent?.heroText || "Start with the plan that fits today and upgrade as your needs grow."
      },
      pricing: {
        title: "Choose Your Plan",
        text: "Clear options for teams at every stage.",
        items: aiContent?.pricing || [
          "Starter|$29/mo|Core features, Basic support, 5 users|Get Started",
          "Growth|$79/mo|Advanced workflows, Priority support, 20 users|Start Free Trial",
          "Scale|$199/mo|Enterprise controls, Dedicated support, Unlimited users|Contact Sales"
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
    PRICING_KINDS
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
        title: aiContent?.heroTitle || "Connect Your Essential Tools",
        text: aiContent?.heroText || "Bring your existing stack together with secure, flexible integrations."
      },
      integrations: {
        title: "Popular Integrations",
        text: "Connect the systems your team already relies on.",
        items: aiContent?.integrations || [
          "CRM|Keep customer data synchronized|📊",
          "Analytics|Send trusted product data to your reporting tools|📈",
          "Collaboration|Turn events into notifications and team actions|💬",
          "Developer API|Build custom connections with documented APIs|🔌"
        ]
      },
      features: {
        title: "Built to Connect",
        text: "Reliable synchronization, secure access, and developer-friendly extensibility."
      },
      cta: {
        title: "Don't See Your Tool?",
        text: "Ask about a custom integration for your stack."
      }
    },
    INTEGRATIONS_KINDS
  );

export const generateReservationBlocks = (
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
        title: aiContent?.heroTitle || "Book Your Experience",
        text: aiContent?.heroText || "Secure your spot with our easy reservation system."
      },
      reservation: {
        title: "Make a Reservation",
        text: "Fill in the details below to secure your spot."
      }
    },
    RESERVATION_KINDS
  );

// ============================================
// GENERATEUR PRINCIPAL
// ============================================

export function generatePageBlocksByType(
  pageType: string,
  category: string,
  aiContent: any,
  heroImageUrl?: string,
  navigationItems: Array<{ label: string; href: string }> = [],
  pageTitle?: string,
  generatedBlocks: PageBlock[] = []
): PageBlock[] {
  let blocks: PageBlock[];

  switch (pageType) {
    case "home":
      blocks =
        generateHomeBlocks(
          category,
          aiContent,
          heroImageUrl,
          navigationItems
        );
      break;

    case "about":
      blocks =
        generateAboutBlocks(
          category,
          aiContent,
          heroImageUrl,
          navigationItems
        );
      break;

    case "services":
      blocks =
        generateServicesBlocks(
          category,
          aiContent,
          heroImageUrl,
          navigationItems
        );
      break;

    case "contact":
      blocks =
        generateContactBlocks(
          category,
          aiContent,
          heroImageUrl,
          navigationItems
        );
      break;

    case "solutions":
      blocks =
        generateSolutionsBlocks(
          category,
          aiContent,
          heroImageUrl,
          navigationItems
        );
      break;

    case "pricing":
      blocks =
        generatePricingBlocks(
          category,
          aiContent,
          heroImageUrl,
          navigationItems
        );
      break;

    case "integrations":
      blocks =
        generateIntegrationsBlocks(
          category,
          aiContent,
          heroImageUrl,
          navigationItems
        );
      break;

    case "reservation":
    case "reservations":
    case "appointments":
      blocks =
        generateReservationBlocks(
          category,
          aiContent,
          heroImageUrl,
          navigationItems
        );
      break;

    default:
      blocks =
        generateSpecializedBlocks(
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
          [
            "navbar",
            "hero",
            "features",
            "cta",
            "faq",
            "footer"
          ]
        );
      break;
  }

  const designSystem =
    generateDesignSystem(
      category
    );

  return applyDesignSystemToBlocks(
    blocks,
    designSystem
  );
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
  buildFAQ,
  buildTeam,
  buildValues,
  buildStory,
  buildPricing,
  buildReservation,
  buildIntegrations,
  buildTimeline,
  featureCard,
  enrichSection,
  HOME_KINDS,
  ABOUT_KINDS,
  SERVICES_KINDS,
  SOLUTIONS_KINDS,
  CONTACT_KINDS,
  PRICING_KINDS,
  RESERVATION_KINDS,
  INTEGRATIONS_KINDS,
};
