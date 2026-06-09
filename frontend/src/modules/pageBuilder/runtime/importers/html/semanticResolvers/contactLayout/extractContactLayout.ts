import {
  extractComputedStyles
} from "../../../css/extractComputedStyles";

import type {
  StructuralNode
} from "../../structure/buildStructuralGraph";

export const extractContactLayout = (
  node: StructuralNode
) => {

  // =====================================
  // CONTACT SECTIONS
  // =====================================

  const rows =

    Array.from(
      node.element.querySelectorAll(
        ".crow"
      )
    );

  const sections =
    rows.map(row => {

      // =====================================
      // TITLE
      // =====================================

      const titleEl =

        row.querySelector(
          "h1,h2,h3,h4,h5,strong,.label,.k"
        );

      const title =

        titleEl?.textContent
          ?.trim() || "";

      // =====================================
      // ITEMS
      // =====================================

      const itemElements =

        Array.from(
          row.children
        )

        .filter(el => {

          const text =
            el.textContent?.trim();

          if (!text) {
            return false;
          }

          // =====================================
          // AVOID DUPLICATED TITLE
          // =====================================

          if (
            text === title
          ) {

            return false;
          }

          return true;
        });

      // =====================================
      // EXTRACT ITEMS
      // =====================================

      const items =

        itemElements

          .flatMap(el => {

            // =====================================
            // DIRECT TEXT NODES
            // =====================================

            const directTexts =

              Array.from(
                el.childNodes
              )

              .filter(
                node =>

                  node.nodeType ===
                  Node.TEXT_NODE
              )

              .map(
                node =>

                  node.textContent
                    ?.trim()
              )

              .filter(
                (
                  item
                ): item is string =>
                  !!item
              );

            // =====================================
            // CHILD ELEMENT TEXT
            // =====================================

            const childTexts =

              Array.from(
                el.children
              )

              .flatMap(child => {

                // =====================================
                // LEAF NODE
                // =====================================

                if (
                  !child.children.length
                ) {

                  const text =
                    child.textContent
                      ?.trim();

                  return text
                    ? [text]
                    : [];
                }

                // =====================================
                // NESTED CHILDREN
                // =====================================

                return Array.from(
                  child.children
                )

                .map(
                  nested =>

                    nested.textContent
                      ?.trim()
                )

                .filter(
                  (
                    item
                  ): item is string =>
                    !!item
                );
              });

            // =====================================
            // RETURN
            // =====================================

            return [

              ...directTexts,
              ...childTexts
            ];
          })

          // =====================================
          // CLEAN TEXT
          // =====================================

          .map(
            item =>

              item
                .replace(/\s+/g, " ")
                .trim()
          )

          // =====================================
          // REMOVE NOISE
          // =====================================

          .filter(
            item =>
              item.length > 2
          )

          // =====================================
          // REMOVE DUPLICATES
          // =====================================

          .filter(
            (
              item,
              index,
              array
            ) =>

              array.indexOf(item)
              === index
          );

      // =====================================
      // RETURN SECTION
      // =====================================

      return {

        title,

        items,

        style:
          extractComputedStyles(
            row as HTMLElement
          )
      };
    });

  // =====================================
  // FORM
  // =====================================

  const form =

    node.element.querySelector(
      "form"
    );

  const formStyle =

    form
      ? extractComputedStyles(
          form as HTMLElement
        )
      : {};

  // =====================================
  // FORM FIELDS
  // =====================================

const formRows =

  Array.from(

    node.element.querySelectorAll(

      ".field-row, .field, .frow, .cinput"
    )
  );
 
const formFields =

  formRows

    .map(row => {

      const inputs =

        Array.from(
          row.querySelectorAll(
            "input, textarea, select"
          )
        );

      const fields =
        inputs.map(input => {

          // =====================================
          // LABEL
          // =====================================

          const parent =
            input.parentElement;

          const label =

            parent
              ?.querySelector(
                "label"
              )
              ?.textContent
              ?.trim() || "";

          // =====================================
          // OPTIONS
          // =====================================

          const options =

            input.tagName.toLowerCase()
            === "select"

              ? Array.from(
                  (
                    input as HTMLSelectElement
                  ).options
                )

                .map(
                  option =>
                    option.textContent
                      ?.trim()
                )

                .filter(
                  (
                    item
                  ): item is string =>
                    !!item
                )

              : [];

          // =====================================
          // FIELD
          // =====================================

          return {

            tag:
              input.tagName.toLowerCase(),

            placeholder:
              input.getAttribute(
                "placeholder"
              ) || "",

            type:
              input.getAttribute(
                "type"
              ) || "",

            label,

            options,

            style:
              extractComputedStyles(
                input as HTMLElement
              )
          };
        });

      if (!fields.length) {
        return null;
      }

      return {

        style:
          extractComputedStyles(
            row as HTMLElement
          ),

        fields
      };
    })

    .filter(Boolean);
  // =====================================
  // HERO TITLE
  // =====================================

  const heroTitle =

    node.element.querySelector(
      "h1"
    );

  const heroStyle =

    heroTitle
      ? extractComputedStyles(
          heroTitle as HTMLElement
        )
      : {};

  // =====================================
  // RETURN
  // =====================================

  return {

  sections,

  formRows: formFields,

  formStyle,

  heroStyle
};
};