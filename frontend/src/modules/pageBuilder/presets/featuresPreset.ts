import { v4 as uuidv4 } from "uuid";
import type { Block } from "../types/page.types";
import {
  extractLayoutStyles,
  extractTypographyStyles
} from "../runtime/importers/css/extractStyleProps";
import {
  filterCardStyle,
  filterGridStyle,
  filterSectionStyle,
  filterTextStyle,
  mergePresetDesktopStyle
} from "./styleFilters";

interface FeatureItemPayload {
  title: string;
  description?: string;
  text?: string;
  styles?: FeaturePillarItemStyles;
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
  styles?: FeaturePillarsStyleMap;
  suppressIntro?: boolean;
}

type ResponsiveStyle = {
  desktop?: Record<string, any>;
  tablet?: Record<string, any>;
  mobile?: Record<string, any>;
};

type FeaturePillarItemStyles = {
  card?: ResponsiveStyle;
  eyebrow?: ResponsiveStyle;
  title?: ResponsiveStyle;
  description?: ResponsiveStyle;
  tags?: ResponsiveStyle[];
};

type FeaturePillarsStyleMap = {
  section?: ResponsiveStyle;
  container?: ResponsiveStyle;
  eyebrow?: ResponsiveStyle;
  title?: ResponsiveStyle;
  description?: ResponsiveStyle;
  grid?: ResponsiveStyle;
  card?: ResponsiveStyle;
  tag?: ResponsiveStyle;
};

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
) => {
  const normalized =
    normalizeCssValue(
      value
    );

  if (
    normalized.includes("url(") ||
    normalized.includes("gradient(")
  ) {
    return false;
  }

  return [
    "",
    "none",
    "transparent",
    "rgba(0,0,0,0)",
    "rgb(0,0,0,0)",
    "initial",
    "inherit",
    "unset"
  ].includes(
    normalized
  );
};

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

const mergeResponsiveDesktop = (
  fallback: Record<string, any>,
  extracted: ResponsiveStyle | undefined,
  filter: (
    desktop: Record<string, any>
  ) => Record<string, any>
) =>
  mergePresetDesktopStyle(
    fallback,
    extracted,
    filter
  );

const mergeElementAndPayloadStyles = (
  elementStyle: ResponsiveStyle | undefined,
  payloadStyle: ResponsiveStyle | undefined
): ResponsiveStyle | undefined => {
  if (
    !elementStyle &&
    !payloadStyle
  ) {
    return undefined;
  }

  return {
    desktop: {
      ...(payloadStyle?.desktop || {}),
      ...(elementStyle?.desktop || {})
    },
    tablet: {
      ...(payloadStyle?.tablet || {}),
      ...(elementStyle?.tablet || {})
    },
    mobile: {
      ...(payloadStyle?.mobile || {}),
      ...(elementStyle?.mobile || {})
    }
  };
};

