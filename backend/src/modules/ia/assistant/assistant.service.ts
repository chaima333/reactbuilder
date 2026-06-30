// assistant.service.ts

import { analyzePage } from "../analyzers/pageAnalyzer";

export type AssistantSuggestion = {
  id: string;
  title: string;
  description: string;
  action:
    | "IMPROVE_HERO"
    | "ADD_SERVICES"
    | "ADD_FAQ"
    | "ADD_CTA"
    | "ADD_TESTIMONIALS"
    | "ADD_PRICING";
  payload?: any;
};

export type AssistantResponse = {
  reply: string;
  category: string;
  analysis?: any;
  suggestions: AssistantSuggestion[];
};

export type AssistantInput = {
  prompt: string;
  blocks?: any[];
  pageTitle?: string;
  slug?: string;
};

const extractCategory = (prompt: string): string => {
  const text = prompt.toLowerCase();

  const categories = [
    "restaurant",
    "cybersecurity",
    "finance",
    "education",
    "medical",
    "ecommerce",
    "agency",
    "portfolio",
    "consulting",
    "realestate",
    "event",
    "construction",
    "travel",
    "blog",
    "technology",
  ];

  for (const cat of categories) {
    if (text.includes(cat)) {
      return cat;
    }
  }

  if (
    text.includes("financial") ||
    text.includes("investment") ||
    text.includes("advisory") ||
    text.includes("capital")
  ) {
    return "finance";
  }

  if (
    text.includes("menu") ||
    text.includes("reservation") ||
    text.includes("dining") ||
    text.includes("chef")
  ) {
    return "restaurant";
  }

  return "general";
};

const getHeroTitleForCategory = (category: string): string => {
  const titles: Record<string, string> = {
    cybersecurity: "Secure Your Future with Advanced Cyber Defense",
    restaurant: "Welcome to an Unforgettable Culinary Journey",
    finance: "Smart Financial Solutions for Modern Businesses",
    education: "Empower Your Learning Journey Today",
    medical: "Modern Healthcare Made Simple",
    ecommerce: "Shop the Latest Collection, Curated for You",
    agency: "We Build Brands That Matter",
    portfolio: "Creative Vision, Bold Execution",
    realestate: "Find Your Dream Property Today",
    consulting: "Strategic Solutions for Business Growth",
    event: "Create Unforgettable Events",
    construction: "Building Dreams, One Project at a Time",
    travel: "Explore the World With Confidence",
    blog: "Stories That Inspire and Inform",
    technology: "Innovating the Future with Technology",
  };

  return titles[category] || "Transform Your Business with Our Solutions";
};

const getHeroTextForCategory = (category: string): string => {
  const texts: Record<string, string> = {
    cybersecurity:
      "AI-powered threat detection, hands-on labs, and expert training to protect your digital assets.",
    restaurant:
      "Experience the finest cuisine crafted with passion and the freshest ingredients.",
    finance:
      "Strategic advisory, investment planning, and wealth management for ambitious organizations.",
    education:
      "Expert-led courses, interactive learning, and industry-recognized certifications.",
    medical:
      "Online appointments, telemedicine, and secure patient management for modern healthcare.",
    ecommerce:
      "Discover premium products with fast shipping, secure checkout, and 24/7 support.",
    agency:
      "Full-service creative agency delivering branding, design, and marketing solutions.",
    portfolio:
      "A showcase of creative projects that push boundaries and inspire innovation.",
    realestate:
      "Premium properties, market insights, and expert guidance for your real estate journey.",
    consulting:
      "Expert advice and strategic planning to achieve your business goals.",
    event:
      "Professional event planning and management for unforgettable experiences.",
    construction:
      "Quality construction services from residential to commercial projects.",
    travel:
      "Curated travel experiences, insider tips, and expert guidance for your next adventure.",
    blog:
      "A platform for writers and readers to share ideas, insights, and inspiration.",
    technology:
      "Next-generation solutions in AI, cloud, and software development.",
  };

  return texts[category] || "Professional solutions designed for your success.";
};

