import { v4 as uuidv4 } from "uuid";
import type { Block } from "../types/page.types";
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

interface FeatureItemPayload {
  title: string;
  description?: string;
  text?: string;
}

interface FeaturesPresetPayload {
  items?: FeatureItemPayload[];
  claimedNode?: {
    element?: HTMLElement;
  };
  gridNode?: {
    element?: HTMLElement;
  };
  sourceNode?: {
    element?: HTMLElement;
  };
}

const defaultItems: FeatureItemPayload[] = [
  {
    title: "Fast",
    description: "Optimized for high performance."
  },
  {
    title: "Flexible",
    description: "Composable runtime architecture."
  },
  {
    title: "Scalable",
    description: "Built for complex builders."
  }
];

const isHTMLElementLike = (
  element: Element
): element is HTMLElement =>
  element.nodeType === 1 &&
  typeof (element as HTMLElement).tagName === "string";

const getDirectText = (
  element?: Element | null
) =>
  element
    ? Array.from(
        element.childNodes
      )
        .filter(
          node =>
            node.nodeType ===
            Node.TEXT_NODE
        )
        .map(
          node =>
            node.textContent || ""
        )
        .join(" ")
        .replace(/\s+/g, " ")
        .trim()
    : "";

const getText = (
  element?: Element | null
) =>
  element?.textContent
    ?.trim() || "";

const normalizeCssValue = (
  value: unknown
) =>
  String(value || "")
    .replace(/\s+/g, "")
    .toLowerCase();

const isTransparentBackground = (
  value: unknown
) =>
  [
    "",
    "none",
    "transparent",
    "rgba(0,0,0,0)",
    "rgb(0,0,0,0)",
    "initial",
    "inherit",
    "unset"
  ].includes(
    normalizeCssValue(value)
  );

const hasMeaningfulBackground = (
  style: Record<string, any> = {}
) =>
  !isTransparentBackground(
    style.background
  ) ||
  !isTransparentBackground(
    style.backgroundColor
  ) ||
  !isTransparentBackground(
    style.backgroundImage
  );

const getRgbLuminance = (
  value: unknown
) => {
  const match =
    String(value || "")
      .match(
        /rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/i
      );

  if (!match) {
    return null;
  }

  const [r, g, b] =
    match
      .slice(1, 4)
      .map(Number);

  return (
    0.2126 * r +
    0.7152 * g +
    0.0722 * b
  );
};

const styleLooksDark = (
  style: Record<string, any> = {}
) => {
  const backgroundLuminance =
    getRgbLuminance(
      style.backgroundColor
    ) ??
    getRgbLuminance(
      style.background
    );

  if (
    backgroundLuminance !== null &&
    backgroundLuminance < 96
  ) {
    return true;
  }

  const colorLuminance =
    getRgbLuminance(
      style.color
    );

  return (
    hasMeaningfulBackground(
      style
    ) &&
    colorLuminance !== null &&
    colorLuminance > 170
  );
};

const classSuggestsDark = (
  element?: HTMLElement
) =>
  /\b(dark|night|black|navy|glass|inverse)\b/i
    .test(
      element?.getAttribute("class") || ""
    );

const shouldUseDarkFallback = (
  element: HTMLElement | undefined,
  extractedStyle: any
) => {
  const desktop =
    extractedStyle?.desktop ||
    extractedStyle ||
    {};

  return (
    styleLooksDark(
      desktop
    ) ||
    classSuggestsDark(
      element
    )
  );
};

const summarizeBlockTree = (
  block: Block | null,
  depth = 0
): any => {
  if (!block || depth > 4) {
    return null;
  }

  return {
    type:
      block.type,
    content:
      block.data?.props?.content ||
      block.data?.props?.label ||
      block.data?.props?.title ||
      "",
    semanticRole:
      block.data?.props?.semanticRole,
    childCount:
      block.children?.length || 0,
    children:
      (block.children || []).map(
        child =>
          summarizeBlockTree(
            child as Block,
            depth + 1
          )
      )
  };
};

