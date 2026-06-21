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
      category === "Finance"
        ? "GlobalFinance"
        : category === "Medical"
          ? "MediCare"
          : category === "Technology"
            ? "TechNova"
            : "SmartBusiness",
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
            : "modern",
    needsPricing,
    needsIntegrations,
    needsBooking
  };
};