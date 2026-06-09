import { v4 as uuidv4 } from "uuid";

import type {
  Block
} from "../types/page.types";

import type {
  HeroPayload
} from "../runtime/importers/html/semanticContracts/HeroPayload";
import {
  extractLayoutStyles,
  extractTypographyStyles
} from "../runtime/importers/css/extractStyleProps";
import {
  filterCardStyle,
  filterHeroSectionStyle,
  filterTextStyle,
  mergePresetDesktopStyle
} from "./styleFilters";

interface HeroLayoutPayload {

  variant?:

    | "split"

    | "centered"

    | "minimal";
}

const desktopOf = (
  style: any
) =>
  style?.desktop || style || {};

const textOf = (
  element?: Element | null
) =>
  element?.textContent
    ?.trim() || "";

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

const isHTMLElementLike = (
  element: Element
): element is HTMLElement =>
  element.nodeType === 1 &&
  typeof (element as HTMLElement).tagName === "string";

const uniqueTexts = (
  values: string[]
) =>
  Array.from(
    new Set(
      values
        .map(value => value.trim())
        .filter(Boolean)
    )
  );

const uniqueBy = <T,>(
  values: T[],
  getKey: (value: T) => string
) => {
  const seen =
    new Set<string>();

  return values.filter(value => {
    const key =
      getKey(value).trim();

    if (
      !key ||
      seen.has(key)
    ) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

const queryElements = (
  root: HTMLElement | undefined,
  selector: string
) =>
  root
    ? Array.from(
        root.querySelectorAll(
          selector
        )
      ).filter(
        (element): element is HTMLElement =>
          isHTMLElementLike(element) &&
          !!textOf(element)
      )
    : [];

const mergeElementStyle = (
  element: HTMLElement | null | undefined,
  fallback: Record<string, any>,
  filter: (
    style: Record<string, any>
  ) => Record<string, any>
) =>
  mergePresetDesktopStyle(
    fallback,
    element
      ? {
          desktop: {
            ...desktopOf(
              extractLayoutStyles(
                element
              )
            ),
            ...desktopOf(
              extractTypographyStyles(
                element
              )
            )
          }
        }
      : undefined,
    filter
  );

const mergeElementDesktopStyle = (
  element: HTMLElement | null | undefined,
  fallback: Record<string, any>,
  filter: (
    style: Record<string, any>
  ) => Record<string, any>
) =>
  mergeElementStyle(
    element,
    fallback,
    filter
  ).desktop;

const filterHeroTitleStyle = (
  style: Record<string, any>
) => ({
  ...filterTextStyle(
    style
  ),
  ...Object.fromEntries(
    [
      "fontStyle",
      "background",
      "backgroundColor",
      "backgroundImage",
      "backgroundClip",
      "WebkitBackgroundClip",
      "WebkitTextFillColor"
    ]
      .filter(
        key =>
          style[key] !== undefined &&
          style[key] !== "" &&
          style[key] !== "none" &&
          style[key] !== "transparent"
      )
      .map(
        key => [
          key,
          style[key]
        ]
      )
  )
});

const parsePxValue = (
  value: unknown
) => {
  if (
    typeof value !== "string"
  ) {
    return null;
  }

  const match =
    value
      .trim()
      .match(/^(-?\d+(?:\.\d+)?)px$/);

  return match
    ? Number(
        match[1]
      )
    : null;
};

const formatPxValue = (
  value: number
) =>
  `${Number(
    value.toFixed(
      3
    )
  )}px`;

const applyHeroTitleScale = (
  style: any,
  sourceTitleStyle: any
) => {
  const desktop =
    style?.desktop || {};

  const sourceDesktop =
    desktopOf(
      sourceTitleStyle
    );

  const originalFontSize =
    sourceDesktop.fontSize;

  const originalPx =
    parsePxValue(
      originalFontSize
    );

  const emittedBefore =
    desktop.fontSize;

  const emittedBeforePx =
    parsePxValue(
      emittedBefore
    );

  if (
    !originalPx ||
    (
      emittedBeforePx &&
      emittedBeforePx >= originalPx
    )
  ) {
    return style;
  }

  const emittedAfter =
    formatPxValue(
      Math.min(
        originalPx,
        128
      )
    );

  return {
    ...style,
    desktop: {
      ...desktop,
      fontSize: emittedAfter,
      lineHeight:
        sourceDesktop.lineHeight ||
        desktop.lineHeight,
      fontWeight:
        sourceDesktop.fontWeight ||
        desktop.fontWeight
    }
  };
};

const filterHeroLayoutStyle = (
  style: Record<string, any>
) =>
  Object.fromEntries(
    [
      "display",
      "flexDirection",
      "flexWrap",
      "gap",
      "rowGap",
      "columnGap",
      "alignItems",
      "justifyContent",
      "width",
      "maxWidth",
      "padding",
      "paddingTop",
      "paddingBottom",
      "paddingLeft",
      "paddingRight",
      "border",
      "borderRadius",
      "background",
      "backgroundColor",
      "backgroundImage",
      "color"
    ]
      .filter(
        key =>
          style[key] !== undefined &&
          style[key] !== "" &&
          style[key] !== "normal"
      )
      .map(
        key => [
          key,
          style[key]
        ]
      )
  );

const createTextBlock = (
  content: string,
  style: any,
  props: Record<string, any> = {}
): Block => ({
  id: uuidv4(),
  type: "text" as const,
  data: {
    props: {
      content,
      ...props
    },
    style
  },
  children: []
});

const createTitleBlock = (
  content: string,
  style: any
): Block => ({
  id: uuidv4(),
  type: "title" as const,
  data: {
    props: {
      content
    },
    style
  },
  children: []
});

const createFlexRow = (
  children: Block[],
  desktopStyle: Record<string, any>,
  itemDesktopStyle: Record<string, any> = {}
): Block | null => {
  if (!children.length) {
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
          alignItems: "center",
          ...desktopStyle
        },
        tablet: {},
        mobile: {
          flexDirection: "column"
        }
      }
    },
    children:
      children.map(child => ({
        id: uuidv4(),
        type: "flexItem" as const,
        data: {
          props: {},
          style: {
            desktop: {
              minWidth: "0",
              width: "auto",
              maxWidth: "none",
              flex: "0 1 auto",
              flexGrow: 0,
              flexShrink: 1,
              ...itemDesktopStyle
            },
            tablet: {},
            mobile: {}
          }
        },
        children: [
          child
        ]
      }))
  };
};

