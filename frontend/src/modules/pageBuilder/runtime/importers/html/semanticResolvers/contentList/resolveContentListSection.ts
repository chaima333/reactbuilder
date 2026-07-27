import type {
  StructuralNode
} from "../../structure/buildStructuralGraph";

import {
  getElementClassName
} from "../../domGuards";

export const resolveContentListSection = (
  node: StructuralNode
) => {
  const element =
    node.element;

  const titleElement =
    element.querySelector(
      ":scope > h2, :scope > h3"
    );

  const descriptionElement =
    element.querySelector(
      ":scope > p"
    );

  const listElement =
    element.querySelector(
      ":scope > ul, :scope > ol"
    );

  const itemElements =
    listElement
      ? Array.from(
          listElement.querySelectorAll(
            ":scope > li"
          )
        )
      : [];

  const items =
    itemElements
      .map(item =>
        item.textContent
          ?.replace(/\s+/g, " ")
          .trim()
      )
      .filter(Boolean) as string[];

  const title =
    titleElement?.textContent
      ?.replace(/\s+/g, " ")
      .trim() || "";

  const description =
    descriptionElement?.textContent
      ?.replace(/\s+/g, " ")
      .trim() || "";

  const matches =
    !!titleElement &&
    !!listElement &&
    items.length >= 3;

  console.log(
    "🔎 CONTENT_LIST_RESOLVER_CHECK",
    {
      matches,
      className:
        getElementClassName(
          element
        ),
      tag:
        element.tagName,
      hasTitle:
        !!titleElement,
      hasDescription:
        !!descriptionElement,
      hasList:
        !!listElement,
      itemCount:
        items.length,
      title,
      description,
      preview:
        element.textContent
          ?.replace(/\s+/g, " ")
          .trim()
          .slice(0, 160)
    }
  );

  if (!matches) {
    return null;
  }

  console.log(
    "✅ CONTENT_LIST_MATCH",
    {
      className:
        getElementClassName(
          element
        ),
      tag:
        element.tagName,
      title,
      description,
      itemCount:
        items.length
    }
  );

  console.log(
    "🔥 CONTENT_LIST_RESOLVER_ACTIVE",
    {
      title,
      description,
      items,
      className:
        element.className,
      tag:
        element.tagName
    }
  );

  return {
    type:
      "CONTENT_LIST_SECTION",

    claimedNode:
      node,

    payload: {
      type:
        "CONTENT_LIST_SECTION",

      title,
      description,
      items
    }
  };
};