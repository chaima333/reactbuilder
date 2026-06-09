import { v4 as uuidv4 } from "uuid";
import type { Block } from "../types/page.types";
import {
  extractLayoutStyles,
  extractTypographyStyles
} from "../runtime/importers/css/extractStyleProps";
import {
  applySectionTitleScale,
  filterCardStyle,
  filterGridStyle,
  filterSectionStyle,
  filterTextStyle,
  mergePresetDesktopStyle
} from "./styleFilters";
import {
  extractTitleSegments
} from "../runtime/importers/html/typography/extractTitleSegments";

interface InsightItemPayload {
  title: string;
  description?: string;
  meta?: string;
  href?: string;
  ctaLabel?: string;
}

interface InsightsPresetPayload {
  title?: string;
  description?: string;
  actions?: Array<{
    label?: string;
    href?: string;
  }>;
  items?: InsightItemPayload[];
  claimedNode?: {
    element?: HTMLElement;
  };
}

const desktopOf = (
  style: any
) =>
  style?.desktop || style || {};

const defaultItems: InsightItemPayload[] = [
  {
    title: "Market intelligence",
    description: "Perspective on the signals shaping the next cycle."
  },
  {
    title: "Research brief",
    description: "A concise read on strategy, risk, and opportunity."
  },
  {
    title: "Field note",
    description: "What operators and investors are watching now."
  }
];

