// src/modules/pageBuilder/runtime/importers/html/mapElementToBlock.ts
// LEGACY - OLD PIPELINE - NOT SOURCE OF TRUTH

import type {
  SerializedBlock
} from "../../../types/document/serialized.types";
import { ImportContext } from "../../../types/importContext";
import { extractStyleProps } from "../css/extractStyleProps";
import { createDeterministicId } from "./createDeterministicId";
import { detectSemanticContainer } from "./semantic/detectSemanticContainer";
import { getOwnerComputedStyle } from "./domGuards";

const createId = (
  prefix: string
) => {
  return `${prefix}-${crypto.randomUUID()}`;
};

export const mapElementToBlock = (
  element: Element,
  path: number[] = [],
   context: ImportContext = {}
)

: SerializedBlock | null => {

  const tag =
    element.tagName.toLowerCase();

  const computed =
    getOwnerComputedStyle(
      element as HTMLElement
    );

/// SEMANTIC 

    const semanticAllowed =
  !context.insideSemanticContainer;

const semanticType =

  semanticAllowed

    ? detectSemanticContainer(
        element as HTMLElement
      )

    : null;

if (
  semanticType?.type === "flexItem"
) {

  return {

    id:
      createDeterministicId(
        "flexitem",
        path
      ),

    type:
      "flexItem",

      data: {

    props: {},

    style: {

      desktop: {

        flex:
          "1 1 calc(33.333% - 24px)",

        maxWidth:
          "calc(33.333% - 24px)",

        minWidth: "260px"
      },

      tablet: {

        flex:
          "1 1 calc(50% - 24px)",

        maxWidth:
          "calc(50% - 24px)"
      },

      mobile: {

        flex: "1 1 100%",

        maxWidth: "100%"
      }
    },

  },

    children:

      Array.from(
        element.children
      )

        .map(
          (child, index) =>

  mapElementToBlock(

  child,
  [...path, index],

  {

    insideSemanticContainer: true,

    semanticDepth:
      (
        context.semanticDepth || 0
      ) + 1
  }
)
        )
        .filter(
  (
    child
  ): child is SerializedBlock =>
    child !== null
)

  };
}
  // =========================
  // GRID INFERENCE
  // =========================

if (
  computed.display === "grid"
) {

  const templateColumns =
    computed.gridTemplateColumns;

  const columnCount =
    templateColumns
      .split(" ")
      .filter(Boolean)
      .length;

  return {

    id:
      createDeterministicId(
        "section",
        path
      ),

    type: "section",
  data: {

    props: {},

    style:
      extractStyleProps(
        element as HTMLElement
      ),

    },

    children: [

      {

        id:
          createDeterministicId(
            "grid",
            path
          ),

        type: "grid",

          data: {


        props: {},

        style: {

          desktop: {

            gap:
              computed.gap || "24px",

            gridTemplateColumns:
            `repeat(${columnCount || 3}, minmax(0, 1fr))`
          }
        },
      },

        children:

  Array.from(
    element.children
  )

    .map(
      (child, index) =>

        mapElementToBlock(
          child,
          [...path, index],
          context
        )
    )

    .filter(
      (
        child
      ): child is SerializedBlock =>
        child !== null
    )
      }
    ]
  };
}

  // =========================
  // FLEX INFERENCE
  // =========================

  if (
    computed.display === "flex"
  ) {

    return {
id:
  createDeterministicId(
    "flex",
    path
  ),
      type:
        "flex",

          data: {


      props: {},

      style: {

  desktop: {

    gap:
      computed.gap || "24px",

    flexDirection:
      computed.flexDirection || "row",

    justifyContent:
      computed.justifyContent || "flex-start",

    alignItems:
      computed.alignItems || "stretch"
  }
},
},
children:

  Array.from(
    element.children
  )

    .map(
      (child, index) => {
        return mapElementToBlock(
          child,
          [...path, index],
          context
        );
      }
    )

    .filter(
      (
        child
      ): child is SerializedBlock =>
        child !== null
    )
  }

  }
  // =========================
  // TITLE
  // =========================

  if (
    tag === "h1" ||
    tag === "h2" ||
    tag === "h3"
  ) {

    return {

      id:
       createDeterministicId(
  "title",
  path
),

      type:
        "title",

  data: {

      props: {

        content:
          element.textContent || ""
      },

      style:
  extractStyleProps(
    element as HTMLElement
  ),
  },
      children: []
    };
  }

  // =========================
  // TEXT
  // =========================

  if (
  tag === "p"
) {

 return {

  id:
    createDeterministicId(
      "text",
      path
    ),

  type:
    "text",

  data: {

    props: {

      content:
        element.textContent
        ?.trim() || ""
    },

    style:
      extractStyleProps(
        element as HTMLElement
      )
  },

  children: []
};
}

  // =========================
  // IMAGE
  // =========================

  if (
    tag === "img"
  ) {

    return {
id:
  createDeterministicId(
    "image",
    path
  ),

      type:
        "image",
data: {
      props: {

        url:
          element.getAttribute("src") || "",

        alt:
          element.getAttribute("alt") || ""
      },

      style:
  extractStyleProps(
    element as HTMLElement
  ),
},
      children: []
    };
  }

  // =========================
  // BUTTON
  // =========================

  if (
    tag === "button"
  ) {

    return {
   id:
  createDeterministicId(
    "button",
    path
  ),  

      type:
        "button",
data: {

      props: {

        label:
          element.textContent || "Button"
      },

      style:
  extractStyleProps(
    element as HTMLElement
  ),
},

      children: []
    };
  }

  // =========================
  // SECTION
  // =========================

 if (
  tag === "section" ||
  tag === "div"
) {

  const children =
    Array.from(
      element.children
    );

  const repeatedTags =
    children.every(
      (child) =>
        child.tagName ===
        children[0]?.tagName
    );
console.log({

  childrenCount:
    children.length,

  tags:
    children.map(
      child =>
        child.tagName
    ),

  repeatedTags
});


// =========================
// SECTION
// =========================

if (
  tag === "section" ||
  tag === "div"
) {

  console.log(
    "SECTION DETECTED"
  );

  const children =
    Array.from(
      element.children
    );

  const repeatedTags =
    children.every(
      (child) =>
        child.tagName ===
        children[0]?.tagName
    );

  console.log({

    childrenCount:
      children.length,

    tags:
      children.map(
        child =>
          child.tagName
      ),

    repeatedTags
  });

  // =====================================
  // CONTEXTUAL TYPE
  // =====================================

 const currentType =

  context.parentType ===
  "section"

  ||

  context.parentType ===
  "flex"

  ||

  context.parentType ===
  "grid"

    ? "flexItem"

    : "section";



    console.log(
  "🧱 CURRENT TYPE",
  {
    tag,
    parentType:
      context.parentType,
    currentType
  }
);
  // =====================================
  // RETURN
  // =====================================

  return {

    id:
      createId(
        currentType
      ),

    type:
      currentType,

      data: {

    props: {},

    style:

      extractStyleProps(
        element as HTMLElement
      ),

    },

    children:

      Array.from(
        element.children
      )

        .map(
          (child, index) =>

            mapElementToBlock(

              child,

              [...path, index],

              {

                ...context,

                parentType:
                  currentType
              }
            )
        )

        .filter(
          (
            child
          ): child is SerializedBlock =>

            child !== null
        )
  };
}}
  return null;
}
