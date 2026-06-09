import type {
  SemanticMatchResult
} from "./types";
import {
  getOwnerComputedStyle
} from "../domGuards";

export const isFeaturesLayout = (
  element: Element
): SemanticMatchResult => {

  let score = 0;

  const reasons: string[] = [];

  const children =
    Array.from(
      element.children
    );

  if (
    children.length >= 3
  ) {

    score += 30;

    reasons.push(
      "multiple-cards"
    );
  }

  const repeatedTags =
    new Set(

      children.map(
        child =>
          child.tagName
      )

    ).size === 1;

  if (
    repeatedTags
  ) {

    score += 20;

    reasons.push(
      "repeated-structure"
    );
  }

  const computed =
    getOwnerComputedStyle(
      element as HTMLElement
    );

  if (
    computed.display === "grid"
  ) {

    score += 30;

    reasons.push(
      "grid-layout"
    );
  }

  const headings =
    element.querySelectorAll(
      "h1,h2,h3"
    );

  if (
    headings.length >= 3
  ) {

    score += 15;

    reasons.push(
      "feature-headings"
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