const mergeLayoutAndTypography = (
  element?: HTMLElement | null
): ResponsiveStyle | undefined =>
  element
    ? {
        desktop: {
          ...extractLayoutStyles(
            element
          ).desktop,
          ...extractTypographyStyles(
            element
          ).desktop
        },
        tablet: {},
        mobile: {}
      }
    : undefined;

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
    current
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
      backgroundSize:
        computed.backgroundSize,
      backgroundPosition:
        computed.backgroundPosition,
      backgroundRepeat:
        computed.backgroundRepeat,
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
      ? extractLayoutStyles(
          containerElement
        )
      : undefined;

  const desktop = {
    ...(extracted?.desktop || {})
  };

  const safeDesktop =
    sanitizeContainerDesktopStyle(
      desktop
    );

  const sourceMaxWidth =
    safeDesktop.maxWidth
      ? safeDesktop.maxWidth
      : "1180px";

  return {
    ...(extracted || {}),
desktop: {
  ...safeDesktop,

  display:
    "flex",

  flexDirection:
    "column",

  alignItems:
    "center",

  width:
    "100%",

  maxWidth:
    sourceMaxWidth,

  marginLeft:
    "auto",

  marginRight:
    "auto",

  margin:
    "0 auto",

  paddingLeft:
    safeDesktop.paddingLeft || "24px",

  paddingRight:
    safeDesktop.paddingRight || "24px",

  boxSizing:
    "border-box",

  overflow:
    "visible"
},

    tablet: {
      ...(extracted?.tablet || {}),

      width:
        "100%",

      maxWidth:
        "100%",

      marginLeft:
        "auto",

      marginRight:
        "auto",

      boxSizing:
        "border-box"
    },

    mobile: {
      ...(extracted?.mobile || {}),

      width:
        "100%",

      maxWidth:
        "100%",

      marginLeft:
        "auto",

      marginRight:
        "auto",

      boxSizing:
        "border-box"
    }
  };
};
const getFeatureCardElements = (
  element?: HTMLElement
) => {
  if (!element) {
    return [];
  }

  const isCard = (
    child: Element
  ): child is HTMLElement =>
    isHTMLElementLike(child) &&
    child !== element &&
    !!child.querySelector(
      "h1,h2,h3,h4,h5,h6"
    ) &&
    !!child.querySelector(
      "p"
    ) &&
    (
      child.tagName.toLowerCase() === "article" ||
      child.classList.contains("feat") ||
      child.classList.contains("ind-card") ||
      child.className.toString().toLowerCase().includes("card") ||
      child.className.toString().toLowerCase().includes("pillar") ||
      child.className.toString().toLowerCase().includes("feature")
    );

  const directCards =
    Array.from(
      element.children
    ).filter(
      isCard
    );

  if (
    directCards.length
  ) {
    return directCards;
  }

  return Array.from(
    element.querySelectorAll(
      "article, .feat, .ind-card, .feature-card, .pillar, .pillar-card, .card, [class*='card'], [class*='feature'], [class*='pillar']"
    )
  ).filter(
    isCard
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
const parsePx = (
  value: any
): number | null => {
  const match =
    String(value || "")
      .match(/^([\d.]+)px$/);

  return match
    ? Number(match[1])
    : null;
};

const scalePx = (
  value: any,
  factor: number
): string | undefined => {
  const parsed =
    parsePx(
      value
    );

  if (
    parsed === null
  ) {
    return undefined;
  }

  return `${Math.round(
    parsed * factor
  )}px`;
};

const isReasonableContainerMaxWidth = (
  value: any
) => {
  const normalized =
    String(
      value || ""
    ).trim();

  if (
    !normalized ||
    normalized === "none" ||
    normalized === "auto"
  ) {
    return false;
  }

  if (
    normalized.includes("%") ||
    normalized.includes("calc(") ||
    normalized.includes("min(") ||
    normalized.includes("max(") ||
    normalized.includes("clamp(")
  ) {
    return true;
  }

  const parsed =
    parsePx(
      normalized
    );

  return (
    parsed !== null &&
    parsed >= 720 &&
    parsed <= 1600
  );
};

const sanitizeContainerDesktopStyle = (
  style: Record<string, any> = {}
) => {
  const result = {
    ...style
  };

  delete result.width;
  delete result.minWidth;
  delete result.height;
  delete result.minHeight;
  delete result.maxHeight;
  delete result.left;
  delete result.right;
  delete result.transform;

  if (
    !isReasonableContainerMaxWidth(
      result.maxWidth
    )
  ) {
    delete result.maxWidth;
  }

  return result;
};

const makeResponsiveSectionTitleStyle = (
  titleElement?: HTMLElement | null
) => {
  const base =
    mergePresetDesktopStyle(
      {
        textAlign: "left",
        whiteSpace: "normal",
        maxWidth: "760px"
      },
      titleElement
        ? extractTypographyStyles(
            titleElement
          )
        : undefined,
      filterTextStyle
    );

  const desktop =
    base.desktop || {};

  return {
    ...base,

    desktop: {
      ...desktop,
      textAlign: "left",
      whiteSpace: "normal",
      maxWidth: "760px"
    },

    tablet: {
      ...(base.tablet || {}),
      fontSize:
        scalePx(
          desktop.fontSize,
          0.72
        ),
      lineHeight:
        scalePx(
          desktop.lineHeight,
          0.72
        ) ||
        desktop.lineHeight,
      textAlign: "left",
      whiteSpace: "normal",
      maxWidth: "100%"
    },

    mobile: {
      ...(base.mobile || {}),
      fontSize:
        scalePx(
          desktop.fontSize,
          0.52
        ),
      lineHeight:
        scalePx(
          desktop.lineHeight,
          0.52
        ) ||
        desktop.lineHeight,
      textAlign: "left",
      whiteSpace: "normal",
      maxWidth: "100%"
    }
  };
};

const resolveTabletFeatureGridColumns = (
  itemCount: number
) => {
  if (
    itemCount <= 1
  ) {
    return "1fr";
  }

  return "repeat(2, minmax(0, 1fr))";
};
const createSectionIntro = (
  claimedElement?: HTMLElement,
  cardSourceElement?: HTMLElement,
  styles?: FeaturePillarsStyleMap
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

  const titleStyle =
    makeResponsiveSectionTitleStyle(
      titleElement
    );

  if (
    styles?.title?.desktop
  ) {
    titleStyle.desktop = {
      ...(titleStyle.desktop || {}),
      ...filterTextStyle(
        styles.title.desktop
      )
    };
  }

const titleBlock: Block | null =
  titleContent
    ? {
        id:
          uuidv4(),

        type:
          "title" as const,

        data: {
          props: {
            content:
              titleContent
          },

          style:
            titleStyle
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
              ...mergeResponsiveDesktop(
                {
                  textAlign: "left",
                  display: "inline-flex",
                  width: "fit-content",
                  paddingTop: "8px",
                  paddingBottom: "8px",
                  paddingLeft: "14px",
                  paddingRight: "14px"
                },
                mergeElementAndPayloadStyles(
                  mergeLayoutAndTypography(
                    eyebrowElement
                  ),
                  styles?.eyebrow
                ),
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
              ...mergeResponsiveDesktop(
                {
                  textAlign: "left"
                },
                mergeElementAndPayloadStyles(
                  descriptionElement
                    ? extractTypographyStyles(
                        descriptionElement
                      )
                    : undefined,
                  styles?.description
                ),
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
  maxWidth: "760px",
  alignSelf: "flex-start"
},

tablet: {
  width: "100%",
  maxWidth: "100%",
  alignSelf: "flex-start"
},

mobile: {
  width: "100%",
  maxWidth: "100%",
  alignSelf: "flex-start"
}
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
          ".topics span, .tags span, .chips span, .chip, .pill, .badge, .tag, [class*='chip'], [class*='pill'], [class*='badge'], [class*='tag']"
        )
      ).filter(
        (element): element is HTMLElement =>
          isHTMLElementLike(element) &&
          !element.matches(".sub") &&
          !!getText(element)
      )
    : [];

const createChipList = (
  chipElements: HTMLElement[],
  fallbackStyles: ResponsiveStyle[] = []
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
        (chip, index) => ({
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
                  ...mergeResponsiveDesktop(
                    {},
                    mergeElementAndPayloadStyles(
                      mergeLayoutAndTypography(
                        chip.element
                      ),
                      fallbackStyles[index]
                    ),
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
    ":scope > .tag, :scope > .r-num, :scope > .n, :scope > .num, :scope > .number, :scope > .index, :scope > .eyebrow, :scope > .section-tag, :scope > [class*='num'], :scope > [class*='number'], :scope > [class*='index'], :scope > [class*='eyebrow'], :scope > [class*='badge']"
  ) as HTMLElement | null;

  const eyebrowContent =
    getDirectText(
      eyebrowElement
    ) ||
    getText(
      eyebrowElement
    );

  const isNumberBadge =
    /^[0-9]{1,2}$/.test(
      eyebrowContent.trim()
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
      tagElements,
      item.styles?.tags
    );

  const elementCardStyle =
    cardElement
      ? extractLayoutStyles(
          cardElement
        )
      : undefined;

  const extractedCardStyle =
    mergeElementAndPayloadStyles(
      elementCardStyle,
      item.styles?.card
    );

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
const gridColumn =
  cardElement
    ? cardElement.ownerDocument.defaultView
        ?.getComputedStyle(cardElement)
        .gridColumn
    : "";

if (
  gridColumn &&
  gridColumn !== "auto"
) {
  emittedCardStyle.desktop = {
    ...(emittedCardStyle.desktop || {}),
    gridColumn
  };
}
emittedCardStyle.desktop = {
  ...(emittedCardStyle.desktop || {}),

  width:
    "100%",

  maxWidth:
    "100%",

  minWidth:
    "0",

  boxSizing:
    "border-box",

  justifySelf:
    "stretch",

  overflow:
    "visible"
};

delete emittedCardStyle.desktop.marginLeft;
delete emittedCardStyle.desktop.marginRight;
delete emittedCardStyle.desktop.left;
delete emittedCardStyle.desktop.right;
delete emittedCardStyle.desktop.transform;

const badgeBlock: Block | null =
  eyebrowContent
    ? {
        id:
          uuidv4(),

        type:
          "text" as const,

        data: {
          props: {
            content:
              eyebrowContent
          },

          style: {
            ...mergeResponsiveDesktop(
              isNumberBadge
                ? {
                    display:
                      "inline-flex",

                    alignItems:
                      "center",

                    justifyContent:
                      "center",

                    width:
                      "44px",

                    height:
                      "44px",

                    minWidth:
                      "44px",

                    borderRadius:
                      "12px",

                    textAlign:
                      "center"
                  }
                : {
                    textAlign:
                      "left"
                  },
              mergeElementAndPayloadStyles(
                eyebrowElement
                  ? extractLayoutStyles(
                      eyebrowElement
                    )
                  : undefined,
                item.styles?.eyebrow
              ),
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
    : null;

const titleBlock: Block = {
  id:
    uuidv4(),

  type:
    "title" as const,

  data: {
    props: {
      content:
        titleContent,

      semanticRole:
        "sectionTitle"
    },

    style: {
      ...mergeResponsiveDesktop(
        {
          textAlign:
            "left",

          maxWidth:
            "760px",

          whiteSpace:
            "normal"
        },
        mergeElementAndPayloadStyles(
          titleElement
            ? extractTypographyStyles(
                titleElement
              )
            : undefined,
          item.styles?.title
        ),
        filterTextStyle
      )
    }
  },

  children: []
};

const subtitleBlock: Block | null =
  subtitleContent
    ? {
        id:
          uuidv4(),

        type:
          "text" as const,

        data: {
          props: {
            content:
              subtitleContent
          },

          style: {
            ...mergeResponsiveDesktop(
              {
                textAlign:
                  "left"
              },
              mergeElementAndPayloadStyles(
                subElement
                  ? extractTypographyStyles(
                      subElement
                    )
                  : undefined,
                item.styles?.description
              ),
              filterTextStyle
            )
          }
        },

        children: []
      }
    : null;

const descriptionBlock: Block | null =
  descriptionContent
    ? {
        id:
          uuidv4(),

        type:
          "text" as const,

        data: {
          props: {
            content:
              descriptionContent
          },

          style: {
            ...mergeResponsiveDesktop(
              {
                textAlign:
                  "left"
              },
              mergeElementAndPayloadStyles(
                textElement
                  ? extractTypographyStyles(
                      textElement
                    )
                  : undefined,
                item.styles?.description
              ),
              filterTextStyle
            )
          }
        },

        children: []
      }
    : null;

const contentStack: Block = {
  id:
    uuidv4(),

  type:
    "flex" as const,

  data: {
    props: {
      direction:
        "column"
    },

    style: {
      desktop: {
        display:
          "flex",

        flexDirection:
          "column",

        gap:
          "10px",

        minWidth:
          "0",

        flex:
          "1"
      },
      tablet: {},
      mobile: {}
    }
  },

  children:
    [
      titleBlock,
      subtitleBlock,
      descriptionBlock,
      chipList
    ].filter(
      (child): child is Block =>
        child !== null
    )
};

const cardChildren: Block[] =
  isNumberBadge && badgeBlock
    ? [
        {
          id:
            uuidv4(),

          type:
            "flex" as const,

          data: {
            props: {},

            style: {
              desktop: {
                display:
                  "flex",

                flexDirection:
                  "row",

                alignItems:
                  "flex-start",

                gap:
                  "22px",

                width:
                  "100%"
              },

              tablet: {
                display:
                  "flex",

                flexDirection:
                  "row",

                gap:
                  "18px",

                width:
                  "100%"
              },

              mobile: {
                display:
                  "flex",

                flexDirection:
                  "column",

                gap:
                  "14px",

                width:
                  "100%"
              }
            }
          },

          children: [
            badgeBlock,
            contentStack
          ]
        }
      ]
    : [
        badgeBlock,
        contentStack
      ].filter(
        (child): child is Block =>
          child !== null
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
    children: cardChildren
  };
};
const countGridTracks = (
  value?: string
) => {
  const columns =
    String(
      value || ""
    ).trim();

  if (
    !columns ||
    columns === "none"
  ) {
    return 0;
  }

  const repeatMatch =
    columns.match(
      /repeat\(\s*(\d+)\s*,/i
    );

  if (
    repeatMatch
  ) {
    return Number(
      repeatMatch[1]
    );
  }

  return columns
    .split(/\s+/)
    .filter(Boolean)
    .length;
};

const resolveFeatureGridColumns = (
  sourceColumns: string | undefined,
  itemCount: number
) => {
  const sourceTrackCount =
    countGridTracks(
      sourceColumns
    );

  if (
    sourceTrackCount >= 1 &&
    sourceTrackCount <= 4
  ) {
    return `repeat(${sourceTrackCount}, minmax(0, 1fr))`;
  }

  if (
    itemCount === 1
  ) {
    return "1fr";
  }

  if (
    itemCount === 2
  ) {
    return "repeat(2, minmax(0, 1fr))";
  }

  if (
    itemCount === 3
  ) {
    return "repeat(3, minmax(0, 1fr))";
  }

  return "repeat(2, minmax(0, 1fr))";
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

  const sectionRootElement =
    claimedElement?.closest(
      "section, header, main"
    ) as HTMLElement | null;

  const cardSourceElement =
    payload?.gridNode?.element ||
    payload?.sourceNode?.element ||
    claimedElement;

  const visualSectionElement =
    sectionRootElement ||
    claimedElement;

  const payloadStyles =
    payload?.styles || {};

  const containerElement =
    findContainerElement(
      visualSectionElement || undefined,
      cardSourceElement
    );

  const cardElements =
    getFeatureCardElements(
      cardSourceElement
    );
const sourceGridElement =
  payload?.gridNode?.element ||
  (
    cardSourceElement?.matches?.(
      ".feat-grid, .profiles-grid, [class*='feat-grid'], [class*='profiles-grid'], [class*='grid']"
    )
      ? cardSourceElement
      : cardSourceElement?.querySelector?.(
          ".feat-grid, .profiles-grid, [class*='feat-grid'], [class*='profiles-grid'], [class*='grid']"
        )
  ) as HTMLElement | null;

const sourceGridColumns =
  sourceGridElement
    ? (
        sourceGridElement.ownerDocument.defaultView ||
        window
      ).getComputedStyle(
        sourceGridElement
      ).gridTemplateColumns
    : "";

const desktopGridColumns =
  resolveFeatureGridColumns(
    sourceGridColumns,
    items.length
  );
  const sectionStyle =
    visualSectionElement
      ? extractLayoutStyles(
          visualSectionElement
        )
      : undefined;

  const sectionSourceStyle =
    mergeElementAndPayloadStyles(
      sectionStyle,
      payloadStyles.section
    );

  const sectionDesktopStyle =
    filterSectionStyle(
      sectionSourceStyle?.desktop || {}
    );

  const sectionPaintStyle =
    getFeatureSectionPaintStyle(
      visualSectionElement ||
      claimedElement
    );

  const containerStyle =
    createContainerStyle(
      containerElement
    );

  const payloadContainerDesktop =
    payloadStyles.container?.desktop || {};

  const safePayloadContainerDesktop =
    sanitizeContainerDesktopStyle(
      payloadContainerDesktop
    );

  const sourceGridStyle =
    mergeElementAndPayloadStyles(
      sourceGridElement
        ? extractLayoutStyles(
            sourceGridElement
          )
        : undefined,
      payloadStyles.grid
    );

  const gridDesktopStyle =
    filterGridStyle(
      sourceGridStyle?.desktop || {}
    );

  const gridGap =
    gridDesktopStyle.gap ||
    gridDesktopStyle.columnGap ||
    gridDesktopStyle.rowGap ||
    "22px";

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

const shouldSuppressIntro =
  !!payload?.suppressIntro;

const sectionIntro =
  shouldSuppressIntro
    ? null
    : createSectionIntro(
        visualSectionElement ||
        claimedElement,
        cardSourceElement,
        payloadStyles
      );

const contentChildren =
  [
    sectionIntro,

    {
      id:
        uuidv4(),

      type:
        "grid" as const,

        data: {
          props: {},

          style: {
            desktop: {
              ...gridDesktopStyle,

              display:
                "grid",
              gridTemplateColumns:desktopGridColumns,
              gap:
                gridGap,

              width:
                "100%",

              maxWidth:
                "100%",

              margin:
                "0",

              marginLeft:
                "0",

              marginRight:
                "0",

              justifyContent:
                "center",

              justifyItems:
                "stretch",

              alignItems:
                "stretch",

              boxSizing:
                "border-box",

              overflow:
                "visible"
            },

            tablet: {
              display:
                "grid",

              gridTemplateColumns:
                "1fr",

              gap:
                gridGap,

              width:
                "100%",

              maxWidth:
                "100%",

              margin:
                "0",

              boxSizing:
                "border-box",

              overflow:
                "visible"
            },

            mobile: {
              display:
                "grid",

              gridTemplateColumns:
                "1fr",

              gap:
                gridGap,

              width:
                "100%",

              maxWidth:
                "100%",

              margin:
                "0",

              boxSizing:
                "border-box",

              overflow:
                "visible"
            }
          }
        },

        children:
          featureCards
      }
    ].filter(
      (child): child is Block =>
        child !== null
    );

  return {
    id:
      uuidv4(),

    type:
      "section" as const,

    meta: {
      semanticType:
        "FEATURE_PILLARS"
    },

    data: {
      props: {},

      style: {
        desktop: {
          ...sectionDesktopStyle,
          ...sectionPaintStyle,

          display:
            "flex",

          flexDirection:
            "column",

          alignItems:
            "center",

          justifyContent:
            "center",

          width:
            "100%",

          maxWidth:
            "100%",

          margin:
            sectionDesktopStyle.margin || "0",

          padding:
            sectionDesktopStyle.padding,

          paddingTop:
            sectionDesktopStyle.padding
              ? undefined
              : sectionDesktopStyle.paddingTop || "64px",

          paddingBottom:
            sectionDesktopStyle.padding
              ? undefined
              : sectionDesktopStyle.paddingBottom || "72px",

          paddingLeft:
            sectionDesktopStyle.padding
              ? undefined
              : sectionDesktopStyle.paddingLeft || "0px",

          paddingRight:
            sectionDesktopStyle.padding
              ? undefined
              : sectionDesktopStyle.paddingRight || "0px",

          boxSizing:
            "border-box",

          overflow:
            "visible"
        },

        tablet: {
          display:
            "flex",

          flexDirection:
            "column",

          alignItems:
            "center",

          width:
            "100%",

          maxWidth:
            "100%",

          margin:
            "0",

          paddingLeft:
            "0px",

          paddingRight:
            "0px",

          boxSizing:
            "border-box",

          overflow:
            "visible"
        },

        mobile: {
          display:
            "flex",

          flexDirection:
            "column",

          alignItems:
            "center",

          width:
            "100%",

          maxWidth:
            "100%",

          margin:
            "0",

          paddingLeft:
            "0px",

          paddingRight:
            "0px",

          boxSizing:
            "border-box",

          overflow:
            "visible"
        }
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
              ...(containerStyle.desktop || {}),
              ...safePayloadContainerDesktop,

              display:
                "flex",

              flexDirection:
                "column",

              alignItems:
                "stretch",

              width:
                "100%",

              maxWidth:
                safePayloadContainerDesktop.maxWidth ||
                containerStyle.desktop?.maxWidth ||
                "1180px",

              margin:
                safePayloadContainerDesktop.margin ||
                containerStyle.desktop?.margin ||
                "0 auto",

              marginLeft:
                safePayloadContainerDesktop.marginLeft ||
                containerStyle.desktop?.marginLeft ||
                "auto",

              marginRight:
                safePayloadContainerDesktop.marginRight ||
                containerStyle.desktop?.marginRight ||
                "auto",

              boxSizing:
                "border-box",

              overflow:
                "visible"
            },

            tablet: {
              display:
                "flex",

              flexDirection:
                "column",

              alignItems:
                "stretch",

              width:
                "100%",

              maxWidth:
                "calc(100% - 56px)",

              margin:
                "0 auto",

              boxSizing:
                "border-box",

              overflow:
                "visible"
            },

            mobile: {
              display:
                "flex",

              flexDirection:
                "column",

              alignItems:
                "stretch",

              width:
                "100%",

              maxWidth:
                "calc(100% - 40px)",

              margin:
                "0 auto",

              boxSizing:
                "border-box",

              overflow:
                "visible"
            }
          }
        },

        children:
          contentChildren
      }
    ]
  };
};