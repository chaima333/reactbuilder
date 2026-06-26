import {
  extractComputedStyles
} from "../../../css/extractComputedStyles";

import type {
  StructuralNode
} from "../../structure/buildStructuralGraph";

const cleanText = (
  value?: string | null
) =>
  value
    ?.replace(/\s+/g, " ")
    .trim() || "";

const asHtml = (
  element?: Element | null
) =>
  element as HTMLElement | null;

const isTransparentPaint = (
  value?: string
) => {
  const normalized =
    (value || "")
      .replace(/\s+/g, "")
      .toLowerCase();

  return (
    !normalized ||
    normalized === "transparent" ||
    normalized === "none" ||
    normalized === "rgba(0,0,0,0)" ||
    normalized.includes("rgba(0,0,0,0)")
  );
};

const resolveCssVars = (
  element: HTMLElement,
  value = ""
) => {
  const computed =
    element.ownerDocument.defaultView
      ?.getComputedStyle(element);

  return value.replace(
    /var\((--[^,\s)]+)(?:,[^)]+)?\)/g,
    (_, variableName) =>
      computed
        ?.getPropertyValue(variableName)
        ?.trim() ||
      ""
  );
};

const cssPropToCamel = (
  prop: string
) =>
  prop.replace(
    /-([a-z])/g,
    (_, letter) =>
      letter.toUpperCase()
  );

const readDeclaredStyles = (
  element: HTMLElement,
  props: string[]
) => {
  const declared: Record<string, any> = {};
  const document =
    element.ownerDocument;

  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList;

    try {
      rules =
        sheet.cssRules;
    } catch {
      continue;
    }

    const visitRules = (
      ruleList: CSSRuleList
    ) => {
      for (const rule of Array.from(ruleList)) {
        const nestedRules =
          (rule as CSSMediaRule).cssRules;

        if (nestedRules) {
          try {
            visitRules(nestedRules);
          } catch {
            // ignore inaccessible nested rules
          }
        }

        const styleRule =
          rule as CSSStyleRule;

        if (
          !styleRule.selectorText ||
          !styleRule.style
        ) {
          continue;
        }

        try {
          if (
            !element.matches(styleRule.selectorText)
          ) {
            continue;
          }
        } catch {
          continue;
        }

        props.forEach(prop => {
          const rawValue =
            styleRule.style.getPropertyValue(prop);

          if (!rawValue) {
            return;
          }

          declared[
            cssPropToCamel(prop)
          ] =
            resolveCssVars(
              element,
              rawValue.trim()
            );
        });
      }
    };

    visitRules(rules);
  }

  return declared;
};

const extractSubmitStyle = (
  submitElement?: HTMLElement | null
) => {
  if (!submitElement) {
    return {};
  }

  const computedStyle =
    extractComputedStyles(
      submitElement
    );

  const declaredStyle =
    readDeclaredStyles(
      submitElement,
      [
        "background",
        "background-color",
        "color",
        "border",
        "border-radius",
        "box-shadow",
        "padding",
        "min-height",
        "font-family",
        "font-size",
        "font-weight",
        "letter-spacing",
        "text-transform",
        "text-align",
        "display",
        "align-items",
        "justify-content"
      ]
    );

  return {
    ...computedStyle,
    ...declaredStyle,

    background:
      isTransparentPaint(computedStyle.background)
        ? declaredStyle.background ||
          computedStyle.background
        : computedStyle.background,

    backgroundColor:
      isTransparentPaint(computedStyle.backgroundColor)
        ? declaredStyle.backgroundColor ||
          computedStyle.backgroundColor
        : computedStyle.backgroundColor
  };
};
const looksLikeFlag = (
  value: string
) =>
  Array.from(value).some(char => {
    const code =
      char.codePointAt(0) || 0;

    return (
      code >= 0x1f1e6 &&
      code <= 0x1f1ff
    );
  });

