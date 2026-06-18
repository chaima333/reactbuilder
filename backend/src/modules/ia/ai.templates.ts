// ai.templates.ts

export type SectionKind =
  | "navbar"
  | "hero"
  | "mission"
  | "features"
  | "services"
  | "testimonial"
  | "cta"
  | "footer";

export interface SectionConfig {
  kind: SectionKind;
  title: string;
  text: string;
  cta?: string;
  items?: string[];
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
        kind: "navbar",
        title: "MediCare",
        text: "",
        cta: "Book Appointment",
        items: ["Home", "Doctors", "Services", "Contact"],
        style: { backgroundColor: "#ffffff", color: "#0f172a" }
      },
      {
        kind: "hero",
        title: "Book Trusted Medical Consultations Online",
        text: "A modern healthcare platform for clinics, doctors and patients.",
        cta: "Book Appointment",
        style: { backgroundColor: "#f0f9ff", color: "#0f172a", titleSize: "54px" }
      },
      {
        kind: "mission",
        title: "Simplifying Access to Care",
        text: "We help clinics manage appointments, patients and consultations from one digital platform."
      },
      {
        kind: "features",
        title: "Key Features",
        text: "Everything clinics need to improve patient experience.",
        items: ["Doctor profiles", "Online appointments", "Telemedicine", "Patient requests"]
      },
      {
        kind: "services",
        title: "Healthcare Services",
        text: "Digital tools for modern private clinics.",
        items: ["Appointment booking", "Clinic communication", "Patient management"]
      },
      {
        kind: "testimonial",
        title: "Trusted by Healthcare Teams",
        text: "A reliable solution designed for better care coordination."
      },
      {
        kind: "cta",
        title: "Ready to modernize your clinic?",
        text: "Launch your digital appointment experience today.",
        cta: "Get Started"
      },
      {
        kind: "footer",
        title: "FinCapital",
        text: "© 2026 MediCare. All rights reserved.",
        items: ["Privacy Policy", "Terms of Service", "Contact"],
        style: { backgroundColor: "#0f172a" }
      }
    ]
  },

  Finance: {
    defaultTitle: "Finance Advisory",
    sections: [
      {
        kind: "navbar",
        title: "FinCapital",
        text: "",
        cta: "Request Advisory",
        items: ["Home", "Services", "About", "Contact"],
        style: { backgroundColor: "#020b18", color: "#ffffff" }
      },
      {
        kind: "hero",
        title: "Finance the Visionary. Build the Future.",
        text: "A strategic finance and technology advisory platform helping institutions, investors and governments structure ambitious projects.",
        cta: "Request Advisory",
        style: { backgroundColor: "#020b18", color: "#ffffff", titleSize: "56px" }
      },
      {
        kind: "mission",
        title: "Strategic Services",
        text: "Project financing, digital finance, AI transformation and advisory services designed for ambitious organizations.",
        cta: "Explore Services",
        style: { titleSize: "38px" }
      },
      {
        kind: "features",
        title: "Key Capabilities",
        text: "We deliver financial solutions that drive growth.",
        items: ["Project financing", "Digital finance", "AI transformation", "Advisory services"]
      },
      {
        kind: "cta",
        title: "Ready to transform your financial strategy?",
        text: "Let's build the future together.",
        cta: "Contact Us"
      },
      {
        kind: "footer",
        title: "FinCapital",
        text: "© 2026 FinCapital. All rights reserved.",
        items: ["Privacy Policy", "Terms", "Contact"],
        style: { backgroundColor: "#020b18" }
      }
    ]
  },

  Restaurant: {
    defaultTitle: "Restaurant Website",
    sections: [
      {
        kind: "navbar",
        title: "Gourmet",
        text: "",
        cta: "Book a Table",
        items: ["Home", "Menu", "About", "Contact"],
        style: { backgroundColor: "#1a1a2e", color: "#f8f9fa" }
      },
      {
        kind: "hero",
        title: "Welcome to Our Table",
        text: "Discover our menu, reserve your table, and experience a culinary journey like no other.",
        cta: "View Menu",
        style: { backgroundColor: "#1a1a2e", color: "#f8f9fa", titleSize: "56px" }
      },
      {
        kind: "features",
        title: "Our Specialties",
        text: "From farm to table, every dish is crafted with passion and the finest ingredients.",
        items: ["Fresh ingredients", "Seasonal menu", "Chef's specials", "Wine pairings"]
      },
      {
        kind: "services",
        title: "Dining Experiences",
        text: "Whether it's a romantic dinner or a family gathering, we have the perfect setting.",
        items: ["Private dining", "Catering", "Outdoor seating", "Takeaway"]
      },
      {
        kind: "testimonial",
        title: "What Our Guests Say",
        text: "We take pride in delivering unforgettable dining experiences."
      },
      {
        kind: "cta",
        title: "Reserve Your Table",
        text: "Book your dining experience with us today.",
        cta: "Book a Table"
      },
      {
        kind: "footer",
        title: "FinCapital",
        text: "© 2026 Gourmet Restaurant.",
        items: ["Privacy", "Terms", "Contact"],
        style: { backgroundColor: "#1a1a2e" }
      }
    ]
  },

  Ecommerce: {
    defaultTitle: "Online Store",
    sections: [
      {
        kind: "navbar",
        title: "ShopVerse",
        text: "",
        cta: "Shop Now",
        items: ["Home", "Products", "Deals", "Contact"],
        style: { backgroundColor: "#0f172a", color: "#ffffff" }
      },
      {
        kind: "hero",
        title: "Shop the Latest Collection",
        text: "Discover premium products curated just for you. Fast shipping and secure checkout.",
        cta: "Shop Now",
        style: { backgroundColor: "#0f172a", color: "#ffffff", titleSize: "54px" }
      },
      {
        kind: "features",
        title: "Featured Products",
        text: "Browse our bestsellers and exclusive deals before they're gone.",
        items: ["Bestsellers", "Exclusive deals", "New arrivals", "Limited editions"]
      },
      {
        kind: "services",
        title: "Why Shop With Us",
        text: "We make online shopping easy, secure, and enjoyable.",
        items: ["Fast shipping", "Secure checkout", "Easy returns", "24/7 support"]
      },
      {
        kind: "testimonial",
        title: "What Our Customers Say",
        text: "Join thousands of satisfied customers who love our products."
      },
      {
        kind: "cta",
        title: "Ready to Upgrade Your Style?",
        text: "Explore our collection and find your perfect match.",
        cta: "View All Products"
      },
      {
        kind: "footer",
        title: "FinCapital",
        text: "© 2026 ShopVerse. All rights reserved.",
        items: ["Privacy", "Terms", "Contact"],
        style: { backgroundColor: "#0f172a" }
      }
    ]
  },

  Education: {
    defaultTitle: "Education Platform",
    sections: [
      {
        kind: "navbar",
        title: "EduFuture",
        text: "",
        cta: "Get Started",
        items: ["Home", "Courses", "About", "Contact"],
        style: { backgroundColor: "#ffffff", color: "#064e3b" }
      },
      {
        kind: "hero",
        title: "Learn, Grow, Succeed",
        text: "Empowering minds through innovative education. Courses, resources, and expert guidance.",
        cta: "Explore Courses",
        style: { backgroundColor: "#f0fdf4", color: "#064e3b", titleSize: "54px" }
      },
      {
        kind: "mission",
        title: "Our Mission",
        text: "To make quality education accessible to everyone, everywhere."
      },
      {
        kind: "features",
        title: "Our Programs",
        text: "From coding to creativity, find the perfect course to accelerate your career.",
        items: ["Coding bootcamps", "Creative arts", "Business skills", "Language learning"]
      },
      {
        kind: "services",
        title: "Learning Resources",
        text: "We provide everything you need to succeed in your learning journey.",
        items: ["Video tutorials", "Interactive exercises", "Expert mentors", "Community forums"]
      },
      {
        kind: "cta",
        title: "Start Your Learning Journey",
        text: "Join thousands of students who are changing their lives through education.",
        cta: "Get Started"
      },
      {
        kind: "footer",
        title: "FinCapital",
        text: "© 2026 EduFuture. All rights reserved.",
        items: ["Privacy", "Terms", "Contact"],
        style: { backgroundColor: "#064e3b" }
      }
    ]
  },

  Portfolio: {
    defaultTitle: "Portfolio",
    sections: [
      {
        kind: "navbar",
        title: "Creative Studio",
        text: "",
        cta: "Get in Touch",
        items: ["Home", "Work", "About", "Contact"],
        style: { backgroundColor: "#ffffff", color: "#0f172a" }
      },
      {
        kind: "hero",
        title: "Creative Vision, Bold Execution",
        text: "A curated showcase of projects, designs, and ideas that define excellence.",
        cta: "View Portfolio",
        style: { backgroundColor: "#fefce8", color: "#0f172a", titleSize: "56px" }
      },
      {
        kind: "mission",
        title: "My Approach",
        text: "Every project is a story. I bring ideas to life through design and innovation."
      },
      {
        kind: "features",
        title: "Featured Work",
        text: "Explore a selection of projects that push boundaries and inspire innovation.",
        items: ["Web design", "Branding", "Photography", "Illustration"]
      },
      {
        kind: "services",
        title: "What I Do",
        text: "I create visual experiences that connect brands with their audience.",
        items: ["UI/UX design", "Graphic design", "Creative direction", "Digital art"]
      },
      {
        kind: "testimonial",
        title: "What Clients Say",
        text: "Working with clients who trust my vision is what drives me forward."
      },
      {
        kind: "cta",
        title: "Let's Create Something Amazing",
        text: "Have a project in mind? Let's bring it to life together.",
        cta: "Get in Touch"
      },
      {
        kind: "footer",
        title: "FinCapital",
        text: "© 2026 Creative Studio.",
        items: ["Privacy", "Terms", "Contact"],
        style: { backgroundColor: "#0f172a" }
      }
    ]
  },

  Agency: {
    defaultTitle: "Agency Website",
    sections: [
      {
        kind: "navbar",
        title: "AgencyX",
        text: "",
        cta: "Start a Project",
        items: ["Home", "Services", "Work", "Contact"],
        style: { backgroundColor: "#1e1b4b", color: "#ffffff" }
      },
      {
        kind: "hero",
        title: "We Build Brands That Matter",
        text: "A full-service creative agency crafting digital experiences, strategies, and campaigns.",
        cta: "Start a Project",
        style: { backgroundColor: "#1e1b4b", color: "#ffffff", titleSize: "56px" }
      },
      {
        kind: "mission",
        title: "Our Mission",
        text: "To help brands tell their story and connect with audiences in meaningful ways."
      },
      {
        kind: "features",
        title: "Our Services",
        text: "Branding, web design, marketing, and content creation tailored to your goals.",
        items: ["Branding", "Web design", "Marketing", "Content creation"]
      },
      {
        kind: "services",
        title: "How We Work",
        text: "We combine creativity with strategy to deliver results that matter.",
        items: ["Discovery", "Strategy", "Design", "Launch"]
      },
      {
        kind: "testimonial",
        title: "Client Success Stories",
        text: "We've helped hundreds of brands achieve their goals and grow their business."
      },
      {
        kind: "cta",
        title: "Ready to Build Your Brand?",
        text: "Let's collaborate and create something extraordinary.",
        cta: "Contact Us"
      },
      {
        kind: "footer",
        title: "FinCapital",
        text: "© 2026 AgencyX. All rights reserved.",
        items: ["Privacy", "Terms", "Contact"],
        style: { backgroundColor: "#1e1b4b" }
      }
    ]
  },

  Consulting: {
    defaultTitle: "Consulting Firm",
    sections: [
      {
        kind: "navbar",
        title: "ConsultPro",
        text: "",
        cta: "Get in Touch",
        items: ["Home", "Expertise", "About", "Contact"],
        style: { backgroundColor: "#0c4a6e", color: "#ffffff" }
      },
      {
        kind: "hero",
        title: "Strategic Solutions for Complex Challenges",
        text: "We partner with leaders to drive transformation, optimize operations, and achieve sustainable growth.",
        cta: "Get in Touch",
        style: { backgroundColor: "#0c4a6e", color: "#ffffff", titleSize: "52px" }
      },
      {
        kind: "mission",
        title: "Our Approach",
        text: "We combine deep industry expertise with innovative thinking to solve your most complex problems."
      },
      {
        kind: "features",
        title: "Our Expertise",
        text: "Strategy, operations, technology, and organizational change delivered with precision.",
        items: ["Strategy", "Operations", "Technology", "Organizational change"]
      },
      {
        kind: "services",
        title: "How We Help",
        text: "From assessment to execution, we guide you every step of the way.",
        items: ["Assessment", "Strategy", "Implementation", "Optimization"]
      },
      {
        kind: "testimonial",
        title: "What Our Clients Say",
        text: "We're proud to partner with organizations that are shaping the future."
      },
      {
        kind: "cta",
        title: "Ready to Transform Your Organization?",
        text: "Let's discuss how we can help you achieve your goals.",
        cta: "Schedule a Consultation"
      },
      {
        kind: "footer",
        title: "FinCapital",
        text: "© 2026 ConsultPro. All rights reserved.",
        items: ["Privacy", "Terms", "Contact"],
        style: { backgroundColor: "#0c4a6e" }
      }
    ]
  },

  Technology: {
    defaultTitle: "Technology Company",
    sections: [
      {
        kind: "navbar",
        title: "TechNova",
        text: "",
        cta: "Contact Us",
        items: ["Home", "Solutions", "About", "Contact"],
        style: { backgroundColor: "#020617", color: "#ffffff" }
      },
      {
        kind: "hero",
        title: "Innovating the Future",
        text: "Building next-generation solutions in AI, cloud, and software development.",
        cta: "See Our Work",
        style: { backgroundColor: "#020617", color: "#ffffff", titleSize: "56px" }
      },
      {
        kind: "mission",
        title: "Our Vision",
        text: "To build technology that transforms industries and improves lives."
      },
      {
        kind: "features",
        title: "Tech Solutions",
        text: "From machine learning to scalable infrastructure, we deliver cutting-edge technology.",
        items: ["Machine learning", "Cloud infrastructure", "Software development", "Data analytics"]
      },
      {
        kind: "services",
        title: "What We Build",
        text: "We create solutions that are scalable, secure, and built for the future.",
        items: ["AI platforms", "Cloud services", "Custom software", "DevOps tools"]
      },
      {
        kind: "testimonial",
        title: "Trusted by Innovators",
        text: "We work with companies that are pushing the boundaries of what's possible."
      },
      {
        kind: "cta",
        title: "Ready to Innovate?",
        text: "Let's build the future together.",
        cta: "Contact Our Team"
      },
      {
        kind: "footer",
        title: "FinCapital",
        text: "© 2026 TechNova. All rights reserved.",
        items: ["Privacy", "Terms", "Contact"],
        style: { backgroundColor: "#020617" }
      }
    ]
  },

  Corporate: {
    defaultTitle: "Corporate Website",
    sections: [
      {
        kind: "navbar",
        title: "CorpGlobal",
        text: "",
        cta: "About Us",
        items: ["Home", "About", "Services", "Contact"],
        style: { backgroundColor: "#ffffff", color: "#0f172a" }
      },
      {
        kind: "hero",
        title: "FinCapital",
        text: "",
        cta: "Get Started",
        style: { backgroundColor: "#f8fafc", color: "#0f172a", titleSize: "48px" }
      },
      {
        kind: "mission",
        title: "Our Commitments",
        text: "Excellence, integrity, and innovation drive everything we do."
      },
      {
        kind: "features",
        title: "Core Values",
        text: "We are guided by principles that shape our culture and impact.",
        items: ["Excellence", "Integrity", "Innovation", "Sustainability"]
      },
      {
        kind: "cta",
        title: "Partner With Us",
        text: "Let's work together to build something meaningful.",
        cta: "About Us"
      },
      {
        kind: "footer",
        title: "FinCapital",
        text: "© 2026 CorpGlobal. All rights reserved.",
        items: ["Privacy", "Terms", "Contact"],
        style: { backgroundColor: "#0f172a" }
      }
    ]
  }
};