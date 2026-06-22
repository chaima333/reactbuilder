// content.generator.ts

// ==================== HELPERS ====================

import { BusinessProfile } from "./business.profile";

/**
 * Extract keywords from prompt
 * - Supprime les mots communs (stop words)
 * - Garde les mots significatifs (noms, verbes, adjectifs)
 * - Retourne une liste de mots-clés uniques
 */
const extractKeywordsFromPrompt = (prompt: string): string[] => {
  const cleanPrompt = prompt.trim().replace(/\s+/g, " ");
  
  // Stop words à ignorer
  const stopWords = new Set([
    'a', 'an', 'the', 'of', 'for', 'on', 'at', 'to', 'in', 'with', 'without',
    'and', 'or', 'but', 'so', 'for', 'nor', 'yet', 'as', 'by', 'from', 'into',
    'through', 'during', 'including', 'providing', 'platform', 'solution',
    'service', 'management', 'system', 'software', 'tool', 'suite', 'application',
    'for', 'with', 'our', 'your', 'their', 'its', 'are', 'is', 'was', 'were',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
    'may', 'might', 'must', 'shall', 'can'
  ]);

  // Nettoyer et splitter
  const words = cleanPrompt
    .toLowerCase()
    .replace(/[^a-zA-Z\s]/g, '') // Enlever la ponctuation
    .split(' ')
    .filter(word => word.length > 2) // Ignorer les mots trop courts
    .filter(word => !stopWords.has(word)); // Ignorer les stop words

  // Retourner les mots uniques (sans doublons)
  return [...new Set(words)];
};

/**
 * Génère des services à partir des mots-clés
 * - Formate les mots-clés en titres de services
 * - Prend les 4-6 premiers mots significatifs
 */
const generateServicesFromKeywords = (keywords: string[], maxCount: number = 6): string[] => {
  if (keywords.length === 0) {
    // Fallback si pas de mots-clés
    return [
      "Professional Services",
      "Expert Solutions",
      "Quality Delivery",
      "Customer Success"
    ];
  }

  // Formatter les mots-clés en titres de services
  return keywords.slice(0, maxCount).map(keyword => {
    // Transformer "cybersecurity" -> "Cybersecurity"
    // Transformer "threat_detection" -> "Threat Detection"
    return keyword
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  });
};

/**
 * Génère des features à partir des mots-clés (format: "Title|Description|Button")
 */
const generateFeaturesFromKeywords = (keywords: string[], maxCount: number = 4): string[] => {
  if (keywords.length === 0) {
    return [
      "Innovative Solutions|Cutting-edge solutions designed for your business needs.|Learn More",
      "Expert Team|Work with industry professionals who deliver results.|Learn More",
      "Quality Assurance|We ensure the highest quality in every project.|Learn More",
      "Customer Focus|Your satisfaction is our top priority.|Learn More"
    ];
  }

  // Prendre les mots suivants (offset de 2 pour varier des services)
  const startIndex = Math.min(2, keywords.length);
  const featureKeywords = keywords.slice(startIndex, startIndex + maxCount);
  
  if (featureKeywords.length === 0) {
    // Si pas assez de mots, prendre les premiers
    return keywords.slice(0, maxCount).map(k => {
      const title = k.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      return `${title}|Expert ${title} solutions for your business.|Learn More`;
    });
  }

  return featureKeywords.map(keyword => {
    const title = keyword
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    // Générer des descriptions variées
    const descriptions = [
      `Advanced ${title} solutions tailored to your needs.`,
      `Professional ${title} services that deliver measurable results.`,
      `Innovative ${title} strategies for modern businesses.`,
      `Comprehensive ${title} solutions with expert support.`
    ];
    
    return `${title}|${descriptions[Math.floor(Math.random() * descriptions.length)]}|Learn More`;
  });
};

/**
 * Génère des statistiques dynamiques basées sur les mots-clés
 */