const normalizeOfficeFallbackText = (
  value: string
) =>
  cleanText(value)
    .replace(
      /([a-zà-ÿ])([A-ZÀ-Ý])/g,
      "$1\n$2"
    )
    .replace(
      /([A-Za-zÀ-ÿ])(\d)/g,
      "$1\n$2"
    );

const extractOfficeText = (
  office: HTMLElement
) => {
  const name =
    cleanText(
      office.querySelector(
        ".name,.office-name,[class*='name']"
      )?.textContent
    );

  const address =
    cleanText(
      office.querySelector(
        ".addr,.address,[class*='addr'],[class*='address']"
      )?.textContent
    );

  if (
    name ||
    address
  ) {
    return [
      name,
      address
    ]
      .filter(Boolean)
      .join("\n");
  }

  const children =
    Array.from(
      office.children
    )
      .map(child =>
        cleanText(
          child.textContent
        )
      )
      .filter(Boolean);

  if (
    children.length >= 2
  ) {
    const [
      first,
      second,
      ...rest
    ] = children;

    const title =
      looksLikeFlag(first)
        ? [
            first,
            second
          ]
            .filter(Boolean)
            .join(" ")
        : first;

    const body =
      looksLikeFlag(first)
        ? rest.join(" ")
        : [
            second,
            ...rest
          ].join(" ");

    return [
      title,
      body
    ]
      .filter(Boolean)
      .join("\n");
  }

  return normalizeOfficeFallbackText(
    office.textContent || ""
  );
};

const extractValueText = (
  element?: HTMLElement | null
) => {
  if (!element) {
    return "";
  }

  const directItems =
    Array.from(
      element.querySelectorAll(
        ":scope > a, :scope > .office, :scope > p, :scope > div"
      )
    ) as HTMLElement[];

  if (directItems.length) {
    return directItems
      .map(item => {
        if (
          item.classList.contains("office")
        ) {
          return extractOfficeText(item);
        }

        return cleanText(
          item.textContent
        );
      })
      .filter(Boolean)
      .join("\n");
  }

  return cleanText(
    element.textContent
  );
};

const getFieldGroups = (
  form: HTMLFormElement
) => {
  const rows =
    Array.from(
      form.querySelectorAll(
        ".field-row"
      )
    ) as HTMLElement[];

  const standaloneFields =
    Array.from(
      form.querySelectorAll(
        ".field"
      )
    ).filter(
      (
        field
      ): field is HTMLElement =>
        !field.closest(
          ".field-row"
        )
    );

  return [
    ...rows,
    ...standaloneFields
  ].sort(
    (
      left,
      right
    ) =>
      left.compareDocumentPosition(
        right
      ) &
      Node.DOCUMENT_POSITION_FOLLOWING
        ? -1
        : 1
  );
};

