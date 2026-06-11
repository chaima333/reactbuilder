import { v4 as uuidv4 } from "uuid";
import type { Block } from "../types/page.types";
import {
  extractLayoutStyles,
  extractTypographyStyles
} from "../runtime/importers/css/extractStyleProps";
import {
  getLocalVisualContext,
  resolveInheritedBackground,
  resolveInheritedSectionSpacing
} from "../runtime/importers/design/visualContext";
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
  category?: string;
  title: string;
  description?: string;
  meta?: string;
  source?: string;
  time?: string;
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

const getComputedSnapshot = (
  element?: HTMLElement | null
) => {
  if (!element) {
    return null;
  }

  const computed =
    (
      element.ownerDocument.defaultView ||
      window
    ).getComputedStyle(
      element
    );

  return {
    background:
      computed.background,
    backgroundColor:
      computed.backgroundColor,
    padding:
      computed.padding,
    paddingTop:
      computed.paddingTop,
    paddingBottom:
      computed.paddingBottom,
    maxWidth:
      computed.maxWidth,
    width:
      computed.width,
    fontSize:
      computed.fontSize,
    lineHeight:
      computed.lineHeight,
    gap:
      computed.gap,
    minHeight:
      computed.minHeight,
    border:
      computed.border,
    borderRadius:
      computed.borderRadius
  };
};

const normalizeCss = (
  value: unknown
) =>
  String(value || "")
    .replace(/\s+/g, "")
    .toLowerCase();

const isTransparentBackground = (
  value: unknown
) => {
  const normalized =
    normalizeCss(
      value
    );

  return (
    !normalized ||
    normalized === "transparent" ||
    normalized === "none" ||
    normalized === "rgba(0,0,0,0)" ||
    normalized === "rgb(0,0,0,0)"
  );
};

const isMeaningfulSpacingValue = (
  value: unknown
) => {
  const normalized =
    normalizeCss(
      value
    );

  return (
    !!normalized &&
    normalized !== "0" &&
    normalized !== "0px" &&
    normalized !== "0px0px" &&
    normalized !== "0px0px0px0px" &&
    normalized !== "initial" &&
    normalized !== "inherit" &&
    normalized !== "unset"
  );
};

const parseRgb = (
  value: unknown
) => {
  const match =
    String(value || "")
      .match(
        /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/
      );

  if (!match) {
    return null;
  }

  return {
    r:
      Number(match[1]),
    g:
      Number(match[2]),
    b:
      Number(match[3]),
    a:
      match[4] === undefined
        ? 1
        : Number(match[4])
  };
};

const isDarkBackground = (
  value: unknown
) => {
  const color =
    parseRgb(
      value
    );

  if (
    !color ||
    color.a <= 0
  ) {
    return false;
  }

  const luminance =
    (
      color.r * 0.2126 +
      color.g * 0.7152 +
      color.b * 0.0722
    );

  return luminance < 80;
};

