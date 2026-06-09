// frontend/src/modules/pageBuilder/runtime/importers/html/semanticMatchers.ts
// LEGACY - OLD PIPELINE - NOT SOURCE OF TRUTH

import { extractStyleProps } from "../css/extractStyleProps";

import { createDeterministicId }
from "./createDeterministicId";

export const BLOCK_TYPES = {
  SECTION: "section",
  TITLE: "title",
  TEXT: "text",
  IMAGE: "image",
  BUTTON: "button"
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

export const semanticMatchers: any[] = [

  {

    name:
      "features-section-matcher",

    threshold: 6,

    requiredSignals: [

      "repeated-cards",

      "heading-inside-card",

      "paragraph-inside-card"
    ],

    getScore: (
      element: HTMLElement
    ): number => {

      const cards =
        element.querySelectorAll(
          ".feature-card, [class*='card'], [class*='item']"
        );

      if (cards.length < 2) {
        return 0;
      }

      let hasHeading =
        false;

      let hasParagraph =
        false;

      cards.forEach(card => {

        if (
          card.querySelector(
            "h3, h4, h5, h6"
          )
        ) {

          hasHeading =
            true;
        }

        if (
          card.querySelector("p")
        ) {

          hasParagraph =
            true;
        }
      });

      if (
        !hasHeading ||
        !hasParagraph
      ) {

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
        Array.from(
          element.children
        )

        .find(child =>
          child.querySelector?.(
            "h1,h2,h3"
          )
        );

      const sectionHeaderH2 =
        directHeader
          ?.querySelector(
            "h1,h2,h3"
          )
          ?.textContent || "";

      const sectionHeaderP =
        directHeader
          ?.querySelector("p")
          ?.textContent || "";

      const rawCards =
        element.querySelectorAll(
          ".feature-card, [class*='card'], [class*='item']"
        );

      const flexItemNodes =

        Array.from(rawCards)

          .map(

            (
              card: any,
              index: number
            ) => {

              const cardHeading =
                card.querySelector(
                  "h3, h4, h5, h6"
                );

              const cardParagraph =
                card.querySelector("p");

              return {

                id:
                  createDeterministicId(
                    "flexItem",
                    [index]
                  ),

                type:
                  "flexItem",

                data: {

                  props: {},

                  style: {

                    desktop: {}
                  }
                },

                children: [

                  ...(cardHeading

                    ? [

                        {

                          id:
                            createDeterministicId(
                              "title",
                              [2, index, 0]
                            ),

                          type:
                            "title",

                          data: {

                            props: {

                              content:
                                cardHeading
                                  .textContent
                                  ?.trim() || "",

                              level:
                                "h3"
                            },

                            style: {

                              desktop: {}
                            }
                          },

                          children: []
                        }
                      ]

                    : []),

                  ...(cardParagraph

                    ? [

                        {

                          id:
                            createDeterministicId(
                              "text",
                              [2, index, 1]
                            ),

                          type:
                            "text",

                          data: {

                            props: {

                              content:
                                cardParagraph
                                  .textContent
                                  ?.trim() || ""
                            },

                            style: {

                              desktop: {}
                            }
                          },

                          children: []
                        }
                      ]

                    : [])
                ]
              };
            }
          );

      return {

        id:
          createDeterministicId(
            "section",
            [0]
          ),

        type:
          "section",

        data: {

          props: {},

          style: {

            desktop: {}
          }
        },

        children: [

          ...(sectionHeaderH2

            ? [

                {

                  id:
                    createDeterministicId(
                      "title",
                      [0, 0]
                    ),

                  type:
                    "title",

                  data: {

                    props: {

                      content:
                        sectionHeaderH2,

                      level:
                        "h2"
                    },

                    style: {

                      desktop: {}
                    }
                  },

                  children: []
                }
              ]

            : []),

          ...(sectionHeaderP

            ? [

                {

                  id:
                    createDeterministicId(
                      "text",
                      [0, 1]
                    ),

                  type:
                    "text",

                  data: {

                    props: {

                      content:
                        sectionHeaderP
                    },

                    style: {

                      desktop: {}
                    }
                  },

                  children: []
                }
              ]

            : []),

          {

            id:
              createDeterministicId(
                "flex",
                [0, 2]
              ),

            type:
              "flex",

            data: {

              props: {},

              style: {

                desktop: {}
              }
            },

            children:
              flexItemNodes
          }
        ]
      };
    }
  }
];
