import type {
  StructuralNode
} from "../../structure/buildStructuralGraph";

import {
  getElementClassName
} from "../../domGuards";

const normalizeText = (
  value?: string | null
) =>
  (value || "")
    .replace(/\s+/g, " ")
    .trim();

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
      normalizeText(
        logoLink?.textContent
      ),
image:
  logoImage?.getAttribute("src") || "",

    href:
      logoLink?.getAttribute("href") || "#"
  };

  const ctaElement =
    node.element.querySelector(
      ".btn, .btn-primary, a[class*='btn'], button"
    ) as HTMLElement | null;

  const navRoot =
    node.element.querySelector(
      ".nav-links, ul"
    ) || node.element;

  const directItems =
    Array.from(
      navRoot.querySelectorAll(
        ":scope > li, :scope > ul > li"
      )
    );

  const structuredLinks =
    directItems
      .map(item => {
        const directAnchor =
          Array.from(item.children).find(
            child =>
              child.tagName.toLowerCase() === "a"
          ) as HTMLAnchorElement | undefined;

        if (
          !directAnchor ||
          directAnchor === logoLink ||
          directAnchor === ctaElement
        ) {
          return null;
        }

        const children =
          Array.from(
            item.querySelectorAll("ul a")
          )
            .filter(a =>
              a !== directAnchor &&
              a !== logoLink &&
              a !== ctaElement
            )
            .map(a => ({
              label:
                normalizeText(
                  a.textContent
                ),
              href:
                a.getAttribute("href") || "#"
            }))
            .filter(link => link.label);

        return {
          label:
            normalizeText(
              directAnchor.textContent
            ),
          href:
            directAnchor.getAttribute("href") || "#",
          children
        };
      })
      .filter(Boolean);

  const flatLinks =
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
          normalizeText(
            a.textContent
          ),
        href:
          a.getAttribute("href") || "#",
        children: []
      }))
      .filter(link => link.label);

  const links =
    structuredLinks.length
      ? structuredLinks
      : flatLinks;

  if (!links.length && !logo.text && !logo.image) {
    return null;
  }

  const cta =
    ctaElement
      ? {
          label:
            normalizeText(
              ctaElement.textContent
            ),

          href:
            ctaElement.getAttribute("href") || "#"
        }
      : null;

 const view =
  node.element.ownerDocument.defaultView;

const styleSource =
  node.element.closest("header, .header, .site-header, [class*='header']") as HTMLElement | null
  || node.element;

const computed =
  view?.getComputedStyle(styleSource);
  const parentComputed =
  node.element.parentElement
    ? view?.getComputedStyle(node.element.parentElement)
    : null;

const rootComputed =
  view?.getComputedStyle(
    node.element.ownerDocument.documentElement
  );
  const rootVar = (name: string) =>
  rootComputed
    ?.getPropertyValue(name)
    ?.trim();

const tokenNavBg =
  rootVar("--nav-bg") ||
  rootVar("--nav") ||
  rootVar("--bg") ||
  rootVar("--dark") ||
  rootVar("--bg-dark");

const tokenAccent =
  rootVar("--accent") ||
  rootVar("--orange") ||
  rootVar("--primary");

const tokenText =
  rootVar("--text") ||
  rootVar("--text-light") ||
  rootVar("--white");

const pickColor = (...values: Array<string | undefined>) =>
  values.find(
    value =>
      value &&
      value !== "transparent" &&
      value !== "rgba(0, 0, 0, 0)"
  );

const firstNavLink =
  node.element.querySelector(".nav-links a, ul a") as HTMLElement | null;

const firstSubmenu =
  node.element.querySelector("li ul") as HTMLElement | null;

const firstCta =
  ctaElement as HTMLElement | null;

const linkComputed =
  firstNavLink
  ? view?.getComputedStyle(firstNavLink)
    : null;

const submenuComputed =
  firstSubmenu
  ? view?.getComputedStyle(firstSubmenu)
    : null;

const ctaComputed =
  firstCta
  ? view?.getComputedStyle(firstCta)
    : null;

console.log("🧭 NAVBAR TARGET CHECK", {
  tag: node.element.tagName,
  className: node.element.className,
  parentTag: node.element.parentElement?.tagName,
  parentClass: node.element.parentElement?.className,
  html: node.element.outerHTML.slice(0, 500)
});
console.log("🎨 NAVBAR RAW STYLE", {
  backgroundColor: computed?.backgroundColor,
  color: computed?.color,
  linkColor: linkComputed?.color,
  submenuBackground: submenuComputed?.backgroundColor,
  ctaBackground: ctaComputed?.backgroundColor
});
console.log("NAVBAR STYLE SOURCE", {
  navClass: node.element.className,
  styleSourceTag: styleSource.tagName,
  styleSourceClass: styleSource.className
});

  return {
    type: "NAVBAR",
    logo,
    links,
    cta,
   rawStyle: {
  background:
    computed?.background,

  backgroundColor:
    pickColor(
      computed?.backgroundColor,
      tokenNavBg,
      parentComputed?.backgroundColor,
      rootComputed?.backgroundColor
    ),

  color:
    pickColor(
      computed?.color,
      tokenText,
      parentComputed?.color,
      "#ffffff"
    ),

  borderBottom:
    computed?.borderBottomStyle &&
    computed.borderBottomStyle !== "none"
      ? `${computed.borderBottomWidth} ${computed.borderBottomStyle} ${computed.borderBottomColor}`
      : undefined,

  boxShadow:
    computed?.boxShadow &&
    computed.boxShadow !== "none"
      ? computed.boxShadow
      : undefined,

  backdropFilter:
    computed?.backdropFilter &&
    computed.backdropFilter !== "none"
      ? computed.backdropFilter
      : undefined,

  linkColor:
    pickColor(
      linkComputed?.color,
      tokenText
    ),

  submenuBackground:
    pickColor(
      submenuComputed?.backgroundColor,
      tokenNavBg
    ),

  ctaBackground:
    pickColor(
      ctaComputed?.backgroundColor,
      tokenAccent
    ),

  ctaColor:
    pickColor(
      ctaComputed?.color,
      "#020B18"
    )
},
    claimedNode: node
  };
};
