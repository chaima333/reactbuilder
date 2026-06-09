import type {
  StructuralNode
} from "../../structure/buildStructuralGraph";

export const extractHero = (
  node: StructuralNode
) => {

  const title =

    node.element.querySelector(
      "h1"
    )
    ?.textContent
    ?.trim();

  const subtitle =

    node.element.querySelector(
      "p"
    )
    ?.textContent
    ?.trim();

  const cta =

    node.element.querySelector(
      "button,a"
    )
    ?.textContent
    ?.trim();

  const buttons =
    Array.from(
      node.element.querySelectorAll(
        "button,a"
      )
    )
      .map(element =>
        element.textContent
          ?.trim() || ""
      )
      .filter(Boolean);

  const kpiItems =
    Array.from(
      node.element.querySelectorAll(
        ".kpi,.stat,.metric,[class*='kpi'],[class*='stat'],[class*='metric']"
      )
    )
      .map(element =>
        element.textContent
          ?.trim() || ""
      )
      .filter(Boolean);

  const partnerItems =
    Array.from(
      node.element.querySelectorAll(
        ".partner,.partners,[class*='partner'],[class*='logo']"
      )
    )
      .map(element =>
        element.textContent
          ?.trim() || ""
      )
      .filter(Boolean);

  return {

    title:
      title || "",

    subtitle:
      subtitle || "",

    ctaText:
      cta || "",

    buttons,

    kpiItems,

    partnerItems
  };
};
