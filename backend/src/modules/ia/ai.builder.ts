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
    props: { text },
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
    props: { text },
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

// ============================================
// FEATURE CARD HELPER
// ============================================

const featureCard = (text: string): PageBlock => ({
  id: makeId("feature"),
  type: "text",
  data: {
    props: { text },
    style: responsiveStyle({
      padding: "24px",
      border: "1px solid #e5e7eb",
      borderRadius: "12px",
      backgroundColor: "#ffffff",
      textAlign: "center",
      fontSize: "16px",
      fontWeight: "500",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
    })
  },
  children: []
});

// ============================================
// SECTION BUILDERS (KIND B KIND)
// ============================================

const buildHero = (config: SectionConfig): PageBlock => {
  const bgColor = config.style?.backgroundColor || "#ffffff";
  const color = config.style?.color || "#0f172a";
  const titleSize = config.style?.titleSize || "56px";

  return sectionBlock(
    [
      titleBlock(config.title, {
        fontSize: titleSize,
        color
      }),
      textBlock(config.text, {
        color
      }),
      ...(config.cta ? [buttonBlock(config.cta)] : [])
    ],
    {
      backgroundColor: bgColor,
      color,
      padding: "120px 40px",
      minHeight: "60vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center"
    }
  );
};

const buildMission = (config: SectionConfig): PageBlock => {
  return sectionBlock(
    [
      titleBlock(config.title, {
        fontSize: "38px",
        marginBottom: "24px"
      }),
      textBlock(config.text, {
        fontSize: "20px",
        maxWidth: "800px",
        margin: "0 auto"
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
  
  // Najem naamel grid 2x2 wala 3x1
  const featureBlocks: PageBlock[] = items.map((item, index) => {
    const block = featureCard(item);
    // Nzid style mte3 grid
    block.data.style = responsiveStyle({
      ...block.data.style.desktop,
      gridColumn: index % 2 === 0 ? "1" : "2",
      marginBottom: "16px"
    });
    return block;
  });

  // N7ot l features f container wahid
  const featuresContainer: PageBlock = {
    id: makeId("features-grid"),
    type: "flex",
    data: {
      props: {},
      style: responsiveStyle({
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "24px",
        maxWidth: "900px",
        margin: "0 auto",
        padding: "20px"
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

const buildServices = (config: SectionConfig): PageBlock => {
  const items = config.items || [];
  
  const serviceBlocks: PageBlock[] = items.map((item) => ({
    id: makeId("service"),
    type: "text",
    data: {
      props: { text: item },
      style: responsiveStyle({
        padding: "20px",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        backgroundColor: "#f9fafb",
        textAlign: "center",
        fontSize: "16px",
        fontWeight: "500",
        transition: "all 0.3s ease"
      })
    },
    children: []
  }));

  const servicesContainer: PageBlock = {
    id: makeId("services-grid"),
    type: "flex",
    data: {
      props: {},
      style: responsiveStyle({
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: "20px",
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
      minHeight: "40vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center"
    }
  );
};

const buildFooter = (config: SectionConfig): PageBlock => {
  return sectionBlock(
    [
      textBlock(config.text, {
        fontSize: "14px",
        color: "#94a3b8",
        textAlign: "center"
      })
    ],
    {
      backgroundColor: config.style?.backgroundColor || "#0f172a",
      padding: "40px 20px",
      borderTop: "1px solid #1e293b"
    }
  );
};

// ============================================
// MAIN BUILDER (SWITCH B KIND)
// ============================================

export function buildSectionFromConfig(
  config: SectionConfig
): PageBlock {
  switch (config.kind) {
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
    case "cta":
      return buildCTA(config);
    case "footer":
      return buildFooter(config);
    default:
      return buildMission(config);
  }
}

// ============================================
// BUILD FULL PAGE
// ============================================

export function buildPageFromTemplate(
  template: TemplateConfig,
  prompt: string,
  title?: string
): PageBlock[] {
  const pageTitle = title || template.defaultTitle;
  
  // Nbadloulha title mte3 hero section ken mafihach
  const sections = template.sections.map((section, index) => {
    // Ki tkoun hero w title fargh, n7otou pageTitle
    if (section.kind === "hero" && !section.title) {
      return {
        ...section,
        title: pageTitle,
        text: section.text || prompt
      };
    }
    return section;
  });

  return sections.map((section) => buildSectionFromConfig(section));
}


export function generateTemplate(
  category: string,
  prompt: string,
  title?: string
): GeneratedPage {
  const template =
    CATEGORY_TEMPLATES[category] ?? CATEGORY_TEMPLATES["Corporate"];

  const blocks = buildPageFromTemplate(template, prompt, title);

  return {
    title: title ?? template.defaultTitle,
    blocks
  };
}

// ============================================
// EXPORTS
// ============================================

export {
  buildHero,
  buildMission,
  buildFeatures,
  buildServices,
  buildTestimonial,
  buildCTA,
  buildFooter,
  featureCard
};