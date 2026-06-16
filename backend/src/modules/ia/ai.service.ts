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
    props: { text },
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
  children
});

export class AiService {
 private static async predictCategory(prompt: string): Promise<string> {
  console.log("ML_SERVICE_URL_USED", ML_SERVICE_URL);

  const response = await fetch(`${ML_SERVICE_URL}/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ prompt })
  });

  console.log("ML_RESPONSE_STATUS", response.status);

  if (!response.ok) {
    throw new Error("ML_SERVICE_ERROR");
  }

  const result = await response.json();

  console.log("ML_RESPONSE_BODY", result);

  return result.category || "Corporate";
}

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

  static generateCorporateTemplate(prompt: string, title?: string): GeneratedPage {
    const pageTitle = title || "Corporate Website";

    const blocks: PageBlock[] = [
      sectionBlock([
        titleBlock(pageTitle),
        textBlock(`Generated from prompt: ${prompt}`),
        buttonBlock("Get Started")
      ])
    ];

    return {
      title: pageTitle,
      blocks
    };
  }

  static generateTemplateByCategory(
    category: string,
    prompt: string,
    title?: string
  ): GeneratedPage {
    switch (category) {
      case "Finance":
        return this.generateFinanceTemplate(prompt, title);

      case "Consulting":
      case "Technology":
      case "Agency":
      case "Corporate":
      default:
        return this.generateCorporateTemplate(prompt, title);
    }
  }

  static async generatePage(
    siteId: number,
    userId: number,
    prompt: string,
    title?: string
  ) {
    console.log("AI_SERVICE_VERSION", "ML_INTEGRATION_V1");
    if (!prompt?.trim()) {
      throw new Error("PROMPT_REQUIRED");
    }

    const category = await this.predictCategory(prompt);

    console.log("AI_ML_CATEGORY", {
      prompt,
      category
    });

    const generated = this.generateTemplateByCategory(
      category,
      prompt,
      title
    );

    const result = await PageService.createPage(siteId, userId, {
      title: generated.title,
      blocks: generated.blocks
    });

    return result.data;
  }
}