const generateStatsFromKeywords = (keywords: string[]): { value: string; label: string }[] => {
  if (keywords.length === 0) {
    return [
      { value: "100+", label: "Projects" },
      { value: "50+", label: "Clients" },
      { value: "95%", label: "Satisfaction" },
      { value: "24/7", label: "Support" }
    ];
  }

  // Générer des stats basées sur le contexte
  const stats: { value: string; label: string }[] = [];
  
  // Vérifier les mots-clés pour des stats spécifiques
  const hasUsers = keywords.some(k => ['user', 'customer', 'client', 'member'].includes(k));
  const hasProjects = keywords.some(k => ['project', 'task', 'work', 'build'].includes(k));
  const hasYears = keywords.some(k => ['year', 'experience', 'expert'].includes(k));
  const hasPercent = keywords.some(k => ['rate', 'success', 'satisfaction', 'quality'].includes(k));

  if (hasUsers) stats.push({ value: "500+", label: "Users" });
  else if (hasProjects) stats.push({ value: "200+", label: "Projects" });
  else stats.push({ value: "100+", label: "Clients" });

  if (hasYears) stats.push({ value: "10+", label: "Years Experience" });
  else if (hasPercent) stats.push({ value: "98%", label: "Satisfaction Rate" });
  else stats.push({ value: "50+", label: "Team Members" });

  // 3ème stat
  stats.push({ value: "24/7", label: "Support" });
  
  // 4ème stat
  stats.push({ value: "4.9★", label: "Rating" });

  return stats;
};

/**
 * Génère des statistiques spécifiques à la catégorie (category-aware)
 * - TOUTES les catégories ont 4 stats
 */
const generateCategoryStats = (category: string): { value: string; label: string }[] => {
  const statsMap: Record<string, { value: string; label: string }[]> = {
    Education: [
      { value: "5000+", label: "Students" },
      { value: "120+", label: "Courses" },
      { value: "95%", label: "Success Rate" },
      { value: "4.8★", label: "Rating" }
    ],
    Technology: [
      { value: "1000+", label: "Projects" },
      { value: "98%", label: "Uptime" },
      { value: "200+", label: "Experts" },
      { value: "4.9★", label: "Rating" }
    ],
    Medical: [
      { value: "10000+", label: "Patients" },
      { value: "95%", label: "Recovery Rate" },
      { value: "24/7", label: "Support" },
      { value: "4.8★", label: "Rating" }
    ],
    Finance: [
      { value: "500M+", label: "Managed" },
      { value: "98%", label: "Satisfaction" },
      { value: "200+", label: "Experts" },
      { value: "4.9★", label: "Rating" }
    ],
    Ecommerce: [
      { value: "10K+", label: "Products" },
      { value: "50K+", label: "Customers" },
      { value: "4.8★", label: "Rating" },
      { value: "99%", label: "Delivery Rate" }
    ],
    Agency: [
      { value: "500+", label: "Projects" },
      { value: "150+", label: "Clients" },
      { value: "98%", label: "Retention" },
      { value: "4.9★", label: "Rating" }
    ],
    Portfolio: [
      { value: "200+", label: "Projects" },
      { value: "50+", label: "Awards" },
      { value: "100+", label: "Clients" },
      { value: "4.9★", label: "Rating" }
    ],
    Restaurant: [
      { value: "10K+", label: "Meals Served" },
      { value: "4.9★", label: "Rating" },
      { value: "95%", label: "Satisfaction" },
      { value: "500+", label: "Reviews" }
    ],
    Consulting: [
      { value: "500+", label: "Clients" },
      { value: "98%", label: "Success Rate" },
      { value: "200+", label: "Experts" },
      { value: "4.9★", label: "Rating" }
    ],
    RealEstate: [
      { value: "1000+", label: "Properties" },
      { value: "500+", label: "Happy Clients" },
      { value: "98%", label: "Satisfaction" },
      { value: "4.9★", label: "Rating" }
    ],
    Event: [
      { value: "500+", label: "Events" },
      { value: "50K+", label: "Attendees" },
      { value: "4.9★", label: "Rating" },
      { value: "98%", label: "Satisfaction" }
    ],
    Construction: [
      { value: "200+", label: "Projects" },
      { value: "98%", label: "On Time" },
      { value: "95%", label: "Satisfaction" },
      { value: "4.9★", label: "Rating" }
    ],
    Travel: [
      { value: "10K+", label: "Travelers" },
      { value: "100+", label: "Destinations" },
      { value: "4.9★", label: "Rating" },
      { value: "98%", label: "Satisfaction" }
    ],
    Blog: [
      { value: "500+", label: "Articles" },
      { value: "50K+", label: "Readers" },
      { value: "4.8★", label: "Rating" },
      { value: "95%", label: "Engagement" }
    ]
  };

  return statsMap[category] || [
    { value: "100+", label: "Projects" },
    { value: "50+", label: "Clients" },
    { value: "95%", label: "Satisfaction" },
    { value: "4.8★", label: "Rating" }
  ];
};

/**
 * Génère un brand name dynamique à partir des mots-clés
 */
const generateBrandFromKeywords = (keywords: string[]): string => {
  if (keywords.length === 0) {
    return "InnovatePro";
  }

  // Prendre les 2 premiers mots significatifs
  const firstWords = keywords.slice(0, 2);
  const brand = firstWords.map(w => 
    w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
  ).join('');

  // Ajouter un suffixe si le nom est trop court
  if (brand.length < 4) {
    return brand + 'Pro';
  }

  return brand;
};

