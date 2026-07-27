import { HeroPayload } from "../../semanticContracts/HeroPayload";

import type {
  StructuralNode
} from "../../structure/buildStructuralGraph";

import {
  detectHero
} from "./detectHero";

import {
  extractHero
} from "./extractHero";

import {
  validateHero
} from "./validateHero";

const textOf = (
  element?: Element | null
) =>
  element?.textContent
    ?.trim()
    .replace(/\s+/g, " ") || "";

const classOf = (
  element?: Element | null
) =>
  typeof (element as HTMLElement | null)
    ?.className === "string"
    ? ((element as HTMLElement)
        .className || "")
    : "";

const hasHeroClass = (
  element?: Element | null
) =>
  /\b(?:page-hero|hero)\b/i.test(
    classOf(element)
  ) ||
  classOf(element)
    .toLowerCase()
    .includes("hero");

const hasLeadText = (
  element?: Element | null
) =>
  !!element?.querySelector?.(
    ".lead, [class*='lead'], p"
  );

const looksLikeHeroRootElement = (
  element?: HTMLElement | null
) => {
  if (!element) {
    return false;
  }

  const tag =
    element.tagName;

  const explicitHero =
    tag === "HEADER" ||
    tag === "SECTION" ||
    hasHeroClass(element);

  if (
    explicitHero &&
    !!element.querySelector("h1")
  ) {
    return true;
  }

  return (
    (
      tag === "HEADER" ||
      tag === "SECTION"
    ) &&
    !!element.querySelector("h1") &&
    hasLeadText(element)
  );
};

const findHeroRootNode = (
  node: StructuralNode
): StructuralNode => {
  if (
    looksLikeHeroRootElement(
      node.element
    )
  ) {
    return node;
  }

  const queue = [
    ...node.children
  ];

  while (
    queue.length
  ) {
    const current =
      queue.shift()!;

    if (
      looksLikeHeroRootElement(
        current.element
      )
    ) {
      return current;
    }

    queue.push(
      ...current.children
    );
  }

  return node;
};

const uniqueTexts = (
  values: string[]
) =>
  Array.from(
    new Set(
      values
        .map(value =>
          value.trim()
        )
        .filter(Boolean)
    )
  );

