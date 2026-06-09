

export const analyzeSiblingPatterns = (
  elements: Element[]
) => {

  if (
    elements.length < 2
  ) {

    return {
      repeated: false,
      confidence: 0
    };
  }

  const signatures =
    elements.map(
      element => {

        return Array.from(
          element.children
        )
          .map(
            child =>
              child.tagName
          )
          .join("-");
      }
    );

  const first =
    signatures[0];

  const similar =
    signatures.filter(
      sig =>
        sig === first
    ).length;

  const confidence =

    similar /
    signatures.length;

  return {

    repeated:
      confidence >= 0.7,

    confidence,

    signatures
  };
};