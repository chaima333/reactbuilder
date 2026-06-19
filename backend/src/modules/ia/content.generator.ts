export const generateAiContent = (
  category: string,
  prompt: string
) => {
  const cleanPrompt =
    prompt.trim().replace(/\s+/g, " ");
const SERVICES_BY_CATEGORY = {
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
  ]
};

const STATS_BY_CATEGORY = {
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
  ]
};
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
    Corporate: "NovaCorp"
  };

  const brandName =
    brandByCategory[category] || `${category} Platform`;
return {
  title: brandName,

  heroTitle:
  category === "Finance"
    ? "Smart Financial Advisory For Growing Businesses"
    : category === "Medical"
      ? "Modern Healthcare Made Simple"
      : category === "Technology"
        ? "Build Smarter Digital Products"
        : `Modern ${category} Solutions`,
  heroText:
    `A modern ${category.toLowerCase()} solution designed for professional digital experiences.`,

  services:
    SERVICES_BY_CATEGORY[category] ||
    SERVICES_BY_CATEGORY.Corporate,

  stats:
    STATS_BY_CATEGORY[category] ||
    STATS_BY_CATEGORY.Corporate,

    testimonials:
  category === "Finance"
    ? [
        "Helped us structure funding faster|Startup Founder",
        "Clear financial strategy and strong execution|Investment Director",
        "Reliable advisory for long-term growth|CEO"
      ]
    : category === "Medical"
      ? [
          "Reduced appointment workload significantly|Clinic Manager",
          "Patients can book consultations easily|Dr Ahmed",
          "Simple platform for daily clinic operations|Healthcare Admin"
        ]
      : [
          "Professional service and strong results|Client"
        ],

ctaTitle:
  category === "Finance"
    ? "Ready to Grow Your Financial Strategy?"
    : category === "Medical"
      ? "Ready to Modernize Your Clinic?"
      : `Ready to Build Your ${category} Platform?`,

ctaText:
  category === "Finance"
    ? "Start planning smarter funding and investment decisions today."
    : category === "Medical"
      ? "Launch your digital healthcare experience today."
      : "Create a modern digital presence with AI."
};
};