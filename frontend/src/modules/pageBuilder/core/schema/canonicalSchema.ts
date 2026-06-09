import type { BlockType } from "../../types/page.types";

export type WrapperRule = {
  child: BlockType;
  wrapper: BlockType;
};

export type TransformRule = {
  from: BlockType;
  to: BlockType;
};

export type CanonicalBlockSchema = {
  type: BlockType;
  accepts: BlockType[];
  rejects: BlockType[];
  allowedChildren: BlockType[];
  wrapperRules: WrapperRule[];
  transformRules: TransformRule[];
};

const primitives: BlockType[] = [
  "title",
  "text",
  "image",
  "button",
  "link",
   "input",
  "select",
  "textarea"
];

const semanticBlocks: BlockType[] = [
  "hero",
  "cta",
  "features",
  "navbar",
  "valuesGrid",
  "officeTable",
  "featurePillars"
];

const containers: BlockType[] = [
  "section",
  "flex",
  "navbar",
  "grid",
  "flexItem",
  "gridItem"
];

const allKnownTypes: BlockType[] = [
  "root",
  ...containers,
  ...primitives,
  ...semanticBlocks
];

const rejectEverythingExcept = (
  accepted: BlockType[]
): BlockType[] =>

  allKnownTypes.filter(
    (type) =>

      type !== "root" &&

      !accepted.includes(type)
  );

const schema = (
  type: BlockType,
  accepts: BlockType[],
  wrapperRules: WrapperRule[] = [],
  transformRules: TransformRule[] = []
): CanonicalBlockSchema => ({

  type,

  accepts,

  rejects:
    rejectEverythingExcept(
      accepts
    ),

  allowedChildren:
    accepts,

  wrapperRules,

  transformRules
});

export const canonicalBlockSchemas: Record<
  BlockType,
  CanonicalBlockSchema
> = {

  // =====================================
  // ROOT
  // =====================================

  root: schema(
    "root",
    [
      "section",
      "navbar"
    ]
  ),

  // =====================================
  // SECTION
  // =====================================

  section: schema(
    "section",
    [

      "title",
      "text",
      "image",
      "button",
      "link",

      "navbar",
      "flex",
      "grid",

      "hero",
      "cta",
      "features",

      "valuesGrid",
      "officeTable",
      "featurePillars"
    ]
  ),

  // =====================================
  // FLEX
  // =====================================

flex: schema(

  "flex",

  [

    "flexItem",

    "title",
    "text",
    "image",
    "button",
    "link",

    "input",
    "select",
    "textarea",

    "flex",
    "grid",
    "gridItem"
  ],

  []
),

  // =====================================
  // NAVBAR
  // =====================================

  navbar: schema(

    "navbar",

    ["flexItem"],

    primitives.map(
      (child) => ({

        child,

        wrapper:
          "flexItem"
      })
    )
  ),

  // =====================================
  // GRID
  // =====================================

  grid: schema(

    "grid",

    ["gridItem"],

    primitives.map(
      (child) => ({

        child,

        wrapper:
          "gridItem"
      })
    )
  ),

  // =====================================
  // FLEX ITEM
  // =====================================

  flexItem: schema(
    "flexItem",
    [

      "title",
      "text",
      "image",
      "button",
      "link",

      "flex",
      "grid",

      "hero",
      "cta",
      "features",

      "valuesGrid",
      "officeTable",
      "featurePillars"
    ]
  ),

  // =====================================
  // GRID ITEM
  // =====================================

  gridItem: schema(
    "gridItem",
    [

      "title",
      "text",
      "image",
      "button",
      "link",

      "flex",
      "grid",

      "hero",
      "cta",
      "features",

      "valuesGrid",
      "officeTable",
      "featurePillars",

      "input",
"select",
"textarea"
    ]
  ),

  // =====================================
  // PRIMITIVES
  // =====================================

  title:
    schema("title", []),

  text:
    schema("text", []),

  image:
    schema("image", []),

  button:
    schema("button", []),

  link:
    schema("link", []),
input:
  schema("input", []),

select:
  schema("select", []),

textarea:
  schema("textarea", []),
  // =====================================
  // SEMANTIC
  // =====================================

  hero:
    schema("hero", []),

  cta:
    schema("cta", []),

  features:
    schema("features", []),

  valuesGrid:
    schema("valuesGrid", []),

  officeTable:
    schema("officeTable", []),

  featurePillars:
    schema("featurePillars", [])
};

export const getCanonicalBlockSchema = (
  type: BlockType
): CanonicalBlockSchema =>

  canonicalBlockSchemas[type];

export const canAcceptChild = (
  parentType: BlockType,
  childType: BlockType
) => {

  return getCanonicalBlockSchema(
    parentType
  )

    .accepts

    .includes(
      childType
    );
};

export const getWrapperRule = (
  parentType: BlockType,
  childType: BlockType
) => {

  return getCanonicalBlockSchema(
    parentType
  )

    .wrapperRules

    .find(
      (rule) =>

        rule.child ===
        childType
    );
};