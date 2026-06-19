import type {
  StructuralNode
} from "../../structure/buildStructuralGraph";

const cleanText = (
  value?: string | null
) =>
  value
    ?.replace(/\s+/g, " ")
    .trim() || "";

export const resolveCtaCard = (
  node: StructuralNode
) => {
  const element =
    node.element;
const parent =
  element.parentElement as HTMLElement | null;

const parentClass =
  parent?.className?.toString().toLowerCase() || "";

if (
  parentClass.includes("tiers") ||
  parentClass.includes("pricing") ||
  parentClass.includes("grid")
) {
  return null;
}
  const titleElement =
    element.querySelector(
      ":scope > h2, :scope > h3"
    );

  const textElement =
    element.querySelector(
      ":scope > p"
    );

  const actions =
    Array.from(
      element.querySelectorAll(
        ":scope a, :scope button"
      )
    )
      .map(action => ({
        label:
          cleanText(
            action.textContent
          ),
        href:
          action.getAttribute("href") || ""
      }))
      .filter(action => action.label);

  const matches =
    !!titleElement &&
    !!textElement &&
    actions.length > 0;

  if (!matches) {
    return null;
  }

  console.log(
    "✅ CTA_CARD_MATCH",
    {
      className:
        element.getAttribute("class") || "",
      title:
        cleanText(
          titleElement.textContent
        ),
      actionCount:
        actions.length
    }
  );
return {
  type: "CTA_CARD",
  claimedNode: node,
  title:
    cleanText(titleElement.textContent),
  text:
    cleanText(textElement.textContent),
  actions
};
};