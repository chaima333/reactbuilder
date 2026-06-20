export const generateAiContent = (
  category: string,
  prompt: string
) => {
  const cleanPrompt =
    prompt.trim().replace(/\s+/g, " ");
    const words = cleanPrompt
  .split(" ")
  .filter((w) => w.length > 3);

const dynamicBrand =
  words.slice(0, 2)
    .map(
      (w) =>
        w.charAt(0).toUpperCase() +
        w.slice(1).toLowerCase()
    )
    .join("");


  // ===== SERVICES BY CATEGORY =====
  const SERVICES_BY_CATEGORY: Record<string, string[]> = {
    Finance: [
      "Investment Advisory",
      "Risk Analysis",
      "Portfolio Management",
      "Capital Structuring"
    ],

    Medical: [
      "Appointment Booking",
      "Telemedicine",
      "Patient Records",
      "Clinic Analytics"
    ],

    Technology: [
      "Software Development",
      "Cloud Solutions",
      "AI Automation",
      "DevOps Services"
    ],

    Corporate: [
      "Consulting",
      "Management",
      "Strategy",
      "Operations"
    ],

    // ===== NOUVEAUX =====
    Education: [
      "Online Courses",
      "Expert Instructors",
      "Learning Materials",
      "Certification Programs"
    ],

    Ecommerce: [
      "Product Catalog",
      "Secure Payments",
      "Order Tracking",
      "Customer Support"
    ],

    Agency: [
      "Brand Strategy",
      "Digital Marketing",
      "Content Creation",
      "Social Media Management"
    ],

    Portfolio: [
      "Project Showcase",
      "Case Studies",
      "Creative Gallery",
      "Client Work"
    ],

    Restaurant: [
      "Menu Management",
      "Table Reservations",
      "Online Ordering",
      "Customer Reviews"
    ],

    Consulting: [
      "Strategic Planning",
      "Business Analysis",
      "Market Research",
      "Performance Optimization"
    ],

    RealEstate: [
      "Property Listings",
      "Virtual Tours",
      "Mortgage Services",
      "Real Estate Analytics"
    ],

    Event: [
      "Event Planning",
      "Ticketing System",
      "Speaker Management",
      "Sponsor Relations"
    ],

    Construction: [
      "Project Management",
      "Building Design",
      "Cost Estimation",
      "Quality Control"
    ],

    Travel: [
      "Destination Guides",
      "Booking System",
      "Travel Packages",
      "Customer Reviews"
    ],

    Blog: [
      "Content Publishing",
      "SEO Optimization",
      "Social Media Integration",
      "Analytics Dashboard"
    ],
  };

  // ===== STATS BY CATEGORY =====
  const STATS_BY_CATEGORY: Record<string, { value: string; label: string }[]> = {
    Finance: [
      { value: "500+", label: "Clients" },
      { value: "$50M+", label: "Managed Assets" }
    ],

    Medical: [
      { value: "10k+", label: "Patients" },
      { value: "200+", label: "Doctors" }
    ],

    Technology: [
      { value: "150+", label: "Projects" },
      { value: "99%", label: "Uptime" }
    ],

    Corporate: [
      { value: "100+", label: "Partners" },
      { value: "25+", label: "Countries" }
    ],

    // ===== NOUVEAUX =====
    Education: [
      { value: "5000+", label: "Students" },
      { value: "120+", label: "Courses" },
      { value: "40+", label: "Instructors" },
      { value: "95%", label: "Success Rate" }
    ],

    Ecommerce: [
      { value: "10k+", label: "Orders" },
      { value: "500+", label: "Products" },
      { value: "98%", label: "Customer Satisfaction" }
    ],

    Agency: [
      { value: "300+", label: "Projects" },
      { value: "120+", label: "Clients" },
      { value: "15+", label: "Years Experience" }
    ],

    Portfolio: [
      { value: "50+", label: "Projects" },
      { value: "20+", label: "Clients" },
      { value: "10+", label: "Awards" }
    ],

    Restaurant: [
      { value: "200+", label: "Menu Items" },
      { value: "500+", label: "Daily Customers" },
      { value: "4.8/5", label: "Average Rating" }
    ],

    Consulting: [
      { value: "300+", label: "Consultants" },
      { value: "200+", label: "Clients" },
      { value: "15+", label: "Years Experience" }
    ],

    RealEstate: [
      { value: "1000+", label: "Properties" },
      { value: "500+", label: "Happy Clients" },
      { value: "97%", label: "Satisfaction Rate" }
    ],

    Event: [
      { value: "500+", label: "Events" },
      { value: "50k+", label: "Attendees" },
      { value: "200+", label: "Speakers" }
    ],

    Construction: [
      { value: "200+", label: "Projects" },
      { value: "150+", label: "Clients" },
      { value: "98%", label: "Quality Rate" }
    ],

    Travel: [
      { value: "500+", label: "Destinations" },
      { value: "10k+", label: "Happy Travelers" },
      { value: "4.9/5", label: "Average Rating" }
    ],

    Blog: [
      { value: "1000+", label: "Posts" },
      { value: "50k+", label: "Readers" },
      { value: "200+", label: "Authors" }
    ],
  };

  // ===== BRAND NAMES =====
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

  const brandName = brandByCategory[category] || `${category} Platform`;

  // ===== HERO TITLES =====
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

  // ===== CTA TITLES =====
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

  // ===== CTA TEXTS =====
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

  // ===== TESTIMONIALS =====
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

  // ===== RETOUR =====
  return {
    title: brandName,
    heroTitle:cleanPrompt.split(" ").slice(0, 6).join(" "),
    heroText:cleanPrompt,
    services: SERVICES_BY_CATEGORY[category] || SERVICES_BY_CATEGORY.Corporate,

    stats: STATS_BY_CATEGORY[category] || STATS_BY_CATEGORY.Corporate,

    testimonials: testimonialsByCategory[category] || [
      "Professional service and strong results|Client"
    ],

    ctaTitle: ctaTitleByCategory[category] || `Ready to Build Your ${category} Platform?`,

    ctaText: ctaTextByCategory[category] || "Create a modern digital presence with AI."
  };
};