const directChildren = (
  element: HTMLElement | undefined | null,
  selector?: string
) =>
  element
    ? Array.from(
        element.children
      ).filter(
        (child): child is HTMLElement =>
          isHTMLElementLike(child) &&
          (!selector || child.matches(selector)) &&
          !!textOf(child)
      )
    : [];

const directChild = (
  element: HTMLElement | undefined | null,
  selector: string
) =>
  directChildren(
    element,
    selector
  )[0] || null;

const extractHeroTitleText = (
  titleElement: HTMLElement | null,
  fallback: string
) => {
  const lines =
    extractHeroTitleLines(
      titleElement
    );

  return lines.length >= 2
    ? lines.join("\n")
    : fallback;
};

const extractHeroTitleLines = (
  titleElement: HTMLElement | null
) => {
  const lineElements =
    titleElement
      ? Array.from(
          titleElement.querySelectorAll(
            ".l1, .l2, .l3, [class*='line'], span"
          )
        ).filter(
          (element): element is HTMLElement =>
            isHTMLElementLike(element) &&
            !!textOf(element)
        )
      : [];

  return uniqueTexts(
    lineElements.map(
      textOf
    )
  );
};

const extractHeroTitleLineEntries = (
  titleElement: HTMLElement | null,
  fallback: string
) => {
  const lineElements =
    titleElement
      ? Array.from(
          titleElement.querySelectorAll(
            ".l1, .l2, .l3, [class*='line'], span"
          )
        ).filter(
          (element): element is HTMLElement =>
            isHTMLElementLike(element) &&
            !!textOf(element)
        )
      : [];

  const entries =
    uniqueBy(
      lineElements.map(element => ({
        content:
          textOf(element),
        element
      })),
      entry => entry.content
    );

  if (entries.length >= 2) {
    return entries;
  }

  return [
    {
      content:
        fallback,
      element:
        titleElement
    }
  ];
};

const splitKpiText = (
  value: string
) => {
  const normalized =
    value.trim();

  if (!normalized) {
    return {
      number: "",
      label: ""
    };
  }

  const strictMatch =
    normalized.match(
      /^([+\-]?(?:[$€£]\s*)?\d[\d\s.,]*(?:(?:Mds|Md|K|M|B)\+?|\+|%)?)\s+(.+)$/
    );

  if (strictMatch) {
    return {
      number:
        strictMatch[1].trim(),
      label:
        strictMatch[2].trim()
    };
  }

  const match =
    normalized.match(
      /^([+\-]?(?:[$€£]\s*)?\d[\d\s.,]*(?:[A-Za-z]+)?[+%]?|[A-Z]{2,}\+?)\s+(.+)$/
    );
  return {
    number:
      match?.[1]?.trim() ||
      normalized,
    label:
      match?.[2]?.trim() || ""
  };
};

const isMeaningfulKpiValue = (
  value: string
) => {
  const normalized =
    value.trim();

  if (!normalized) {
    return false;
  }

  if (
    /^[^\dA-Za-z]+$/.test(
      normalized
    )
  ) {
    return false;
  }

  return /\d/.test(
    normalized
  );
};

const hasTrueZeroSource = (
  value: string
) =>
  /^[$€£]?\s*0(?:[.,]0+)?(?:\s*(?:%|[A-Za-z]+))?\+?$/.test(
    value.trim()
  );

