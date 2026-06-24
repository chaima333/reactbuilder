// aiAssistant/heroPresets.ts

export interface HeroStyle {
  background: string;
  color: string;
  titleSize: string;
  boxShadow: string;
}

export const getHeroStyleForCategory = (category: string): HeroStyle => {
  const key = category?.toLowerCase?.() || "technology";

  const styles: Record<string, HeroStyle> = {
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

  return styles[key] || styles.technology;
};

export const getHeroTitleForCategory = (category: string): string => {
  const key = category?.toLowerCase?.() || "technology";

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

  return titles[key] || "Transform Your Business with Our Solutions";
};

export const getHeroTextForCategory = (category: string): string => {
  const key = category?.toLowerCase?.() || "technology";

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

  return texts[key] || "Professional solutions designed for your success.";
};

export const getHeroButtonForCategory = (category: string): string => {
  const key = category?.toLowerCase?.() || "technology";

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

  return buttons[key] || "Get Started";
};