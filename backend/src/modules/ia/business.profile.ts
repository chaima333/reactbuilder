import { AiPageType, SiteContext } from "./ai.types";

export interface BusinessProfile {
  industry: string;
  companyName: string;
  services: string[];
  audience: string[];
  keywords: string[];
  tone: string;
  needsPricing: boolean;
  needsIntegrations: boolean;
  needsBooking: boolean;
}

const unique = (items: string[]) =>
  Array.from(new Set(items.filter(Boolean)));

const includesAny = (text: string, words: string[]) =>
  words.some((word) => text.includes(word));
const extractCompanyName = (
  prompt: string
): string | null => {
  const patterns = [
    /\bcalled\s+([A-Z][A-Za-z0-9&.-]*(?:\s+[A-Z][A-Za-z0-9&.-]*){0,2})/,
    /\bnamed\s+([A-Z][A-Za-z0-9&.-]*(?:\s+[A-Z][A-Za-z0-9&.-]*){0,2})/,
    /\bfor\s+([A-Z][A-Za-z0-9&.-]*(?:\s+[A-Z][A-Za-z0-9&.-]*){0,2})/,
    /\bcompany\s+([A-Z][A-Za-z0-9&.-]*(?:\s+[A-Z][A-Za-z0-9&.-]*){0,2})/
  ];

  for (const pattern of patterns) {
    const match = prompt.match(pattern);

    if (match?.[1]) {
      return match[1].trim();
    }
  }

  return null;
};

const fallbackCompanyName = (
  category: string
): string =>
  category === "Finance"
    ? "GlobalFinance"
    : category === "Medical"
      ? "MediCare"
      : category === "Technology"
        ? "TechNova"
        : category === "Cybersecurity"
          ? "SecureShield"
          : category === "RealEstate"
            ? "HomeHaven"
            : "SmartBusiness";

