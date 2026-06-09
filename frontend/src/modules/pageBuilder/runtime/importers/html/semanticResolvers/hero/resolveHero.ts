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
      ".num, .number, .value"
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
  const kpiBar =
    heroElement.querySelector(
      ".kpi-bar"
    );

  const kpiElements =
    kpiBar
      ? Array.from(
          kpiBar.children
        ).filter(child =>
          child.matches(
            ".kpi, .stat, .metric, [class*='kpi'], [class*='stat'], [class*='metric']"
          )
        )
      : [];

  const debugItems =
    kpiElements.map(item => {
      console.log(
        "HERO_RESOLVER_KPI_ITEMS_FULL_HTML",
        item.outerHTML
      );

      const labelElement =
        item.querySelector(
          ".lbl, .label, .caption"
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
        kpiBar
          ? {
              tag:
                kpiBar.tagName,
              className:
                classOf(kpiBar),
              childCount:
                kpiBar.children.length,
              rawText:
                textOf(kpiBar)
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

  const payload =

    extractHero(
      node
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

console.log(
  "🚨 HERO CLAIM NODE",
  node.element.className,
  node.path
);

const heroClaimNode =

  node.element.tagName === "HEADER"

    ? node

    : node.children.find(
        child =>
          child.element.tagName ===
          "HEADER"
      );

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
    heroClaimNode || undefined
  };
};
