import { PageService } from "../pages/services/page.service";
import { GeneratedPage } from "./ai.types";
import { PageBlock } from "../pages/types/page.types";

const makeId = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 9)}`;

const responsiveStyle = (desktop: Record<string, any> = {}) => ({
  desktop,
  tablet: {},
  mobile: {}
});

export class AiService {
  static generateMockPage(prompt: string, title?: string): GeneratedPage {
    const pageTitle = title || "AI Generated Home";

    const blocks: PageBlock[] = [
      {
        id: makeId("section"),
        type: "section",
        data: {
          props: {},
          style: responsiveStyle({
            padding: "80px 40px",
            backgroundColor: "#ffffff"
          })
        },
        children: [
          {
            id: makeId("title"),
            type: "title",
            data: {
              props: {
                text: pageTitle
              },
              style: responsiveStyle({
                fontSize: "48px",
                fontWeight: "700",
                textAlign: "center",
                marginBottom: "16px"
              })
            },
            children: []
          },
          {
            id: makeId("text"),
            type: "text",
            data: {
              props: {
                text: `Generated from prompt: ${prompt}`
              },
              style: responsiveStyle({
                fontSize: "18px",
                textAlign: "center",
                marginBottom: "24px"
              })
            },
            children: []
          },
          {
            id: makeId("button"),
            type: "button",
            data: {
              props: {
                label: "Get Started"
              },
              style: responsiveStyle({
                display: "block",
                margin: "0 auto"
              })
            },
            children: []
          }
        ]
      }
    ];

    return {
      title: pageTitle,
      blocks
    };
  }

  static async generatePage(siteId: number, userId: number, prompt: string, title?: string) {
    if (!prompt?.trim()) {
      throw new Error("PROMPT_REQUIRED");
    }

    const generated = this.generateMockPage(prompt, title);

    const result = await PageService.createPage(siteId, userId, {
      title: generated.title,
      blocks: generated.blocks
    });

    return result.data;
  }
}