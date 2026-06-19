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

  const identity =
    `${getElementClassName(element)} ${getElementClassName(element.parentElement as HTMLElement)}`
      .toLowerCase();

  if (
    identity.includes("job") ||
    identity.includes("jobs") ||
    identity.includes("markets")
  ) {
    return null;
  }

  const directButton =
    element.querySelector(
      ":scope > a, :scope > button"
    );

  const textNodes =
    element.querySelectorAll(
      ":scope div"
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

  const labelText =
    label.toLowerCase();

  const matches =
    !!directButton &&
    textNodes.length >= 2 &&
    (
      labelText.includes("contact") ||
      labelText.includes("phone") ||
      labelText.includes("email") ||
      labelText.includes("address")
    );

  if (!matches) {
    return null;
  }

  const actionText =
    directButton.textContent
      ?.replace(/\s+/g, " ")
      .trim() || "";

  const actionHref =
    directButton instanceof HTMLAnchorElement
      ? directButton.getAttribute("href") || ""
      : "";

  console.log(
    "✅ INFO_BANNER_MATCH",
    {
      className:
        getElementClassName(element),
      tag:
        element.tagName,
      label,
      buttonText:
        actionText
    }
  );

  return {
    type: "INFO_BANNER",
    claimedNode: node,
    label,
    value,
    actionText,
    actionHref
  };
};