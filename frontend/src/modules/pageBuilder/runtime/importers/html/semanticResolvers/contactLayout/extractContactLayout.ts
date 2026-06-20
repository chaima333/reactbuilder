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
        ).map(row => {
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
                ".v,.value,dd,a,p"
              )
            );

          return {
            label:
              cleanText(
                labelElement
                  ?.textContent
              ),
            value:
              cleanText(
                valueElement
                  ?.textContent
              ),
            href:
              valueElement
                ?.tagName === "A"
                ? valueElement.getAttribute(
                    "href"
                  ) ||
                  ""
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
        }).filter(
          row =>
            !!row.label ||
            !!row.value
        )
      : [];

  const formRows =
    form
      ? getFieldGroups(
          form
        ).map(group => {
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
                  control.tagName ===
                    "SELECT"
                    ? control as HTMLSelectElement
                    : null;

                return {
                  tag:
                    control.tagName
                      .toLowerCase(),
                  placeholder:
                    control.getAttribute(
                      "placeholder"
                    ) ||
                    "",
                  type:
                    control.getAttribute(
                      "type"
                    ) ||
                    "",
                  name:
                    control.getAttribute(
                      "name"
                    ) ||
                    "",
                  label:
                    cleanText(
                      labelElement
                        ?.textContent
                    ),
                  options:
                    select
                      ? Array.from(
                          select.options
                        ).map(option =>
                          cleanText(
                            option.textContent
                          )
                        ).filter(
                          Boolean
                        )
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
        }).filter(
          row =>
            row.fields.length >
            0
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
    contactTableStyle:
      contactTable
        ? extractComputedStyles(
            contactTable
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
      submitElement
        ? extractComputedStyles(
            submitElement
          )
        : {},
    formStyle:
      form
        ? extractComputedStyles(
            form
          )
        : {}
  };
};
