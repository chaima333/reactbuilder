import type {
  StructuralNode
} from "../../structure/buildStructuralGraph";

import {
  getElementClassName
} from "../../domGuards";

export const resolveNavbar = (
  node: StructuralNode
) => {
  const tag =
    node.element.tagName.toLowerCase();

  const className =
    getElementClassName(node.element);

  const isRealNavbar =
    tag === "nav" ||
    className.includes("nav") ||
    className.includes("navbar");

  if (!isRealNavbar) {
    return null;
  }

  const logoLink =
    node.element.querySelector(
      ".logo, a[class*='logo']"
    ) as HTMLAnchorElement | null;

  const logoImage =
    logoLink?.querySelector("img") as HTMLImageElement | null;

  const logo = {
    text:
      logoLink?.textContent
        ?.replace(/\s+/g, " ")
        .trim() || "",

    image:
      logoImage?.getAttribute("src") || "",

    href:
      logoLink?.getAttribute("href") || "#"
  };

  const ctaElement =
    node.element.querySelector(
      ".btn, a[class*='btn'], button"
    ) as HTMLElement | null;

  const links =
    Array.from(
      node.element.querySelectorAll(
        ".nav-links a, ul a"
      )
    )
      .filter(a =>
        a !== logoLink &&
        a !== ctaElement
      )
      .map(a => ({
        label:
          a.textContent
            ?.replace(/\s+/g, " ")
            .trim() || "",

        href:
          a.getAttribute("href") || "#"
      }))
      .filter(link => link.label);

  if (!links.length && !logo.text && !logo.image) {
    return null;
  }

  const cta =
    ctaElement
      ? {
          label:
            ctaElement.textContent
              ?.replace(/\s+/g, " ")
              .trim() || "",

          href:
            ctaElement.getAttribute("href") || "#"
        }
      : null;
console.log(
  "🔥 NAVBAR DETECTED",
  {
    logo,
    linksCount: links.length,
    cta
  }
);
  return {
    type: "NAVBAR",
    logo,
    links,
    cta,
    claimedNode: node
  };
};