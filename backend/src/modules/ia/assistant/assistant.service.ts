// assistant.service.ts

export type AssistantSuggestion = {
  id: string;
  title: string;
  description: string;
  action: "IMPROVE_HERO" | "ADD_SERVICES" | "ADD_FAQ" | "ADD_CTA" | "ADD_TESTIMONIALS" | "ADD_PRICING";
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

/**
 * Extract category from prompt
 */
const extractCategory = (prompt: string): string => {
  const text = prompt.toLowerCase();
  
  const categories = [
    "restaurant", "cybersecurity", "finance", "education", "medical",
    "ecommerce", "agency", "portfolio", "consulting", "realestate",
    "event", "construction", "travel", "blog", "technology"
  ];
  
  for (const cat of categories) {
    if (text.includes(cat)) {
      return cat;
    }
  }
  
  return "general";
};

/**
 * Generate hero styles based on category
 */
const getHeroStyleForCategory = (category: string): {
  background: string;
  color: string;
  titleSize: string;
  boxShadow: string;
} => {
  const styles: Record<string, any> = {
    cybersecurity: {
      background: "linear-gradient(135deg, #020617 0%, #0f172a 55%, #0e7490 100%)",
      color: "#ffffff",
      titleSize: "56px",
      boxShadow: "0 24px 60px rgba(15, 23, 42, 0.35)"
    },
    restaurant: {
      background: "linear-gradient(135deg, #1a1a2e 0%, #2d1b3d 55%, #e94560 100%)",
      color: "#f8f9fa",
      titleSize: "54px",
      boxShadow: "0 24px 60px rgba(233, 69, 96, 0.25)"
    },
    finance: {
      background: "linear-gradient(135deg, #020b18 0%, #0f172a 55%, #d4af37 100%)",
      color: "#ffffff",
      titleSize: "56px",
      boxShadow: "0 24px 60px rgba(212, 175, 55, 0.25)"
    },
    education: {
      background: "linear-gradient(135deg, #f0fdf4 0%, #d1fae5 55%, #064e3b 100%)",
      color: "#064e3b",
      titleSize: "54px",
      boxShadow: "0 24px 60px rgba(6, 78, 59, 0.20)"
    },
    medical: {
      background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 55%, #0ea5e9 100%)",
      color: "#0f172a",
      titleSize: "54px",
      boxShadow: "0 24px 60px rgba(14, 165, 233, 0.25)"
    },
    ecommerce: {
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #f59e0b 100%)",
      color: "#ffffff",
      titleSize: "54px",
      boxShadow: "0 24px 60px rgba(245, 158, 11, 0.25)"
    },
    agency: {
      background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 55%, #8b5cf6 100%)",
      color: "#ffffff",
      titleSize: "56px",
      boxShadow: "0 24px 60px rgba(139, 92, 246, 0.30)"
    },
    portfolio: {
      background: "linear-gradient(135deg, #fefce8 0%, #fde68a 55%, #d97706 100%)",
      color: "#0f172a",
      titleSize: "56px",
      boxShadow: "0 24px 60px rgba(217, 119, 6, 0.20)"
    },
    realestate: {
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #22d3ee 100%)",
      color: "#ffffff",
      titleSize: "56px",
      boxShadow: "0 24px 60px rgba(34, 211, 238, 0.25)"
    },
    consulting: {
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #3b82f6 100%)",
      color: "#ffffff",
      titleSize: "52px",
      boxShadow: "0 24px 60px rgba(59, 130, 246, 0.25)"
    },
    event: {
      background: "linear-gradient(135deg, #1a1a2e 0%, #2d1b3d 55%, #ec4899 100%)",
      color: "#f8f9fa",
      titleSize: "52px",
      boxShadow: "0 24px 60px rgba(236, 72, 153, 0.25)"
    },
    construction: {
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #f59e0b 100%)",
      color: "#ffffff",
      titleSize: "52px",
      boxShadow: "0 24px 60px rgba(245, 158, 11, 0.25)"
    },
    travel: {
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #06b6d4 100%)",
      color: "#ffffff",
      titleSize: "52px",
      boxShadow: "0 24px 60px rgba(6, 182, 212, 0.25)"
    },
    blog: {
      background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 55%, #64748b 100%)",
      color: "#0f172a",
      titleSize: "52px",
      boxShadow: "0 24px 60px rgba(100, 116, 139, 0.20)"
    },
    technology: {
      background: "linear-gradient(135deg, #020617 0%, #0f172a 55%, #3b82f6 100%)",
      color: "#ffffff",
      titleSize: "56px",
      boxShadow: "0 24px 60px rgba(59, 130, 246, 0.30)"
    }
  };

  return styles[category] || styles.technology;
};

/**
 * Generate hero title based on category
 */
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
    technology: "Innovating the Future with Technology"
  };

  return titles[category] || "Transform Your Business with Our Solutions";
};

/**
 * Generate hero text based on category
 */
const getHeroTextForCategory = (category: string): string => {
  const texts: Record<string, string> = {
    cybersecurity: "AI-powered threat detection, hands-on labs, and expert training to protect your digital assets.",
    restaurant: "Experience the finest cuisine crafted with passion and the freshest ingredients.",
    finance: "Strategic advisory, investment planning, and wealth management for ambitious organizations.",
    education: "Expert-led courses, interactive learning, and industry-recognized certifications.",
    medical: "Online appointments, telemedicine, and secure patient management for modern healthcare.",
    ecommerce: "Discover premium products with fast shipping, secure checkout, and 24/7 support.",
    agency: "Full-service creative agency delivering branding, design, and marketing solutions.",
    portfolio: "A showcase of creative projects that push boundaries and inspire innovation.",
    realestate: "Premium properties, market insights, and expert guidance for your real estate journey.",
    consulting: "Expert advice and strategic planning to achieve your business goals.",
    event: "Professional event planning and management for unforgettable experiences.",
    construction: "Quality construction services from residential to commercial projects.",
    travel: "Curated travel experiences, insider tips, and expert guidance for your next adventure.",
    blog: "A platform for writers and readers to share ideas, insights, and inspiration.",
    technology: "Next-generation solutions in AI, cloud, and software development."
  };

  return texts[category] || "Professional solutions designed for your success.";
};

