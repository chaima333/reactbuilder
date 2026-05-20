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
  "button"
];

const semanticBlocks: BlockType[] = [
  "hero",
  "cta",
  "features"
];

const containers: BlockType[] = [
  "section",
  "flex",
  "grid",
  "flexItem",
  "gridItem"
];

const allKnownTypes: BlockType[] = [
  "root",
  ...containers,
  ...primitives,
  ...semanticBlocks,
  "navbar"
];

const rejectEverythingExcept = (
  accepted: BlockType[]
): BlockType[] =>
  allKnownTypes.filter(
    (type) => type !== "root" && !accepted.includes(type)
  );

const schema = (
  type: BlockType,
  accepts: BlockType[],
  wrapperRules: WrapperRule[] = [],
  transformRules: TransformRule[] = []
): CanonicalBlockSchema => ({
  type,
  accepts,
  rejects: rejectEverythingExcept(accepts),
  allowedChildren: accepts,
  wrapperRules,
  transformRules
});

export const canonicalBlockSchemas: Record<
  BlockType,
  CanonicalBlockSchema
> = {
  root: schema("root", ["section", "navbar"]),

  section: schema("section", [
    "title",
    "text",
    "image",
    "button",
    "flex",
    "grid",
    "hero",
    "cta",
    "features"
  ]),

  flex: schema(
    "flex",
    ["flexItem"],
    primitives.map((child) => ({
      child,
      wrapper: "flexItem"
    }))
  ),

  grid: schema(
    "grid",
    ["gridItem"],
    primitives.map((child) => ({
      child,
      wrapper: "gridItem"
    }))
  ),

  flexItem: schema("flexItem", [
    "title",
    "text",
    "image",
    "button",
    "hero",
    "cta",
    "features"
  ]),

  gridItem: schema("gridItem", [
    "title",
    "text",
    "image",
    "button",
    "hero",
    "cta",
    "features"
  ]),

  title: schema("title", []),
  text: schema("text", []),
  image: schema("image", []),
  button: schema("button", []),
  navbar: schema("navbar", []),
  hero: schema("hero", []),
  cta: schema("cta", []),
  features: schema("features", [])
};

export const getCanonicalBlockSchema = (
  type: BlockType
): CanonicalBlockSchema => canonicalBlockSchemas[type];

export const canAcceptChild = (
  parentType: BlockType,
  childType: BlockType
) => {
  return getCanonicalBlockSchema(parentType).accepts.includes(childType);
};

export const getWrapperRule = (
  parentType: BlockType,
  childType: BlockType
) => {
  return getCanonicalBlockSchema(parentType).wrapperRules.find(
    (rule) => rule.child === childType
  );
};