const findNearestDarkBackground = (
  element?: HTMLElement | null
) => {
  let current =
    element?.parentElement || null;

  while (current) {
    const computed =
      (
        current.ownerDocument.defaultView ||
        window
      ).getComputedStyle(
        current
      );

    const background =
      computed.backgroundColor ||
      computed.background;

    if (
      isDarkBackground(
        background
      )
    ) {
      return background;
    }

    current =
      current.parentElement;
  }

  return "";
};

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
      item.category
        ? createTextBlock(
            item.category,
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
                      ".cat, [class*='cat']"
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
      (item.source || item.time)
        ? {
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
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "12px",
                  width: "100%"
                },
                tablet: {},
                mobile: {}
              }
            },
            children: [
              item.source
                ? {
                    id: uuidv4(),
                    type: "flexItem" as const,
                    data: {
                      props: {},
                      style: {
                        desktop: {
                          flex: "1 1 auto",
                          minWidth: "0"
                        },
                        tablet: {},
                        mobile: {}
                      }
                    },
                    children: [
                      createTextBlock(
                        item.source,
                        {
                          fontSize: "12px",
                          fontWeight: "600"
                        },
                        cardElement
                          ? extractTypographyStyles(
                              (
                                cardElement.querySelector(
                                  ".meta, [class*='meta']"
                                ) as HTMLElement | null
                              ) || cardElement
                            )
                          : undefined
                      )
                    ]
                  }
                : null,
              item.time
                ? {
                    id: uuidv4(),
                    type: "flexItem" as const,
                    data: {
                      props: {},
                      style: {
                        desktop: {
                          flex: "0 0 auto"
                        },
                        tablet: {},
                        mobile: {}
                      }
                    },
                    children: [
                      createTextBlock(
                        item.time,
                        {
                          fontSize: "12px",
                          fontWeight: "600",
                          textAlign: "right"
                        },
                        cardElement
                          ? extractTypographyStyles(
                              (
                                cardElement.querySelector(
                                  "time, .time, [class*='time'], .date, [class*='date'], [class*='min']"
                                ) as HTMLElement | null
                              ) || cardElement
                            )
                          : undefined
                      )
                    ]
                  }
                : null
            ].filter(
              (child): child is Block =>
                child !== null
            )
          }
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

  const emittedSectionStyle =
    mergePresetDesktopStyle(
      {},
      sectionStyle,
      filterSectionStyle
    );

  const emittedGridStyle =
    mergePresetDesktopStyle(
      {
        display: "grid",
        gridTemplateColumns:
          `repeat(${Math.min(items.length, 3)}, minmax(0,1fr))`,
        gap: "24px"
      },
      gridStyle,
      filterGridStyle
    );

  const firstCardElement =
    cardElements[0];

  const firstCardComputed =
    getComputedSnapshot(
      firstCardElement
    );

  const emittedFirstCardStyle =
    mergePresetDesktopStyle(
      {
        padding: "28px",
        borderRadius: "18px",
        border: "1px solid rgba(255,255,255,0.12)",
        display: "flex",
        flexDirection: "column",
        gap: "14px"
      },
      firstCardElement
        ? extractLayoutStyles(
            firstCardElement
          )
        : undefined,
      filterCardStyle
    );

  const emittedTitleStyle =
    sectionTitleElement
      ? mergePresetDesktopStyle(
          {
            fontSize: "40px",
            fontWeight: "800",
            lineHeight: "1.15"
          },
          extractTypographyStyles(
            sectionTitleElement
          ),
          filterTextStyle
        )
      : undefined;

  const emittedDescriptionStyle =
    descriptionElement
      ? mergePresetDesktopStyle(
          {
            fontSize: "16px",
            lineHeight: "1.7",
            maxWidth: "720px"
          },
          extractTypographyStyles(
            descriptionElement
          ),
      filterTextStyle
    )
      : undefined;

  const sectionBackgroundBefore =
    emittedSectionStyle.desktop?.background ||
    emittedSectionStyle.desktop?.backgroundColor;

  const localVisualContext =
    getLocalVisualContext(
      claimedElement
    );

  const inheritedBackground =
    resolveInheritedBackground(
      claimedElement
    );

  const inheritedSpacing =
    resolveInheritedSectionSpacing(
      claimedElement
    );

  const shouldApplyInheritedBackground =
    isTransparentBackground(
      sectionBackgroundBefore
    ) &&
    !!inheritedBackground;

  const sourceSectionDesktop =
    sectionStyle?.desktop || {};

  const hasExplicitLocalSpacing =
    [
      sourceSectionDesktop.padding,
      sourceSectionDesktop.paddingTop,
      sourceSectionDesktop.paddingBottom,
      sourceSectionDesktop.paddingLeft,
      sourceSectionDesktop.paddingRight
    ].some(
      isMeaningfulSpacingValue
    );

  const shouldApplyInheritedSpacing =
    !hasExplicitLocalSpacing &&
    !!inheritedSpacing;

  const finalSectionStyle =
    {
      ...emittedSectionStyle,
      desktop: {
        ...emittedSectionStyle.desktop,
        ...(shouldApplyInheritedBackground
          ? {
              background:
                inheritedBackground?.background,
              backgroundColor:
                inheritedBackground?.backgroundColor,
              backgroundImage:
                inheritedBackground?.backgroundImage
            }
          : {}),
        ...(shouldApplyInheritedSpacing
          ? {
              padding:
                inheritedSpacing?.padding,
              paddingTop:
                inheritedSpacing?.paddingTop,
              paddingBottom:
                inheritedSpacing?.paddingBottom,
              paddingLeft:
                inheritedSpacing?.paddingLeft,
              paddingRight:
                inheritedSpacing?.paddingRight
            }
          : {})
      }
    };

  console.log(
    "INSIGHTS_VISUAL_CONTEXT_APPLIED",
    {
      localBackground:
        localVisualContext
          ? {
              background:
                localVisualContext.background,
              backgroundColor:
                localVisualContext.backgroundColor,
              backgroundImage:
                localVisualContext.backgroundImage
            }
          : null,
      inheritedBackground,
      appliedBackground:
        shouldApplyInheritedBackground
          ? {
              background:
                inheritedBackground?.background,
              backgroundColor:
                inheritedBackground?.backgroundColor,
              backgroundImage:
                inheritedBackground?.backgroundImage
            }
          : null,
      localSpacing:
        localVisualContext?.spacing || null,
      inheritedSpacing,
      appliedSpacing:
        shouldApplyInheritedSpacing
          ? {
              padding:
                inheritedSpacing?.padding,
              paddingTop:
                inheritedSpacing?.paddingTop,
              paddingBottom:
                inheritedSpacing?.paddingBottom,
              paddingLeft:
                inheritedSpacing?.paddingLeft,
              paddingRight:
                inheritedSpacing?.paddingRight
            }
          : null
    }
  );

  console.log(
    "INSIGHTS_VISUAL_REPORT",
    {
      sectionBackground:
        finalSectionStyle.desktop?.background ||
        finalSectionStyle.desktop?.backgroundColor,
      sectionPadding:
        finalSectionStyle.desktop?.padding ||
        [
          finalSectionStyle.desktop?.paddingTop,
          finalSectionStyle.desktop?.paddingRight,
          finalSectionStyle.desktop?.paddingBottom,
          finalSectionStyle.desktop?.paddingLeft
        ]
          .filter(Boolean)
          .join(" "),
      titleFontSize:
        emittedTitleStyle?.desktop?.fontSize,
      titleMaxWidth:
        emittedTitleStyle?.desktop?.maxWidth,
      descriptionMaxWidth:
        emittedDescriptionStyle?.desktop?.maxWidth,
      gridGap:
        emittedGridStyle.desktop?.gap ||
        emittedGridStyle.desktop?.columnGap ||
        emittedGridStyle.desktop?.rowGap,
      cardWidth:
        emittedFirstCardStyle.desktop?.width,
      cardMinHeight:
        emittedFirstCardStyle.desktop?.minHeight,
      cardPadding:
        emittedFirstCardStyle.desktop?.padding ||
        [
          emittedFirstCardStyle.desktop?.paddingTop,
          emittedFirstCardStyle.desktop?.paddingRight,
          emittedFirstCardStyle.desktop?.paddingBottom,
          emittedFirstCardStyle.desktop?.paddingLeft
        ]
          .filter(Boolean)
          .join(" "),
      cardBackground:
        emittedFirstCardStyle.desktop?.background ||
        emittedFirstCardStyle.desktop?.backgroundColor,
      cardBorder:
        emittedFirstCardStyle.desktop?.border,
      cardBorderRadius:
        emittedFirstCardStyle.desktop?.borderRadius,
      sourceComputed: {
        section:
          getComputedSnapshot(
            claimedElement
          ),
        grid:
          getComputedSnapshot(
            gridElement
          ),
        firstCard:
          firstCardComputed,
        title:
          getComputedSnapshot(
            sectionTitleElement
          ),
        description:
          getComputedSnapshot(
            descriptionElement
          )
      }
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
        ...finalSectionStyle
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
