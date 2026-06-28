import { v4 as uuidv4 } from "uuid";
import type { Block } from "../types/page.types";
import {
  extractLayoutStyles,
  extractTypographyStyles
} from "../runtime/importers/css/extractStyleProps";
import {
  applySectionTitleScale,
  filterCardStyle,
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
const getFeatureSectionPaintStyle = (
  element?: HTMLElement
): Record<string, any> => {
  if (!element) {
    return {};
  }

  const win =
    element.ownerDocument.defaultView ||
    window;

  let current: HTMLElement | null =
    element;

  while (
    current &&
    current !== element.ownerDocument.body
  ) {
    const computed =
      win.getComputedStyle(
        current
      );

    const style = {
      background:
        computed.background,
      backgroundColor:
        computed.backgroundColor,
      backgroundImage:
        computed.backgroundImage,
      color:
        computed.color
    };

    if (
      hasMeaningfulBackground(
        style
      ) ||
      classSuggestsDark(
        current
      )
    ) {
      return {
        ...style,
        width:
          "100%",
        boxSizing:
          "border-box"
      };
    }

    current =
      current.parentElement;
  }

  return {};
};
const findContainerElement = (
  claimedElement?: HTMLElement,
  sourceElement?: HTMLElement
) =>
  (
    sourceElement?.closest(
      ".container, [class~='container']"
    ) ||
    claimedElement?.querySelector(
      ".container, [class~='container']"
    ) ||
    claimedElement?.closest(
      ".container, [class~='container']"
    )
  ) as HTMLElement | null;

const createContainerStyle = (
  containerElement?: HTMLElement | null
) => {
  const extracted =
    containerElement
      ? extractLayoutStyles(containerElement)
      : undefined;

  const desktop = {
    ...(extracted?.desktop || {})
  };

  delete desktop.height;
  delete desktop.minHeight;

  return {
    ...(extracted || {}),
    desktop: {
      ...desktop,
      display: "flex",
      flexDirection: "column",
      width: desktop.width || "100%",
      marginLeft: desktop.marginLeft || "auto",
      marginRight: desktop.marginRight || "auto"
    },
    tablet: {
      ...(extracted?.tablet || {})
    },
    mobile: {
      ...(extracted?.mobile || {})
    }
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
                            textAlign: "left"
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
                  textAlign: "left",
                  display: "inline-flex",
                  width: "fit-content",
                  paddingTop: "8px",
                  paddingBottom: "8px",
                  paddingLeft: "14px",
                  paddingRight: "14px"
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
                    {},
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
  display:
    "flex",

  flexDirection:
    "column",

  gap:
    "12px",

  height:
    "100%",

  ...(useDarkCardFallback
    ? {
        backgroundColor:
          "rgba(8, 28, 48, 0.92)",

        border:
          "1px solid rgba(96, 165, 250, 0.22)",

        borderRadius:
          "12px",

        padding:
          "22px",

        color:
          "#eaf4ff"
      }
    : {})
};
  const emittedCardStyle =
    mergePresetDesktopStyle(
      fallbackCardStyle,
      extractedCardStyle,
      filterCardStyle
    );

  return {
    id: uuidv4(),
    type: "gridItem" as const,
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
                    textAlign: "left"
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
                    textAlign: "left"
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
                    textAlign: "left"
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
 
  const sectionStyle =
  claimedElement
    ? extractLayoutStyles(
        claimedElement
      )
    : undefined;
const sectionPaintStyle =
  getFeatureSectionPaintStyle(
    claimedElement
  );
console.log(
  "🔥 FEATURE_PILLARS_PRESET_USED",
  {
    items:
      items.length,
    claimedClass:
      claimedElement?.className,
    sourceClass:
      cardSourceElement?.className,
    sectionPaintStyle
  }
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

  const containerElement =
    findContainerElement(
      claimedElement,
      cardSourceElement
    );
    const containerStyle =
  createContainerStyle(
    containerElement
  );

 const gridStyle =
  cardSourceElement
    ? extractLayoutStyles(cardSourceElement)
    : null;

const contentChildren =
  [
    sectionIntro,
   {
  id: uuidv4(),
  type: "grid" as const,
  data: {
    props: {},
    style: {
      desktop: {
        ...(gridStyle?.desktop || {}),
        display: "grid",
        gridTemplateColumns:
          gridStyle?.desktop?.gridTemplateColumns &&
          gridStyle.desktop.gridTemplateColumns !== "none"
            ? gridStyle.desktop.gridTemplateColumns
            : "repeat(3, minmax(0, 1fr))",
        gap:
          gridStyle?.desktop?.gap || "22px",
        width: "100%",
        alignItems: "stretch"
      },
      tablet: {
        ...(gridStyle?.tablet || {}),
        display: "grid",
        gridTemplateColumns: "1fr",
        width: "100%"
      },
      mobile: {
        ...(gridStyle?.mobile || {}),
        display: "grid",
        gridTemplateColumns: "1fr",
        width: "100%"
      }
    }
  },
  children: featureCards
}
  ].filter(
    (child): child is Block =>
      child !== null
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
 desktop: {
  ...(sectionStyle?.desktop || {}),
  ...sectionPaintStyle,

    paddingTop:
      sectionStyle?.desktop?.paddingTop ||
      "80px",

    paddingBottom:
      sectionStyle?.desktop?.paddingBottom ||
      "80px",

    paddingLeft:
      sectionStyle?.desktop?.paddingLeft ||
      "24px",

    paddingRight:
      sectionStyle?.desktop?.paddingRight ||
      "24px",

    overflow:
      "visible"
  },

  tablet: {
    ...(sectionStyle?.tablet || {})
  },

  mobile: {
    ...(sectionStyle?.mobile || {})
  }
}
    },
    children: [
      {
        id: uuidv4(),
        type: "flex" as const,
        data: {
          props: {},
          style: containerStyle
        },
        children:
          contentChildren
      }
    ]
  };
};