const readKpiAttributeValue = (
  element: HTMLElement | null
) =>
  (
    element?.getAttribute(
      "data-value"
    ) ||
    element?.getAttribute(
      "data-target"
    ) ||
    element?.getAttribute(
      "data-count"
    ) ||
    ""
  ).trim();

const hasExactZeroKpiSource = (
  value: string
) =>
  /^[$€£]?\s*0(?:[.,]0+)?\s*(?:[+%])?$/.test(
    value.trim()
  );

const isStandaloneKpiValue = (
  value: string
) =>
  /^[$€£]?\s*\d[\d\s.,]*(?:[A-Za-z]+)?\s*[+%]?$/.test(
    value.trim()
  );

const readVisibleKpiSuffix = (
  visibleText: string
) =>
  visibleText
    .trim()
    .match(
      /([A-Za-z]+[+%]?|[+%])$/
    )?.[1] || "";

const readKpiAriaAttributeValue = (
  element: HTMLElement | null
) =>
  (
    element?.getAttribute(
      "aria-label"
    ) || ""
  ).trim();

const queryKpiNumberElement = (
  element: HTMLElement | undefined
) => {
  const wrapper =
    element?.querySelector(
      ".num, .number, .value"
    ) as HTMLElement | null;

  const attrNode =
    (
      wrapper?.querySelector(
        "[data-value], [data-target], [data-count]"
      ) ||
      element?.querySelector(
        "[data-value], [data-target], [data-count]"
      )
    ) as HTMLElement | null;

  return wrapper || attrNode;
};

const isRicherFormattedKpiValue = (
  visibleText: string,
  rawValue: string
) => {
  const visible =
    visibleText.trim();
  const raw =
    rawValue.trim();

  if (
    !visible ||
    !raw ||
    !/\d/.test(visible)
  ) {
    return false;
  }

  const visibleDigits =
    visible.replace(/\D/g, "");
  const rawDigits =
    raw.replace(/\D/g, "");

  return (
    !!rawDigits &&
    visibleDigits.includes(
      rawDigits
    ) &&
    visible.length > raw.length
  );
};

const readKpiDescendantAttributeValue = (
  element: HTMLElement | null
) => {
  const candidates =
    [
      element,
      ...(element
        ? Array.from(
            element.querySelectorAll(
              "[data-value], [data-target], [data-count]"
            )
          ).filter(
            (candidate): candidate is HTMLElement =>
              isHTMLElementLike(
                candidate
              )
          )
        : [])
    ];

  for (const candidate of candidates) {
    const value =
      readKpiAttributeValue(
        candidate
      );

    if (
      isMeaningfulKpiValue(
        value
      ) ||
      hasExactZeroKpiSource(
        value
      )
    ) {
      return value;
    }
  }

  return "";
};

const mergeKpiAffixes = (
  value: string,
  visibleText: string
) => {
  const normalizedValue =
    value.trim();
  const normalizedVisible =
    visibleText.trim();

  if (
    !normalizedValue ||
    /[$€£%+A-Za-z]/.test(
      normalizedValue
    )
  ) {
    return normalizedValue;
  }

  const prefix =
    normalizedVisible.match(
      /^([$€£])/
    )?.[1] || "";
  const suffix =
    readVisibleKpiSuffix(
      normalizedVisible
    );

  return `${prefix}${normalizedValue}${suffix}`;
};

const readKpiValue = (
  element: HTMLElement | null,
  parentElement?: HTMLElement | null
) => {
  const direct =
    getDirectText(
      element
    );

  if (
    readKpiDescendantAttributeValue(
      element
    )
  ) {
    const attributeValue =
      readKpiDescendantAttributeValue(
        element
      );
    const visibleText =
      textOf(
        element
      );

    if (
      isRicherFormattedKpiValue(
        visibleText,
        attributeValue
      )
    ) {
      return visibleText;
    }

    return mergeKpiAffixes(
      attributeValue,
      direct
    );
  }

  if (
    readKpiDescendantAttributeValue(
      parentElement || null
    )
  ) {
    const attributeValue =
      readKpiDescendantAttributeValue(
        parentElement || null
      );
    const visibleText =
      textOf(
        element
      );

    if (
      isRicherFormattedKpiValue(
        visibleText,
        attributeValue
      )
    ) {
      return visibleText;
    }

    return mergeKpiAffixes(
      attributeValue,
      direct
    );
  }

  if (
    isStandaloneKpiValue(
      direct
    ) ||
    hasExactZeroKpiSource(
      direct
    )
  ) {
    return direct;
  }

  const fullText =
    textOf(
      element
    );

  if (
    isStandaloneKpiValue(
      fullText
    ) ||
    hasExactZeroKpiSource(
      fullText
    )
  ) {
    return fullText;
  }

  return "";
};

