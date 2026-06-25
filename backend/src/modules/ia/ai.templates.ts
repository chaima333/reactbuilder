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
  | "faq"
  | "footer"
  | "team"
  | "values"
  | "story"
  | "pricing"
  | "reservation"
  | "integrations"
  | "timeline"

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
        kind: "faq",
        title: "Frequently Asked Questions",
        text: "Find answers to the most common questions about our technology solutions.",
        items: [
          "What technologies do you specialize in?|We specialize in AI, machine learning, cloud infrastructure, and full-stack development.",
          "How do you ensure data security?|We follow industry best practices and compliance standards for data protection.",
          "Do you offer ongoing support?|Yes, we provide comprehensive support and maintenance for all our solutions.",
          "What is your development process?|We follow agile methodology with regular client collaboration and feedback.",
        ],
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
  // =========Cybersecurity ======
  Cybersecurity: {
    defaultTitle: "Cybersecurity Platform",
    sections: [
      {
        kind: "navbar",
        title: "CyberShield",
        text: "",
        cta: "Request Demo",
        items: ["Home", "Labs", "Training", "Certifications", "Contact"],
        style: { backgroundColor: "#020617", color: "#ffffff" },
      },
      {
        kind: "hero",
        title: "Build Cybersecurity Skills With Hands-On Labs",
        text: "A modern cybersecurity training platform for enterprises, security teams and IT professionals.",
        cta: "Start Training",
        image:
          "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&h=400&fit=crop",
        style: { backgroundColor: "#020617", color: "#ffffff", titleSize: "56px" },
      },
      {
        kind: "mission",
        title: "Cyber Defense Training Built for Real Threats",
        text: "We help organizations strengthen security skills through realistic attack scenarios, compliance training and expert-led cyber defense exercises.",
      },
      {
        kind: "features",
        title: "Cybersecurity Training Programs",
        text: "Practical programs designed for security teams, IT professionals and enterprise defenders.",
        items: [
          "Threat Detection Labs|Practice realistic attack detection scenarios.|Explore Labs",
          "Penetration Testing Workshops|Learn ethical hacking methods safely.|View Training",
          "Compliance Certification|Prepare teams for security standards and audits.|Get Certified",
          "SOC Monitoring Simulations|Train analysts with real-world monitoring workflows.|Start Simulation"
        ],
      },
      {
        kind: "services",
        title: "Security Training Services",
        text: "Everything your team needs to build stronger cyber defense capabilities.",
        items: [
          "🛡️ Threat Detection Labs|Hands-on labs for identifying and responding to threats.",
          "🧪 Penetration Testing|Practical workshops for ethical hacking and vulnerability testing.",
          "📋 Compliance Training|Programs focused on governance, risk and compliance readiness.",
          "🚨 Incident Response|Scenario-based training for breach response and crisis handling.",
        ],
      },
      {
        kind: "testimonial",
        title: "Trusted by Security Teams",
        text: "Organizations use our platform to train teams against real-world cyber threats.",
        items: [
          "★★★★★|The labs helped our analysts respond faster to real incidents.|SOC Manager",
          "★★★★★|A practical cybersecurity training platform, not just theory.|IT Director",
          "★★★★★|Our team improved detection and response workflows quickly.|Security Lead",
          "★★★★★|The compliance training made audit preparation much easier.|Risk Manager",
        ],
      },
      {
        kind: "stats",
        title: "Security Training Results",
        text: "Measurable outcomes for modern cyber defense teams.",
        items: [
          "500+|Security Teams Trained",
          "120+|Hands-On Labs",
          "95%|Certification Success",
          "24/7|Training Access"
        ],
      },
      {
        kind: "faq",
        title: "Frequently Asked Questions",
        text: "Common questions about cybersecurity training, labs and certifications.",
        items: [
          "Do you provide threat detection labs?|Yes, the platform includes practical detection labs based on realistic scenarios.",
          "Can teams earn cybersecurity certificates?|Yes, learners can complete programs and receive certificates.",
          "Do you cover compliance training?|Yes, we include compliance-focused modules for enterprise security teams.",
          "Are the exercises hands-on?|Yes, the training is built around practical labs and cyber defense simulations.",
        ],
      },
      {
        kind: "cta",
        title: "Ready to Strengthen Your Cyber Defense?",
        text: "Train your team with hands-on cybersecurity labs, expert guidance and real-world scenarios.",
        cta: "Request Demo",
      },
      {
        kind: "footer",
        title: "CyberShield",
        text: "Hands-on cybersecurity training for modern defense teams.",
        items: ["About|Labs|Training|Certifications|Contact", "LinkedIn|Twitter|GitHub|YouTube"],
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
        kind: "faq",
        title: "Frequently Asked Questions",
        text: "Everything you need to know about our learning platform.",
        items: [
          "Do I receive a certificate?|Yes, certificates are provided after course completion.",
          "Can I learn at my own pace?|Yes, courses are available anytime.",
          "Are instructors experienced?|Yes, all instructors are industry professionals.",
          "What courses do you offer?|We offer a wide range of courses across various fields.",
        ],
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
        kind: "faq",
        title: "Frequently Asked Questions",
        text: "Common questions about our healthcare services.",
        items: [
          "Can I book appointments online?|Yes, online booking is available 24/7.",
          "Are your services covered by insurance?|Contact us for insurance coverage details.",
          "What medical services do you offer?|We offer comprehensive medical services.",
          "Is my medical data secure?|Yes, we comply with all privacy regulations.",
        ],
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
        kind: "faq",
        title: "Frequently Asked Questions",
        text: "Answers to common questions about our online store.",
        items: [
          "Can I sell physical products?|Yes, our platform supports physical products.",
          "Do you support digital products?|Yes, digital products and services are supported.",
          "What payment methods are accepted?|We support all major payment methods.",
          "Is my store secure?|Yes, we ensure your store is fully secure.",
        ],
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
        kind: "faq",
        title: "Frequently Asked Questions",
        text: "Common questions about our financial services.",
        items: [
          "Do you provide investment advisory?|Yes, we offer professional financial advisory services.",
          "Who can use your services?|Businesses, investors and professionals.",
          "How do I get started?|Contact our team for an initial consultation.",
          "Is my data secure?|Yes, we use enterprise-grade security measures.",
        ],
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
        kind: "faq",
        title: "Frequently Asked Questions",
        text: "Common questions about our agency services.",
        items: [
          "Do you handle social media?|Yes, we provide social media management services.",
          "What industries do you serve?|We work across multiple industries and sectors.",
          "How do you measure success?|We track key performance indicators and metrics.",
          "Do you offer consulting?|Yes, we provide brand strategy consulting services.",
        ],
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

  // ===== REAL ESTATE =====
  RealEstate: {
    defaultTitle: "Real Estate Platform",
    sections: [
      {
        kind: "navbar",
        title: "HomeHaven",
        text: "",
        cta: "Browse Properties",
        items: ["Home", "Properties", "Services", "About", "Contact"],
        style: { backgroundColor: "#0f172a", color: "#ffffff" },
      },
      {
        kind: "hero",
        title: "Find Your Dream Property Today",
        text: "Premium real estate solutions for buyers, investors and property owners.",
        cta: "Explore Properties",
        image:
          "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop",
        style: { backgroundColor: "#0f172a", color: "#ffffff", titleSize: "56px" },
      },
      {
        kind: "mission",
        title: "Our Mission",
        text: "Helping clients discover, invest and grow through premium real estate opportunities.",
      },
      {
        kind: "features",
        title: "Property Solutions",
        text: "Everything you need for successful property investments.",
        items: ["Property Listings", "Property Valuation", "Investment Advisory", "Rental Management"],
      },
      {
        kind: "services",
        title: "Real Estate Services",
        text: "Comprehensive services for buyers, sellers and investors.",
        items: [
          "🏠 Property Listings|Browse premium residential and commercial properties.",
          "📈 Investment Advisory|Identify profitable real estate opportunities.",
          "📊 Property Valuation|Accurate market-based property assessments.",
          "🔑 Rental Management|Professional management for rental properties.",
        ],
      },
      {
        kind: "testimonial",
        title: "What Clients Say",
        text: "Trusted by buyers and investors.",
        items: [
          "★★★★★|Found our dream home quickly.|Home Buyer",
          "★★★★★|Professional and transparent process.|Investor",
          "★★★★★|Outstanding support from start to finish.|Property Owner",
          "★★★★★|Highly recommended real estate experts.|Client",
        ],
      },
      {
        kind: "stats",
        title: "Our Impact",
        text: "Real estate results that matter.",
        items: ["1000+|Properties", "500+|Happy Clients", "150M+|Property Value", "98%|Satisfaction"],
      },
      {
        kind: "faq",
        title: "Frequently Asked Questions",
        text: "Common questions about our real estate services.",
        items: [
          "Can I list my property?|Yes, property owners can submit listings.",
          "Do you support rentals?|Yes, rental management services are available.",
          "Do you provide market analysis?|Yes, we provide valuation and market insights.",
          "What commission do you charge?|Contact us for detailed pricing information.",
        ],
      },
      {
        kind: "cta",
        title: "Ready To Find Your Next Property?",
        text: "Start your real estate journey today.",
        cta: "Contact Us",
      },
      {
        kind: "footer",
        title: "HomeHaven",
        text: "Premium real estate solutions.",
        items: ["About|Properties|Services|Contact", "LinkedIn|Facebook|Instagram|YouTube"],
        style: { backgroundColor: "#0f172a" },
      },
    ],
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
        kind: "faq",
        title: "Frequently Asked Questions",
        text: "Common questions about our restaurant.",
        items: [
          "Can I manage my menu online?|Yes, you can update your menu anytime.",
          "Do you offer delivery integration?|Yes, we integrate with delivery services.",
          "How do I handle reservations?|You can manage reservations directly.",
          "Can I collect customer feedback?|Yes, we provide review management tools.",
        ],
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
        kind: "faq",
        title: "Frequently Asked Questions",
        text: "Common questions about my creative services.",
        items: [
          "Can I upload my own projects?|Yes, you can showcase all your projects.",
          "Is it customizable?|Yes, you can customize your portfolio design.",
          "Can I add categories?|Yes, organize your work by categories.",
          "Is my portfolio visible online?|Yes, your portfolio is publicly accessible.",
        ],
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

  // ===== CONSULTING =====
  Consulting: {
    defaultTitle: "Consulting Firm",
    sections: [
      {
        kind: "navbar",
        title: "StratEdge",
        text: "",
        cta: "Get a Consultation",
        items: ["Home", "Services", "About", "Insights", "Contact"],
        style: { backgroundColor: "#0f172a", color: "#ffffff" },
      },
      {
        kind: "hero",
        title: "Strategic Solutions for Business Growth",
        text: "Expert consulting services to help you navigate challenges and achieve your goals.",
        cta: "Get a Consultation",
        image:
          "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop",
        style: { backgroundColor: "#0f172a", color: "#ffffff", titleSize: "52px" },
      },
      {
        kind: "mission",
        title: "Our Mission",
        text: "To empower organizations with strategic insights and actionable solutions.",
      },
      {
        kind: "features",
        title: "Our Expertise",
        text: "Strategic advisory across multiple domains.",
        items: ["Business Strategy", "Operations Optimization", "Digital Transformation", "Market Entry"],
      },
      {
        kind: "services",
        title: "Consulting Services",
        text: "We deliver measurable results for your business.",
        items: [
          "📊 Strategic Planning|Develop effective strategies for business growth.",
          "💡 Business Advisory|Get expert advice to overcome business challenges.",
          "🔍 Market Research|Access in-depth market research and insights.",
          "⚙️ Performance Optimization|Optimize your business processes for success.",
        ],
      },
      {
        kind: "testimonial",
        title: "Client Success Stories",
        text: "Our clients trust us to deliver results.",
        items: [
          "★★★★★|Transformed our business strategy.|CEO, TechCorp",
          "★★★★★|Exceptional guidance and expertise.|Founder, HealthStart",
          "★★★★★|Helped us enter new markets successfully.|Director, GlobalCo",
          "★★★★★|Delivered measurable results.|COO, RetailGroup",
        ],
      },
      {
        kind: "stats",
        title: "Our Impact",
        text: "Delivering results that matter.",
        items: ["500+|Clients Served", "98%|Success Rate", "200+|Experts", "4.9★|Client Rating"],
      },
      {
        kind: "faq",
        title: "Frequently Asked Questions",
        text: "Common questions about our consulting services.",
        items: [
          "What consulting services do you offer?|We offer comprehensive business consulting.",
          "Who are your typical clients?|We work with businesses of all sizes.",
          "How long are consulting engagements?|Duration varies based on client needs.",
          "Can I get a trial consultation?|Yes, we offer initial consultation sessions.",
        ],
      },
      {
        kind: "cta",
        title: "Ready to Transform Your Business?",
        text: "Get expert guidance to achieve your business goals.",
        cta: "Get a Consultation",
      },
      {
        kind: "footer",
        title: "StratEdge",
        text: "Strategic solutions for business growth.",
        items: ["About|Services|Insights|Contact", "LinkedIn|Twitter|YouTube|Instagram"],
        style: { backgroundColor: "#0f172a" },
      },
    ],
  },

  // ===== EVENT =====
  Event: {
    defaultTitle: "Event Management",
    sections: [
      {
        kind: "navbar",
        title: "EventPro",
        text: "",
        cta: "Plan Your Event",
        items: ["Home", "Events", "Services", "Gallery", "Contact"],
        style: { backgroundColor: "#1a1a2e", color: "#f8f9fa" },
      },
      {
        kind: "hero",
        title: "Create Unforgettable Events",
        text: "Professional event planning and management for corporate events, weddings, and more.",
        cta: "Plan Your Event",
        image:
          "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&h=400&fit=crop",
        style: { backgroundColor: "#1a1a2e", color: "#f8f9fa", titleSize: "52px" },
      },
      {
        kind: "mission",
        title: "Our Philosophy",
        text: "Every event tells a story. We create experiences that leave lasting impressions.",
      },
      {
        kind: "features",
        title: "Event Solutions",
        text: "Comprehensive event planning and management services.",
        items: ["Corporate Events", "Weddings", "Conferences", "Private Parties"],
      },
      {
        kind: "services",
        title: "Event Services",
        text: "We handle everything from concept to execution.",
        items: [
          "📋 Event Planning|Plan and organize events with ease.",
          "🎫 Ticket Management|Sell and manage tickets for your events.",
          "👥 Guest Registration|Simplify guest registration and check-in.",
          "📡 Live Streaming|Broadcast your events to a global audience.",
        ],
      },
      {
        kind: "testimonial",
        title: "What Our Clients Say",
        text: "We bring your vision to life.",
        items: [
          "★★★★★|Flawless event execution.|Event Director",
          "★★★★★|Exceeded all attendee expectations.|Marketing Lead",
          "★★★★★|Professional event management.|Sponsor",
          "★★★★★|Made our dream event possible.|Client",
        ],
      },
      {
        kind: "stats",
        title: "Our Experience",
        text: "Creating memorable experiences.",
        items: ["500+|Events Planned", "50K+|Attendees", "4.9★|Rating", "98%|Satisfaction"],
      },
      {
        kind: "faq",
        title: "Frequently Asked Questions",
        text: "Common questions about our event services.",
        items: [
          "Can I sell tickets online?|Yes, we provide complete ticketing solutions.",
          "Do you support virtual events?|Yes, we support hybrid and virtual events.",
          "How do I manage attendees?|You can manage attendees through our dashboard.",
          "Do you provide event marketing?|Yes, we offer event promotion services.",
        ],
      },
      {
        kind: "cta",
        title: "Ready to Plan Your Next Event?",
        text: "Let's create an unforgettable experience together.",
        cta: "Contact Us",
      },
      {
        kind: "footer",
        title: "EventPro",
        text: "Creating unforgettable experiences.",
        items: ["About|Events|Services|Contact", "Instagram|Facebook|Twitter|YouTube"],
        style: { backgroundColor: "#1a1a2e" },
      },
    ],
  },

  // ===== CONSTRUCTION =====
  Construction: {
    defaultTitle: "Construction Company",
    sections: [
      {
        kind: "navbar",
        title: "BuildMaster",
        text: "",
        cta: "Get a Quote",
        items: ["Home", "Projects", "Services", "About", "Contact"],
        style: { backgroundColor: "#0f172a", color: "#ffffff" },
      },
      {
        kind: "hero",
        title: "Building Dreams, One Project at a Time",
        text: "Quality construction services for residential and commercial projects.",
        cta: "View Projects",
        image:
          "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&h=400&fit=crop",
        style: { backgroundColor: "#0f172a", color: "#ffffff", titleSize: "52px" },
      },
      {
        kind: "mission",
        title: "Our Commitment",
        text: "Delivering quality construction with integrity and excellence.",
      },
      {
        kind: "features",
        title: "Construction Services",
        text: "From residential to commercial, we build with precision.",
        items: ["Residential Construction", "Commercial Projects", "Renovations", "Interior Design"],
      },
      {
        kind: "services",
        title: "Our Services",
        text: "We bring your vision to life.",
        items: [
          "🏗️ Project Management|Manage construction projects efficiently.",
          "📐 Architectural Design|Create innovative and functional designs.",
          "🔧 Building Services|Access comprehensive building services.",
          "✅ Quality Control|Ensure the highest quality standards.",
        ],
      },
      {
        kind: "testimonial",
        title: "Client Testimonials",
        text: "Trusted for quality and reliability.",
        items: [
          "★★★★★|Completed our project on time.|Project Manager",
          "★★★★★|Quality workmanship throughout.|Architect",
          "★★★★★|Professional and reliable team.|Developer",
          "★★★★★|Exceeded our expectations.|Homeowner",
        ],
      },
      {
        kind: "stats",
        title: "Our Numbers",
        text: "Building excellence since day one.",
        items: ["200+|Projects Completed", "98%|On Time Delivery", "95%|Satisfaction", "4.9★|Rating"],
      },
      {
        kind: "faq",
        title: "Frequently Asked Questions",
        text: "Common questions about our construction services.",
        items: [
          "What types of projects do you handle?|We handle all types of construction projects.",
          "Can you provide estimates?|Yes, we provide detailed cost estimates.",
          "What is your timeline?|Timelines vary based on project complexity.",
          "Do you provide warranties?|Yes, we offer project warranties.",
        ],
      },
      {
        kind: "cta",
        title: "Ready to Build Your Future?",
        text: "Let's bring your vision to reality.",
        cta: "Get a Quote",
      },
      {
        kind: "footer",
        title: "BuildMaster",
        text: "Building excellence, one project at a time.",
        items: ["About|Projects|Services|Contact", "LinkedIn|Facebook|Instagram|YouTube"],
        style: { backgroundColor: "#0f172a" },
      },
    ],
  },

  // ===== TRAVEL =====
  Travel: {
    defaultTitle: "Travel Platform",
    sections: [
      {
        kind: "navbar",
        title: "Wanderlust",
        text: "",
        cta: "Plan Your Trip",
        items: ["Home", "Destinations", "Packages", "About", "Contact"],
        style: { backgroundColor: "#0f172a", color: "#ffffff" },
      },
      {
        kind: "hero",
        title: "Explore the World With Confidence",
        text: "Curated travel experiences, insider tips, and expert guidance for your next adventure.",
        cta: "Explore Destinations",
        image:
          "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&h=400&fit=crop",
        style: { backgroundColor: "#0f172a", color: "#ffffff", titleSize: "52px" },
      },
      {
        kind: "mission",
        title: "Our Vision",
        text: "To make travel accessible, memorable, and transformative for everyone.",
      },
      {
        kind: "features",
        title: "Travel Solutions",
        text: "Everything you need to plan your next adventure.",
        items: ["Flight Booking", "Hotel Reservations", "Tour Packages", "Travel Insurance"],
      },
      {
        kind: "services",
        title: "Travel Services",
        text: "We take care of the details so you can enjoy the journey.",
        items: [
          "✈️ Trip Planning|Plan your trips with personalized recommendations.",
          "🏨 Hotel Booking|Find and book hotels at the best prices.",
          "🧳 Tour Packages|Discover amazing tour packages and deals.",
          "🛡️ Travel Insurance|Protect your travels with comprehensive insurance.",
        ],
      },
      {
        kind: "testimonial",
        title: "Traveler Stories",
        text: "Real experiences from real travelers.",
        items: [
          "★★★★★|Unforgettable travel experience.|Traveler",
          "★★★★★|Expert guidance every step of the way.|Tourist",
          "★★★★★|Made our dream vacation possible.|Adventurer",
          "★★★★★|Highly recommended travel platform.|Globetrotter",
        ],
      },
      {
        kind: "stats",
        title: "By the Numbers",
        text: "Trusted by travelers worldwide.",
        items: ["10K+|Travelers", "100+|Destinations", "4.9★|Rating", "98%|Satisfaction"],
      },
      {
        kind: "faq",
        title: "Frequently Asked Questions",
        text: "Common questions about our travel services.",
        items: [
          "Do you offer package deals?|Yes, we provide travel packages.",
          "Can I book last minute?|Yes, last minute bookings are available.",
          "Do you provide travel insurance?|Yes, we offer comprehensive travel insurance.",
          "Can I customize my trip?|Yes, we offer customizable travel experiences.",
        ],
      },
      {
        kind: "cta",
        title: "Ready to Explore?",
        text: "Start planning your next adventure today.",
        cta: "Plan Your Trip",
      },
      {
        kind: "footer",
        title: "Wanderlust",
        text: "Explore the world with confidence.",
        items: ["About|Destinations|Packages|Contact", "Instagram|Facebook|Twitter|YouTube"],
        style: { backgroundColor: "#0f172a" },
      },
    ],
  },

  // ===== BLOG =====
  Blog: {
    defaultTitle: "Blog Platform",
    sections: [
      {
        kind: "navbar",
        title: "BlogSphere",
        text: "",
        cta: "Start Writing",
        items: ["Home", "Articles", "Categories", "About", "Contact"],
        style: { backgroundColor: "#ffffff", color: "#0f172a" },
      },
      {
        kind: "hero",
        title: "Stories That Inspire and Inform",
        text: "A platform for writers and readers to share ideas, insights, and inspiration.",
        cta: "Read Articles",
        image:
          "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&h=400&fit=crop",
        style: { backgroundColor: "#f8fafc", color: "#0f172a", titleSize: "52px" },
      },
      {
        kind: "mission",
        title: "Our Purpose",
        text: "Empowering voices and sharing stories that matter.",
      },
      {
        kind: "features",
        title: "Blog Features",
        text: "Everything you need to build your online presence.",
        items: ["Content Creation", "SEO Optimization", "Audience Analytics", "Community Engagement"],
      },
      {
        kind: "services",
        title: "Writing Services",
        text: "Professional content creation for blogs, websites, and social media.",
        items: [
          "✍️ Content Creation|Create engaging content that resonates with readers.",
          "🔍 SEO Optimization|Optimize your content for better search visibility.",
          "💬 Audience Engagement|Connect with your audience through compelling content.",
          "📊 Analytics Dashboard|Track your performance with real-time analytics.",
        ],
      },
      {
        kind: "testimonial",
        title: "Writer Testimonials",
        text: "What our community says about us.",
        items: [
          "★★★★★|Grew our audience by 300%.|Content Manager",
          "★★★★★|Valuable insights and practical advice.|Reader",
          "★★★★★|Transformed our content strategy.|Editor",
          "★★★★★|A platform that supports creativity.|Writer",
        ],
      },
      {
        kind: "stats",
        title: "Blog Stats",
        text: "Join our growing community.",
        items: ["500+|Articles", "50K+|Readers", "4.8★|Rating", "95%|Engagement"],
      },
      {
        kind: "faq",
        title: "Frequently Asked Questions",
        text: "Common questions about our blog platform.",
        items: [
          "Can I start a blog with your platform?|Yes, start your blog in minutes.",
          "Do you provide SEO tools?|Yes, we provide SEO optimization tools.",
          "Can I monetize my blog?|Yes, we offer monetization options.",
          "Do you have analytics?|Yes, we provide detailed analytics and insights.",
        ],
      },
      {
        kind: "cta",
        title: "Ready to Share Your Story?",
        text: "Join thousands of writers who share their ideas with the world.",
        cta: "Start Writing",
      },
      {
        kind: "footer",
        title: "BlogSphere",
        text: "Stories that inspire and inform.",
        items: ["About|Articles|Categories|Contact", "Instagram|Facebook|Twitter|YouTube"],
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