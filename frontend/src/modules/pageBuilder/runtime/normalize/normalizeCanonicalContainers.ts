import {
  blockRegistry
} from "../../core/blockRegistry";

interface BlockData {
  props?: Record<string, unknown>;
  style?: {
    desktop?: Record<string, unknown>;
    tablet?: Record<string, unknown>;
    mobile?: Record<string, unknown>;
  };
  [key: string]: unknown;
}

interface BlockNode {
  id?: string;
  type: string;
  data?: BlockData;
  props?: Record<string, unknown>;
  style?: Record<string, unknown>;
  children?: BlockNode[];
  [key: string]: unknown;
}

interface ResponsiveStyle {
  desktop: Record<string, unknown>;
  tablet: Record<string, unknown>;
  mobile: Record<string, unknown>;
}

const createId = (prefix: string): string =>
  `${prefix}-${
    globalThis.crypto?.randomUUID?.() ||
    Math.random()
      .toString(36)
      .slice(2)
  }`;

const responsiveStyle = (
  desktop: Record<string, unknown> = {}
): ResponsiveStyle => ({
  desktop,
  tablet: {},
  mobile: {}
});

const normalizeBlockType = (value: unknown): string => {
  const type = String(value || "");

  if (type.toLowerCase() === "flexitem") {
    return "flexItem";
  }

  if (type.toLowerCase() === "griditem") {
    return "gridItem";
  }

  return type;
};

const canContain = (
  parentType: string,
  childType: string
): boolean => {
  const allowedChildren = (blockRegistry as any)?.[parentType]?.rules?.allowedChildren;

  return (
    Array.isArray(allowedChildren) &&
    allowedChildren.includes(childType)
  );
};

const createNeutralSection = (child: BlockNode): BlockNode => ({
  id: createId("canonical-section"),
  type: "section",
  data: {
    props: {},
    style: responsiveStyle({
      display: "contents",
      width: "100%",
      padding: "0",
      margin: "0"
    })
  },
  children: [child]
});

const createFlexItem = (child: BlockNode): BlockNode => ({
  id: createId("canonical-flex-item"),
  type: "flexItem",
  data: {
    props: {},
    style: responsiveStyle({
      width: "100%",
      minWidth: "0"
    })
  },
  children: [child]
});

const createGridItem = (child: BlockNode): BlockNode => ({
  id: createId("canonical-grid-item"),
  type: "gridItem",
  data: {
    props: {},
    style: responsiveStyle({
      width: "100%",
      minWidth: "0"
    })
  },
  children: [child]
});
const createFlexContainer = (
  child: BlockNode
): BlockNode => ({
  id:
    createId(
      "canonical-flex"
    ),

  type:
    "flex",

  data: {
    props: {},

    style:
      responsiveStyle({
        display:
          "flex",

        flexDirection:
          "column",

        width:
          "100%",

        minWidth:
          "0"
      })
  },

  children: [
    createFlexItem(
      child
    )
  ]
});
const repairChild = (
  parentType: string,
  child: BlockNode
): BlockNode => {
  const primitiveTypes = [
    "title",
    "text",
    "image",
    "button",
    "link",
    "input",
    "select",
    "textarea"
  ];
  if (
    parentType === "section" &&
    primitiveTypes.includes(child.type)
  ) {
    return createFlexContainer(
      child
    );
  }
  if (
    parentType === "gridItem" &&
    (
      child.type === "visitorLogin" ||
      child.type === "visitorRegister"
    ) &&
    canContain("gridItem", "flex") &&
    canContain("flex", "flexItem") &&
    canContain("flexItem", "section") &&
    canContain("section", child.type)
  ) {
    return createFlexContainer(
      createNeutralSection(
        child
      )
    );
  }
  if (
    canContain(
      parentType,
      child.type
    )
  ) {
    return child;
  }

  if (
    (
      parentType === "flex" ||
      parentType === "navbar" ||
      parentType === "footer"
    ) &&
    canContain(
      parentType,
      "flexItem"
    )
  ) {
    let flexItemChild =
      child;

    if (
      !canContain(
        "flexItem",
        child.type
      ) &&
      canContain(
        "flexItem",
        "section"
      ) &&
      canContain(
        "section",
        child.type
      )
    ) {
      flexItemChild =
        createNeutralSection(
          child
        );
    }

    return createFlexItem(
      flexItemChild
    );
  }

  if (
    parentType === "grid" &&
    canContain(
      "grid",
      "gridItem"
    )
  ) {
    let gridItemChild =
      child;

    if (
      !canContain(
        "gridItem",
        child.type
      ) &&
      canContain(
        "gridItem",
        "section"
      ) &&
      canContain(
        "section",
        child.type
      )
    ) {
      gridItemChild =
        createNeutralSection(
          child
        );
    }

    return createGridItem(
      gridItemChild
    );
  }

  if (
    canContain(
      parentType,
      "section"
    ) &&
    canContain(
      "section",
      child.type
    )
  ) {
    return createNeutralSection(
      child
    );
  }
  return child;
};
const normalizeNode = (rawBlock: unknown): BlockNode => {
  const block = rawBlock as BlockNode || {};

  const type = normalizeBlockType(block?.type);

  const rawChildren = Array.isArray(block?.children) ? block.children : [];
  const normalizedChildren: BlockNode[] = rawChildren.map(normalizeNode);

  return {
    ...block,
    id: block?.id || createId(type || "block"),
    type,
    data: {
      ...(block?.data || {}),
      props: block?.data?.props || block?.props || {},
      style: block?.data?.style || block?.style || responsiveStyle()
    },
    children: normalizedChildren.map(
  (child: BlockNode) => {
    const isSyntheticSection =
      (
        type === "flexItem" ||
        type === "gridItem"
      ) &&
      child.type === "section" &&
      child.children?.length === 1;

    if (isSyntheticSection) {
      const onlyChild =
        child.children![0];

      if (
        canContain(
          type,
          onlyChild.type
        )
      ) {
        return onlyChild;
      }
    }

    return repairChild(
      type,
      child
    );
  }
)
  };
};

export const normalizeCanonicalContainers = (
  tree: unknown[]
): BlockNode[] => {
  if (!Array.isArray(tree)) {
    return [];
  }

  return tree.map(normalizeNode);
};