/**
 * Génère un hero title dynamique
 */
const generateHeroTitle = (keywords: string[], category: string): string => {
  if (keywords.length === 0) {
    return `Modern ${category} Solutions`;
  }

  const firstKeyword = keywords[0];
  const capitalized = firstKeyword.charAt(0).toUpperCase() + firstKeyword.slice(1);
  
  const templates = [
    `Smart ${capitalized} Solutions For Modern Businesses`,
    `${capitalized} Platform For Digital Success`,
    `Enterprise-Grade ${capitalized} Services`,
    `Next-Generation ${capitalized} Solutions`,
    `Transform Your Business With ${capitalized}`
  ];

  return templates[Math.floor(Math.random() * templates.length)];
};

/**
 * Génère le titre de la mission en fonction de la catégorie
 */
const generateMissionTitle = (category: string): string => {
  // Version simplifiée comme demandé
  if (category === "Education") {
    return "Our Learning Mission";
  } else if (category === "Technology") {
    return "Our Technology Vision";
  } else {
    return "Our Mission";
  }
};

/**
 * Génère le texte de la mission à partir des mots-clés et de la catégorie
 */
const generateMissionText = (keywords: string[], category: string, dynamicServices: string[]): string => {
  if (keywords.length > 0) {
    return `We help people and organizations succeed through ${dynamicServices
      .slice(0, 3)
      .join(", ")
      .toLowerCase()}.`;
  }
  
  return `We deliver modern ${category.toLowerCase()} solutions with quality and impact.`;
};

// ==================== MAIN FUNCTION ====================

const CATEGORY_SERVICES: Record<string, string[]> = {
  Education: [
    "Online Courses",
    "Virtual Classrooms",
    "Certification Programs",
    "Learning Analytics"
  ],

  Technology: [
    "AI Automation",
    "Cloud Infrastructure",
    "API Integrations",
    "Business Analytics"
  ],

  Finance: [
    "Investment Advisory",
    "Risk Management",
    "Capital Planning",
    "Portfolio Management"
  ],

  Medical: [
    "Online Appointments",
    "Patient Management",
    "Telemedicine",
    "Medical Records"
  ],
  
  RealEstate: [
    "Property Listings",
    "Property Management",
    "Real Estate Investment",
    "Property Valuation"
  ],
  
  Agency: [
    "Brand Strategy",
    "Creative Design",
    "Digital Marketing",
    "Content Creation"
  ],
};

const CATEGORY_FEATURES: Record<string, string[]> = {
  Education: [
    "Interactive Learning|Engage students with dynamic and interactive learning experiences.|Learn More",
    "Expert Instructors|Learn from industry professionals with years of experience.|Learn More",
    "Progress Tracking|Monitor student progress with advanced analytics tools.|Learn More",
    "Industry Certifications|Earn recognized certifications to boost your career.|Learn More"
  ],

  Technology: [
    "Scalable Infrastructure|Build and scale your infrastructure with confidence.|Learn More",
    "Real-Time Analytics|Get actionable insights with real-time data analytics.|Learn More",
    "Automation Workflows|Streamline your operations with intelligent automation.|Learn More",
    "Secure Integrations|Connect securely with industry-standard integrations.|Learn More"
  ],

  Finance: [
    "Data Driven Insights|Make informed decisions with data-driven financial insights.|Learn More",
    "Risk Monitoring|Monitor and manage risks with advanced tools.|Learn More",
    "Financial Reporting|Get comprehensive financial reports for better planning.|Learn More",
    "Growth Planning|Plan your financial growth with expert guidance.|Learn More"
  ],

  Medical: [
    "Secure Patient Data|Keep patient data secure with enterprise-grade protection.|Learn More",
    "Easy Scheduling|Simplify appointment scheduling for patients and staff.|Learn More",
    "Remote Consultations|Offer telemedicine services for better patient access.|Learn More",
    "24/7 Support|Get round-the-clock support for your medical practice.|Learn More"
  ],
  
  RealEstate: [
    "Premium Listings|Access premium property listings from trusted sellers.|Learn More",
    "Market Insights|Get real-time market insights and property valuations.|Learn More",
    "Property Search|Find your dream property with advanced search tools.|Learn More",
    "Investment Opportunities|Discover profitable real estate investment opportunities.|Learn More"
  ],
  
  Agency: [
    "Creative Campaigns|Launch campaigns that attract the right audience and convert better.|Learn More",
    "Brand Identity|Build a strong visual identity with clear messaging and positioning.|Learn More",
    "Content Strategy|Plan content that supports awareness, trust and growth.|Learn More",
    "Marketing Performance|Track results and improve campaigns with measurable insights.|Learn More"
  ],
};

