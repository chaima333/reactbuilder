export const detectSemanticContainer = (
  element: HTMLElement
) => {

  // =====================================
  // DIRECT CHILDREN
  // =====================================

  const directChildren =
    Array.from(
      element.children
    );

  // =====================================
  // TOO SMALL
  // =====================================

  if (
    directChildren.length < 2
  ) {
    return null;
  }

  // =====================================
  // SEMANTIC ZONES
  // =====================================

  const semanticChildren =

    directChildren.filter(
      (child) => {

        return (

          child.querySelector(
            "img"
          ) ||

          child.querySelector(
            "p,h1,h2,h3"
          ) ||

          child.querySelector(
            "button"
          )
        );
      }
    );

  // =====================================
  // DEBUG
  // =====================================

  console.log({

    element,

    directChildren:
      directChildren.length,

    semanticChildren:
      semanticChildren.length
  });

  // =====================================
  // FEATURE CARD DETECTION
  // =====================================

  if (
    semanticChildren.length >= 2
  ) {

    return {
  type: "CARD",
  confidence: 0.8
};
  }

  return null;
};