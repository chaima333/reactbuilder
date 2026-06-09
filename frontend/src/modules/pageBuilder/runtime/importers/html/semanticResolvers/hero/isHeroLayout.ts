import { SemanticMatchResult } from "../../semantic/types";
import {
  getOwnerComputedStyle
} from "../../domGuards";

export const isHeroLayout = (
  element: Element
): SemanticMatchResult => {

  let score = 0;

  const reasons: string[] = [];

  const headings =
    element.querySelectorAll(
      "h1,h2"
    );

  if (headings.length >= 1) {

    score += 30;

    reasons.push(
      "heading-detected"
    );
  }

  const buttons =
    element.querySelectorAll(
      "button,a"
    );

  if (buttons.length >= 1) {

    score += 25;

    reasons.push(
      "cta-detected"
    );
  }

  const images =
    element.querySelectorAll(
      "img"
    );

  if (images.length >= 1) {

    score += 20;

    reasons.push(
      "image-detected"
    );
  }

  const computed =
    getOwnerComputedStyle(
      element as HTMLElement
    );

  if (
    computed.display === "flex"
  ) {

    score += 15;

    reasons.push(
      "flex-layout"
    );
  }

  return {

    matched:
      score >= 60,

    score,

    reason:
      reasons
  };
};
