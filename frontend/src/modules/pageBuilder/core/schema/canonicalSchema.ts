import {
  blockRegistry
} from "../blockRegistry";

import type {
  BlockType
} from "../../types/page.types";

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

const registeredTypes =
  Object.keys(blockRegistry) as BlockType[];

const rootAcceptedTypes =
  registeredTypes.filter((type) =>
    blockRegistry[type]
      ?.rules
      ?.allowedParents
      ?.includes("root")
  );

const wrapperChildren: BlockType[] = [
  "title",
  "text",
  "image",
  "button",
  "link",
  "input",
  "select",
  "textarea",
  "collectionList",
  "form"
];

const createWrapperRules = (
  wrapper: BlockType
): WrapperRule[] =>
  wrapperChildren.map((child) => ({
    child,
    wrapper
  }));

const getWrapperRules = (
  type: BlockType
): WrapperRule[] => {
  if (
    type === "navbar" ||
    type === "footer" ||
    type === "flex"
  ) {
    return createWrapperRules(
      "flexItem"
    );
  }

  if (type === "grid") {
    return createWrapperRules(
      "gridItem"
    );
  }

  return [];
};

const createSchema = (
  type: BlockType,
  accepts: BlockType[]
): CanonicalBlockSchema => ({
  type,

  accepts,

  rejects:
    registeredTypes.filter(
      (candidate) =>
        !accepts.includes(candidate)
    ),

  allowedChildren:
    accepts,

  wrapperRules:
    getWrapperRules(type),

  transformRules: []
});

export const getCanonicalBlockSchema = (
  type: BlockType
): CanonicalBlockSchema => {
  if (type === "root") {
    return createSchema(
      "root",
      rootAcceptedTypes
    );
  }

  const config =
    blockRegistry[type];

  return createSchema(
    type,
    config?.rules?.allowedChildren ?? []
  );
};

export const canAcceptChild = (
  parentType: BlockType,
  childType: BlockType
): boolean =>
  getCanonicalBlockSchema(
    parentType
  ).accepts.includes(
    childType
  );

export const getWrapperRule = (
  parentType: BlockType,
  childType: BlockType
): WrapperRule | undefined =>
  getCanonicalBlockSchema(
    parentType
  ).wrapperRules.find(
    (rule) =>
      rule.child === childType
  );
