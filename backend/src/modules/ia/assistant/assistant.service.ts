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
  prompt: string
) => {
  const lowerPrompt =
    prompt.toLowerCase();

  if (
    lowerPrompt.includes("short") ||
    lowerPrompt.includes("shorter") ||
    lowerPrompt.includes("résumé") ||
    lowerPrompt.includes("court")
  ) {
    return text
      .split(".")[0]
      .slice(0, 90);
  }

  if (
    lowerPrompt.includes("professional") ||
    lowerPrompt.includes("pro") ||
    lowerPrompt.includes("formal")
  ) {
    return `Professional ${text}`
      .replace("Professional Professional", "Professional");
  }

  if (
    lowerPrompt.includes("marketing") ||
    lowerPrompt.includes("attractive")
  ) {
    return `${text} — built to help your business grow with confidence.`;
  }

  if (
    lowerPrompt.includes("french") ||
    lowerPrompt.includes("français") ||
    lowerPrompt.includes("translate to french")
  ) {
    return `Version française: ${text}`;
  }

  if (
    lowerPrompt.includes("arabic") ||
    lowerPrompt.includes("arabe")
  ) {
    return `النسخة العربية: ${text}`;
  }

  return `${text} Improve your message with clearer value and stronger impact.`;
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

  if (
    ["title", "text", "button"].includes(block.type)
  ) {
    const newText =
      improveText(
        currentText,
        prompt
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