import type {
  StructuralNode
} from "../../structure/buildStructuralGraph";

import {
  getElementClassName
} from "../../domGuards";

export const resolveInfoBanner = (
  node: StructuralNode
) => {

  const element =
    node.element;

  const directButton =

    element.querySelector(
      ":scope > a, :scope > button"
    );

  const textNodes =

    element.querySelectorAll(
      ":scope div"
    );

  const matches =

    !!directButton &&
    textNodes.length >= 2;

  if (!matches) {
    return null;
  }

  console.log(
    "✅ INFO_BANNER_MATCH",
    {
      className:
        getElementClassName(
          element
        ),
      tag:
        element.tagName,
      buttonText:
        directButton.textContent
      ?.trim()
    }
  );

 const label =
  element.querySelector(":scope div div:first-child")
    ?.textContent
    ?.replace(/\s+/g, " ")
    .trim() || "";

const value =
  element.querySelector(":scope div div:nth-child(2)")
    ?.textContent
    ?.replace(/\s+/g, " ")
    .trim() || "";

const actionText =
  directButton.textContent
    ?.replace(/\s+/g, " ")
    .trim() || "";

const actionHref =
  directButton instanceof HTMLAnchorElement
    ? directButton.getAttribute("href") || ""
    : "";

return {
  type: "INFO_BANNER",
  claimedNode: node,
  label,
  value,
  actionText,
  actionHref
};
};