import { PageService } from "../pages/services/page.service";
import { GeneratedPage } from "./ai.types";
import { PageBlock } from "../pages/types/page.types";

const ML_SERVICE_URL =
  process.env.ML_SERVICE_URL || "http://localhost:5000";

const makeId = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 9)}`;

const responsiveStyle = (desktop: Record<string, any> = {}) => ({
  desktop,
  tablet: {},
  mobile: {}
});

const titleBlock = (text: string, style: Record<string, any> = {}): PageBlock => ({
  id: makeId("title"),
  type: "title",
  data: {
    props: {
  content: text,
  text
},
    style: responsiveStyle({
      fontSize: "44px",
      fontWeight: "800",
      textAlign: "center",
      marginBottom: "16px",
      ...style
    })
  },
  children: []
});

const textBlock = (text: string, style: Record<string, any> = {}): PageBlock => ({
  id: makeId("text"),
  type: "text",
  data: {
    props: { text },
    style: responsiveStyle({
      fontSize: "18px",
      textAlign: "center",
      marginBottom: "24px",
      ...style
    })
  },
  children: []
});

const buttonBlock = (label: string): PageBlock => ({
  id: makeId("button"),
  type: "button",
  data: {
    props: { label },
    style: responsiveStyle({
      display: "block",
      margin: "0 auto"
    })
  },
  children: []
});
const flexItemBlock = (children: PageBlock[]): PageBlock => ({
  id: makeId("flex-item"),
  type: "flexItem",
  data: {
    props: {},
    style: responsiveStyle({
      width: "100%"
    })
  },
  children
});

const flexBlock = (children: PageBlock[]): PageBlock => ({
  id: makeId("flex"),
  type: "flex",
  data: {
    props: {},
    style: responsiveStyle({
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "16px",
      width: "100%"
    })
  },
  children
});

const sectionBlock = (
  children: PageBlock[],
  style: Record<string, any> = {}
): PageBlock => ({
  id: makeId("section"),
  type: "section",
  data: {
    props: {},
    style: responsiveStyle({
      padding: "80px 40px",
      backgroundColor: "#ffffff",
      ...style
    })
  },
  children: [
    flexBlock(
      children.map((child) =>
        flexItemBlock([child])
      )
    )
  ]
});

export class AiService {
  // Hedhi tsob l category mel ML model mte3na
  private static async predictCategory(prompt: string): Promise<string> {
    console.log("ML_SERVICE_URL_USED", ML_SERVICE_URL);

    try {
      const response = await fetch(`${ML_SERVICE_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt })
      });

      console.log("ML_RESPONSE_STATUS", response.status);

      if (!response.ok) {
        console.error("ML service returned error status:", response.status);
        // Ki yfout service ML, najmou naamlou fallback ala default
        return "Corporate";
      }

      const result = await response.json();
      console.log("ML_RESPONSE_BODY", result);

      // Nta9ou mel result w nsob category
      return result.category || "Corporate";
    } catch (error) {
      console.error("ML service error:", error);
      // Ki yfout error f connection, nraj3ou Corporate par défaut
      return "Corporate";
    }
  }

  // Template mte3 Finance
  static generateFinanceTemplate(prompt: string, title?: string): GeneratedPage {
    const pageTitle = title || "Finance Advisory";

    const blocks: PageBlock[] = [
      sectionBlock(
        [
          titleBlock("Finance the Visionary. Build the Future.", {
            fontSize: "56px"
          }),
          textBlock(
            "A strategic finance and technology advisory platform helping institutions, investors and governments structure ambitious projects."
          ),
          buttonBlock("Request Advisory")
        ],
        {
          backgroundColor: "#020b18",
          color: "#ffffff"
        }
      ),
      sectionBlock([
        titleBlock("Strategic Services", {
          fontSize: "38px"
        }),
        textBlock("Project financing, digital finance, AI transformation and advisory services designed for ambitious organizations."),
        buttonBlock("Explore Services")
      ])
    ];

    return {
      title: pageTitle,
      blocks
    };
  }

  // Template mte3 Medical
  static generateMedicalTemplate(prompt: string, title?: string): GeneratedPage {
    const pageTitle = title || "Medical Appointment Platform";

    const blocks: PageBlock[] = [
      sectionBlock(
        [
          titleBlock("Book Trusted Medical Consultations Online", {
            fontSize: "54px"
          }),
          textBlock(
            "A modern healthcare platform for clinics, doctors and patients to manage appointments, consultations and care access."
          ),
          buttonBlock("Book Appointment")
        ],
        {
          backgroundColor: "#f0f9ff",
          color: "#0f172a"
        }
      ),
      sectionBlock([
        titleBlock("Healthcare Services", {
          fontSize: "38px"
        }),
        textBlock(
          "Online appointments, doctor profiles, patient consultation requests, telemedicine support and clinic communication tools."
        ),
        buttonBlock("Explore Services")
      ])
    ];

    return {
      title: pageTitle,
      blocks
    };
  }

  // Template mte3 Restaurant
  static generateRestaurantTemplate(prompt: string, title?: string): GeneratedPage {
    const pageTitle = title || "Restaurant Website";

    const blocks: PageBlock[] = [
      sectionBlock(
        [
          titleBlock("Welcome to Our Table", {
            fontSize: "56px"
          }),
          textBlock(
            "Discover our menu, reserve your table, and experience a culinary journey like no other."
          ),
          buttonBlock("View Menu")
        ],
        {
          backgroundColor: "#1a1a2e",
          color: "#f8f9fa"
        }
      ),
      sectionBlock([
        titleBlock("Our Specialties", {
          fontSize: "38px"
        }),
        textBlock("From farm to table, every dish is crafted with passion and the finest ingredients."),
        buttonBlock("Book a Table")
      ])
    ];

    return {
      title: pageTitle,
      blocks
    };
  }

  // Template mte3 Ecommerce
  static generateEcommerceTemplate(prompt: string, title?: string): GeneratedPage {
    const pageTitle = title || "Online Store";

    const blocks: PageBlock[] = [
      sectionBlock(
        [
          titleBlock("Shop the Latest Collection", {
            fontSize: "54px"
          }),
          textBlock(
            "Discover premium products curated just for you. Fast shipping and secure checkout."
          ),
          buttonBlock("Shop Now")
        ],
        {
          backgroundColor: "#0f172a",
          color: "#ffffff"
        }
      ),
      sectionBlock([
        titleBlock("Featured Products", {
          fontSize: "38px"
        }),
        textBlock("Browse our bestsellers and exclusive deals before they're gone."),
        buttonBlock("View All Products")
      ])
    ];

    return {
      title: pageTitle,
      blocks
    };
  }

  // Template mte3 Education
  static generateEducationTemplate(prompt: string, title?: string): GeneratedPage {
    const pageTitle = title || "Education Platform";

    const blocks: PageBlock[] = [
      sectionBlock(
        [
          titleBlock("Learn, Grow, Succeed", {
            fontSize: "54px"
          }),
          textBlock(
            "Empowering minds through innovative education. Courses, resources, and expert guidance."
          ),
          buttonBlock("Explore Courses")
        ],
        {
          backgroundColor: "#f0fdf4",
          color: "#064e3b"
        }
      ),
      sectionBlock([
        titleBlock("Our Programs", {
          fontSize: "38px"
        }),
        textBlock("From coding to creativity, find the perfect course to accelerate your career."),
        buttonBlock("View Programs")
      ])
    ];

    return {
      title: pageTitle,
      blocks
    };
  }

  // Template mte3 Portfolio
  static generatePortfolioTemplate(prompt: string, title?: string): GeneratedPage {
    const pageTitle = title || "Portfolio";

    const blocks: PageBlock[] = [
      sectionBlock(
        [
          titleBlock("Creative Vision, Bold Execution", {
            fontSize: "56px"
          }),
          textBlock(
            "A curated showcase of projects, designs, and ideas that define excellence."
          ),
          buttonBlock("View Portfolio")
        ],
        {
          backgroundColor: "#fefce8",
          color: "#0f172a"
        }
      ),
      sectionBlock([
        titleBlock("Featured Work", {
          fontSize: "38px"
        }),
        textBlock("Explore a selection of projects that push boundaries and inspire innovation."),
        buttonBlock("See All Work")
      ])
    ];

    return {
      title: pageTitle,
      blocks
    };
  }

  // Template mte3 Agency
  static generateAgencyTemplate(prompt: string, title?: string): GeneratedPage {
    const pageTitle = title || "Agency Website";

    const blocks: PageBlock[] = [
      sectionBlock(
        [
          titleBlock("We Build Brands That Matter", {
            fontSize: "56px"
          }),
          textBlock(
            "A full-service creative agency crafting digital experiences, strategies, and campaigns."
          ),
          buttonBlock("Start a Project")
        ],
        {
          backgroundColor: "#1e1b4b",
          color: "#ffffff"
        }
      ),
      sectionBlock([
        titleBlock("Our Services", {
          fontSize: "38px"
        }),
        textBlock("Branding, web design, marketing, and content creation tailored to your goals."),
        buttonBlock("Explore Services")
      ])
    ];

    return {
      title: pageTitle,
      blocks
    };
  }

  // Template mte3 Consulting
  static generateConsultingTemplate(prompt: string, title?: string): GeneratedPage {
    const pageTitle = title || "Consulting Firm";

    const blocks: PageBlock[] = [
      sectionBlock(
        [
          titleBlock("Strategic Solutions for Complex Challenges", {
            fontSize: "52px"
          }),
          textBlock(
            "We partner with leaders to drive transformation, optimize operations, and achieve sustainable growth."
          ),
          buttonBlock("Get in Touch")
        ],
        {
          backgroundColor: "#0c4a6e",
          color: "#ffffff"
        }
      ),
      sectionBlock([
        titleBlock("Our Expertise", {
          fontSize: "38px"
        }),
        textBlock("Strategy, operations, technology, and organizational change delivered with precision."),
        buttonBlock("Learn More")
      ])
    ];

    return {
      title: pageTitle,
      blocks
    };
  }

  // Template mte3 Technology
  static generateTechnologyTemplate(prompt: string, title?: string): GeneratedPage {
    const pageTitle = title || "Technology Company";

    const blocks: PageBlock[] = [
      sectionBlock(
        [
          titleBlock("Innovating the Future", {
            fontSize: "56px"
          }),
          textBlock(
            "Building next-generation solutions in AI, cloud, and software development."
          ),
          buttonBlock("See Our Work")
        ],
        {
          backgroundColor: "#020617",
          color: "#ffffff"
        }
      ),
      sectionBlock([
        titleBlock("Tech Solutions", {
          fontSize: "38px"
        }),
        textBlock("From machine learning to scalable infrastructure, we deliver cutting-edge technology."),
        buttonBlock("Explore Solutions")
      ])
    ];

    return {
      title: pageTitle,
      blocks
    };
  }

  // Template par défaut (Corporate)
  static generateCorporateTemplate(prompt: string, title?: string): GeneratedPage {
    const pageTitle = title || "Corporate Website";

    const blocks: PageBlock[] = [
      sectionBlock(
        [
          titleBlock(pageTitle, {
            fontSize: "48px"
          }),
          textBlock(
            prompt || "A modern corporate platform built for clarity, impact, and growth."
          ),
          buttonBlock("Get Started")
        ],
        {
          backgroundColor: "#f8fafc",
          color: "#0f172a"
        }
      ),
      sectionBlock([
        titleBlock("Our Commitments", {
          fontSize: "38px"
        }),
        textBlock("Excellence, integrity, and innovation drive everything we do."),
        buttonBlock("About Us")
      ])
    ];

    return {
      title: pageTitle,
      blocks
    };
  }

  // Sélection du template selon la catégorie
  static generateTemplateByCategory(
    category: string,
    prompt: string,
    title?: string
  ): GeneratedPage {
    console.log("AI_TEMPLATE_SELECTED", category);
    switch (category) {
      case "Finance":
        return this.generateFinanceTemplate(prompt, title);
      case "Medical":
        return this.generateMedicalTemplate(prompt, title);
      case "Restaurant":
        return this.generateRestaurantTemplate(prompt, title);
      case "Ecommerce":
        return this.generateEcommerceTemplate(prompt, title);
      case "Education":
        return this.generateEducationTemplate(prompt, title);
      case "Portfolio":
        return this.generatePortfolioTemplate(prompt, title);
      case "Agency":
        return this.generateAgencyTemplate(prompt, title);
      case "Consulting":
        return this.generateConsultingTemplate(prompt, title);
      case "Technology":
        return this.generateTechnologyTemplate(prompt, title);
      case "Corporate":
      default:
        return this.generateCorporateTemplate(prompt, title);
    }
  }

  // Fonction principale li tsob category w tgeneri page
  
  static async generatePage(
    siteId: number,
    userId: number,
    prompt: string,
    title?: string
  ) {
    console.log("🚨 BACKEND_FILE_VERSION", "AI_SERVICE_LOCAL_2026_06_17");
    console.log("AI_SERVICE_VERSION", "ML_INTEGRATION_V1");
    if (!prompt?.trim()) {
      throw new Error("PROMPT_REQUIRED");
    }

    // Nsob category mel prompt mte3na
    const category = await this.predictCategory(prompt);

    console.log("AI_ML_CATEGORY", {
      prompt,
      category
    });

    // Ngeneri page selon category
    const generated = this.generateTemplateByCategory(
      category,
      prompt,
      title
    );

    // Nsave f base
    const result = await PageService.createPage(siteId, userId, {
      title: generated.title,
      blocks: generated.blocks
    });

    return result.data;
  }
}