const getFeatureCardElements = (
  element?: HTMLElement
) => {
  if (!element) {
    return [];
  }

  const directCards =
    Array.from(
      element.children
    ).filter(
      (child): child is HTMLElement =>
        isHTMLElementLike(child) &&
        !!child.querySelector(
          "h1,h2,h3,h4,h5,h6"
        )
    );

  if (directCards.length) {
    return directCards;
  }

  return Array.from(
    element.querySelectorAll(
      ".feature-card, .pillar, .pillar-card, [class*='feature'], [class*='pillar']"
    )
  ).filter(
    (child): child is HTMLElement =>
      isHTMLElementLike(child) &&
      child !== element &&
      !!child.querySelector(
        "h1,h2,h3,h4,h5,h6"
      )
  );
};

const getSectionIntroElements = (
  sectionElement?: HTMLElement,
  cardSourceElement?: HTMLElement
) => {
  if (!sectionElement) {
    return {
      eyebrowElement: null,
      titleElement: null,
      descriptionElement: null
    };
  }

  const isInsideCardSource = (
    element?: Element | null
  ) =>
    !!(
      element &&
      cardSourceElement &&
      cardSourceElement.contains(
        element
      )
    );

  const eyebrowElement =
    Array.from(
      sectionElement.querySelectorAll(
        ".section-tag, .eyebrow, [class*='tag']"
      )
    ).find(
      element =>
        !isInsideCardSource(
          element
        )
    ) as HTMLElement | undefined;

  const titleElement =
    Array.from(
      sectionElement.querySelectorAll(
        ".sec-head h1, .sec-head h2, .sec-head h3, h1, h2, h3"
      )
    ).find(
      element =>
        !isInsideCardSource(
          element
        )
    ) as HTMLElement | undefined;

  const descriptionElement =
    Array.from(
      sectionElement.querySelectorAll(
        ".sec-head p, .lead, p"
      )
    ).find(
      element =>
        !isInsideCardSource(
          element
        )
    ) as HTMLElement | undefined;

  return {
    eyebrowElement:
      eyebrowElement || null,
    titleElement:
      titleElement || null,
    descriptionElement:
      descriptionElement || null
  };
};

