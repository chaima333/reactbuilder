import {
  getClassTokens
} from "../domGuards";

const leafTags = [

  "SPAN",
  "B",
  "I",
  "STRONG",
  "SMALL"
];

const weakClasses = [

  "k",
  "v",
  "name",
  "addr",
  "bar"
];

export const shouldSkipSemanticNode = (
  element: HTMLElement
) => {

  const classTokens =

    getClassTokens(
      element
    );

  const weakClass =

    weakClasses.some(
      token =>

        classTokens.includes(
          token
        )
    );

  const weakTag =

    leafTags.includes(
      element.tagName
    );

  return weakTag || weakClass;
};