const readKpiFallbackValue = (
  fallbackText: string
) => {
  const fallback =
    splitKpiText(
      fallbackText
    );

  if (
    isMeaningfulKpiValue(
      fallback.number
    ) &&
    isStandaloneKpiValue(
      fallback.number
    ) &&
    (
      fallback.number !== "0" ||
      hasExactZeroKpiSource(
        fallbackText
      )
    )
  ) {
    return fallback.number;
  }

  if (
    isStandaloneKpiValue(
      fallbackText
    ) ||
    hasExactZeroKpiSource(
      fallbackText
    )
  ) {
    return fallbackText.trim();
  }

  return "";
};

const readKpiAriaValue = (
  element: HTMLElement | null
) => {
  return readKpiFallbackValue(
    readKpiAriaAttributeValue(
      element
    )
  );
};

const extractKpiItem = (
  element: HTMLElement | undefined,
  fallbackText: string
) => {
  const numberElement =
    queryKpiNumberElement(
      element
    );

  const labelElement =
    directChild(
      element,
      ".lbl, .label, .caption"
    );

  const fallback =
    splitKpiText(
      fallbackText ||
      getDirectText(element) ||
      textOf(element)
    );

  const fallbackNumber =
    readKpiFallbackValue(
      fallbackText
    );

  const number =
    fallbackNumber ||
    readKpiValue(
      numberElement,
      element
    ) ||
    readKpiDescendantAttributeValue(
      numberElement
    ) ||
    readKpiDescendantAttributeValue(
      element || null
    ) ||
    readKpiAriaValue(
      numberElement
    ) ||
    readKpiAriaValue(
      element || null
    ) ||
    readKpiFallbackValue(
      fallbackText ||
      textOf(element)
    );

  return {
    number:
      isMeaningfulKpiValue(
        number
      ) ||
      hasExactZeroKpiSource(
        number
      )
        ? number
        : "",
    label:
      getDirectText(labelElement) ||
      textOf(labelElement) ||
      fallback.label,
    numberElement,
    labelElement
  };
};

const createKpiBlock = (
  item: {
    number: string;
    label: string;
    numberElement?: HTMLElement | null;
    labelElement?: HTMLElement | null;
  },
  index = 0
): Block => ({
  id: uuidv4(),
  type: "flex" as const,
  data: {
    props: {},
    style: {
      desktop: {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "4px",
        paddingLeft:
          index > 0
            ? "28px"
            : "0",
        borderLeft:
          index > 0
            ? "1px solid rgba(148, 163, 184, 0.22)"
            : undefined,
        minWidth: "0"
      },
      tablet: {},
      mobile: {}
    }
  },
  children: [
    ...(item.number
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
              createTextBlock(
                item.number,
                mergeElementStyle(
                  item.numberElement,
                  {
                    fontSize: "28px",
                    fontWeight: "800",
                    lineHeight: "1"
                  },
                  filterTextStyle
                ),
                {
                  semanticRole: "kpiNumber",
                  typographyToken: "display-sm"
                }
              )
            ]
          } as Block
        ]
      : []),
    ...(item.label
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
              createTextBlock(
                item.label,
                mergeElementStyle(
                  item.labelElement,
                  {
                    fontSize: "13px",
                    fontWeight: "600",
                    lineHeight: "1.35",
                    opacity: 0.74
                  },
                  filterTextStyle
                ),
                {
                  semanticRole: "kpiLabel",
                  typographyToken: "label"
                }
              )
            ]
          } as Block
        ]
      : [])
  ]
});

const getComputedHeroStyle = (
  element?: HTMLElement | null
) => {
  if (!element) {
    return null;
  }

  const computed =
    (
      element.ownerDocument.defaultView ||
      window
    ).getComputedStyle(element);

  return {
    tag:
      element.tagName,
    className:
      element.getAttribute("class") || "",
    display:
      computed.display,
    flexDirection:
      computed.flexDirection,
    flexWrap:
      computed.flexWrap,
    gap:
      computed.gap,
    alignItems:
      computed.alignItems,
    justifyContent:
      computed.justifyContent,
    background:
      computed.background,
    backgroundColor:
      computed.backgroundColor,
    backgroundImage:
      computed.backgroundImage,
    color:
      computed.color,
    padding:
      computed.padding,
    fontSize:
      computed.fontSize,
    fontWeight:
      computed.fontWeight,
    lineHeight:
      computed.lineHeight,
    width:
      computed.width,
    maxWidth:
      computed.maxWidth
  };
};

const summarizeHeroBlockTree = (
  block: Block,
  depth = 0
): any => ({
  type:
    block.type,
  semanticType:
    block.meta?.semanticType,
  role:
    block.data?.props?.semanticRole,
  text:
    block.type === "title" ||
    block.type === "text" ||
    block.type === "button" ||
    block.type === "link"
      ? block.data?.props?.content ||
        block.data?.props?.label ||
        ""
      : undefined,
  style:
    block.data?.style?.desktop ||
    block.data?.style ||
    {},
  children:
    depth >= 4
      ? []
      : (block.children || []).map(child =>
          summarizeHeroBlockTree(
            child,
            depth + 1
          )
        )
});