/**
 * Generate hero button text based on category
 */
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
    technology: "See Our Work"
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

const analyzePageBlocks = (blocks: any[] = []) => {
  const flat = flattenBlocks(blocks);
  const text = flat.map(getBlockText).join(" ");

  const hasHero = text.includes("hero");
  const hasServices =
    text.includes("services") ||
    text.includes("service-title") ||
    text.includes("services-grid");

  const hasFAQ =
    text.includes("faq") ||
    text.includes("faq-container") ||
    text.includes("faq-question");

  const hasCTA =
    text.includes("cta") ||
    text.includes("request") ||
    text.includes("start") ||
    text.includes("contact");

  const hasPricing =
    text.includes("pricing") ||
    text.includes("price") ||
    text.includes("plan");

  const hasTestimonials =
    text.includes("testimonial") ||
    text.includes("review") ||
    text.includes("client");

  let score = 20;
  if (hasHero) score += 20;
  if (hasServices) score += 15;
  if (hasFAQ) score += 15;
  if (hasCTA) score += 15;
  if (hasTestimonials) score += 10;
  if (hasPricing) score += 5;

  return {
    blockCount: flat.length,
    hasHero,
    hasServices,
    hasFAQ,
    hasCTA,
    hasPricing,
    hasTestimonials,
    score: Math.min(score, 100),
  };
};
/**
 * Main assistant function
 */
export const askAssistant = async (
  input: AssistantInput
): Promise<AssistantResponse> => {
  const { prompt, blocks = [], pageTitle } = input;

  const text = prompt.toLowerCase();
  const analysis = analyzePageBlocks(blocks);
  const category = extractCategory(text);
  
  const suggestions: AssistantSuggestion[] = [];

  if (!analysis.hasFAQ) {
  suggestions.push({
    id: "missing-faq",
    title: " Add FAQ Section",
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
    title: " Add Services Section",
    description: "Your page should explain the main services clearly.",
    action: "ADD_SERVICES",
  });
}

  // ===== HERO IMPROVEMENT =====
  if (text.includes("improve") || text.includes("hero") || text.includes("design") || suggestions.length === 0) {
    const heroStyle = getHeroStyleForCategory(category);
    const heroTitle = getHeroTitleForCategory(category);
    const heroText = getHeroTextForCategory(category);
    const heroButton = getHeroButtonForCategory(category);
    
    suggestions.push({
      id: `${category}-hero-improve`,
      title: " Improve Hero Section",
      description: `Apply a professional ${category} style with a compelling headline.`,
      action: "IMPROVE_HERO",
      payload: {
        style: heroStyle,
        title: heroTitle,
        text: heroText,
        button: heroButton
      }
    });
  }

  // ===== SERVICES =====
  if (text.includes("services") || text.includes("offer") || text.includes("provide")) {
    suggestions.push({
      id: `${category}-add-services`,
      title: " Add Services Section",
      description: `Showcase key ${category} services to highlight your expertise.`,
      action: "ADD_SERVICES"
    });
  }

  // ===== FAQ =====
  if (text.includes("faq") || text.includes("question") || text.includes("help")) {
    suggestions.push({
      id: `${category}-add-faq`,
      title: " Add FAQ Section",
      description: "Answer common customer questions and build trust.",
      action: "ADD_FAQ"
    });
  }

  // ===== CTA =====
// ===== CTA =====
if (!analysis.hasCTA) {
  suggestions.push({
    id: `${category}-add-cta`,
    title: "Add Call-to-Action",
    description: "Encourage visitors to take the next step with a clear CTA.",
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

  // ===== TESTIMONIALS =====
  if (text.includes("testimonial") || text.includes("review") || text.includes("social proof")) {
    suggestions.push({
      id: `${category}-add-testimonials`,
      title: " Add Testimonials",
      description: "Build credibility with client reviews and success stories.",
      action: "ADD_TESTIMONIALS"
    });
  }

  // ===== PRICING =====
  if (text.includes("pricing") || text.includes("price") || text.includes("plan") || text.includes("cost")) {
    suggestions.push({
      id: `${category}-add-pricing`,
      title: "💰 Add Pricing Section",
      description: "Show pricing plans to improve conversion.",
      action: "ADD_PRICING"
    });
  }

  // ===== FALLBACK SUGGESTIONS (always include hero if no others) =====
  if (suggestions.length === 1) {
    suggestions.push(
      {
        id: `${category}-services`,
        title: " Add Services Section",
        description: `Showcase your ${category} services and expertise.`,
        action: "ADD_SERVICES"
      },
      {
        id: `${category}-faq`,
        title: " Add FAQ Section",
        description: "Add frequently asked questions to build trust.",
        action: "ADD_FAQ"
      },
    );
  }

  // Generate reply
 const reply = `✅ I analyzed "${pageTitle || "this page"}". Score: ${analysis.score}/100. I found ${suggestions.length} improvements you can apply immediately.`;

return {
  reply,
  category,
  analysis,
  suggestions: suggestions.slice(0, 6),
};
};