export const extractContactLayout = (
  node: StructuralNode
) => {
  const contactGrid =
    node.element;

  const sectionElement =
    (
      contactGrid.closest("section") as HTMLElement | null
    ) ||
    contactGrid;

  const containerElement =
    contactGrid.parentElement &&
    contactGrid.parentElement !== sectionElement
      ? contactGrid.parentElement as HTMLElement
      : null;

  const contactTable =
    contactGrid.querySelector(
      ":scope > .ctable, .ctable"
    ) as HTMLElement | null;

  const form =
    contactGrid.querySelector(
      ":scope > form.form, :scope > form, form.form"
    ) as HTMLFormElement | null;

  const contactRows =
    contactTable
      ? Array.from(
          contactTable.querySelectorAll(
            ".crow"
          )
        )
          .map(row => {
            const rowElement =
              row as HTMLElement;

            const labelElement =
              asHtml(
                rowElement.querySelector(
                  ".k,.label,dt,strong"
                )
              );

            const valueElement =
              asHtml(
                rowElement.querySelector(
                  ".v,.value,dd"
                )
              ) ||
              asHtml(
                rowElement.querySelector(
                  "a,p"
                )
              );

            return {
              label:
                cleanText(
                  labelElement
                    ?.textContent
                ),

              value:
                extractValueText(
                  valueElement
                ),

              href:
                valueElement?.tagName === "A"
                  ? valueElement.getAttribute(
                      "href"
                    ) || ""
                  : "",

              style:
                extractComputedStyles(
                  rowElement
                ),

              labelStyle:
                labelElement
                  ? extractComputedStyles(
                      labelElement
                    )
                  : {},

              valueStyle:
                valueElement
                  ? extractComputedStyles(
                      valueElement
                    )
                  : {}
            };
          })
          .filter(
            row =>
              !!row.label ||
              !!row.value
          )
      : [];

  const formRows =
    form
      ? getFieldGroups(
          form
        )
          .map(group => {
            const controls =
              Array.from(
                group.querySelectorAll(
                  "input,select,textarea"
                )
              ) as HTMLElement[];

            return {
              style:
                extractComputedStyles(
                  group
                ),

              fields:
                controls.map(control => {
                  const labelElement =
                    asHtml(
                      control.closest(
                        ".field"
                      )?.querySelector(
                        "label"
                      )
                    );

                  const select =
                    control.tagName === "SELECT"
                      ? control as HTMLSelectElement
                      : null;

                  return {
                    tag:
                      control.tagName
                        .toLowerCase(),

                    placeholder:
                      control.getAttribute(
                        "placeholder"
                      ) || "",

                    type:
                      control.getAttribute(
                        "type"
                      ) || "",

                    name:
                      control.getAttribute(
                        "name"
                      ) || "",

                    label:
                      cleanText(
                        labelElement
                          ?.textContent
                      ),

                    options:
                      select
                        ? Array.from(
                            select.options
                          )
                            .map(option =>
                              cleanText(
                                option.textContent
                              )
                            )
                            .filter(Boolean)
                        : [],

                    style:
                      extractComputedStyles(
                        control
                      ),

                    labelStyle:
                      labelElement
                        ? extractComputedStyles(
                            labelElement
                          )
                        : {}
                  };
                })
            };
          })
          .filter(
            row =>
              row.fields.length > 0
          )
      : [];

  const formTitleElement =
    asHtml(
      form?.querySelector(
        ":scope > h1,:scope > h2,:scope > h3,:scope > h4"
      )
    );

  const formDescriptionElement =
    asHtml(
      form?.querySelector(
        ":scope > p"
      )
    );

  const submitElement =
    asHtml(
      form?.querySelector(
        "button[type='submit'],button,input[type='submit']"
      )
    );

  return {
    contactRows,

    gridStyle:
      extractComputedStyles(
        contactGrid
      ),

    contactGridStyle:
      extractComputedStyles(
        contactGrid
      ),

    contactTableStyle:
      contactTable
        ? extractComputedStyles(
            contactTable
          )
        : {},

    containerStyle:
      containerElement
        ? extractComputedStyles(
            containerElement
          )
        : {},

    formRows,

    formTitle:
      cleanText(
        formTitleElement
          ?.textContent
      ),

    formTitleStyle:
      formTitleElement
        ? extractComputedStyles(
            formTitleElement
          )
        : {},

    formDescription:
      cleanText(
        formDescriptionElement
          ?.textContent
      ),

    formDescriptionStyle:
      formDescriptionElement
        ? extractComputedStyles(
            formDescriptionElement
          )
        : {},

    submitLabel:
      cleanText(
        submitElement
          ?.textContent
      ) ||
      submitElement?.getAttribute(
        "value"
      ) ||
      "Submit",

    submitStyle:
      extractSubmitStyle(
        submitElement
      ),

    formStyle:
      form
        ? extractComputedStyles(
            form
          )
        : {},

    sectionStyle:
      extractComputedStyles(
        sectionElement
      ),

    inheritedPageStyle:
      extractComputedStyles(
        contactGrid.ownerDocument.body as HTMLElement
      )
  };
};