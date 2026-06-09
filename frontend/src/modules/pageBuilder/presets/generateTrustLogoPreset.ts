import { v4 as uuidv4 } from "uuid";
import type {
  Block
} from "../types/page.types";
import type {
  TrustLogoSectionPayload
} from "../runtime/importers/html/semanticContracts/TrustLogoSectionPayload";
import {
  extractLayoutStyles,
  extractTypographyStyles
} from "../runtime/importers/css/extractStyleProps";
import {
  applySectionTitleScale,
  filterCardStyle,
  filterSectionStyle,
  filterTextStyle,
  mergePresetDesktopStyle
} from "./styleFilters";
import {
  extractTitleSegments
} from "../runtime/importers/html/typography/extractTitleSegments";

const createTextBlock = (
  content: string,
  style: Record<string, any>,
  extractedStyle?: any
): Block => ({
  id:
    uuidv4(),
  type:
    "text" as const,
  data: {
    props: {
      content
    },
    style: {
      ...mergePresetDesktopStyle(
        style,
        extractedStyle,
        filterTextStyle
      )
    }
  },
  children: []
});

const createTitleBlock = (
  content: string,
  extractedStyle?: any,
  sourceElement?: HTMLElement | null
): Block => ({
  id:
    uuidv4(),
  type:
    "title" as const,
  data: {
    props: {
      content,
      level:
        "h2",
      segments:
        extractTitleSegments(
          sourceElement
        )
    },
    style: {
      ...applySectionTitleScale(
        mergePresetDesktopStyle(
          {
            fontSize: "40px",
            fontWeight: "800",
            lineHeight: "1.15",
            textAlign: "center"
          },
          extractedStyle,
          filterTextStyle
        ),
        extractedStyle,
        "TRUST_LOGO_SECTION"
      )
    }
  },
  children: []
});

export const generateTrustLogoPreset = (
  payload?: TrustLogoSectionPayload
): Block => {
  const claimedElement =
    payload?.claimedNode?.element;

  const sourceNode =
    payload?.sourceNode ||
    (
      claimedElement?.querySelector(
        ".partners-row, .partners, .logos, .logo-cloud, .clients, .references"
      ) as HTMLElement | null
    );

  const logoElements =
    sourceNode
      ? Array.from(
          sourceNode.children
        ).filter(
          (child): child is HTMLElement =>
            child.nodeType === 1 &&
            typeof (child as HTMLElement).tagName ===
              "string"
        )
      : [];

  const titleElement =
    claimedElement?.querySelector(
      "h1,h2,h3"
    ) as HTMLElement | null;

  const descriptionElement =
    claimedElement?.querySelector(
      "p"
    ) as HTMLElement | null;

  const eyebrowElement =
    claimedElement?.querySelector(
      ".section-tag, .eyebrow, [class*='eyebrow'], [class*='tag']"
    ) as HTMLElement | null;

  const items =
    payload?.items || [];

  console.log(
    "TRUST_LOGO_PRESET",
    {
      title:
        payload?.title,
      itemCount:
        items.length,
      claimedClassName:
        claimedElement?.getAttribute("class") || "",
      sourceClassName:
        sourceNode?.getAttribute("class") || ""
    }
  );

  return {
    id:
      uuidv4(),
    type:
      "section" as const,
    meta: {
      semanticType:
        "TRUST_LOGO_SECTION"
    },
    data: {
      props: {},
      style: {
        ...mergePresetDesktopStyle(
          {
            paddingTop: "72px",
            paddingBottom: "72px",
            paddingLeft: "24px",
            paddingRight: "24px"
          },
          claimedElement
            ? extractLayoutStyles(
                claimedElement
              )
            : undefined,
          filterSectionStyle
        )
      }
    },
    children: [
      {
        id:
          uuidv4(),
        type:
          "flex" as const,
        data: {
          props: {},
          style: {
            desktop: {
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "28px",
              width: "100%",
              maxWidth: "1180px",
              marginLeft: "auto",
              marginRight: "auto"
            },
            tablet: {},
            mobile: {}
          }
        },
        children: [
          {
            id:
              uuidv4(),
            type:
              "flexItem" as const,
            data: {
              props: {},
              style: {
                desktop: {
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "12px"
                },
                tablet: {},
                mobile: {}
              }
            },
            children: [
              payload?.eyebrow
                ? createTextBlock(
                    payload.eyebrow,
                    {
                      fontSize: "12px",
                      fontWeight: "700",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      textAlign: "center"
                    },
                    eyebrowElement
                      ? extractTypographyStyles(
                          eyebrowElement
                        )
                      : undefined
                  )
                : null,
              payload?.title
                ? createTitleBlock(
                    payload.title,
                    titleElement
                      ? extractTypographyStyles(
                          titleElement
                        )
                      : undefined,
                    titleElement
                  )
                : null,
              payload?.description
                ? createTextBlock(
                    payload.description,
                    {
                      fontSize: "16px",
                      lineHeight: "1.7",
                      maxWidth: "720px",
                      textAlign: "center"
                    },
                    descriptionElement
                      ? extractTypographyStyles(
                          descriptionElement
                        )
                      : undefined
                  )
                : null
            ].filter(
              (child): child is Block =>
                child !== null
            )
          },
          {
            id:
              uuidv4(),
            type:
              "flexItem" as const,
            data: {
              props: {},
              style: {
                desktop: {
                  width: "100%"
                },
                tablet: {},
                mobile: {}
              }
            },
            children: [
              {
                id:
                  uuidv4(),
                type:
                  "flex" as const,
                data: {
                  props: {},
                  style: {
                    ...mergePresetDesktopStyle(
                      {
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        flexWrap: "wrap",
                        gap: "28px"
                      },
                      sourceNode
                        ? extractLayoutStyles(
                            sourceNode
                          )
                        : undefined,
                      filterCardStyle
                    )
                  }
                },
                children:
                  items.map((item, index) => {
                    const logoElement =
                      logoElements[index];

                    return {
                      id:
                        uuidv4(),
                      type:
                        "flexItem" as const,
                      data: {
                        props: {},
                        style: {
                          ...mergePresetDesktopStyle(
                            {
                              width: "auto",
                              flex: "0 0 auto"
                            },
                            logoElement
                              ? extractLayoutStyles(
                                  logoElement
                                )
                              : undefined,
                            filterCardStyle
                          )
                        }
                      },
                      children: [
                        createTextBlock(
                          item.label,
                          {
                            fontSize: "13px",
                            fontWeight: "700",
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            textAlign: "center"
                          },
                          logoElement
                            ? extractTypographyStyles(
                                logoElement
                              )
                            : undefined
                        )
                      ]
                    };
                  })
              }
            ]
          }
        ]
      }
    ]
  };
};
