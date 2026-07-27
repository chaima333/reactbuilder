import type {
  StructuralNode
} from "../../structure/buildStructuralGraph";

import {
  getElementClassName
} from "../../domGuards";

const cleanText = (
  value?: string | null
) =>
  value
    ?.replace(/\s+/g, " ")
    .trim() || "";

const findEyebrow = (
  column: HTMLElement
) => {
  const explicit =
    column.querySelector(
      ":scope > .eyebrow, :scope > .badge, :scope > .pill, :scope > [class*='eyebrow'], :scope > [class*='badge'], :scope > [class*='pill'], :scope > small"
    );

  if (
    explicit
  ) {
    return cleanText(
      explicit.textContent
    );
  }

  const title =
    column.querySelector(
      ":scope > h2, :scope > h3"
    );

  const firstChild =
    Array.from(
      column.children
    ).find(
      child =>
        child !== title &&
        child.tagName !== "P"
    );

  const text =
    cleanText(
      firstChild?.textContent
    );

  if (
    text.length > 0 &&
    text.length <= 40
  ) {
    return text;
  }

  return "";
};

export const resolveTwoColumnIntro = (
  node: StructuralNode
) => {
  const element =
    node.element;

  const directChildren =
    Array.from(
      element.children
    ) as HTMLElement[];

  if (
    directChildren.length !== 2
  ) {
    return null;
  }

  const columns =
    directChildren.filter(
      child => {
        const title =
          child.querySelector(
            ":scope > h2, :scope > h3"
          );

        const text =
          child.querySelector(
            ":scope > p"
          );

        return !!title && !!text;
      }
    );

  const matches =
    columns.length === 2;

  if (
    !matches
  ) {
    return null;
  }

  console.log(
    "✅ TWO_COLUMN_INTRO_MATCH",
    {
      className:
        getElementClassName(
          element
        ),
      tag:
        element.tagName,
      columnCount:
        columns.length,
      columns:
        columns.map(
          column => ({
            className:
              getElementClassName(
                column
              ),
            eyebrow:
              findEyebrow(
                column
              ),
            title:
              cleanText(
                column.querySelector(
                  ":scope > h2, :scope > h3"
                )?.textContent
              ),
            text:
              cleanText(
                column.querySelector(
                  ":scope > p"
                )?.textContent
              )
          })
        )
    }
  );

  return {
    type:
      "TWO_COLUMN_INTRO",

    claimedNode:
      node,

    payload: {
      type:
        "TWO_COLUMN_INTRO",

      columns:
        columns.map(
          column => ({
            eyebrow:
              findEyebrow(
                column
              ),

            title:
              cleanText(
                column.querySelector(
                  ":scope > h2, :scope > h3"
                )?.textContent
              ),

            text:
              cleanText(
                column.querySelector(
                  ":scope > p"
                )?.textContent
              )
          })
        )
    }
  };
};