export const generateHeroPreset = (
  payload?: HeroPayload & {

    layout?: HeroLayoutPayload;
  }
): Block => {
  const claimedElement =
    payload?.claimedNode?.element;

  const titleElement =
    claimedElement?.querySelector(
      "h1"
    ) as HTMLElement | null;

  const subtitleElement =
    claimedElement?.querySelector(
      "p"
    ) as HTMLElement | null;

  const ctaElement =
    claimedElement?.querySelector(
      "button,a"
    ) as HTMLElement | null;

  const sectionStyle =
    claimedElement
      ? extractLayoutStyles(
          claimedElement
        )
      : undefined;

  const titleStyle =
    titleElement
      ? extractTypographyStyles(
          titleElement
        )
      : undefined;

  const subtitleStyle =
    subtitleElement
      ? extractTypographyStyles(
          subtitleElement
        )
      : undefined;

  const ctaStyle =
    ctaElement
      ? {
          desktop: {
            ...desktopOf(
              extractLayoutStyles(
                ctaElement
              )
            ),
            ...desktopOf(
              extractTypographyStyles(
                ctaElement
              )
            )
          },
          tablet: {},
          mobile: {}
        }
      : undefined;

  const eyebrowElement =
    claimedElement?.querySelector(
      ".hero-eyebrow, .eyebrow, [class*='eyebrow'], [class*='tagline'], [class*='badge']"
    ) as HTMLElement | null;

  const actionElements =
    queryElements(
      claimedElement,
      ".hero-ctas a, .hero-ctas button, .cta-row a, .cta-row button, [class*='hero-cta'] a, [class*='hero-cta'] button"
    );

  const fallbackActionElements =
    actionElements.length
      ? actionElements
      : queryElements(
          claimedElement,
          "button,a"
        );

  const actionItems =
    fallbackActionElements.length
      ? uniqueBy(
          fallbackActionElements
            .map(element => ({
              label:
                textOf(element),
              element
            })),
          item =>
            `${item.label}:${item.element.getAttribute("href") || ""}`
        )
      : uniqueTexts(
          [
            ...(payload?.buttons || []),
            payload?.ctaText || ""
          ]
        ).map(label => ({
          label,
          element:
            undefined as HTMLElement | undefined
        }));

  const actionLabels =
    actionItems.map(
      item => item.label
    );

  const titleContent =
    extractHeroTitleText(
      titleElement,
      payload?.title ||
        textOf(
          titleElement
        ) ||
        "Hero Headline"
    );

  const titleLines =
    extractHeroTitleLines(
      titleElement
    );

  const kpiContainer =
    claimedElement?.querySelector(
      ".kpi-bar, [class*='kpi-bar'], .metrics, .stats"
    ) as HTMLElement | null;

  const directKpiElements =
    directChildren(
      kpiContainer,
      ".kpi, .stat, .metric, [class*='kpi'], [class*='stat'], [class*='metric']"
    );

  const kpiElements =
    directKpiElements.length
      ? directKpiElements
      : queryElements(
          claimedElement,
          ".kpi-bar .kpi, .kpi-bar .stat, .kpi-bar .metric, .kpi, .stat, .metric, [class*='kpi'], [class*='stat'], [class*='metric']"
        );

  const kpiTexts =
    uniqueTexts(
      payload?.kpiItems?.length
        ? payload.kpiItems
        : kpiElements.length
          ? kpiElements.map(
              textOf
            )
          : []
    );

  const kpiItems =
    kpiTexts.map(
      (
        item,
        index
      ) =>
        extractKpiItem(
          kpiElements[index],
          item
        )
    );

  console.log(
    "HERO KPI SOURCE",
    kpiItems.map(
      (
        item,
        index
      ) => ({
        index,
        sourceTag:
          kpiElements[index]?.tagName || "",
        sourceClassName:
          kpiElements[index]?.getAttribute(
            "class"
          ) || "",
        originalDomNode:
          kpiElements[index]
            ? {
                tag:
                  kpiElements[index].tagName,
                className:
                  kpiElements[index].getAttribute(
                    "class"
                  ) || "",
                textContent:
                  textOf(
                    kpiElements[index]
                  ),
                innerHTML:
                  kpiElements[index].innerHTML
                    .slice(0, 1200),
                dataValue:
                  kpiElements[index].getAttribute(
                    "data-value"
                  ),
                dataCount:
                  kpiElements[index].getAttribute(
                    "data-count"
                  ),
                dataTarget:
                  kpiElements[index].getAttribute(
                    "data-target"
                  ),
                ariaLabel:
                  kpiElements[index].getAttribute(
                    "aria-label"
                  )
              }
            : null,
        rawOuterHTML:
          kpiElements[index]?.outerHTML
            ?.slice(0, 1200) || "",
        rawText:
          kpiTexts[index] || "",
        numberText:
          item.number,
        labelText:
          item.label,
        numberNode:
          item.numberElement
            ? {
                tag:
                  item.numberElement.tagName,
                className:
                  item.numberElement.getAttribute(
                    "class"
                  ) || "",
                textContent:
                  textOf(
                    item.numberElement
                  ),
                innerHTML:
                  item.numberElement.innerHTML
                    .slice(0, 600),
                dataValue:
                  item.numberElement.getAttribute(
                    "data-value"
                  ),
                dataCount:
                  item.numberElement.getAttribute(
                    "data-count"
                  ),
                dataTarget:
                  item.numberElement.getAttribute(
                    "data-target"
                  ),
                ariaLabel:
                  item.numberElement.getAttribute(
                    "aria-label"
                  ),
                outerHTML:
                  item.numberElement.outerHTML
                    .slice(0, 600)
              }
            : null,
        labelNode:
          item.labelElement
            ? {
                tag:
                  item.labelElement.tagName,
                className:
                  item.labelElement.getAttribute(
                    "class"
                  ) || "",
                textContent:
                  textOf(
                    item.labelElement
                  ),
                innerHTML:
                  item.labelElement.innerHTML
                    .slice(0, 600),
                dataValue:
                  item.labelElement.getAttribute(
                    "data-value"
                  ),
                dataCount:
                  item.labelElement.getAttribute(
                    "data-count"
                  ),
                dataTarget:
                  item.labelElement.getAttribute(
                    "data-target"
                  ),
                ariaLabel:
                  item.labelElement.getAttribute(
                    "aria-label"
                  ),
                outerHTML:
                  item.labelElement.outerHTML
                    .slice(0, 600)
              }
            : null,
        numberSelectorText:
          textOf(
            item.numberElement
          ),
        labelSelectorText:
          textOf(
            item.labelElement
          )
      })
    )
  );

  const partnersRowElement =
    claimedElement?.querySelector(
      ".partners-row, .partners, [class*='partners-row'], [class*='partners']"
    ) as HTMLElement | null;

  const partnerElements =
    directChildren(
      partnersRowElement,
      ".p, .partner, [class*='partner'], [class*='logo'], *"
    );

  const fallbackPartnerElements =
    partnerElements.length
      ? partnerElements
      : queryElements(
          claimedElement,
          ".partners-row .p, .partners .p, .partners-row > *, .partners > *"
        );

  const partnerItems =
    uniqueTexts(
      fallbackPartnerElements.length
        ? fallbackPartnerElements.map(
            textOf
          )
        : payload?.partnerItems || []
    );

  console.log(
    "HERO PARTNER SOURCE",
    fallbackPartnerElements.map(
      (
        element,
        index
      ) => ({
        index,
        tag:
          element.tagName,
        className:
          element.getAttribute(
            "class"
          ) || "",
        textContent:
          textOf(
            element
          )
      })
    )
  );

  const eyebrowBlock =
    textOf(
      eyebrowElement
    )
      ? createTextBlock(
          textOf(
            eyebrowElement
          ),
          mergeElementStyle(
            eyebrowElement,
            {
              fontSize: "13px",
              fontWeight: "700",
              lineHeight: "1.2",
              letterSpacing: "0.08em",
              textTransform: "uppercase"
            },
            filterTextStyle
          ),
          {
            semanticRole: "eyebrow",
            typographyToken: "label"
          }
        )
      : null;

  const titleBaseStyle =
    mergePresetDesktopStyle(
      {
        width: "100%",
        maxWidth: "980px",
        textAlign: "left",
        lineHeight: "1.05",
        fontSize: "64px",
        fontWeight: "700"
      },
      titleStyle,
      filterHeroTitleStyle
    );

  const scaledTitleBaseStyle =
    applyHeroTitleScale(
      titleBaseStyle,
      titleStyle
    );

  const originalHeroTitlePx =
    parsePxValue(
      desktopOf(
        titleStyle
      ).fontSize
    );

  const emittedHeroTitleBeforePx =
    parsePxValue(
      titleBaseStyle.desktop?.fontSize
    );

  console.log(
    "HERO_TITLE_SCALE_APPLIED",
    {
      originalFontSize:
        desktopOf(
          titleStyle
        ).fontSize,
      emittedBefore:
        titleBaseStyle.desktop?.fontSize,
      emittedAfter:
        scaledTitleBaseStyle.desktop?.fontSize,
      ratioBefore:
        originalHeroTitlePx &&
        emittedHeroTitleBeforePx
          ? Number(
              (
                emittedHeroTitleBeforePx /
                originalHeroTitlePx
              ).toFixed(
                3
              )
            )
          : null
    }
  );

  const titleLineEntries =
    extractHeroTitleLineEntries(
      titleElement,
      titleContent
    );

  const titleBlocks =
    titleLineEntries.map(entry =>
      createTitleBlock(
        entry.content,
        entry.element &&
        entry.element !== titleElement
          ? applyHeroTitleScale(
              mergePresetDesktopStyle(
                scaledTitleBaseStyle.desktop,
                {
                  desktop: {
                    ...desktopOf(
                      extractLayoutStyles(
                        entry.element
                      )
                    ),
                    ...desktopOf(
                      extractTypographyStyles(
                        entry.element
                      )
                    )
                  }
                },
                filterHeroTitleStyle
              ),
              titleStyle
            )
          : scaledTitleBaseStyle
      )
    );

  const subtitleBlock =
    createTextBlock(
      payload?.subtitle ||
        textOf(
          subtitleElement
        ) ||
        "Hero subtext content...",
      mergePresetDesktopStyle(
        {
          textAlign: "left",
          fontSize: "20px",
          lineHeight: "1.6",
          maxWidth: "720px"
        },
        subtitleStyle,
        filterTextStyle
      ),
      {
        semanticRole: "bodyText",
        typographyToken: "body-lg"
      }
    );

  const actionsRow =
    createFlexRow(
      actionItems.map(
        (
          action,
          index
        ) => {
          const actionElement =
            action.element ||
            ctaElement;

          const isAnchor =
            actionElement?.tagName === "A";

          const fallbackActionStyle =
            index === 0
              ? {
                  backgroundColor: "#111827",
                  color: "#ffffff",
                  border: "1px solid #111827"
                }
              : {
                  backgroundColor: "transparent",
                  color: "inherit",
                  border: "1px solid currentColor"
                };

          return {
            id: uuidv4(),
            type: isAnchor
              ? "link"
              : "button",
            data: {
              props: {
                label:
                  action.label,
                ...(isAnchor
                  ? {
                      href:
                        actionElement?.getAttribute(
                          "href"
                        ) || "#"
                    }
                  : {})
              },
              style: {
                ...mergeElementStyle(
                  actionElement,
                  {
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingTop: "14px",
                    paddingBottom: "14px",
                    paddingLeft: "22px",
                    paddingRight: "22px",
                    borderRadius: "999px",
                    fontWeight: "700",
                    lineHeight: "1",
                    textDecoration: "none",
                    ...fallbackActionStyle
                  },
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
          } as Block;
        }
      ),
      {
        gap: "16px",
        width: "auto",
        maxWidth: "100%",
        alignItems: "center",
        justifyContent: "flex-start",
        flexWrap: "wrap"
      },
      {
        width: "auto",
        maxWidth: "none",
        flex: "0 0 auto",
        flexGrow: 0,
        flexShrink: 0
      }
    );

  const kpiRow =
    createFlexRow(
      kpiItems.map(
        (
          item,
          index
        ) =>
          createKpiBlock(
            item,
            index
          )
      ),
      {
        ...mergeElementDesktopStyle(
          kpiContainer,
          {
            display: "flex",
            flexDirection: "row",
            flexWrap: "nowrap",
            alignItems: "stretch",
            justifyContent: "space-between",
            gap: "32px",
            width: "100%",
            maxWidth: "100%"
          },
          filterHeroLayoutStyle
        ),
        flexDirection: "row",
        flexWrap: "nowrap"
      },
      {
        flex: "1 1 0",
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: "0",
        width: "auto",
        minWidth: "0"
      }
    );

  console.log(
    "KPI ROW CHILDREN COUNT",
    kpiRow?.children?.length,
    kpiRow?.children?.map(c => ({
      type:
        c.type,
      childCount:
        c.children?.length,
      firstChildText:
        c.children?.[0]?.children?.[0]?.data?.props?.content
    }))
  );

  const partnersRow =
    createFlexRow(
      partnerItems.map(
        (
          item,
          index
        ) =>
          createTextBlock(
            item,
            mergeElementStyle(
              fallbackPartnerElements[index],
              {
                fontSize: "13px",
                fontWeight: "600",
                lineHeight: "1.3",
                opacity: 0.72
              },
              filterTextStyle
            ),
            {
              semanticRole: "partner",
              typographyToken: "label"
            }
          )
      ),
      {
        gap: "18px",
        width: "100%",
        flexDirection: "row",
        flexWrap: "wrap"
      },
      {
        width: "auto",
        maxWidth: "none",
        flex: "0 1 auto"
      }
    );

  const contentChildren =
    [
      eyebrowBlock,
      ...titleBlocks,
      subtitleBlock,
      actionsRow,
      kpiRow,
      partnersRow
    ].filter(
      (block): block is Block =>
        !!block
    );

  console.log(
    "HERO_PRESET_COMPLETENESS",
    {
      hasEyebrow:
        !!eyebrowBlock,
      actionCount:
        actionLabels.length,
      kpiCount:
        kpiItems.length,
      partnerCount:
        partnerItems.length,
      titleLineCount:
        titleBlocks.length,
      childTypes:
        contentChildren.map(
          child => child.type
        )
    }
  );

  const mergedHeroSectionStyle =
    mergePresetDesktopStyle(
      {
        paddingTop: "120px",
        paddingBottom: "120px",
        paddingLeft: "24px",
        paddingRight: "24px",
        backgroundColor: "#020B18"
      },
      sectionStyle,
      filterHeroSectionStyle
    );

  const heroDesktopStyle =
    mergedHeroSectionStyle.desktop || {};

  const hasUsableHeroBackground =
    !!heroDesktopStyle.backgroundImage &&
    heroDesktopStyle.backgroundImage !== "none" ||
    (
      !!heroDesktopStyle.backgroundColor &&
      ![
        "transparent",
        "rgba(0, 0, 0, 0)",
        "rgba(0,0,0,0)"
      ].includes(
        String(
          heroDesktopStyle.backgroundColor
        )
      )
    ) ||
    (
      !!heroDesktopStyle.background &&
      ![
        "transparent",
        "rgba(0, 0, 0, 0)",
        "rgba(0,0,0,0)",
        "none"
      ].includes(
        String(
          heroDesktopStyle.background
        )
      )
    );

  if (!hasUsableHeroBackground) {
    heroDesktopStyle.backgroundColor =
      "#020B18";
  }

  const heroBlock: Block = {

    id: uuidv4(),

    type: "section" as const,

    meta: {

      semanticType:
        "HERO_SECTION",

      confidence:
        0.96
    },

    data: {

      props: {},

      style: {

        ...mergedHeroSectionStyle
      }
    },

    children: [

      // =====================================
      // MAIN FLEX
      // =====================================

      {
        id: uuidv4(),

        type: "flex" as const,

        data: {

          props: {},

          style: {

            desktop: {
              display:
                "flex",

              flexDirection:

                payload?.image &&
                payload?.layout?.variant ===
                  "split"

                  ? "row"

                  : "column",

alignItems:

  payload?.layout?.variant ===
  "centered"

    ? "center"

    : "flex-start",

justifyContent:

  payload?.image &&
  payload?.layout?.variant ===
    "split"

    ? "space-between"

    : "flex-start",
              gap:

                payload?.image &&
                payload?.layout?.variant ===
                  "split"

                  ? "40px"

                  : "24px",

              width:
                "100%",

              maxWidth:
                "1180px",

              marginLeft:
                "auto",

              marginRight:
                "auto"
            },

            tablet: {

              flexDirection:
                "column"
            },

            mobile: {

              flexDirection:
                "column"
            }
          }
        },

        children: [

          // =====================================
          // CONTENT ITEM
          // =====================================

          {
            id: uuidv4(),

            type: "flexItem" as const,

            data: {

              props: {},

              style: {

                desktop: {

                  width:

                    payload?.image &&
                    payload?.layout?.variant ===
                      "split"

                      ? "50%"

                      : "100%",

                  maxWidth:

                    payload?.image &&
                    payload?.layout?.variant ===
                      "split"

                      ? "620px"

                      : "1180px",

                  display:
                    "flex",

                  flexDirection:
                    "column",

                  alignItems:
                    "flex-start",

                  justifyContent:
                    "flex-start",

                  gap:
                    "24px"
                },

                tablet: {

                  width:
                    "100%"
                },

                mobile: {

                  width:
                    "100%"
                }
              }
            },

            children:
              contentChildren
          },

          // =====================================
          // IMAGE ITEM
          // =====================================

          ...(payload?.image

            ? [

                {
                  id: uuidv4(),

                  type: "flexItem" as const,

                  data: {

                    props: {},

                    style: {

                      desktop: {

                        width:

                          payload?.layout?.variant ===
                            "split"

                            ? "40%"

                            : "100%",

                        display:
                          "flex",

                        justifyContent:

                          payload?.layout?.variant ===
                          "split"

                            ? "space-between"

                            : "center"
                      },

                      tablet: {

                        width:
                          "100%"
                      },

                      mobile: {

                        width:
                          "100%"
                      }
                    }
                  },

                  children: [

                    {
                      id: uuidv4(),

                      type: "image" as const,

                      data: {

                        props: {

                          url:
                            payload.image,

                          alt:
                            "Hero Image"
                        },

                        style: {

                          desktop: {

                            width:
                              "100%",

                            borderRadius:
                              "20px",

                            objectFit:
                              "cover"
                          },

                          tablet: {},

                          mobile: {}
                        }
                      },

                      children: []
                    }
                  ]
                }
              ]

            : [])
        ]
      }
    ]
  };

  console.log(
    "HERO_VISUAL_STYLE_REPORT",
    {
      section:
        getComputedHeroStyle(
          claimedElement
        ),
      titleNodes:
        [
          titleElement,
          ...titleLineEntries
            .map(entry => entry.element)
            .filter(
              (
                element
              ): element is HTMLElement =>
                !!element &&
                element !== titleElement
            )
        ].map(
          getComputedHeroStyle
        ),
      ctaRow:
        getComputedHeroStyle(
          actionElements[0]?.parentElement ||
          ctaElement?.parentElement ||
          null
        ),
      kpiBar:
        {
          ...getComputedHeroStyle(
            kpiContainer
          ),
          itemCount:
            kpiItems.length
        },
      emittedHeroTree:
        summarizeHeroBlockTree(
          heroBlock
        )
    }
  );

  return heroBlock;
}
