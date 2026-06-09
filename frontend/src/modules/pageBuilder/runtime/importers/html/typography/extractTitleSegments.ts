export type TitleSegment = {
  text: string;
  variant: "default" | "accent";
  sourceClass?: string;
};

const normalizeTextNode = (
  value: string
) =>
  value.replace(
    /\s+/g,
    " "
  );

const getVariant = (
  element: Element
): "default" | "accent" => {
  const className =
    element.getAttribute("class") || "";

  return /\b(gradient-text|accent|highlight|emphasis)\b/i.test(
    className
  )
    ? "accent"
    : "default";
};

export const extractTitleSegments = (
  element?: HTMLElement | null
): TitleSegment[] => {
  if (!element) {
    return [];
  }

  const segments =
    Array.from(
      element.childNodes
    )
      .map((node): TitleSegment | null => {
        if (node.nodeType === Node.TEXT_NODE) {
          const text =
            normalizeTextNode(
              node.textContent || ""
            );

          if (!text.trim()) {
            return null;
          }

          return {
            text,
            variant:
              "default"
          };
        }

        if (node.nodeType !== Node.ELEMENT_NODE) {
          return null;
        }

        const child =
          node as Element;

        if (
          child.tagName.toLowerCase() !== "span"
        ) {
          const text =
            normalizeTextNode(
              child.textContent || ""
            ).trim();

          if (!text) {
            return null;
          }

          return {
            text,
            variant:
              getVariant(
                child
              ),
            sourceClass:
              child.getAttribute("class") || undefined
          };
        }

        const text =
          normalizeTextNode(
            child.textContent || ""
          ).trim();

        if (!text) {
          return null;
        }

        return {
          text,
          variant:
            getVariant(
              child
            ),
          sourceClass:
            child.getAttribute("class") || undefined
        };
      })
      .filter(
        (segment): segment is TitleSegment =>
          segment !== null
      );

  if (segments.length > 1) {
    console.log(
      "TITLE_SEGMENTS_EXTRACTED",
      {
        title:
          element.textContent
            ?.replace(/\s+/g, " ")
            .trim() || "",
        segments
      }
    );
  }

  return segments;
};
