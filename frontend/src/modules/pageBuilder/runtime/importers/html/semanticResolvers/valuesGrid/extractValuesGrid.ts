import type {
  StructuralNode
} from "../../structure/buildStructuralGraph";

const getStyle = (
  element?: Element | null
) => {
  if (!element) return {};

  const computed =
    element.ownerDocument.defaultView
      ?.getComputedStyle(element) ||
    window.getComputedStyle(element);

    const isEmptyVisual = (value?: string) =>
  !value ||
  value === "0px" ||
  value === "none" ||
  value === "normal" ||
  value === "rgba(0, 0, 0, 0)" ||
  value.startsWith("0px none");

  return {
   padding: isEmptyVisual(computed.padding) ? undefined : computed.padding,
border: isEmptyVisual(computed.border) ? undefined : computed.border,
borderRadius: isEmptyVisual(computed.borderRadius) ? undefined : computed.borderRadius,
background: computed.background.includes("rgba(0, 0, 0, 0)") ? undefined : computed.background,
backgroundColor: isEmptyVisual(computed.backgroundColor) ? undefined : computed.backgroundColor,
color: computed.color === "rgb(0, 0, 238)" ? undefined : computed.color,
  fontSize:
  isEmptyVisual(computed.fontSize)
    ? undefined
    : computed.fontSize,

fontWeight:
  computed.fontWeight === "400"
    ? undefined
    : computed.fontWeight,

lineHeight:
  isEmptyVisual(computed.lineHeight)
    ? undefined
    : computed.lineHeight,

letterSpacing:
  isEmptyVisual(computed.letterSpacing)
    ? undefined
    : computed.letterSpacing,

textTransform:
  isEmptyVisual(computed.textTransform)
    ? undefined
    : computed.textTransform,

marginBottom:
  isEmptyVisual(computed.marginBottom)
    ? undefined
    : computed.marginBottom,

marginTop:
  isEmptyVisual(computed.marginTop)
    ? undefined
    : computed.marginTop
  };
};

export const extractValuesGrid = (
  node: StructuralNode
) => {
  const children =
    Array.from(node.element.children);

  return children
    .map((child, index) => {
      const eyebrowElement =
        child.querySelector(".s-num");

      const titleElement =
        child.querySelector("h1,h2,h3,h4,h5,h6");

      const descriptionElement =
        child.querySelector("p");

      const ctaElement =
        child.querySelector(".more");

      const title =
        titleElement?.textContent?.trim();

      if (!title) return null;

      console.log(
  "VALUES_GRID_CARD",
  {
    className:
      (child as HTMLElement).className,
    cardStyle:
      getStyle(child)
  }
);

      return {
        id: `value-item-${index}`,

        eyebrow:
          eyebrowElement?.textContent?.trim() || "",

        title,

        description:
          descriptionElement?.textContent?.trim() || "",

        cta:
          ctaElement?.textContent?.trim() || "",

        cardStyle:
          getStyle(child),

        eyebrowStyle:
          getStyle(eyebrowElement),

        titleStyle:
          getStyle(titleElement),

        descriptionStyle:
          getStyle(descriptionElement),

        ctaStyle:
          getStyle(ctaElement)
      };
    })
    .filter((item): item is any => item !== null);
};