// frontend/src/modules/pageBuilder/runtime/importers/html/semanticMatchers.ts

import { extractStyleProps } from "../css/extractStyleProps";

export const BLOCK_TYPES = {
  SECTION: "section",
  TITLE: "title",
  TEXT: "text",
  IMAGE: "image",
  BUTTON: "button",
  FEATURES_SECTION: "features"
} as const;

export interface SerializedBlock {
  id?: string;
  type: string;
  data: {
    props?: Record<string, any>;
    style?: Record<string, any>;
    [key: string]: any;
  };
  children?: SerializedBlock[];
}

const generateUniqueId = () =>
  Math.random().toString(36).substring(2, 9);

export const semanticMatchers: any[] = [
  {
    name: "features-section-matcher",

    threshold: 6,

    requiredSignals: [
      "repeated-cards",
      "heading-inside-card",
      "paragraph-inside-card"
    ],

    getScore: (element: HTMLElement): number => {

      const cards =
        element.querySelectorAll(
          ".feature-card, [class*='card'], [class*='item']"
        );

      if (cards.length < 2) {
        return 0;
      }

      let hasHeading = false;
      let hasParagraph = false;

      cards.forEach(card => {

        if (
          card.querySelector(
            "h3, h4, h5, h6"
          )
        ) {
          hasHeading = true;
        }

        if (
          card.querySelector("p")
        ) {
          hasParagraph = true;
        }
      });

      if (!hasHeading || !hasParagraph) {
        return 0;
      }

      let score =
        cards.length * 2;

      if (
        element.className
          .toLowerCase()
          .includes("feature")
      ) {
        score += 3;
      }

      return score;
    },

    compile: (
      element: HTMLElement,
      fallbackCompile: any
    ): any => {

     const directHeader =
  Array.from(element.children)
    .find(child =>
      child.querySelector?.("h1,h2,h3")
    );

const sectionHeaderH2 =
  directHeader
    ?.querySelector("h1,h2,h3")
    ?.textContent || "";

     const sectionHeaderP =
  directHeader
    ?.querySelector("p")
    ?.textContent || "";

      const rawCards =
        element.querySelectorAll(
          ".feature-card, [class*='card'], [class*='item']"
        );

    // =====================================================
// FLEX ITEMS
// =====================================================

const flexItemNodes =
  Array.from(rawCards).map((card: any) => {

    const cardImg =
      card.querySelector("img");

    const cardHeading =
      card.querySelector(
        "h3, h4, h5, h6"
      );

    const cardParagraph =
      card.querySelector("p");

    const extractedCardStyle =
      extractStyleProps(
        card as HTMLElement
      ).desktop || {};

    return {

      id:
        `block-${generateUniqueId()}`,

      type:
        "flexItem",

      data: {

        props: {},

        style: {

          desktop: {

            // =========================
            // SAFE VISUAL TOKENS ONLY
            // =========================

            backgroundColor:
              extractedCardStyle.backgroundColor,

            borderRadius:
              extractedCardStyle.borderRadius,

            color:
              extractedCardStyle.color,

            paddingTop:
              extractedCardStyle.paddingTop,

            paddingBottom:
              extractedCardStyle.paddingBottom,

            paddingLeft:
              extractedCardStyle.paddingLeft,

            paddingRight:
              extractedCardStyle.paddingRight,

            boxSizing:
              "border-box"
          }
        }
      },

      children: [

        ...(cardImg
          ? [
              {
                id:
                  `block-${generateUniqueId()}`,

                type:
                  "image",

                data: {

                  props: {

                    url:
                      cardImg.getAttribute("src") || "",

                    alt:
                      cardImg.getAttribute("alt") || ""
                  },

                  style:
                    extractStyleProps(
                      cardImg as HTMLElement
                    )
                }
              }
            ]
          : []),

        ...(cardHeading
          ? [
              {
                id:
                  `block-${generateUniqueId()}`,

                type:
                  "title",

                data: {

                  props: {

                    content:
                      cardHeading.textContent?.trim() || "",

                    level:
                      "h3"
                  },

                  style:
                    extractStyleProps(
                      cardHeading as HTMLElement
                    )
                }
              }
            ]
          : []),

        ...(cardParagraph
          ? [
              {
                id:
                  `block-${generateUniqueId()}`,

                type:
                  "text",

                data: {

                  props: {

                    content:
                      cardParagraph.textContent?.trim() || ""
                  },

                  style:
                    extractStyleProps(
                      cardParagraph as HTMLElement
                    )
                }
              }
            ]
          : [])
      ]
    };
  });

// =====================================================
// FLEX CONTAINER
// =====================================================

const flexContainerNode = {

  id:
    `block-${generateUniqueId()}`,

  type:
    "flex",

  data: {

    props: {

      direction:
        "row"
    },

    style: {

      desktop: {

        display:
          "flex",

        flexDirection:
          "row",

        flexWrap:
          "wrap",

        justifyContent:
          "center",

        alignItems:
          "stretch",

        gap:
          "24px",

        width:
          "100%",

        boxSizing:
          "border-box"
      }
    }
  },

  children:
    flexItemNodes
};
      // =====================================================
      // ROOT FEATURES BLOCK
      // =====================================================

      return {

        id:
          `block-${generateUniqueId()}`,

        type:
          "features",

        data: {

          props: {

            headline:
              sectionHeaderH2,

            subtext:
              sectionHeaderP
          },

          style: {

            desktop: {

              width:
                "100%",

              maxWidth:
                "1400px",

              marginLeft:
                "auto",

              marginRight:
                "auto",

              paddingTop:
                "60px",

              paddingBottom:
                "60px",

              paddingLeft:
                "20px",

              paddingRight:
                "20px",

              boxSizing:
                "border-box"
            }
          }
        },

        children: [
          flexContainerNode
        ]
      };
    }
  }
];