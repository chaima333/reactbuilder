import {
  extractLayoutStyles
} from "../../../css/extractStyleProps";

import {
  ValuesGridPayload
} from "../../semanticContracts/ValuesGridPayload";

import type {
  StructuralNode
} from "../../structure/buildStructuralGraph";

import {
  getOwnerComputedStyle
} from "../../domGuards";

import {
  detectValuesGrid
} from "./detectValuesGrid";

import {
  extractValuesGrid
} from "./extractValuesGrid";

import {
  validateValuesGrid
} from "./validateValuesGrid";

const isTransparent = (
  value?: string
) =>
  !value ||
  value === "transparent" ||
  value === "rgba(0, 0, 0, 0)" ||
  value === "rgba(0,0,0,0)" ||
  value === "none";

const omitEmpty = (
  style: Record<string, any>
) =>
  Object.fromEntries(
    Object.entries(
      style
    ).filter(
      ([, value]) =>
        value !== undefined &&
        value !== "" &&
        value !== "normal" &&
        value !== "none" &&
        value !== "0px" &&
        value !== "0px 0px" &&
        value !== "rgba(0, 0, 0, 0)"
    )
  );

const getComputedValuesSectionStyle = (
  element: HTMLElement
) => {
  const computed =
    getOwnerComputedStyle(
      element
    );

  return {
    desktop:
      omitEmpty({
        width:
          "100%",
        maxWidth:
          "none",
        marginLeft:
          "0",
        marginRight:
          "0",
        background:
          isTransparent(
            computed.background
          )
            ? undefined
            : computed.background,
        backgroundColor:
          isTransparent(
            computed.backgroundColor
          )
            ? undefined
            : computed.backgroundColor,
        backgroundImage:
          isTransparent(
            computed.backgroundImage
          )
            ? undefined
            : computed.backgroundImage,
        color:
          computed.color,
        padding:
          computed.padding,
        paddingTop:
          computed.paddingTop,
        paddingBottom:
          computed.paddingBottom,
        paddingLeft:
          computed.paddingLeft,
        paddingRight:
          computed.paddingRight,
        display:
          computed.display === "flex"
            ? computed.display
            : undefined,
        justifyContent:
          computed.display === "flex"
            ? computed.justifyContent
            : undefined,
        alignItems:
          computed.display === "flex"
            ? computed.alignItems
            : undefined
      }),
    tablet: {},
    mobile: {}
  };
};

const getComputedValuesContainerStyle = (
  element: HTMLElement
) => {
  const computed =
    getOwnerComputedStyle(
      element
    );

  return {
    desktop:
      omitEmpty({
        display:
          "flex",
        flexDirection:
          "column",
        width:
          computed.width &&
          computed.width !== "auto"
            ? "100%"
            : undefined,
        maxWidth:
  computed.maxWidth === "none"
    ? undefined
    : computed.maxWidth,
margin:
  computed.margin,
marginLeft:
  computed.marginLeft === "0px"
    ? "auto"
    : computed.marginLeft,
marginRight:
  computed.marginRight === "0px"
    ? "auto"
    : computed.marginRight,
        padding:
          computed.padding,
        paddingTop:
          computed.paddingTop,
        paddingBottom:
          computed.paddingBottom,
        paddingLeft:
          computed.paddingLeft,
        paddingRight:
          computed.paddingRight,
        gap:
          computed.gap,
        rowGap:
          computed.rowGap,
        columnGap:
          computed.columnGap,
        justifyContent:
          computed.display === "flex"
            ? computed.justifyContent
            : undefined,
        alignItems:
          computed.display === "flex"
            ? computed.alignItems
            : undefined
      }),
    tablet: {},
    mobile: {}
  };
};

const findValuesSectionRoot = (
  gridElement: HTMLElement
) => {
  const section =
    gridElement.closest(
      "section, main, article"
    ) as HTMLElement | null;

  return (
    section ||
    gridElement.parentElement ||
    gridElement
  );
};