const createSectionIntro = (
  claimedElement?: HTMLElement,
  cardSourceElement?: HTMLElement
): Block | null => {
  const {
    eyebrowElement,
    titleElement,
    descriptionElement
  } = getSectionIntroElements(
    claimedElement,
    cardSourceElement
  );

  const eyebrowContent =
    getDirectText(
      eyebrowElement
    ) ||
    getText(
      eyebrowElement
    );

  const titleContent =
    getText(
      titleElement
    );

  const descriptionContent =
    getDirectText(
      descriptionElement
    ) ||
    getText(
      descriptionElement
    );

  const titleAccentElement =
    titleElement?.querySelector(
      ".gradient-text, .accent, span"
    ) as HTMLElement | null;

  const titleAccentContent =
    getText(
      titleAccentElement
    );

  const titleBaseContent =
    titleAccentContent
      ? getDirectText(
          titleElement
        )
      : titleContent;

  const titleBlock: Block | null =
    titleContent && titleAccentContent
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
                flexWrap: "wrap",
                gap: "10px",
                alignItems: "baseline"
              },
              tablet: {},
              mobile: {
                flexDirection: "column"
              }
            }
          },
          children: [
            ...(
              titleBaseContent
                ? [
                    {
                      id: uuidv4(),
                      type: "flexItem" as const,
                      data: {
                        props: {},
                        style: {
                          desktop: {},
                          tablet: {},
                          mobile: {}
                        }
                      },
                      children: [
                        {
                          id: uuidv4(),
                          type: "title" as const,
                          data: {
                            props: {
                              content:
                                titleBaseContent,
                              semanticRole: "sectionTitle",
                              typographyToken: "heading-lg"
                            },
                            style: {
                              ...applySectionTitleScale(
                                mergePresetDesktopStyle(
                                  {
                                    fontSize: "42px",
                                    fontWeight: "700",
                                    lineHeight: "1.12",
                                    textAlign: "left"
                                  },
                                  titleElement
                                    ? extractTypographyStyles(
                                        titleElement
                                      )
                                    : undefined,
                                  filterTextStyle
                                ),
                                titleElement
                                  ? extractTypographyStyles(
                                      titleElement
                                    )
                                  : undefined,
                                "FEATURE_PILLARS"
                              )
                            }
                          },
                          children: []
                        }
                      ]
                    }
                  ]
                : []
            ),
            {
              id: uuidv4(),
              type: "flexItem" as const,
              data: {
                props: {},
                style: {
                  desktop: {},
                  tablet: {},
                  mobile: {}
                }
              },
              children: [
                {
                  id: uuidv4(),
                  type: "title" as const,
                  data: {
                    props: {
                      content:
                        titleAccentContent,
                      semanticRole: "sectionTitle",
                      typographyToken: "heading-lg"
                    },
                    style: {
                      ...applySectionTitleScale(
                        mergePresetDesktopStyle(
                          {
                            fontSize: "42px",
                            fontWeight: "700",
                            lineHeight: "1.12",
                            textAlign: "left",
                            background: "linear-gradient(90deg, #1f9bff 0%, #f7b731 100%)",
                            backgroundClip: "text",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            color: "#1f9bff"
                          },
                          titleAccentElement
                            ? extractTypographyStyles(
                                titleAccentElement
                              )
                            : undefined,
                          style => ({
                            ...filterTextStyle(style),
                            background:
                              style.background,
                            backgroundClip:
                              style.backgroundClip,
                            WebkitBackgroundClip:
                              style.WebkitBackgroundClip,
                            WebkitTextFillColor:
                              style.WebkitTextFillColor
                          })
                        ),
                        titleElement
                          ? extractTypographyStyles(
                              titleElement
                            )
                          : undefined,
                        "FEATURE_PILLARS"
                      )
                    }
                  },
                  children: []
                }
              ]
            }
          ]
        }
      : titleContent
        ? {
            id: uuidv4(),
            type: "title" as const,
            data: {
              props: {
                content:
                  titleContent,
                semanticRole: "sectionTitle",
                typographyToken: "heading-lg"
              },
              style: {
                ...applySectionTitleScale(
                  mergePresetDesktopStyle(
                    {
                      fontSize: "42px",
                      fontWeight: "700",
                      lineHeight: "1.12",
                      textAlign: "left"
                    },
                    titleElement
                      ? extractTypographyStyles(
                          titleElement
                        )
                      : undefined,
                    filterTextStyle
                  ),
                  titleElement
                    ? extractTypographyStyles(
                        titleElement
                      )
                    : undefined,
                  "FEATURE_PILLARS"
                )
              }
            },
            children: []
          }
        : null;

  const introChildren: Block[] = [
    eyebrowContent
      ? {
          id: uuidv4(),
          type: "text" as const,
          data: {
            props: {
              content:
                eyebrowContent
            },
            style: {
              ...mergePresetDesktopStyle(
                {
                  fontSize: "12px",
                  fontWeight: "700",
                  letterSpacing: "0.18em",
                  textAlign: "left",
                  display: "inline-flex",
                  width: "fit-content",
                  paddingTop: "8px",
                  paddingBottom: "8px",
                  paddingLeft: "14px",
                  paddingRight: "14px",
                  border: "1px solid rgba(247, 127, 0, 0.45)",
                  borderRadius: "999px",
                  backgroundColor: "rgba(247, 127, 0, 0.08)",
                  color: "#f7b731"
                },
                eyebrowElement
                  ? {
                      desktop: {
                        ...extractLayoutStyles(
                          eyebrowElement
                        ).desktop,
                        ...extractTypographyStyles(
                          eyebrowElement
                        ).desktop
                      }
                    }
                  : undefined,
                style => ({
                  ...filterCardStyle(style),
                  ...filterTextStyle(style)
                })
              )
            }
          },
          children: []
        }
      : null,
    titleBlock,
    descriptionContent
      ? {
          id: uuidv4(),
          type: "text" as const,
          data: {
            props: {
              content:
                descriptionContent
            },
            style: {
              ...mergePresetDesktopStyle(
                {
                  fontSize: "16px",
                  fontWeight: "400",
                  lineHeight: "1.7",
                  textAlign: "left"
                },
                descriptionElement
                  ? extractTypographyStyles(
                      descriptionElement
                    )
                  : undefined,
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
  );

  if (!introChildren.length) {
    return null;
  }

  return {
    id: uuidv4(),
    type: "flex" as const,
    data: {
      props: {
        direction: "column"
      },
      style: {
        desktop: {
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          marginBottom: "42px"
        },
        tablet: {},
        mobile: {}
      }
    },
    children: [
      {
        id: uuidv4(),
        type: "flexItem" as const,
        data: {
          props: {},
          style: {
            desktop: {
              width: "100%",
              maxWidth: "820px"
            },
            tablet: {},
            mobile: {}
          }
        },
        children:
          introChildren
      }
    ]
  };
};

const getChipElements = (
  cardElement?: HTMLElement
) =>
  cardElement
    ? Array.from(
        cardElement.querySelectorAll(
          ".tags span, .chip, .tag, .pill"
        )
      ).filter(
        (element): element is HTMLElement =>
          isHTMLElementLike(element) &&
          !element.matches(".sub") &&
          !!getText(element)
      )
    : [];

const createChipList = (
  chipElements: HTMLElement[]
): Block | null => {
  const chips =
    chipElements
      .map(chip => ({
        element:
          chip,
        content:
          getDirectText(chip) ||
          getText(chip)
      }))
      .filter(
        chip =>
          chip.content.length > 0
      );

  if (!chips.length) {
    return null;
  }

  return {
    id: uuidv4(),
    type: "flex" as const,
    data: {
      props: {},
      style: {
        desktop: {
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          gap: "8px"
        },
        tablet: {},
        mobile: {}
      }
    },
    children:
      chips.map(
        chip => ({
          id: uuidv4(),
          type: "flexItem" as const,
          data: {
            props: {},
            style: {
              desktop: {},
              tablet: {},
              mobile: {}
            }
          },
          children: [
            {
              id: uuidv4(),
              type: "text" as const,
              data: {
                props: {
                  content:
                    chip.content
                },
                style: {
                  ...mergePresetDesktopStyle(
                    {
                      fontSize: "12px",
                      fontWeight: "600"
                    },
                    {
                      desktop: {
                        ...extractLayoutStyles(
                          chip.element
                        ).desktop,
                        ...extractTypographyStyles(
                          chip.element
                        ).desktop
                      }
                    },
                    style => ({
                      ...filterCardStyle(style),
                      ...filterTextStyle(style)
                    })
                  )
                }
              },
              children: []
            }
          ]
        })
      )
  };
};

const createFeatureItem = (
  item: FeatureItemPayload,
  cardElement?: HTMLElement
): Block => {
  const titleElement =
    cardElement?.querySelector(
      "h1,h2,h3,h4,h5,h6"
    ) as HTMLElement | null;

  const textElement =
    cardElement?.querySelector(
      "p"
    ) as HTMLElement | null;

  const subElement =
    titleElement?.querySelector(
      ".sub"
    ) as HTMLElement | null;

  const eyebrowElement =
    cardElement?.querySelector(
      ".r-num, .eyebrow, .section-tag"
    ) as HTMLElement | null;

  const eyebrowContent =
    getDirectText(
      eyebrowElement
    ) ||
    getText(
      eyebrowElement
    );

  const titleContent =
    getDirectText(
      titleElement
    ) ||
    getText(
      titleElement
    ) ||
    item.title ||
    "";

  const subtitleContent =
    getText(
      subElement
    ) || "";

  const descriptionContent =
    getDirectText(
      textElement
    ) ||
    getText(
      textElement
    ) ||
    item.description ||
    item.text ||
    "";

  const tagElements =
    getChipElements(
      cardElement
    );

  const extractedTags =
    tagElements
      .map(element => ({
        tag:
          element.tagName,
        className:
          element.getAttribute("class") || "",
        directText:
          getDirectText(element),
        textContent:
          getText(element),
        outerHTML:
          element.outerHTML.slice(0, 600)
      }))
      .filter(
        entry =>
          entry.directText ||
          entry.textContent
      );

  const chipList =
    createChipList(
      tagElements
    );

  const extractedCardStyle =
    cardElement
      ? extractLayoutStyles(
          cardElement
        )
      : undefined;

  const useDarkCardFallback =
    shouldUseDarkFallback(
      cardElement,
      extractedCardStyle
    );

  const fallbackCardStyle = {
    flex: "1 1 calc(33.333% - 24px)",
    maxWidth: "calc(33.333% - 24px)",
    paddingTop:
      useDarkCardFallback
        ? "34px"
        : "24px",
    paddingBottom:
      useDarkCardFallback
        ? "34px"
        : "24px",
    paddingLeft:
      useDarkCardFallback
        ? "30px"
        : "24px",
    paddingRight:
      useDarkCardFallback
        ? "30px"
        : "24px",
    border:
      useDarkCardFallback
        ? "1px solid rgba(122, 158, 192, 0.16)"
        : "1px solid rgba(17, 24, 39, 0.08)",
    borderRadius:
      useDarkCardFallback
        ? "22px"
        : "18px",
    backgroundColor:
      useDarkCardFallback
        ? "rgba(6, 32, 61, 0.7)"
        : "#f9fafb",
    color:
      useDarkCardFallback
        ? "#eef7ff"
        : "#111827",
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  };

  const filteredCardStyle =
    filterCardStyle(
      extractedCardStyle?.desktop || {}
    );

  const emittedCardStyle =
    mergePresetDesktopStyle(
      fallbackCardStyle,
      extractedCardStyle,
      filterCardStyle
    );

  console.log(
    "FEATURE_PILLARS CARD STYLE COMPARE",
    JSON.stringify(
      {
        title:
          item.title,
        sourceTag:
          cardElement?.tagName || "",
        sourceClassName:
          cardElement?.getAttribute("class") || "",
        extractedCardStyle,
        filteredCardStyle,
        emittedDesktopStyle:
          emittedCardStyle.desktop
      },
      null,
      2
    )
  );

  console.log(
    "FEATURE_PILLARS TEXT SOURCE",
    JSON.stringify(
      {
        itemTitle:
          item.title || "",
        extractedTitle:
          titleContent,
        itemDescription:
          item.description ||
          item.text ||
          "",
        extractedSubtitle:
          subtitleContent,
        extractedDescription:
          descriptionContent,
        card: cardElement
          ? {
              tag:
                cardElement.tagName,
              className:
                cardElement.getAttribute(
                  "class"
                ) || "",
              textContent:
                cardElement.textContent
                  ?.trim() || "",
              outerHTML:
                cardElement.outerHTML
                  .slice(0, 1200)
            }
          : null,
        selectedTitleNode: titleElement
          ? {
              tag:
                titleElement.tagName,
              className:
                titleElement.getAttribute(
                  "class"
                ) || "",
              textContent:
                getText(
                  titleElement
                ),
              directText:
                getDirectText(
                  titleElement
                ),
              outerHTML:
                titleElement.outerHTML
                  .slice(0, 800)
            }
          : null,
        selectedSubtitleNode: textElement
          ? {
              tag:
                textElement.tagName,
              className:
                textElement.getAttribute(
                  "class"
                ) || "",
              textContent:
                getText(
                  textElement
                ),
              directText:
                getDirectText(
                  textElement
                ),
              outerHTML:
                textElement.outerHTML
                  .slice(0, 800)
            }
          : null
      },
      null,
      2
    )
  );

  console.log(
    "FEATURE_CARD_EXTRACTION_TRACE",
    JSON.stringify(
      {
        selectedCardNode: cardElement
          ? {
              tag:
                cardElement.tagName,
              className:
                cardElement.getAttribute("class") || "",
              textContent:
                getText(cardElement),
              directText:
                getDirectText(cardElement),
              outerHTML:
                cardElement.outerHTML.slice(0, 1200)
            }
          : null,
        selectedTitleNode: titleElement
          ? {
              tag:
                titleElement.tagName,
              className:
                titleElement.getAttribute("class") || "",
              textContent:
                getText(titleElement),
              directText:
                getDirectText(titleElement),
              outerHTML:
                titleElement.outerHTML.slice(0, 800)
            }
          : null,
        selectedSubtitleNode: textElement
          ? {
              tag:
                textElement.tagName,
              className:
                textElement.getAttribute("class") || "",
              textContent:
                getText(textElement),
              directText:
                getDirectText(textElement),
              outerHTML:
                textElement.outerHTML.slice(0, 800)
            }
          : null,
        selectedSubNode: subElement
          ? {
              tag:
                subElement.tagName,
              className:
                subElement.getAttribute("class") || "",
              textContent:
                getText(subElement),
              directText:
                getDirectText(subElement),
              outerHTML:
                subElement.outerHTML.slice(0, 800)
            }
          : null,
        extractedTitle:
          titleContent,
        extractedSubtitle:
          subtitleContent,
        extractedDescription:
          descriptionContent,
        extractedTags
      },
      null,
      2
    )
  );

  return {
    id: uuidv4(),
    type: "flexItem" as const,
    data: {
      props: {},
      style: {
        ...emittedCardStyle
      }
    },
    children: [
      eyebrowContent
        ? {
            id: uuidv4(),
            type: "text" as const,
            data: {
              props: {
                content:
                  eyebrowContent
              },
              style: {
                ...mergePresetDesktopStyle(
                  {
                    fontSize: "12px",
                    fontWeight: "800",
                    letterSpacing: "0.24em",
                    textAlign: "left",
                    color: "#f77f00"
                  },
                  eyebrowElement
                    ? extractTypographyStyles(
                        eyebrowElement
                      )
                    : undefined,
                  filterTextStyle
                )
              }
            },
            children: []
          }
        : null,
      {
        id: uuidv4(),
        type: "title" as const,
        data: {
          props: {
            content:
              titleContent,
            semanticRole: "sectionTitle",
            typographyToken: "heading-lg"
          },
          style: {
            ...mergePresetDesktopStyle(
              {
                fontSize: "20px",
                fontWeight: "700",
                lineHeight: "1.3",
                textAlign: "left"
              },
              titleElement
                ? extractTypographyStyles(
                    titleElement
                  )
                : undefined,
              filterTextStyle
            )
          }
        },
        children: []
      },
      subtitleContent
        ? {
            id: uuidv4(),
            type: "text" as const,
            data: {
              props: {
                content:
                  subtitleContent
              },
              style: {
                ...mergePresetDesktopStyle(
                  {
                    fontSize: "15px",
                    fontWeight: "400",
                    lineHeight: "1.7",
                    textAlign: "left",
                    color: "#4b5563"
                  },
                  subElement
                    ? extractTypographyStyles(
                        subElement
                      )
                    : undefined,
                  filterTextStyle
                )
              }
            },
            children: []
          }
        : null,
      descriptionContent
        ? {
            id: uuidv4(),
            type: "text" as const,
            data: {
              props: {
                content:
                  descriptionContent
              },
              style: {
                ...mergePresetDesktopStyle(
                  {
                    fontSize: "15px",
                    fontWeight: "400",
                    lineHeight: "1.7",
                    textAlign: "left",
                    color: "#4b5563"
                  },
                  textElement
                    ? extractTypographyStyles(
                        textElement
                      )
                    : undefined,
                  filterTextStyle
                )
              }
            },
            children: []
          }
        : null,
      chipList
    ].filter(
      (child): child is Block =>
        child !== null
    )
  };
};

export const generateFeaturePillarsPreset = (
  payload?: FeaturesPresetPayload
): Block => {
  const items =
    payload?.items?.length
      ? payload.items
      : defaultItems;

  const claimedElement =
    payload?.claimedNode?.element;

  const cardSourceElement =
    payload?.gridNode?.element ||
    payload?.sourceNode?.element ||
    claimedElement;

  const cardElements =
    getFeatureCardElements(
      cardSourceElement
    );

  console.log(
    "FEATURE_PILLARS PAYLOAD",
    {
      claimedTag:
        claimedElement?.tagName || "",
      claimedClassName:
        claimedElement?.getAttribute("class") || "",
      cardSourceTag:
        cardSourceElement?.tagName || "",
      cardSourceClassName:
        cardSourceElement?.getAttribute("class") || "",
      itemCount:
        items.length,
      rawItems:
        items
    }
  );

  console.log(
    "FEATURE_PILLARS ITEM COUNT",
    {
      itemCount:
        items.length,
      cardElementCount:
        cardElements.length
    }
  );

  items.forEach(
    (
      item,
      index
    ) => {
      const cardElement =
        cardElements[index];

      console.log(
        "FEATURE_PILLARS ITEM DOM ELEMENT",
        {
          index,
          title:
            item.title,
          description:
            item.description || item.text || "",
          sourceTag:
            cardElement?.tagName || "",
          sourceClassName:
            cardElement?.getAttribute("class") || "",
          sourceText:
            cardElement?.textContent
              ?.trim()
              .slice(0, 120) || ""
        }
      );

      console.log(
        "FEATURE_PILLARS CARD STYLE SOURCE",
        JSON.stringify(
          {
            index,
            title:
              item.title,
            keysRequested: [
              "background",
              "backgroundColor",
              "padding",
              "border",
              "borderRadius",
              "display",
              "gap",
              "color",
              "width",
              "height"
            ],
            extractedCardStyle:
              cardElement
                ? extractLayoutStyles(
                    cardElement
                  )
                : null
          },
          null,
          2
        )
      );
    }
  );

  const sectionStyle =
    claimedElement
      ? extractLayoutStyles(
          claimedElement
        )
      : undefined;

  const useDarkSectionFallback =
    shouldUseDarkFallback(
      claimedElement,
      sectionStyle
    );

  const featureCards =
    items.map(
      (
        item,
        index
      ) =>
        createFeatureItem(
          item,
          cardElements[index]
        )
    );

  const sectionIntro =
    createSectionIntro(
      claimedElement,
      cardSourceElement
    );

  console.log(
    "FEATURE_CARD_STRUCTURE_REPORT",
    {
      cardCount:
        featureCards.length,
      cards:
        featureCards.map(
          (
            card,
            index
          ) => {
            const cardElement =
              cardElements[index];
            const titleElement =
              cardElement?.querySelector(
                "h1,h2,h3,h4,h5,h6"
              ) as HTMLElement | null;
            const subElement =
              titleElement?.querySelector(
                ".sub"
              ) as HTMLElement | null;
            const textElement =
              cardElement?.querySelector(
                "p"
              ) as HTMLElement | null;
            const chipElements =
              getChipElements(
                cardElement
              );

            return {
              index,
              source:
                cardElement
                  ? {
                      tag:
                        cardElement.tagName,
                      className:
                        cardElement.getAttribute(
                          "class"
                        ) || ""
                    }
                  : null,
              extracted:
                {
                  title:
                    getDirectText(
                      titleElement
                    ) ||
                    getText(
                      titleElement
                    ) ||
                    items[index]?.title ||
                    "",
                  chips:
                    chipElements
                      .map(element =>
                        getDirectText(
                          element
                        ) ||
                        getText(
                          element
                        )
                      )
                      .filter(Boolean),
                  subtitle:
                    getText(
                      subElement
                    ),
                  description:
                    getDirectText(
                      textElement
                    ) ||
                    getText(
                      textElement
                    ) ||
                    items[index]?.description ||
                    items[index]?.text ||
                    ""
                },
              generatedBlockTree:
                summarizeBlockTree(
                  card
                )
            };
          }
        )
    }
  );

  return {
    id: uuidv4(),
    type: "section" as const,
    meta: {
      semanticType: "FEATURE_PILLARS"
    },
    data: {
      props: {},
      style: {
        ...mergePresetDesktopStyle(
          {
            paddingTop: "100px",
            paddingBottom: "100px",
            paddingLeft: "24px",
            paddingRight: "24px",
            backgroundColor:
              useDarkSectionFallback
                ? "#020b14"
                : "transparent",
            color:
              useDarkSectionFallback
                ? "#eef7ff"
                : "#111827"
          },
          sectionStyle,
          filterSectionStyle
        )
      }
    },
    children: [
      sectionIntro,
      {
        id: uuidv4(),
        type: "flex" as const,
        data: {
          props: {
            direction: "row"
          },
          style: {
            desktop: {
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "24px"
            },
            tablet: {
              flexDirection: "row",
              flexWrap: "wrap"
            },
            mobile: {
              flexDirection: "column"
            }
          }
        },
        children:
          featureCards
      }
    ].filter(
      (child): child is Block =>
        child !== null
    )
  };
};
