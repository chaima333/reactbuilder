import {
  presetRegistry
} from "../../../../../presets/presetRegistry";

import type {
  Block
} from "../../../../../types/page.types";

import {
  isHeroLayout
} from "./isHeroLayout";
import {
  getOwnerComputedStyle
} from "../../domGuards";


const extractHeroContent = (
  element: Element
) => {

  const heading =
    element.querySelector(
      "h1,h2"
    );

  const paragraph =
    element.querySelector(
      "p"
    );

  const button =

    element.querySelector(
      "button"
    ) ||

    element.querySelector(
      "a[href]"
    );

  const image =
    element.querySelector(
      "img"
    );

  return {

    title:
      heading?.textContent || "",

    subtitle:
      paragraph?.textContent || "",

    ctaText:
      button?.textContent || "",

    image:
      image?.getAttribute(
        "src"
      ) || ""
  };
};

export const inferSemanticPreset = (
  element: Element
): Block | null => {

  // =====================================
  // COLLECT MATCHES
  // =====================================

  const matches = [

    {
      type: "hero",

      result:
        isHeroLayout(
          element
        )
    }
  ];

  // =====================================
  // FILTER VALID MATCHES
  // =====================================

  const validMatches =

    matches.filter(
      item =>
        item.result.matched
    );

  // =====================================
  // NO MATCH
  // =====================================

  if (
    validMatches.length === 0
  ) {

    return null;
  }

  // =====================================
  // SORT BY SCORE
  // =====================================

  validMatches.sort(

    (a, b) =>

      b.result.score -
      a.result.score
  );

  // =====================================
  // WINNER
  // =====================================

  const winner =
    validMatches[0];

  // =====================================
  // SAFETY
  // =====================================

  if (!winner) {

    return null;
  }

  console.log(
    "🏆 SEMANTIC WINNER",
    winner
  );

  // =====================================
  // HERO
  // =====================================

  if (
    winner.type ===
    "hero"
  ) {

  const heroContent =

  extractHeroContent(
    element
  );

const heroLayout =

  resolveHeroLayout(
    element
  );


  return presetRegistry.hero({

  type:
    "HERO_SECTION",

  ...heroContent,

  layout:
    heroLayout
});
   
  }

  // =====================================
  // FALLBACK
  // =====================================

  return null;
};

const resolveHeroLayout = (
  element: Element
) => {

  const computed =

    getOwnerComputedStyle(
      element as HTMLElement
    );

  const hasImage =

    !!element.querySelector(
      "img"
    );

  if (
    hasImage
  ) {

    return {
      variant: "split" as const
    };
  }

  return {
    variant: "centered" as const
  };
};
