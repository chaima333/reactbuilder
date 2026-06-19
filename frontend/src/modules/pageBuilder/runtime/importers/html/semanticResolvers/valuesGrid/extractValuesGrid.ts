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

  const isTransparentBackground = (
    value?: string
  ) =>
    !value ||
    value === "transparent" ||
    value === "rgba(0, 0, 0, 0)" ||
    value === "rgba(0,0,0,0)" ||
    value === "none";

  const keep = (
    value?: string
  ) =>
    isEmptyVisual(
      value
    )
      ? undefined
      : value;

  return {
display:
  keep(computed.display),

flexDirection:
  computed.display === "flex"
    ? keep(computed.flexDirection)
    : undefined,

alignItems:
  computed.display === "flex"
    ? keep(computed.alignItems)
    : undefined,

justifyContent:
  computed.display === "flex"
    ? keep(computed.justifyContent)
    : undefined,

gap:
  keep(computed.gap),

rowGap:
  keep(computed.rowGap),

columnGap:
  keep(computed.columnGap),

padding:
  keep(computed.padding),

minHeight:
  keep(computed.minHeight),

width:
  keep(computed.width),

maxWidth:
  keep(computed.maxWidth),

border:
  keep(computed.border),

borderRadius:
  keep(computed.borderRadius),

boxShadow:
  keep(computed.boxShadow),

background:
  isTransparentBackground(
    computed.background
  )
    ? undefined
    : computed.background,

backgroundImage:
  isTransparentBackground(
    computed.backgroundImage
  )
    ? undefined
    : computed.backgroundImage,

backgroundColor:
  isTransparentBackground(
    computed.backgroundColor
  )
    ? undefined
    : computed.backgroundColor,

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
  Array.from(node.element.children).filter((child) => {
    const hasTitle =
      !!child.querySelector("h1,h2,h3,h4,h5,h6");

    const hasText =
      !!child.querySelector("p");

    const hasLetter =
      !!child.querySelector(".letter, [class*='letter']");

    return hasTitle && hasText && hasLetter;
  });

  return children
    .map((child, index) => {
  const eyebrowCandidates =
  Array.from(
    child.querySelectorAll(
      ".s-num, .letter, [class*='letter'], [class*='icon']"
    )
  );

const eyebrowElement =
  eyebrowCandidates.find((el) => {
    const text =
      el.textContent?.replace(/\s+/g, " ").trim() || "";

    const style =
      getStyle(el);

    return (
      text.length > 0 &&
      text.length <= 3 &&
      Object.keys(style).length > 0
    );
  }) || eyebrowCandidates[0] || null;

      const titleElement =
        child.querySelector("h1,h2,h3,h4,h5,h6");

      const descriptionElement =
        child.querySelector("p");

      const ctaElement =
        child.querySelector(".more");

      const title =
        titleElement?.textContent?.trim();

      if (!title) return null;


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
