import type {
  SemanticMatchResult
} from "./types";
import {
  getOwnerComputedStyle
} from "../domGuards";

export const isCTALayout = (
  element: Element
): SemanticMatchResult => {

  let score = 0;

  const reasons: string[] = [];

  const headings =
    element.querySelectorAll(
      "h1,h2,h3"
    );

  if (
    headings.length >= 1
  ) {

    score += 30;

    reasons.push(
      "heading-detected"
    );
  }

  const buttons =
    element.querySelectorAll(
      "button,a"
    );

  if (
    buttons.length >= 1
  ) {

    score += 35;

    reasons.push(
      "cta-button"
    );
  }

  const images =
    element.querySelectorAll(
      "img"
    );

  if (
    images.length === 0
  ) {

    score += 15;

    reasons.push(
      "no-images"
    );
  }

  const computed =
    getOwnerComputedStyle(
      element as HTMLElement
    );

  if (

    computed.textAlign ===
      "center" ||

    computed.justifyContent ===
      "center"

  ) {

    score += 20;

    reasons.push(
      "centered-layout"
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
