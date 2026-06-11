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

  const matches =
    !!titleElement &&
    !!listElement &&
    items.length >= 3;

  if (!matches) {
    return null;
  }

  const title =
    titleElement.textContent
      ?.replace(/\s+/g, " ")
      .trim() || "";

  const description =
    descriptionElement?.textContent
      ?.replace(/\s+/g, " ")
      .trim() || "";

  console.log(
    "✅ CONTENT_LIST_MATCH",
    {
      className:
        getElementClassName(element),
      tag:
        element.tagName,
      title,
      description,
      itemCount:
        items.length
    }
  );

  return {
    type: "CONTENT_LIST_SECTION",
    claimedNode: node,
    payload: {
      type: "CONTENT_LIST_SECTION",
      title,
      description,
      items
    }
  };
};