export const generateAiContent = (
  category: string,
  prompt: string,
  profile?: BusinessProfile
) => {
  const cleanPrompt = prompt.trim().replace(/\s+/g, " ");
  
  // 1. Extraire les mots-clés du prompt
  const keywords = extractKeywordsFromPrompt(cleanPrompt);
  const profileServices =
    profile?.services?.length
      ? profile.services
      : generateServicesFromKeywords(keywords);

  const profileAudience = profile?.audience?.length ? profile.audience : ["businesses", "professionals"];

  const profileBrand = profile?.companyName || generateBrandFromKeywords(keywords);
  
  // 2. Générer les contenus dynamiques
  const dynamicBrand = profileBrand;
  const dynamicServices = CATEGORY_SERVICES[category] || profileServices;
  
  // Pour TOUTES les catégories, features au format "Title|Description|Button"
  const dynamicFeatures = CATEGORY_FEATURES[category] || generateFeaturesFromKeywords(keywords);
  
  const dynamicHeroTitle = generateHeroTitle(keywords, category);

  // 3. Brand name (priorité au dynamique)
  const brandByCategory: Record<string, string> = {
    Medical: "MediCare Pro",
    Finance: "FinVision",
    Technology: "TechNova",
    Education: "EduSphere",
    Restaurant: "TasteHub",
    Agency: "BrandCraft",
    Ecommerce: "Shoply",
    Portfolio: "Creative Studio",
    Consulting: "StratEdge",
    Corporate: "NovaCorp",
    RealEstate: "HomeHaven",
    Event: "EventPro",
    Construction: "BuildMaster",
    Travel: "Wanderlust",
    Blog: "BlogSphere"
  };

  // Utiliser le brand dynamique si des mots-clés ont été trouvés, sinon fallback
  const brandName = keywords.length > 0 
    ? dynamicBrand 
    : (brandByCategory[category] || `${category} Platform`);

  // 4. Hero title (dynamique si possible)
  const heroTitleByCategory: Record<string, string> = {
    Finance: "Smart Financial Advisory For Growing Businesses",
    Medical: "Modern Healthcare Made Simple",
    Technology: "Build Smarter Digital Products",
    Education: "Empower Your Learning Journey",
    Ecommerce: "Next-Generation Online Shopping Experience",
    Agency: "Creative Solutions For Modern Brands",
    Portfolio: "Showcasing Excellence In Every Project",
    Restaurant: "Delicious Food, Exceptional Service",
    Consulting: "Strategic Solutions For Business Growth",
    RealEstate: "Find Your Dream Property Today",
    Event: "Create Unforgettable Events",
    Construction: "Building Dreams, One Project At A Time",
    Travel: "Explore The World With Confidence",
    Blog: "Stories That Inspire And Inform"
  };

  const heroTitle = heroTitleByCategory[category] || dynamicHeroTitle;
  
  // 5. CTA Titles (fallback par catégorie)
  const ctaTitleByCategory: Record<string, string> = {
    Finance: "Ready to Grow Your Financial Strategy?",
    Medical: "Ready to Modernize Your Clinic?",
    Technology: "Ready to Build Your Digital Future?",
    Education: "Ready to Start Learning?",
    Ecommerce: "Ready to Start Selling?",
    Agency: "Ready to Grow Your Brand?",
    Portfolio: "Ready to Showcase Your Work?",
    Restaurant: "Ready to Serve Better?",
    Consulting: "Ready to Transform Your Business?",
    RealEstate: "Ready to Find Your Dream Home?",
    Event: "Ready to Plan Your Next Event?",
    Construction: "Ready to Build Your Future?",
    Travel: "Ready to Explore?",
    Blog: "Ready to Share Your Story?"
  };

  // 6. CTA Texts (fallback par catégorie)
  const ctaTextByCategory: Record<string, string> = {
    Finance: "Start planning smarter funding and investment decisions today.",
    Medical: "Launch your digital healthcare experience today.",
    Technology: "Build and scale your digital products with confidence.",
    Education: "Join thousands of students advancing their careers.",
    Ecommerce: "Start selling online with a powerful ecommerce platform.",
    Agency: "Create impactful brand experiences that drive growth.",
    Portfolio: "Showcase your best work and attract new clients.",
    Restaurant: "Deliver exceptional dining experiences to your customers.",
    Consulting: "Get expert guidance to achieve your business goals.",
    RealEstate: "Find your perfect property with our expert guidance.",
    Event: "Plan and execute unforgettable events with ease.",
    Construction: "Transform your vision into reality with our expertise.",
    Travel: "Explore the world with confidence and peace of mind.",
    Blog: "Share your stories and connect with your audience."
  };

  // 7. Testimonials (fallback par catégorie)
  const testimonialsByCategory: Record<string, string[]> = {
    Finance: [
      "Helped us structure funding faster|Startup Founder",
      "Clear financial strategy and strong execution|Investment Director",
      "Reliable advisory for long-term growth|CEO"
    ],
    Medical: [
      "Reduced appointment workload significantly|Clinic Manager",
      "Patients can book consultations easily|Dr Ahmed",
      "Simple platform for daily clinic operations|Healthcare Admin"
    ],
    Technology: [
      "Transformed our digital infrastructure|CTO",
      "Delivered high-quality solutions on time|Project Lead",
      "Revolutionized our development process|Engineering Director"
    ],
    Education: [
      "Excellent courses with practical projects|Student",
      "The instructors were highly experienced|Graduate",
      "Helped me start my career in tech|Learner"
    ],
    Ecommerce: [
      "Increased our sales by 200%|CEO",
      "Easy to manage and scale|Operations Director",
      "Outstanding customer support|Store Owner"
    ],
    Agency: [
      "Transformed our brand identity|Marketing Director",
      "Delivered exceptional creative work|Brand Manager",
      "Exceeded all our expectations|CEO"
    ],
    Portfolio: [
      "Stunning showcase of our work|Creative Director",
      "Helped us attract high-value clients|Agency Owner",
      "Professional presentation that stands out|Designer"
    ],
    Restaurant: [
      "Increased reservations by 150%|Restaurant Owner",
      "Customers love the online ordering|Manager",
      "Transformed our digital presence|Chef"
    ],
    Consulting: [
      "Expert advice that transformed our strategy|CEO",
      "Delivered measurable results|Operations Director",
      "Strategic insights that drove growth|Founder"
    ],
    RealEstate: [
      "Found our dream home in record time|Home Buyer",
      "Professional and transparent service|Investor",
      "Simplified the entire process|Property Owner"
    ],
    Event: [
      "Organized a flawless conference|Event Director",
      "Exceeded all attendee expectations|Marketing Lead",
      "Professional event management|Sponsor"
    ],
    Construction: [
      "Completed our project on time|Project Manager",
      "Quality workmanship throughout|Architect",
      "Professional and reliable team|Developer"
    ],
    Travel: [
      "Unforgettable travel experience|Traveler",
      "Expert guidance every step of the way|Tourist",
      "Made our dream vacation possible|Adventurer"
    ],
    Blog: [
      "Grew our audience by 300%|Content Manager",
      "Valuable insights and practical advice|Reader",
      "Transformed our content strategy|Editor"
    ]
  };

  // 8. Générer Mission Title & Text
  const missionTitle = generateMissionTitle(category);
  const missionText = generateMissionText(keywords, category, dynamicServices);

  // 9. Générer les stats category-aware (TOUTES les catégories ont 4 stats)
  const categoryStats = generateCategoryStats(category);

  // ===== RETOUR =====
  return {
    title: brandName,
    heroTitle: heroTitle,
    heroText: keywords.length > 0
      ? `Helping ${profileAudience.join(", ")} succeed through ${dynamicServices
          .slice(0, 3)
          .join(", ")
          .toLowerCase()}.`
      : `A modern ${category.toLowerCase()} solution designed for professional digital experiences.`,
    // Mission / Vision (NOUVEAU)
    missionTitle: missionTitle,
    missionText: missionText,
    
    // Services dynamiques
    services: dynamicServices,
    
    // Features dynamiques (TOUTES les catégories ont "Title|Description|Button")
    features: dynamicFeatures,
    
    // Stats category-aware (TOUTES les catégories ont 4 stats)
    stats: categoryStats,
    
    // Testimonials (fallback par catégorie)
    testimonials: testimonialsByCategory[category] || [
      "Professional service and strong results|Client"
    ],
    
    // CTA (fallback par catégorie)
    ctaTitle: keywords.length > 0
      ? `Ready to Launch Your ${dynamicServices[0]} Platform?`
      : ctaTitleByCategory[category] || `Ready to Build Your ${category} Platform?`,
    ctaText: keywords.length > 0
      ? `Turn your ${dynamicServices[0].toLowerCase()} vision into a scalable digital experience.`
      : ctaTextByCategory[category] || "Create a modern digital presence with AI.",
  };
};