export const resolveValuesGrid = (
  node: StructuralNode
): ValuesGridPayload | null => {

   console.log(
    "VALUES_GRID_CHECK_START",
    {
      className: node.element.className,
      candidateTypes: node.candidates.map(c => c.type),
      childCount: node.children.length
    }
  );

  const detected =
    detectValuesGrid(
      node
    );

  if (!detected) {
    return null;
  }
  console.log(
  "VALUES_GRID_DETECTED",
  node.element.className,
  detected
);

  const items =
    extractValuesGrid(
      node
    );
console.log(
  "VALUES_GRID_ITEMS",
  node.element.className,
  items
);
  const valid =
    validateValuesGrid(
      items
    );

  if (!valid) {
    return null;
  }
console.log(
  "VALUES_GRID_VALID",
  node.element.className,
  valid
);
  const computed =
    getOwnerComputedStyle(
      node.element
    );

  const columnCount =
    computed.gridTemplateColumns
      .split(" ")
      .filter(Boolean)
      .length;

  const parent =
    node.element.parentElement as HTMLElement | null;

  const sectionRoot =
    findValuesSectionRoot(
      node.element
    );

  const containerElement =
    parent || sectionRoot;

  const headerElement =
    parent?.querySelector(
      ".sec-head, [class*='sec-head']"
    ) as HTMLElement | null;
const titleElement =
  headerElement?.querySelector("h2,h3") as HTMLElement | null;

const eyebrowElement =
  headerElement?.querySelector(
    ".section-tag, [class*='tag']"
  ) as HTMLElement | null;

  const eyebrow =
    headerElement
      ?.querySelector(
        ".section-tag, [class*='tag']"
      )
      ?.textContent
      ?.replace(/\s+/g, " ")
      .trim() || "";

  const title =
    headerElement
      ?.querySelector("h2,h3")
      ?.textContent
      ?.replace(/\s+/g, " ")
      .trim() || "";
      const descriptionElement =
  headerElement?.querySelector(
    "p, .section-desc, [class*='desc'], [class*='lead']"
  ) as HTMLElement | null;

 const description =
  descriptionElement
    ?.textContent
    ?.replace(/\s+/g, " ")
    .trim() || "";
  const sectionStyle =
    getComputedValuesSectionStyle(
      sectionRoot
    );
  const containerStyle =
    getComputedValuesContainerStyle(
      containerElement
    );
  const gridStyle =
    extractLayoutStyles(
      node.element
    );

  delete gridStyle.desktop.height;
  delete gridStyle.desktop.minHeight;
  delete gridStyle.desktop.maxHeight;
  delete gridStyle.desktop.gridTemplateRows;
  delete gridStyle.desktop.gridAutoRows;
  delete gridStyle.desktop.margin;
  delete gridStyle.desktop.marginTop;
  delete gridStyle.desktop.marginBottom;

  console.log(
    "VALUES_GRID_HEADER",
    {
      eyebrow,
      title,
      description,
      sectionRoot:
        {
          tag:
            sectionRoot.tagName,
          className:
            sectionRoot.getAttribute(
              "class"
            ) || "",
          style:
            sectionStyle
        },
      container:
        {
          tag:
            containerElement.tagName,
          className:
            containerElement.getAttribute(
              "class"
            ) || "",
          style:
            containerStyle
        }
    }
  );

  return {
    type:
      "VALUES_GRID",

    items,

    eyebrow,

    title,

    columnCount,
   
    description,
    
    sectionStyle,

    containerStyle,
    descriptionStyle: {
  desktop: descriptionElement
    ? extractLayoutStyles(descriptionElement).desktop
    : {}
},
eyebrowStyle: {
  desktop: eyebrowElement
    ? extractLayoutStyles(eyebrowElement).desktop
    : {}
},

titleStyle: {
  desktop: titleElement
    ? extractLayoutStyles(titleElement).desktop
    : {}
},

    gridStyle,

    sourceElement:
      node.element,

   claimedNode:
  node.parent?.parent || node
  };
};
