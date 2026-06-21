// ai.templates.ts

export type SectionKind =
  | "navbar"
  | "hero"
  | "mission"
  | "features"
  | "services"
  | "testimonial"
  | "stats"
  | "cta"
  | "footer";

export interface SectionConfig {
  kind: SectionKind;
  title: string;
  text: string;
  cta?: string;
  ctaHref?: string;
  items?: string[];
  navigationItems?: Array<{
    label: string;
    href: string;
  }>;
  image?: string;
  resolvedImage?: string;
  style?: {
    backgroundColor?: string;
    color?: string;
    titleSize?: string;
  };
}

export interface TemplateConfig {
  defaultTitle: string;
  sections: SectionConfig[];
}

// ==================== CATEGORY TEMPLATES ====================

export const CATEGORY_TEMPLATES: Record<string, TemplateConfig> = {
  // ===== TECHNOLOGY =====
  Technology: {
    defaultTitle: "Technology Company",
    sections: [
      {
        kind: "navbar",
        title: "TechNova",
        text: "",
        cta: "Contact Us",
        items: ["Home", "Solutions", "About", "Resources", "Contact"],
        style: { backgroundColor: "#020617", color: "#ffffff" },
      },
      {
        kind: "hero",
        title: "Innovating the Future",
        text: "Building next-generation solutions in AI, cloud, and software development.",
        cta: "See Our Work",
        image:
          "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop",
        style: { backgroundColor: "#020617", color: "#ffffff", titleSize: "56px" },
      },
      {
        kind: "mission",
        title: "Our Vision",
        text: "To build technology that transforms industries and improves lives.",
      },
      {
        kind: "features",
        title: "Tech Solutions",
        text: "From machine learning to scalable infrastructure, we deliver cutting-edge technology.",
        items: ["Machine Learning", "Cloud Infrastructure", "Software Development", "Data Analytics"],
      },
      {
        kind: "services",
        title: "What We Build",
        text: "We create solutions that are scalable, secure, and built for the future.",
        items: [
          "🤖 AI Platforms|Intelligent solutions for complex problems.",
          "☁️ Cloud Services|Scalable infrastructure and cloud migration.",
          "📱 Custom Software|Tailored solutions for your business needs.",
          "🔧 DevOps Tools|Streamlined development and deployment.",
        ],
      },
      {
        kind: "testimonial",
        title: "Trusted by Innovators",
        text: "We work with companies that are pushing the boundaries of what's possible.",
        items: [
          "★★★★★|TechNova is a true innovation partner.|CTO, AIStart",
          "★★★★★|Their solutions are game-changing.|VP, CloudCo",
          "★★★★★|A team of brilliant engineers.|Founder, DataInsight",
          "★★★★★|Delivered beyond our expectations.|CEO, FinTech",
        ],
      },
      {
        kind: "stats",
        title: "Our Impact",
        text: "Technology that makes a difference.",
        items: ["1000+|Projects Deployed", "500+|Enterprise Clients", "40+|Countries", "99.9%|Uptime"],
      },
      {
        kind: "cta",
        title: "Ready to Innovate?",
        text: "Let's build the future together.",
        cta: "Contact Our Team",
      },
      {
        kind: "footer",
        title: "TechNova",
        text: "Building the future, one solution at a time.",
        items: ["About|Solutions|Resources|Contact", "LinkedIn|Twitter|GitHub|YouTube"],
        style: { backgroundColor: "#020617" },
      },
    ],
  },

  // ===== EDUCATION =====
  Education: {
    defaultTitle: "Education Platform",
    sections: [
      {
        kind: "navbar",
        title: "EduFuture",
        text: "",
        cta: "Get Started",
        items: ["Home", "Courses", "About", "Blog", "Contact"],
        style: { backgroundColor: "#ffffff", color: "#064e3b" },
      },
      {
        kind: "hero",
        title: "Learn, Grow, Succeed",
        text: "Empowering minds through innovative education. Courses, resources, and expert guidance.",
        cta: "Explore Courses",
        image:
          "https://images.unsplash.com/photo-1523050854058-8df90110c7f1?w=600&h=400&fit=crop",
        style: { backgroundColor: "#f0fdf4", color: "#064e3b", titleSize: "54px" },
      },
      {
        kind: "mission",
        title: "Our Mission",
        text: "To make quality education accessible to everyone, everywhere.",
      },
      {
        kind: "features",
        title: "Our Programs",
        text: "From coding to creativity, find the perfect course to accelerate your career.",
        items: ["Coding Bootcamps", "Creative Arts", "Business Skills", "Language Learning"],
      },
      {
        kind: "services",
        title: "Learning Resources",
        text: "We provide everything you need to succeed in your learning journey.",
        items: [
          "🎥 Video Tutorials|Learn at your own pace with expert-led videos.",
          "📝 Interactive Exercises|Practice what you learn with hands-on exercises.",
          "👨‍🏫 Expert Mentors|Get guidance from industry professionals.",
          "💬 Community Forums|Connect with fellow learners worldwide.",
        ],
      },
      {
        kind: "testimonial",
        title: "What Our Students Say",
        text: "Real stories from real learners.",
        items: [
          "★★★★★|EduFuture changed my career trajectory.|Maria G.",
          "★★★★★|The best online learning platform.|James W.",
          "★★★★★|Incredible instructors and community.|Priya S.",
          "★★★★★|I landed my dream job after this course.|Ahmed R.",
        ],
      },
      {
        kind: "stats",
        title: "Our Impact",
        text: "Transforming lives through education.",
        items: ["10K+|Students Enrolled", "500+|Courses Available", "150+|Expert Instructors", "95%|Completion Rate"],
      },
      {
        kind: "cta",
        title: "Start Your Learning Journey",
        text: "Join thousands of students who are changing their lives through education.",
        cta: "Get Started",
      },
      {
        kind: "footer",
        title: "EduFuture",
        text: "Empowering minds, transforming futures.",
        items: ["About|Courses|Blog|Contact", "LinkedIn|Facebook|Twitter|YouTube"],
        style: { backgroundColor: "#064e3b" },
      },
    ],
  },

  // ===== MEDICAL =====
  Medical: {
    defaultTitle: "Medical Appointment Platform",
    sections: [
      {
        kind: "navbar",
        title: "MediCare",
        text: "",
        cta: "Book Appointment",
        items: ["Home", "Doctors", "Services", "Appointments", "Contact"],
        style: { backgroundColor: "#ffffff", color: "#0f172a" },
      },
      {
        kind: "hero",
        title: "Book Trusted Medical Consultations Online",
        text: "A modern healthcare platform for clinics, doctors and patients.",
        cta: "Book Appointment",
        image:
          "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=400&fit=crop",
        style: { backgroundColor: "#f0f9ff", color: "#0f172a", titleSize: "54px" },
      },
      {
        kind: "mission",
        title: "Simplifying Access to Care",
        text: "We help clinics manage appointments, patients and consultations from one digital platform.",
      },
      {
        kind: "features",
        title: "Key Features",
        text: "Everything clinics need to improve patient experience.",
        items: ["Doctor Profiles", "Online Appointments", "Telemedicine", "Patient Records"],
      },
      {
        kind: "services",
        title: "Healthcare Services",
        text: "Digital tools for modern private clinics.",
        items: [
          "📅 Appointment Booking|Allow patients to schedule visits online.",
          "💬 Telemedicine|Video consultations from anywhere.",
          "📁 Patient Records|Secure digital health records.",
          "📊 Clinic Analytics|Data-driven insights for better care.",
        ],
      },
      {
        kind: "testimonial",
        title: "What Our Clients Say",
        text: "Real feedback from healthcare professionals.",
        items: [
          "★★★★★|Excellent platform for managing appointments.|Dr Ahmed",
          "★★★★★|Reduced our admin workload by 50%.|Clinic Plus",
          "★★★★★|Easy to use and professional.|Sarah M.",
          "★★★★★|Patients love the new booking system.|Dr Layla",
        ],
      },
      {
        kind: "stats",
        title: "Our Impact",
        text: "Numbers that speak for themselves.",
        items: ["5000+|Appointments", "120+|Doctors", "25+|Clinics", "98%|Satisfaction"],
      },
      {
        kind: "cta",
        title: "Ready to modernize your clinic?",
        text: "Launch your digital appointment experience today.",
        cta: "Get Started",
      },
      {
        kind: "footer",
        title: "MediCare",
        text: "Building the future of healthcare, one appointment at a time.",
        items: ["About Us|Our Team|Careers|Blog", "LinkedIn|Facebook|Instagram|Twitter"],
        style: { backgroundColor: "#0f172a" },
      },
    ],
  },

  // ===== ECOMMERCE =====
  Ecommerce: {
    defaultTitle: "Online Store",
    sections: [
      {
        kind: "navbar",
        title: "ShopVerse",
        text: "",
        cta: "Shop Now",
        items: ["Home", "Products", "Deals", "About", "Contact"],
        style: { backgroundColor: "#0f172a", color: "#ffffff" },
      },
      {
        kind: "hero",
        title: "Shop the Latest Collection",
        text: "Discover premium products curated just for you. Fast shipping and secure checkout.",
        cta: "Shop Now",
        image:
          "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop",
        style: { backgroundColor: "#0f172a", color: "#ffffff", titleSize: "54px" },
      },
      {
        kind: "mission",
        title: "Our Promise",
        text: "Quality products, exceptional service, and a shopping experience you'll love.",
      },
      {
        kind: "features",
        title: "Featured Products",
        text: "Browse our bestsellers and exclusive deals before they're gone.",
        items: ["Bestsellers", "Exclusive Deals", "New Arrivals", "Limited Editions"],
      },
      {
        kind: "services",
        title: "Why Shop With Us",
        text: "We make online shopping easy, secure, and enjoyable.",
        items: [
          "🚚 Fast Shipping|Free delivery on all orders over $50.",
          "🔒 Secure Checkout|Your data is safe with us.",
          "🔄 Easy Returns|Hassle-free returns within 30 days.",
          "💬 24/7 Support|We're here to help anytime.",
        ],
      },
      {
        kind: "testimonial",
        title: "What Our Customers Say",
        text: "Join thousands of satisfied customers who love our products.",
        items: [
          "★★★★★|Amazing quality and fast shipping.|Alex K.",
          "★★★★★|My go-to online store for everything.|Jamie L.",
          "★★★★★|Excellent customer service.|Taylor M.",
          "★★★★★|The best shopping experience online.|Sofia W.",
        ],
      },
      {
        kind: "stats",
        title: "ShopVerse by the Numbers",
        text: "Trusted by customers worldwide.",
        items: ["100K+|Happy Customers", "50K+|Products Sold", "30+|Countries", "4.9★|Average Rating"],
      },
      {
        kind: "cta",
        title: "Ready to Upgrade Your Style?",
        text: "Explore our collection and find your perfect match.",
        cta: "View All Products",
      },
      {
        kind: "footer",
        title: "ShopVerse",
        text: "Your one-stop shop for everything premium.",
        items: ["About|Products|Deals|Contact", "Instagram|Facebook|Twitter|YouTube"],
        style: { backgroundColor: "#0f172a" },
      },
    ],
  },

  // ===== FINANCE =====
  Finance: {
    defaultTitle: "Finance Advisory",
    sections: [
      {
        kind: "navbar",
        title: "FinCapital",
        text: "",
        cta: "Request Advisory",
        items: ["Home", "Services", "About", "Contact"],
        style: { backgroundColor: "#020b18", color: "#ffffff" },
      },
      {
        kind: "hero",
        title: "Finance the Visionary. Build the Future.",
        text: "A strategic finance and technology advisory platform helping institutions, investors and governments structure ambitious projects.",
        cta: "Request Advisory",
        image:
          "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=400&fit=crop",
        style: { backgroundColor: "#020b18", color: "#ffffff", titleSize: "56px" },
      },
      {
        kind: "mission",
        title: "Strategic Services",
        text: "Project financing, digital finance, AI transformation and advisory services designed for ambitious organizations.",
      },
      {
        kind: "features",
        title: "Key Capabilities",
        text: "We deliver financial solutions that drive growth.",
        items: ["Project Financing", "Digital Finance", "AI Transformation", "Advisory Services"],
      },
      {
        kind: "services",
        title: "Financial Solutions",
        text: "Expert services tailored to your business needs.",
        items: [
          "💰 Investment Banking|Strategic capital raising and M&A advisory.",
          "📊 Risk Management|Comprehensive risk assessment and mitigation.",
          "📈 Portfolio Optimization|Data-driven investment strategies.",
          "🏦 Wealth Management|Personalized wealth planning and advisory.",
        ],
      },
      {
        kind: "testimonial",
        title: "What Our Clients Say",
        text: "Trusted by leading organizations worldwide.",
        items: [
          "★★★★★|FinCapital transformed our investment strategy.|CEO, TechCorp",
          "★★★★★|Exceptional financial advisory services.|CFO, GlobalFund",
          "★★★★★|Their expertise is unmatched in the industry.|Partner, VentureX",
          "★★★★★|A game-changer for our portfolio management.|Director, AssetCo",
        ],
      },
      {
        kind: "stats",
        title: "Our Numbers",
        text: "Delivering results that matter.",
        items: ["$50B+|Assets Under Advisory", "500+|Clients Served", "40+|Countries", "99%|Client Satisfaction"],
      },
      {
        kind: "cta",
        title: "Ready to transform your financial strategy?",
        text: "Let's build the future together.",
        cta: "Contact Us",
      },
      {
        kind: "footer",
        title: "FinCapital",
        text: "Building financial futures with integrity and vision.",
        items: ["About|Team|Careers|Blog", "LinkedIn|Twitter|YouTube|Instagram"],
        style: { backgroundColor: "#020b18" },
      },
    ],
  },

  // ===== AGENCY =====
  Agency: {
    defaultTitle: "Agency Website",
    sections: [
      {
        kind: "navbar",
        title: "AgencyX",
        text: "",
        cta: "Start a Project",
        items: ["Home", "Services", "Work", "About", "Contact"],
        style: { backgroundColor: "#1e1b4b", color: "#ffffff" },
      },
      {
        kind: "hero",
        title: "We Build Brands That Matter",
        text: "A full-service creative agency crafting digital experiences, strategies, and campaigns.",
        cta: "Start a Project",
        image:
          "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=400&fit=crop",
        style: { backgroundColor: "#1e1b4b", color: "#ffffff", titleSize: "56px" },
      },
      {
        kind: "mission",
        title: "Our Mission",
        text: "To help brands tell their story and connect with audiences in meaningful ways.",
      },
      {
        kind: "features",
        title: "Our Services",
        text: "Branding, web design, marketing, and content creation tailored to your goals.",
        items: ["Branding", "Web Design", "Marketing", "Content Creation"],
      },
      {
        kind: "services",
        title: "How We Work",
        text: "We combine creativity with strategy to deliver results that matter.",
        items: [
          "🔍 Discovery|Understanding your goals and audience.",
          "📐 Strategy|Data-driven planning for success.",
          "🎨 Design|Creative solutions that stand out.",
          "🚀 Launch|Execution and ongoing optimization.",
        ],
      },
      {
        kind: "testimonial",
        title: "Client Success Stories",
        text: "We've helped hundreds of brands achieve their goals.",
        items: [
          "★★★★★|AgencyX transformed our brand.|CEO, TechStart",
          "★★★★★|Incredible results and creative thinking.|CMO, RetailCo",
          "★★★★★|The best agency we've ever worked with.|Founder, HealthPlus",
          "★★★★★|Our brand identity has never been stronger.|Director, EduOrg",
        ],
      },
      {
        kind: "stats",
        title: "Our Impact",
        text: "Delivering results that speak for themselves.",
        items: ["200+|Clients Served", "500+|Projects Completed", "30+|Countries", "98%|Client Retention"],
      },
      {
        kind: "cta",
        title: "Ready to Build Your Brand?",
        text: "Let's collaborate and create something extraordinary.",
        cta: "Contact Us",
      },
      {
        kind: "footer",
        title: "AgencyX",
        text: "Building brands that matter, together.",
        items: ["About|Services|Work|Contact", "LinkedIn|Instagram|Twitter|YouTube"],
        style: { backgroundColor: "#1e1b4b" },
      },
    ],
  },
//=====================Immobilier=================================
  RealEstate: {
  defaultTitle: "Real Estate Platform",
  sections: [
    {
      kind: "navbar",
      title: "HomeHaven",
      text: "",
      cta: "Browse Properties",
      items: ["Home", "Properties", "Services", "About", "Contact"],
      style: {
        backgroundColor: "#0f172a",
        color: "#ffffff"
      }
    },
    {
      kind: "hero",
      title: "Find Your Dream Property Today",
      text: "Premium real estate solutions for buyers, investors and property owners.",
      cta: "Explore Properties",
      image:
        "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop",
      style: {
        backgroundColor: "#0f172a",
        color: "#ffffff",
        titleSize: "56px"
      }
    },
    {
      kind: "mission",
      title: "Our Mission",
      text: "Helping clients discover, invest and grow through premium real estate opportunities."
    },
    {
      kind: "features",
      title: "Property Solutions",
      text: "Everything you need for successful property investments.",
      items: [
        "Property Listings",
        "Property Valuation",
        "Investment Advisory",
        "Rental Management"
      ]
    },
    {
      kind: "services",
      title: "Real Estate Services",
      text: "Comprehensive services for buyers, sellers and investors.",
      items: [
        "🏠 Property Listings|Browse premium residential and commercial properties.",
        "📈 Investment Advisory|Identify profitable real estate opportunities.",
        "📊 Property Valuation|Accurate market-based property assessments.",
        "🔑 Rental Management|Professional management for rental properties."
      ]
    },
    {
      kind: "testimonial",
      title: "What Clients Say",
      text: "Trusted by buyers and investors.",
      items: [
        "★★★★★|Found our dream home quickly.|Home Buyer",
        "★★★★★|Professional and transparent process.|Investor",
        "★★★★★|Outstanding support from start to finish.|Property Owner",
        "★★★★★|Highly recommended real estate experts.|Client"
      ]
    },
    {
      kind: "stats",
      title: "Our Impact",
      text: "Real estate results that matter.",
      items: [
        "1000+|Properties",
        "500+|Happy Clients",
        "150M+|Property Value",
        "98%|Satisfaction"
      ]
    },
    {
      kind: "cta",
      title: "Ready To Find Your Next Property?",
      text: "Start your real estate journey today.",
      cta: "Contact Us"
    },
    {
      kind: "footer",
      title: "HomeHaven",
      text: "Premium real estate solutions.",
      items: [
        "About|Properties|Services|Contact",
        "LinkedIn|Facebook|Instagram|YouTube"
      ],
      style: {
        backgroundColor: "#0f172a"
      }
    }
  ]
},

  // ===== RESTAURANT =====
  Restaurant: {
    defaultTitle: "Restaurant Website",
    sections: [
      {
        kind: "navbar",
        title: "Gourmet",
        text: "",
        cta: "Book a Table",
        items: ["Home", "Menu", "Reservations", "Gallery", "Contact"],
        style: { backgroundColor: "#1a1a2e", color: "#f8f9fa" },
      },
      {
        kind: "hero",
        title: "Welcome to Our Table",
        text: "Discover our menu, reserve your table, and experience a culinary journey like no other.",
        cta: "View Menu",
        image:
          "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop",
        style: { backgroundColor: "#1a1a2e", color: "#f8f9fa", titleSize: "56px" },
      },
      {
        kind: "mission",
        title: "Our Philosophy",
        text: "From farm to table, every dish is crafted with passion and the finest ingredients.",
      },
      {
        kind: "features",
        title: "Our Specialties",
        text: "What makes us unique.",
        items: ["Fresh Ingredients", "Seasonal Menu", "Chef's Specials", "Wine Pairings"],
      },
      {
        kind: "services",
        title: "Dining Experiences",
        text: "Whether it's a romantic dinner or a family gathering, we have the perfect setting.",
        items: [
          "🍽️ Private Dining|Exclusive dining rooms for special occasions.",
          "🥂 Catering|Full-service catering for events of any size.",
          "🌿 Outdoor Seating|Enjoy your meal in our beautiful garden.",
          "🎉 Events|Host your celebration with us.",
        ],
      },
      {
        kind: "testimonial",
        title: "What Our Guests Say",
        text: "We take pride in delivering unforgettable dining experiences.",
        items: [
          "★★★★★|Best dining experience in town.|Sarah T.",
          "★★★★★|Incredible food and amazing atmosphere.|John D.",
          "★★★★★|The service was impeccable.|Maria R.",
          "★★★★★|A hidden gem in the city.|David L.",
        ],
      },
      {
        kind: "stats",
        title: "Our Story in Numbers",
        text: "Serving excellence every day.",
        items: ["20+|Years of Excellence", "500+|Happy Guests Daily", "50+|Award-Winning Dishes", "100%|Guest Satisfaction"],
      },
      {
        kind: "cta",
        title: "Reserve Your Table",
        text: "Book your dining experience with us today.",
        cta: "Book a Table",
      },
      {
        kind: "footer",
        title: "Gourmet",
        text: "Creating memorable dining experiences since 2006.",
        items: ["About|Menu|Reservations|Contact", "Instagram|Facebook|Twitter|YouTube"],
        style: { backgroundColor: "#1a1a2e" },
      },
    ],
  },

  // ===== PORTFOLIO =====
  Portfolio: {
    defaultTitle: "Portfolio",
    sections: [
      {
        kind: "navbar",
        title: "Creative Studio",
        text: "",
        cta: "Get in Touch",
        items: ["Home", "Projects", "Skills", "About", "Contact"],
        style: { backgroundColor: "#ffffff", color: "#0f172a" },
      },
      {
        kind: "hero",
        title: "Creative Vision, Bold Execution",
        text: "A curated showcase of projects, designs, and ideas that define excellence.",
        cta: "View Portfolio",
        image:
          "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=600&h=400&fit=crop",
        style: { backgroundColor: "#fefce8", color: "#0f172a", titleSize: "56px" },
      },
      {
        kind: "mission",
        title: "My Approach",
        text: "Every project is a story. I bring ideas to life through design and innovation.",
      },
      {
        kind: "features",
        title: "Featured Work",
        text: "Explore a selection of projects that push boundaries and inspire innovation.",
        items: ["Web Design", "Branding", "Photography", "Illustration"],
      },
      {
        kind: "services",
        title: "What I Do",
        text: "I create visual experiences that connect brands with their audience.",
        items: [
          "🎨 UI/UX Design|User-centered design for web and mobile.",
          "🖌️ Graphic Design|Bold visuals that tell your story.",
          "📸 Photography|Professional photography for brands.",
          "✏️ Digital Art|Creative illustrations and digital artwork.",
        ],
      },
      {
        kind: "testimonial",
        title: "What Clients Say",
        text: "Working with clients who trust my vision is what drives me forward.",
        items: [
          "★★★★★|An exceptional creative partner.|Client A.",
          "★★★★★|Brought our brand vision to life.|Client B.",
          "★★★★★|Incredible attention to detail.|Client C.",
          "★★★★★|Exceeded all our expectations.|Client D.",
        ],
      },
      {
        kind: "stats",
        title: "My Journey",
        text: "Creating impact through design.",
        items: ["100+|Projects Delivered", "50+|Happy Clients", "10+|Awards Won", "8+|Years of Experience"],
      },
      {
        kind: "cta",
        title: "Let's Create Something Amazing",
        text: "Have a project in mind? Let's bring it to life together.",
        cta: "Get in Touch",
      },
      {
        kind: "footer",
        title: "Creative Studio",
        text: "Designing the future, one project at a time.",
        items: ["About|Projects|Contact|Blog", "Instagram|Dribbble|Behance|LinkedIn"],
        style: { backgroundColor: "#0f172a" },
      },
    ],
  },
};

// ==================== HELPERS ====================

export const getTemplateForCategory = (category: string): TemplateConfig => {
  return CATEGORY_TEMPLATES[category] || CATEGORY_TEMPLATES.Technology;
};

export const getAvailableCategories = (): string[] => {
  return Object.keys(CATEGORY_TEMPLATES);
};

export const getCategoryTemplateSections = (category: string): SectionConfig[] => {
  const template = getTemplateForCategory(category);
  return template.sections;
};