export const buildBusinessProfile = (
  category: string,
  prompt: string
): BusinessProfile => {
  const text = prompt.toLowerCase();

  const services: string[] = [];
  const audience: string[] = [];
  const keywords: string[] = [];

  if (category === "Finance") {
    if (includesAny(text, ["investment", "advisory"])) {
      services.push("Investment Advisory");
    }

    if (includesAny(text, ["wealth", "portfolio"])) {
      services.push("Wealth Management");
    }

    if (includesAny(text, ["risk"])) {
      services.push("Risk Management");
    }

    if (includesAny(text, ["capital", "fundraising", "raise capital"])) {
      services.push("Capital Raising");
    }

    if (includesAny(text, ["project financing", "infrastructure"])) {
      services.push("Project Financing");
    }
  }

  if (category === "Medical") {
    if (includesAny(text, ["appointment", "booking"])) {
      services.push("Appointment Booking");
    }

    if (includesAny(text, ["doctor", "clinic"])) {
      services.push("Doctor Management");
    }

    if (includesAny(text, ["telemedicine", "consultation"])) {
      services.push("Telemedicine");
    }

    if (includesAny(text, ["patient", "record"])) {
      services.push("Patient Records");
    }
  }

  if (category === "Technology") {
    if (includesAny(text, ["ai", "automation"])) {
      services.push("AI Automation");
    }

    if (includesAny(text, ["cloud", "infrastructure"])) {
      services.push("Cloud Infrastructure");
    }

    if (includesAny(text, ["api", "integration"])) {
      services.push("API Integrations");
    }

    if (includesAny(text, ["saas", "platform"])) {
      services.push("SaaS Platform");
    }
  }
  if (category === "Cybersecurity") {
  if (includesAny(text, ["penetration", "pentest", "testing"])) {
    services.push("Penetration Testing");
  }

  if (includesAny(text, ["soc", "monitoring", "siem"])) {
    services.push("SOC Monitoring");
  }

  if (includesAny(text, ["cloud"])) {
    services.push("Cloud Security");
  }

  if (includesAny(text, ["network", "protection"])) {
    services.push("Network Protection");
  }

  if (includesAny(text, ["compliance", "audit"])) {
    services.push("Compliance Audits");
  }

  if (includesAny(text, ["incident", "response"])) {
    services.push("Incident Response");
  }
}
  if (category === "RealEstate") {
  if (includesAny(text, ["property", "properties", "listing", "listings"])) {
    services.push("Property Listings");
  }

  if (includesAny(text, ["rental", "rent", "tenant", "landlord"])) {
    services.push("Rental Management");
  }

  if (includesAny(text, ["investment", "investor", "roi"])) {
    services.push("Real Estate Investment");
  }

  if (includesAny(text, ["valuation", "market analysis"])) {
    services.push("Property Valuation");
  }

  if (includesAny(text, ["villa", "apartment", "home", "house"])) {
    services.push("Residential Properties");
  }
}

  if (includesAny(text, ["enterprise", "corporation", "companies"])) {
    audience.push("Enterprises");
  }

  if (includesAny(text, ["startup", "startups"])) {
    audience.push("Startups");
  }

  if (includesAny(text, ["government", "governments"])) {
    audience.push("Government Organizations");
  }

  if (includesAny(text, ["investor", "investors"])) {
    audience.push("Investors");
  }

  if (includesAny(text, ["patient", "patients"])) {
    audience.push("Patients");
  }

  if (includesAny(text, ["student", "students", "learners"])) {
    audience.push("Students");
  }
 
  if (category === "RealEstate") {
  if (includesAny(text, ["buyer", "buyers", "home", "house", "apartment", "villa"])) {
    audience.push("Property Buyers");
  }

  if (includesAny(text, ["seller", "sellers", "owner", "owners", "landlord"])) {
    audience.push("Property Owners");
  }

  if (includesAny(text, ["investor", "investors", "investment"])) {
    audience.push("Real Estate Investors");
  }

  if (includesAny(text, ["tenant", "rental", "rent"])) {
    audience.push("Tenants");
  }
}
  const needsPricing =
    includesAny(text, ["pricing", "price", "plans", "subscription"]);

  const needsIntegrations =
    includesAny(text, ["integration", "integrations", "api", "connect"]);

  const needsBooking =
    includesAny(text, ["booking", "appointment", "reservation"]);

  keywords.push(
    ...text
      .split(/[\s,.;:!?()]+/)
      .filter((word) => word.length > 4)
      .slice(0, 12)
  );

  return {
    industry: category,
    companyName:
  extractCompanyName(prompt) ??
  fallbackCompanyName(category),
    services:
      unique(services).length > 0
        ? unique(services)
        : ["Professional Services", "Strategic Consulting", "Digital Solutions"],
    audience:
      unique(audience).length > 0
        ? unique(audience)
        : ["Businesses", "Professionals"],
    keywords: unique(keywords),
   tone:
  category === "Finance"
    ? "professional"
    : category === "Medical"
      ? "trustworthy"
      : category === "Technology"
        ? "innovative"
        : category === "RealEstate"
          ? "premium"
          : "modern",
    needsPricing,
    needsIntegrations,
    needsBooking
  };
};
export const buildSiteContext = (
  category: string,
  prompt: string,
  businessProfile: BusinessProfile
): SiteContext => {
  const pages: AiPageType[] = [
    "home",
    "about",
    "services",
    "contact"
  ];

  if (businessProfile.needsPricing) {
    pages.push("pricing");
  }

  if (businessProfile.needsIntegrations) {
    pages.push("integrations");
  }

  if (businessProfile.needsBooking) {
    pages.push("reservation");
  }

 if (
  category === "Technology" ||
  category === "Finance" ||
  category === "Corporate" ||
  category === "Cybersecurity"
) {
  pages.push("solutions");
}

  return {
    companyName: businessProfile.companyName,
    category,
    audience: businessProfile.audience,
    tone: businessProfile.tone,
    services: businessProfile.services,
    cta: businessProfile.needsBooking
      ? "Book Now"
      : category === "Finance"
        ? "Request a Consultation"
        : category === "Medical"
          ? "Book an Appointment"
          : category === "Technology"
            ? "Start Your Project"
            : "Get a Consultation",
    pages: Array.from(new Set(pages)),
    keywords: businessProfile.keywords
  };
};