const createTextBlock = (
  content: string,
  style: Record<string, any>,
  extractedStyle?: any
): Block => ({
  id: uuidv4(),
  type: "text" as const,
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
  style: Record<string, any>,
  extractedStyle?: any,
  sourceElement?: HTMLElement | null,
  semanticType?: string
): Block => ({
  id: uuidv4(),
  type: "title" as const,
  data: {
    props: {
      content,
      level: "h3",
      segments:
        extractTitleSegments(
          sourceElement
        )
    },
    style: {
      ...(
        semanticType
          ? applySectionTitleScale(
              mergePresetDesktopStyle(
                style,
                extractedStyle,
                filterTextStyle
              ),
              extractedStyle,
              semanticType
            )
          : mergePresetDesktopStyle(
              style,
              extractedStyle,
              filterTextStyle
            )
      )
    }
  },
  children: []
});

const createInsightItem = (
  item: InsightItemPayload,
  cardElement?: HTMLElement
): Block => {
  const actionElement =
    cardElement?.querySelector(
      "a,button"
    ) as HTMLElement | null;

  return {
    id: uuidv4(),
    type: "gridItem" as const,
    data: {
      props: {},
      style: {
        ...mergePresetDesktopStyle(
          {
            padding: "28px",
            borderRadius: "18px",
            border: "1px solid rgba(255,255,255,0.12)",
            display: "flex",
            flexDirection: "column",
            gap: "14px"
          },
          cardElement
            ? extractLayoutStyles(
                cardElement
              )
            : undefined,
          filterCardStyle
        )
      }
    },
    children: [
      item.meta
        ? createTextBlock(
            item.meta,
            {
              fontSize: "12px",
              fontWeight: "700",
              letterSpacing: "0.08em",
              textTransform: "uppercase"
            },
            cardElement
              ? extractTypographyStyles(
                  (
                    cardElement.querySelector(
                      ".meta, time, [class*='meta'], [class*='date'], [class*='category']"
                    ) as HTMLElement | null
                  ) || cardElement
                )
              : undefined
          )
        : null,
      createTitleBlock(
        item.title || "",
        {
          fontSize: "24px",
          fontWeight: "700",
          lineHeight: "1.25"
        },
        cardElement
          ? extractTypographyStyles(
              (
                cardElement.querySelector(
                  "h2,h3,h4"
                ) as HTMLElement | null
              ) || cardElement
            )
          : undefined,
        cardElement?.querySelector(
          "h2,h3,h4"
        ) as HTMLElement | null
      ),
      item.description
        ? createTextBlock(
            item.description,
            {
              fontSize: "15px",
              lineHeight: "1.7"
            },
            cardElement
              ? extractTypographyStyles(
                  (
                    cardElement.querySelector(
                      "p"
                    ) as HTMLElement | null
                  ) || cardElement
                )
              : undefined
          )
        : null,
      item.ctaLabel && actionElement
        ? {
            id: uuidv4(),
            type: "link" as const,
            data: {
              props: {
                label: item.ctaLabel,
                href: item.href || "#"
              },
              style: {
                ...mergePresetDesktopStyle(
                  {
                    fontSize: "14px",
                    fontWeight: "700"
                  },
                  {
                    desktop: {
                      ...desktopOf(
                        extractLayoutStyles(
                          actionElement
                        )
                      ),
                      ...desktopOf(
                        extractTypographyStyles(
                          actionElement
                        )
                      )
                    }
                  },
                  filterTextStyle
                )
              }
            },
            children: []
          }
        : null
    ].filter(
      (child): child is Block =>
        child !== null
    )
  };
};

const createActionBlock = (
  action: {
    label?: string;
    href?: string;
  },
  actionElement?: HTMLElement
): Block => ({
  id: uuidv4(),
  type: "flexItem" as const,
  data: {
    props: {},
    style: {
      desktop: {
        flex: "0 0 auto",
        width: "auto",
        maxWidth: "none"
      },
      tablet: {},
      mobile: {}
    }
  },
  children: [
    {
      id: uuidv4(),
      type: "link" as const,
      data: {
        props: {
          label:
            action.label || "",
          href:
            action.href || "#"
        },
        style: {
          ...mergePresetDesktopStyle(
            {
              fontSize: "14px",
              fontWeight: "700"
            },
            actionElement
              ? {
                  desktop: {
                    ...desktopOf(
                      extractLayoutStyles(
                        actionElement
                      )
                    ),
                    ...desktopOf(
                      extractTypographyStyles(
                        actionElement
                      )
                    )
                  }
                }
              : undefined,
            style => ({
              ...filterCardStyle(
                style
              ),
              ...filterTextStyle(
                style
              )
            })
          )
        }
      },
      children: []
    }
  ]
});

export const generateInsightsPreset = (
  payload?: InsightsPresetPayload
): Block => {
  const items =
    payload?.items?.length
      ? payload.items
      : defaultItems;

  const claimedElement =
    payload?.claimedNode?.element;

  const gridElement =
    claimedElement?.querySelector(
      ".insights-grid, [class*='insights-grid']"
    ) as HTMLElement | null;

  const cardElements =
    Array.from(
      (gridElement || claimedElement)
        ?.querySelectorAll(
          "article.insight, article[class*='insight'], .insight-card, .article-card, .blog-card, .news-card"
        ) || []
    ).filter(
      (element): element is HTMLElement =>
        element.nodeType === 1 &&
        typeof (element as HTMLElement).tagName === "string"
    );

  const sectionStyle =
    claimedElement
      ? extractLayoutStyles(
          claimedElement
        )
      : undefined;

  const gridStyle =
    gridElement
      ? extractLayoutStyles(
          gridElement
        )
      : undefined;

  const sectionTitleElement =
    claimedElement?.querySelector(
      "h1,h2"
    ) as HTMLElement | null;

  const descriptionElement =
    payload?.description
      ? (
          Array.from(
            claimedElement?.querySelectorAll(
              "p"
            ) || []
          ).find(
            element =>
              !cardElements.some(
                card =>
                  card.contains(
                    element
                  )
              )
          ) as HTMLElement | undefined
        )
      : undefined;

  const actions =
    (
      payload?.actions || []
    ).filter(
      action =>
        !!action.label?.trim()
    );

  const actionElements =
    Array.from(
      claimedElement?.querySelectorAll(
        "a,button"
      ) || []
    ).filter(
      (element): element is HTMLElement =>
        element.nodeType === 1 &&
        typeof (element as HTMLElement).tagName === "string" &&
        !!element.textContent?.trim() &&
        !cardElements.some(
          card =>
            card.contains(
              element
            )
        ) &&
        !gridElement?.contains(
          element
        )
    );

  console.log(
    "INSIGHTS_PRESET_ACTIONS_RENDERED",
    {
      payloadActionsCount:
        payload?.actions?.length || 0,
      renderedActionsCount:
        actions.length,
      hasDescription:
        !!payload?.description
    }
  );

  return {
    id: uuidv4(),
    type: "section" as const,
    meta: {
      semanticType: "INSIGHTS_SECTION"
    },
    data: {
      props: {},
      style: {
        ...mergePresetDesktopStyle(
          {},
          sectionStyle,
          filterSectionStyle
        )
      }
    },
    children: [
      {
        id: uuidv4(),
        type: "flex" as const,
        data: {
          props: {},
          style: {
            desktop: {
              display: "flex",
              flexDirection: "column",
              gap: "28px"
            },
            tablet: {},
            mobile: {}
          }
        },
        children: [
          payload?.title
            ? {
                id: uuidv4(),
                type: "flexItem" as const,
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
                  createTitleBlock(
                    payload.title,
                    {
                      fontSize: "40px",
                      fontWeight: "800",
                      lineHeight: "1.15"
                    },
                    sectionTitleElement
                      ? extractTypographyStyles(
                          sectionTitleElement
                        )
                      : undefined,
                    sectionTitleElement,
                    "INSIGHTS_SECTION"
                  )
                ]
              }
            : null,
          payload?.description
            ? {
                id: uuidv4(),
                type: "flexItem" as const,
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
                  createTextBlock(
                    payload.description,
                    {
                      fontSize: "16px",
                      lineHeight: "1.7",
                      maxWidth: "720px"
                    },
                    descriptionElement
                      ? extractTypographyStyles(
                          descriptionElement
                        )
                      : undefined
                  )
                ]
              }
            : null,
          {
            id: uuidv4(),
            type: "flexItem" as const,
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
                id: uuidv4(),
                type: "grid" as const,
                data: {
                  props: {},
                  style: {
                    ...mergePresetDesktopStyle(
                      {
                        display: "grid",
                        gridTemplateColumns:
                          `repeat(${Math.min(items.length, 3)}, minmax(0,1fr))`,
                        gap: "24px"
                      },
                      gridStyle,
                      filterGridStyle
                    )
                  }
                },
                children:
                  items.map(
                    (
                      item,
                      index
                    ) =>
                      createInsightItem(
                        item,
                        cardElements[index]
                      )
                  )
              }
            ]
          },
          actions.length
            ? {
                id: uuidv4(),
                type: "flexItem" as const,
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
                    id: uuidv4(),
                    type: "flex" as const,
                    data: {
                      props: {
                        direction: "row"
                      },
                      style: {
                        desktop: {
                          display: "flex",
                          flexDirection: "row",
                          flexWrap: "wrap",
                          gap: "12px",
                          justifyContent: "flex-start"
                        },
                        tablet: {},
                        mobile: {}
                      }
                    },
                    children:
                      actions.map(
                        (
                          action,
                          index
                        ) =>
                          createActionBlock(
                            action,
                            actionElements[index]
                          )
                      )
                  }
                ]
              }
            : null
        ].filter(Boolean) as Block[]
      }
    ]
  };
};