const readKpiDataValue = (
  element?: Element | null
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

const readKpiDataSuffix = (
  element?: Element | null
) =>
  (
    element?.getAttribute(
      "data-suffix"
    ) || ""
  ).trim();

const readVisibleCurrencyPrefix = (
  value: string
) =>
  value.trim().match(
    /^([$€£])/
  )?.[1] || "";

const readKpiDataNumber = (
  node: Element | null
) => {
  if (!node) {
    return "";
  }

  const source =
    node.querySelector(
      "[data-count], [data-value], [data-target]"
    ) ||
    node;

  const value =
    source.getAttribute(
      "data-count"
    ) ||
    source.getAttribute(
      "data-value"
    ) ||
    source.getAttribute(
      "data-target"
    ) ||
    "";

  const suffix =
    source.getAttribute(
      "data-suffix"
    ) || "";

  const wrapperText =
    textOf(
      node
    );

  const prefix =
    wrapperText.match(
      /^([$€£])/
    )?.[1] || "";

  if (!value) {
    return "";
  }

  return `${prefix}${value}${suffix}`;
};

const readKpiDataNumberMeta = (
  node: Element | null
) => {
  if (!node) {
    return {
      value: "",
      suffix: ""
    };
  }

  const source =
    node.querySelector(
      "[data-count], [data-value], [data-target]"
    ) ||
    node;

  return {
    value:
      source.getAttribute(
        "data-count"
      ) ||
      source.getAttribute(
        "data-value"
      ) ||
      source.getAttribute(
        "data-target"
      ) ||
      "",
    suffix:
      source.getAttribute(
        "data-suffix"
      ) || ""
  };
};

const isUsableKpiNumber = (
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

const isPlaceholderZeroWithLabel = (
  value: string,
  label: string
) =>
  !!label.trim() &&
  /^[$€£]?\s*0(?:[.,]0+)?\s*(?:[+%])?$/.test(
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

const getKpiNumberElement = (
  item: Element
) => {
  const wrapper =
    item.querySelector(
      ".num, .number, .value, .v, [class*='num'], [class*='number'], [class*='value']"
    );

  const attrNode =
    wrapper?.querySelector(
      "[data-value], [data-target], [data-count]"
    ) ||
    item.querySelector(
      "[data-value], [data-target], [data-count]"
    );

  return {
    wrapper,
    attrNode,
    numberElement:
      wrapper || attrNode
  };
};

const getKpiLabelElement = (
  item: Element
) =>
  item.querySelector(
    ".lbl, .label, .caption, .k, [class*='label'], [class*='caption'], [class*='key']"
  );

const hasKpiValueAndLabelPair = (
  element: Element
) =>
  !!(
    element.querySelector(
      ".v, .num, .number, .value, [data-value], [data-target], [data-count], [class*='num'], [class*='number'], [class*='value']"
    ) &&
    getKpiLabelElement(
      element
    )
  );

const getHeroKpiCandidateElements = (
  heroElement: HTMLElement
) => {
  const barSelector =
    ".kpi-bar, .stats, .metrics, [class*='stats'], [class*='kpi'], [class*='metrics']";

  const itemSelector =
    ".kpi, .stat, .metric, .s, [class*='kpi'], [class*='stat'], [class*='metric']";

  const seen =
    new Set<Element>();

  const addUnique = (
    candidates: Element[]
  ) => {
    candidates.forEach(candidate => {
      if (
        candidate !== heroElement &&
        !seen.has(candidate)
      ) {
        seen.add(candidate);
      }
    });
  };

  Array.from(
    heroElement.querySelectorAll(
      barSelector
    )
  ).forEach(bar => {
    const directItems =
      Array.from(
        bar.children
      ).filter(child =>
        child.matches(
          itemSelector
        ) ||
        hasKpiValueAndLabelPair(
          child
        )
      );

    if (directItems.length) {
      addUnique(directItems);
      return;
    }

    addUnique(
      Array.from(
        bar.querySelectorAll(
          itemSelector
        )
      ).filter(candidate =>
        hasKpiValueAndLabelPair(
          candidate
        ) ||
        /\d/.test(
          textOf(candidate)
        )
      )
    );
  });

  if (!seen.size) {
    addUnique(
      Array.from(
        heroElement.querySelectorAll(
          itemSelector
        )
      ).filter(candidate =>
        hasKpiValueAndLabelPair(
          candidate
        )
      )
    );
  }

  return Array.from(
    seen
  );
};

const findKpiNumber = (
  item: Element,
  label: string
) => {
  const {
    wrapper,
    numberElement
  } =
    getKpiNumberElement(
      item
    );

  const dataNumber =
    readKpiDataNumber(
      wrapper || numberElement
    );
  const dataNumberMeta =
    readKpiDataNumberMeta(
      wrapper || numberElement
    );

  if (dataNumber) {
    console.log(
      "HERO_KPI_FINAL_VALUE",
      {
        rawText:
          textOf(item),
        dataCount:
          dataNumberMeta.value,
        dataSuffix:
          dataNumberMeta.suffix,
        resolvedNumber:
          dataNumber
      }
    );

    return dataNumber;
  }

  const candidates =
    [
      item,
      numberElement,
      ...(numberElement
        ? Array.from(
            numberElement.querySelectorAll(
              "[data-value], [data-target], [data-count]"
            )
          )
        : []),
      ...Array.from(
        item.querySelectorAll(
          "[data-value], [data-target], [data-count]"
        )
      )
    ].filter(Boolean) as Element[];

  for (const candidate of candidates) {
    const value =
      readKpiDataValue(
        candidate
      );

    if (
      isUsableKpiNumber(
        value
      ) &&
      !isPlaceholderZeroWithLabel(
        value,
        label
      )
    ) {
      const visibleNumber =
        textOf(
          wrapper || numberElement
        );
      const dataSuffix =
        readKpiDataSuffix(
          candidate
        ) ||
        readKpiDataSuffix(
          wrapper
        ) ||
        readKpiDataSuffix(
          item
        );
      const resolvedNumber =
        `${readVisibleCurrencyPrefix(
          visibleNumber ||
          textOf(item)
        )}${value}${dataSuffix}`;

      console.log(
        "HERO_KPI_FINAL_VALUE",
        {
          rawText:
            textOf(item),
          dataCount:
            value,
          dataSuffix,
          resolvedNumber
        }
      );

      if (
        dataSuffix ||
        readVisibleCurrencyPrefix(
          visibleNumber ||
          textOf(item)
        )
      ) {
        return resolvedNumber;
      }

      if (
        isRicherFormattedKpiValue(
          visibleNumber,
          value
        )
      ) {
        return visibleNumber;
      }

      return mergeKpiAffixes(
        value,
        visibleNumber
      );
    }
  }

  const visibleNumber =
    textOf(
      wrapper || numberElement
    );

  if (
    isUsableKpiNumber(
      visibleNumber
    ) &&
    !isPlaceholderZeroWithLabel(
      visibleNumber,
      label
    )
  ) {
    return visibleNumber;
  }

  return "";
};

const extractHeroKpiItems = (
  heroElement: HTMLElement
) => {
  const kpiElements =
    getHeroKpiCandidateElements(
      heroElement
    );

  const debugItems =
    kpiElements.map(item => {
      console.log(
        "HERO_RESOLVER_KPI_ITEMS_FULL_HTML",
        item.outerHTML
      );

      const labelElement =
        getKpiLabelElement(
          item
        );
      const numberElement =
        getKpiNumberElement(
          item
        ).numberElement;
      const label =
        textOf(labelElement);
      const number =
        findKpiNumber(
          item,
          label
        );

      return {
        tag:
          item.tagName,
        className:
          classOf(item),
        rawText:
          textOf(item),
        outerHTML:
          item.outerHTML.slice(
            0,
            1200
          ),
        numberNode:
          numberElement
            ? {
                tag:
                  numberElement.tagName,
                className:
                  classOf(
                    numberElement
                  ),
                spanText:
                  textOf(
                    numberElement.querySelector(
                      "span"
                    )
                  ),
                text:
                  textOf(
                    numberElement
                  ),
                dataValue:
                  numberElement.getAttribute(
                    "data-value"
                  ),
                dataTarget:
                  numberElement.getAttribute(
                    "data-target"
                  ),
                dataCount:
                  numberElement.getAttribute(
                    "data-count"
                  ),
                outerHTML:
                  numberElement.outerHTML.slice(
                    0,
                    600
                  )
              }
            : null,
        number,
        label,
        emitted:
          number && label
            ? `${number} ${label}`
            : number || label
      };
    });

  console.log(
    "HERO_RESOLVER_KPI_ITEMS",
    {
      kpiBar:
        kpiElements[0]?.parentElement
          ? {
              tag:
                kpiElements[0].parentElement.tagName,
              className:
                classOf(
                  kpiElements[0].parentElement
                ),
              childCount:
                kpiElements[0].parentElement.children.length,
              rawText:
                textOf(
                  kpiElements[0].parentElement
                )
            }
          : null,
      items:
        debugItems
    }
  );

  return uniqueTexts(
    debugItems
      .map(item =>
        item.emitted
      )
      .filter(Boolean)
  );
};

const looksLikeLocationList = (
  value: string
) =>
  /(?:tunis|paris|wilmington|san francisco|office|location|siège|europe|usa)/i.test(
    value
  ) &&
  /[·,|]/.test(
    value
  );

const extractHeroPartnerItems = (
  heroElement: HTMLElement
) => {
  const partnersRow =
    heroElement.querySelector(
      ".partners-row"
    );

  const rowItems =
    partnersRow
      ? Array.from(
          partnersRow.children
        ).filter(child =>
          child.matches(
            ".p, .partner, .logo, [class*='partner'], [class*='logo']"
          )
        )
      : [];

  const explicitItems =
    rowItems.length
      ? rowItems
      : Array.from(
          heroElement.querySelectorAll(
            ".partner, .logo, [class*='partner'], [class*='logo']"
          )
        ).filter(item =>
          !item.matches(
            ".partners, .partners-row"
          )
        );

  const debugItems =
    explicitItems
      .filter(item => {
        const klass =
          classOf(item);
        const text =
          textOf(item);

        return (
          !/(locations?|offices?|cities?|city)/i.test(
            klass
          ) &&
          !looksLikeLocationList(
            text
          )
        );
      })
      .map(item => ({
        tag:
          item.tagName,
        className:
          classOf(item),
        text:
          textOf(item)
      }))
      .filter(item =>
        !!item.text
      );

  console.log(
    "HERO_RESOLVER_PARTNER_ITEMS",
    {
      partnersRow:
        partnersRow
          ? {
              tag:
                partnersRow.tagName,
              className:
                classOf(partnersRow),
              childCount:
                partnersRow.children.length,
              rawText:
                textOf(partnersRow)
            }
          : null,
      items:
        debugItems
    }
  );

  return uniqueTexts(
    debugItems.map(
      item => item.text
    )
  );
};

const normalizeCssValue = (
  value: unknown
) =>
  String(value || "")
    .replace(/\s+/g, "")
    .toLowerCase();

const isTransparentPaint = (
  value: unknown
) => {
  const normalized =
    normalizeCssValue(
      value
    );

  return (
    !normalized ||
    normalized === "transparent" ||
    normalized === "none" ||
    normalized === "initial" ||
    normalized === "inherit" ||
    normalized === "unset" ||
    normalized === "rgba(0,0,0,0)" ||
    normalized === "rgb(0,0,0,0)"
  );
};

const isDefaultWhitePaint = (
  value: unknown
) => {
  const normalized =
    normalizeCssValue(
      value
    );

  return (
    normalized === "white" ||
    normalized === "#fff" ||
    normalized === "#ffffff" ||
    normalized === "rgb(255,255,255)" ||
    normalized === "rgba(255,255,255,1)" ||
    normalized === "rgb(255,255,255)"
  );
};

const hasRealPaint = (
  style: Record<string, any>
) => {
  const background =
    String(style.background || "");

  const backgroundColor =
    style.backgroundColor;

  const backgroundImage =
    style.backgroundImage;

  const hasImage =
    backgroundImage &&
    !isTransparentPaint(
      backgroundImage
    );

  if (
    hasImage
  ) {
    return true;
  }

  const colorIsReal =
    backgroundColor &&
    !isTransparentPaint(
      backgroundColor
    ) &&
    !isDefaultWhitePaint(
      backgroundColor
    );

  if (
    colorIsReal
  ) {
    return true;
  }

  const shorthandLooksWhite =
    isDefaultWhitePaint(
      backgroundColor
    ) ||
    background
      .replace(/\s+/g, "")
      .toLowerCase()
      .includes(
        "rgb(255,255,255)"
      ) ||
    background
      .toLowerCase()
      .includes(
        "white"
      ) ||
    background
      .includes(
        "#fff"
      ) ||
    background
      .includes(
        "#ffffff"
      );

  if (
    shorthandLooksWhite
  ) {
    return false;
  }

  return (
    !!background &&
    !isTransparentPaint(
      background
    )
  );
};
const extractPaintStyle = (
  element: HTMLElement
) => {
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
    backgroundImage:
      computed.backgroundImage,
    backgroundSize:
      computed.backgroundSize,
    backgroundPosition:
      computed.backgroundPosition,
    backgroundRepeat:
      computed.backgroundRepeat
  };
};

const resolveHeroSectionStyle = (
  element?: HTMLElement | null
) => {
  let current =
    element;

  while (
    current &&
    current.tagName !== "HTML"
  ) {
    const paint =
      extractPaintStyle(
        current
      );

    if (
      hasRealPaint(
        paint
      )
    ) {
      return {
        desktop:
          paint,
        tablet: {},
        mobile: {}
      };
    }

    current =
      current.parentElement;
  }

  const document =
    element?.ownerDocument;

  const body =
    document?.body as HTMLElement | undefined;

  const html =
    document?.documentElement as HTMLElement | undefined;

  const bodyPaint =
    body
      ? extractPaintStyle(
          body
        )
      : null;

  if (
    bodyPaint &&
    hasRealPaint(
      bodyPaint
    )
  ) {
    return {
      desktop:
        bodyPaint,
      tablet: {},
      mobile: {}
    };
  }

  const htmlPaint =
    html
      ? extractPaintStyle(
          html
        )
      : null;

  if (
    htmlPaint &&
    hasRealPaint(
      htmlPaint
    )
  ) {
    return {
      desktop:
        htmlPaint,
      tablet: {},
      mobile: {}
    };
  }

  return undefined;
};

export const resolveHero = (
  node: StructuralNode
): HeroPayload | null => {

  // =====================================
  // DETECT
  // =====================================

  const detected =

    detectHero(
      node
    );

  if (
    !detected
  ) {

    return null;
  }

  // =====================================
  // EXTRACT
  // =====================================

  const heroRootNode =
    findHeroRootNode(
      node
    );

  const payload =

    extractHero(
      heroRootNode
    );

  // =====================================
  // VALIDATE
  // =====================================

  const valid =

    validateHero(
      payload
    );

  if (
    !valid
  ) {

    return null;
  }

const heroClaimNode =
  heroRootNode;

  const heroElement =
    heroClaimNode?.element ||
    node.element;

  const kpiItems =
    extractHeroKpiItems(
      heroElement
    );

  const partnerItems =
    extractHeroPartnerItems(
      heroElement
    );

  // =====================================
  // RESULT
  // =====================================

  return {

    type:
      "HERO_SECTION",

    ...payload,

    kpiItems,

    partnerItems,

    claimedNode:
    heroClaimNode || node,

    styles: {
      section:
        resolveHeroSectionStyle(
          heroElement
        )
    }
  };
};