const getHeroButtonForCategory = (category: string): string => {
  const buttons: Record<string, string> = {
    cybersecurity: "Get Started with Security",
    restaurant: "Book a Table",
    finance: "Request Advisory",
    education: "Explore Courses",
    medical: "Book Appointment",
    ecommerce: "Shop Now",
    agency: "Start a Project",
    portfolio: "View Portfolio",
    realestate: "Explore Properties",
    consulting: "Get a Consultation",
    event: "Plan Your Event",
    construction: "Get a Quote",
    travel: "Plan Your Trip",
    blog: "Start Writing",
    technology: "See Our Work",
  };

  return buttons[category] || "Get Started";
};

const flattenBlocks = (blocks: any[] = []): any[] => {
  const result: any[] = [];

  for (const block of blocks) {
    result.push(block);

    if (Array.isArray(block.children)) {
      result.push(...flattenBlocks(block.children));
    }
  }

  return result;
};

const getBlockText = (block: any): string => {
  return [
    block?.id,
    block?.type,
    block?.data?.props?.text,
    block?.data?.props?.content,
    block?.data?.props?.label,
    block?.data?.props?.title,
    block?.data?.meta?.semanticType,
    block?.meta?.semanticType,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
};

export const askAssistant = async (
  input: AssistantInput
): Promise<AssistantResponse> => {
  const { prompt, blocks = [], pageTitle } = input;

  const text = prompt.toLowerCase();

  const pageText = flattenBlocks(blocks)
    .map(getBlockText)
    .join(" ");

  const category = extractCategory(
    [prompt, pageTitle, pageText]
      .filter(Boolean)
      .join(" ")
  );

  const analysis = analyzePage(blocks);

  const suggestions: AssistantSuggestion[] = [];

  if (!analysis.hasFAQ) {
    suggestions.push({
      id: "missing-faq",
      title: "Add FAQ Section",
      description: "Your page is missing a FAQ section.",
      action: "ADD_FAQ",
    });
  }

  if (!analysis.hasCTA) {
    suggestions.push({
      id: "missing-cta",
      title: "Add CTA",
      description: "Your page needs a clear call-to-action.",
      action: "ADD_CTA",
      payload: {
        title: "Ready to grow your business?",
        text: "Contact our team today and take the next step.",
        actions: [
          {
            label: "Contact Us",
            href: "#contact",
          },
        ],
      },
    });
  }

  if (!analysis.hasServices) {
    suggestions.push({
      id: "missing-services",
      title: "Add Services Section",
      description: "Your page should explain the main services clearly.",
      action: "ADD_SERVICES",
    });
  }

  if (!analysis.hasTestimonials) {
    suggestions.push({
      id: "missing-testimonials",
      title: "Add Testimonials",
      description: "Build credibility with client reviews and success stories.",
      action: "ADD_TESTIMONIALS",
    });
  }

  if (analysis.hero.needsImprovement) {
    suggestions.push({
      id: `${category}-hero-improve`,
      title: "Improve Hero Section",
      description: `Improve the hero section because: ${analysis.hero.reasons.join(", ")}`,
      action: "IMPROVE_HERO",
      payload: {
        title: getHeroTitleForCategory(category),
        text: getHeroTextForCategory(category),
        button: getHeroButtonForCategory(category),
      },
    });
  }

  if (
    text.includes("pricing") ||
    text.includes("price") ||
    text.includes("plan") ||
    text.includes("cost")
  ) {
    suggestions.push({
      id: `${category}-add-pricing`,
      title: "Add Pricing Section",
      description: "Show pricing plans to improve conversion.",
      action: "ADD_PRICING",
    });
  }

  const uniqueSuggestions = Array.from(
    new Map(
      suggestions.map((suggestion) => [
        suggestion.action,
        suggestion,
      ])
    ).values()
  );

  const reply =
    `✅ I analyzed "${pageTitle || "this page"}". ` +
    `Score: ${analysis.overallScore}/100. ` +
    `I found ${uniqueSuggestions.length} improvements you can apply immediately.`;

  return {
    reply,
    category,
    analysis,
    suggestions: uniqueSuggestions.slice(0, 6),
  };
};

const getEditableBlockText = (
  block: any
): string => {
  return (
    block?.data?.props?.text ||
    block?.data?.props?.content ||
    block?.data?.props?.label ||
    ""
  );
};

const setBlockText = (
  block: any,
  text: string
) => {
  if (block?.type === "button") {
    return {
      ...block,
      data: {
        ...block.data,
        props: {
          ...block.data?.props,
          label: text
        }
      }
    };
  }

  return {
    ...block,
    data: {
      ...block.data,
      props: {
        ...block.data?.props,
        text,
        content: text
      }
    }
  };
};

const improveText = (
  text: string,
  prompt: string,
  blockType: string
) => {
  const lowerPrompt =
    prompt.toLowerCase();

  const safeText =
    text?.trim() || "Your content";

  if (blockType === "title") {
    if (
      lowerPrompt.includes("professional") ||
      lowerPrompt.includes("pro") ||
      lowerPrompt.includes("formal")
    ) {
      return "Build Smarter Digital Solutions";
    }

    if (
      lowerPrompt.includes("short") ||
      lowerPrompt.includes("shorter") ||
      lowerPrompt.includes("court")
    ) {
      return safeText
        .split(" ")
        .slice(0, 6)
        .join(" ");
    }

    return "Smart Digital Solutions for Growing Teams";
  }

  if (blockType === "button") {
    if (
      lowerPrompt.includes("contact")
    ) {
      return "Contact Us";
    }

    if (
      lowerPrompt.includes("start")
    ) {
      return "Get Started";
    }

    return "Learn More";
  }

  if (blockType === "text") {
    if (
      lowerPrompt.includes("professional") ||
      lowerPrompt.includes("pro") ||
      lowerPrompt.includes("formal")
    ) {
      return "We help organizations grow with smarter automation, reliable cloud infrastructure, and seamless API integrations.";
    }

    if (
      lowerPrompt.includes("short") ||
      lowerPrompt.includes("shorter") ||
      lowerPrompt.includes("court")
    ) {
      return safeText
        .split(".")[0]
        .slice(0, 120);
    }

    if (
      lowerPrompt.includes("marketing") ||
      lowerPrompt.includes("attractive")
    ) {
      return "Transform your workflows with intelligent digital solutions designed to save time, improve performance, and support business growth.";
    }

    if (
      lowerPrompt.includes("french") ||
      lowerPrompt.includes("français")
    ) {
      return "Nous aidons les organisations à automatiser leurs tâches, améliorer leur productivité et développer des solutions numériques intelligentes.";
    }

    return "We help teams create clearer, faster, and more effective digital experiences.";
  }

  return safeText;
};

const isDesignPrompt = (
  prompt: string
) => {
  const text =
    prompt.toLowerCase();

  return (
    text.includes("design") ||
    text.includes("style") ||
    text.includes("modern") ||
    text.includes("premium") ||
    text.includes("dark") ||
    text.includes("clean") ||
    text.includes("spacing") ||
    text.includes("shadow") ||
    text.includes("animation") ||
    text.includes("attractive") ||
    text.includes("beautiful")
  );
};

const improveDesign = (
  block: any,
  prompt: string
) => {
  const text =
    prompt.toLowerCase();

  const desktopStyle =
    block?.data?.style?.desktop || {};

  const tabletStyle =
    block?.data?.style?.tablet || {};

  const mobileStyle =
    block?.data?.style?.mobile || {};

  let desktopPatch: Record<string, any> = {};
  let tabletPatch: Record<string, any> = {};
  let mobilePatch: Record<string, any> = {};

  // BUTTON DESIGN
  if (block?.type === "button") {
    desktopPatch = {
      padding: "14px 34px",
      borderRadius: "999px",
      backgroundColor: "#2563eb",
      color: "#ffffff",
      fontWeight: "800",
      fontSize: "15px",
      border: "none",
      boxShadow: "0 14px 28px rgba(37,99,235,0.28)",
      cursor: "pointer",
      transition: "all 0.25s ease"
    };

    tabletPatch = {
      padding: "12px 28px",
      fontSize: "14px"
    };

    mobilePatch = {
      padding: "11px 24px",
      fontSize: "14px",
      maxWidth: "220px",
      width: "auto"
    };
  }

  // TITLE DESIGN
  else if (block?.type === "title") {
    desktopPatch = {
      fontSize: "52px",
      fontWeight: "900",
      lineHeight: "1.08",
      letterSpacing: "-0.04em",
      color: text.includes("dark")
        ? "#ffffff"
        : "#0f172a",
      marginBottom: "18px"
    };

    tabletPatch = {
      fontSize: "40px",
      lineHeight: "1.12"
    };

    mobilePatch = {
      fontSize: "32px",
      lineHeight: "1.15",
      textAlign: "center"
    };
  }

  // TEXT DESIGN
  else if (block?.type === "text") {
    desktopPatch = {
      fontSize: "18px",
      lineHeight: "1.8",
      color: text.includes("dark")
        ? "#cbd5e1"
        : "#475569",
      maxWidth: "760px"
    };

    tabletPatch = {
      fontSize: "16px"
    };

    mobilePatch = {
      fontSize: "15px",
      textAlign: "center"
    };
  }

  // SECTION / FLEX / CARD DESIGN
  else {
    if (
      text.includes("dark") ||
      text.includes("premium")
    ) {
      desktopPatch = {
        backgroundColor: "#020617",
        color: "#ffffff",
        padding: "96px 48px",
        borderRadius: "28px",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 30px 80px rgba(2,6,23,0.35)",
        boxSizing: "border-box",
        transition: "all 0.3s ease"
      };
    } else if (
      text.includes("clean") ||
      text.includes("minimal")
    ) {
      desktopPatch = {
        backgroundColor: "#f8fafc",
        color: "#0f172a",
        padding: "64px 40px",
        borderRadius: "20px",
        border: "1px solid #e2e8f0",
        boxShadow: "none",
        boxSizing: "border-box"
      };
    } else {
      desktopPatch = {
        backgroundColor: "#ffffff",
        color: "#0f172a",
        padding: "72px 44px",
        borderRadius: "24px",
        border: "1px solid #e5e7eb",
        boxShadow: "0 24px 60px rgba(15,23,42,0.12)",
        boxSizing: "border-box",
        transition: "all 0.3s ease"
      };
    }

    tabletPatch = {
      padding: "56px 32px",
      maxWidth: "100%"
    };

    mobilePatch = {
      padding: "42px 20px",
      maxWidth: "100%",
      borderRadius: "18px"
    };
  }

  return {
    ...block,
    data: {
      ...block.data,
      style: {
        ...block.data?.style,
        desktop: {
          ...desktopStyle,
          ...desktopPatch
        },
        tablet: {
          ...tabletStyle,
          ...tabletPatch
        },
        mobile: {
          ...mobileStyle,
          ...mobilePatch
        }
      }
    }
  };
};


export const editBlockWithAssistant = async ({
  prompt,
  block,
  pageTitle,
  slug
}: {
  prompt: string;
  block: any;
  pageTitle?: string;
  slug?: string;
}) => {
 
  const currentText =
  getEditableBlockText(block);

  let updatedBlock =
    { ...block };
if (isDesignPrompt(prompt)) {
  updatedBlock =
    improveDesign(
      block,
      prompt
    );

  return {
    block: updatedBlock,
    reply: `Selected ${block.type} block design improved successfully.`,
    pageTitle,
    slug
  };
}
  if (
    ["title", "text", "button"].includes(block.type)
  ) {
   const newText =
  improveText(
    currentText,
    prompt,
    block.type
  );

    updatedBlock =
      setBlockText(
        block,
        newText
      );
  } else {
    updatedBlock = {
      ...block,
      data: {
        ...block.data,
        style: {
          ...block.data?.style,
          desktop: {
            ...block.data?.style?.desktop,
            borderRadius: "18px",
            boxShadow:
              "0 12px 30px rgba(15,23,42,0.10)"
          }
        }
      }
    };
  }

  return {
    block: updatedBlock,
    reply: `Selected ${block.type} block updated successfully.`,
    pageTitle,
    slug
  };
};