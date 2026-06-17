// ai.templates.ts  — ملف واحد يحتوي كل الـ config

export interface SectionConfig {
  title: string;
  text: string;
  cta: string;
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

export const CATEGORY_TEMPLATES: Record<string, TemplateConfig> = {
  Medical: {
    defaultTitle: "Medical Appointment Platform",
    sections: [
      {
        title: "Book Trusted Medical Consultations Online",
        text: "A modern healthcare platform for clinics, doctors and patients to manage appointments, consultations and care access.",
        cta: "Book Appointment",
        style: { backgroundColor: "#f0f9ff", color: "#0f172a", titleSize: "54px" }
      },
      {
        title: "Healthcare Services",
        text: "Online appointments, doctor profiles, patient consultation requests, telemedicine support and clinic communication tools.",
        cta: "Explore Services",
        style: { titleSize: "38px" }
      }
    ]
  },

  Finance: {
    defaultTitle: "Finance Advisory",
    sections: [
      {
        title: "Finance the Visionary. Build the Future.",
        text: "A strategic finance and technology advisory platform helping institutions, investors and governments structure ambitious projects.",
        cta: "Request Advisory",
        style: { backgroundColor: "#020b18", color: "#ffffff", titleSize: "56px" }
      },
      {
        title: "Strategic Services",
        text: "Project financing, digital finance, AI transformation and advisory services designed for ambitious organizations.",
        cta: "Explore Services",
        style: { titleSize: "38px" }
      }
    ]
  },

  Restaurant: {
    defaultTitle: "Restaurant Website",
    sections: [
      {
        title: "Welcome to Our Table",
        text: "Discover our menu, reserve your table, and experience a culinary journey like no other.",
        cta: "View Menu",
        style: { backgroundColor: "#1a1a2e", color: "#f8f9fa", titleSize: "56px" }
      },
      {
        title: "Our Specialties",
        text: "From farm to table, every dish is crafted with passion and the finest ingredients.",
        cta: "Book a Table",
        style: { titleSize: "38px" }
      }
    ]
  },

  Ecommerce: {
    defaultTitle: "Online Store",
    sections: [
      {
        title: "Shop the Latest Collection",
        text: "Discover premium products curated just for you. Fast shipping and secure checkout.",
        cta: "Shop Now",
        style: { backgroundColor: "#0f172a", color: "#ffffff", titleSize: "54px" }
      },
      {
        title: "Featured Products",
        text: "Browse our bestsellers and exclusive deals before they're gone.",
        cta: "View All Products",
        style: { titleSize: "38px" }
      }
    ]
  },

  Education: {
    defaultTitle: "Education Platform",
    sections: [
      {
        title: "Learn, Grow, Succeed",
        text: "Empowering minds through innovative education. Courses, resources, and expert guidance.",
        cta: "Explore Courses",
        style: { backgroundColor: "#f0fdf4", color: "#064e3b", titleSize: "54px" }
      },
      {
        title: "Our Programs",
        text: "From coding to creativity, find the perfect course to accelerate your career.",
        cta: "View Programs",
        style: { titleSize: "38px" }
      }
    ]
  },

  Portfolio: {
    defaultTitle: "Portfolio",
    sections: [
      {
        title: "Creative Vision, Bold Execution",
        text: "A curated showcase of projects, designs, and ideas that define excellence.",
        cta: "View Portfolio",
        style: { backgroundColor: "#fefce8", color: "#0f172a", titleSize: "56px" }
      },
      {
        title: "Featured Work",
        text: "Explore a selection of projects that push boundaries and inspire innovation.",
        cta: "See All Work",
        style: { titleSize: "38px" }
      }
    ]
  },

  Agency: {
    defaultTitle: "Agency Website",
    sections: [
      {
        title: "We Build Brands That Matter",
        text: "A full-service creative agency crafting digital experiences, strategies, and campaigns.",
        cta: "Start a Project",
        style: { backgroundColor: "#1e1b4b", color: "#ffffff", titleSize: "56px" }
      },
      {
        title: "Our Services",
        text: "Branding, web design, marketing, and content creation tailored to your goals.",
        cta: "Explore Services",
        style: { titleSize: "38px" }
      }
    ]
  },

  Consulting: {
    defaultTitle: "Consulting Firm",
    sections: [
      {
        title: "Strategic Solutions for Complex Challenges",
        text: "We partner with leaders to drive transformation, optimize operations, and achieve sustainable growth.",
        cta: "Get in Touch",
        style: { backgroundColor: "#0c4a6e", color: "#ffffff", titleSize: "52px" }
      },
      {
        title: "Our Expertise",
        text: "Strategy, operations, technology, and organizational change delivered with precision.",
        cta: "Learn More",
        style: { titleSize: "38px" }
      }
    ]
  },

  Technology: {
    defaultTitle: "Technology Company",
    sections: [
      {
        title: "Innovating the Future",
        text: "Building next-generation solutions in AI, cloud, and software development.",
        cta: "See Our Work",
        style: { backgroundColor: "#020617", color: "#ffffff", titleSize: "56px" }
      },
      {
        title: "Tech Solutions",
        text: "From machine learning to scalable infrastructure, we deliver cutting-edge technology.",
        cta: "Explore Solutions",
        style: { titleSize: "38px" }
      }
    ]
  },

  Corporate: {
    defaultTitle: "Corporate Website",
    sections: [
      {
        title: "",                          // سيُملأ من prompt أو title
        text: "",                           // سيُملأ من prompt
        cta: "Get Started",
        style: { backgroundColor: "#f8fafc", color: "#0f172a", titleSize: "48px" }
      },
      {
        title: "Our Commitments",
        text: "Excellence, integrity, and innovation drive everything we do.",
        cta: "About Us",
        style: { titleSize: "38px" }
      }
    ]
  }
};