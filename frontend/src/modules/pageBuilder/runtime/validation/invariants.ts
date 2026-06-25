import type { Block, BlockType } from "../../types/page.types";
import { canAcceptChild} from "../../core/schema/canonicalSchema";

export type InvariantSeverity = "error" | "warning";

export type InvariantViolation = {
  severity: InvariantSeverity;
  code:
    | "DUPLICATE_ID"
    | "CYCLE"
    | "ORPHAN"
    | "INVALID_NESTING"
    | "ILLEGAL_WRAPPER"
    | "UNKNOWN_BLOCK";
  blockId?: string;
  parentId?: string;
  path: string;
  message: string;
};

const primitiveBlockTypes: BlockType[] = [
  "title",
  "text",
  "image",
  "button",
  "link",
  "input",
  "select",
  "textarea"
];

export type InvariantReport = {
  valid: boolean;
  violations: InvariantViolation[];
  parentMap: Map<string, string>;
};

const isKnownType = (
  type: string
): type is BlockType => {

  return [

    "root",

    // =====================
    // LAYOUT
    // =====================

    "section",

    "flex",

    "flexItem",

    "grid",

    "gridItem",

    "navbar",

    // =====================
    // PRIMITIVES
    // =====================

    "title",

    "text",

    "image",

    "button",

    "link",

    "input",

    "select",

    "textarea",

    // =====================
    // SEMANTIC
    // =====================

    "hero",

    "cta",

    "features"

  ].includes(type);
};

const addViolation = (
  violations: InvariantViolation[],
  violation: InvariantViolation
) => {
  violations.push(violation);
};

const logEmptyTextBlocks = (
  blocks: Block[],
  path = "blocks",
  parentType: BlockType = "root"
) => {

  blocks.forEach((block, index) => {

    const blockPath =
      `${path}[${index}]`;

    if (
      block.type === "text" &&
      typeof block.data?.props?.content ===
  "string" &&

!block.data.props.content
  .trim()
    )

    logEmptyTextBlocks(
      block.children || [],
      `${blockPath}.children`,
      block.type
    );
  });
};

export const validateTreeInvariants = (
  blocks: Block[],
  rootType: BlockType = "root"
): InvariantReport => {
  const violations: InvariantViolation[] = [];
  const ids = new Set<string>();
  const objectStack = new WeakSet<object>();
  const parentMap = new Map<string, string>();

  const visit = (
    block: Block,
    parentType: BlockType,
    parentId: string,
    path: string
  ) => {
    if (objectStack.has(block)) {
      addViolation(violations, {
        severity: "error",
        code: "CYCLE",
        blockId: block.id,
        parentId,
        path,
        message: "Block tree contains a cyclic object reference."
      });
      return;
    }

    objectStack.add(block);

    if (ids.has(block.id)) {
      addViolation(violations, {
        severity: "error",
        code: "DUPLICATE_ID",
        blockId: block.id,
        parentId,
        path,
        message: `Duplicate block id "${block.id}".`
      });
    }

    ids.add(block.id);
    parentMap.set(block.id, parentId);

    if (!isKnownType(block.type)) {
      addViolation(violations, {
        severity: "error",
        code: "UNKNOWN_BLOCK",
        blockId: block.id,
        parentId,
        path,
        message: `Unknown block type "${block.type}".`
      });
      objectStack.delete(block);
      return;
    }

    if (!canAcceptChild(parentType, block.type)) {
      addViolation(violations, {
        severity: "error",
        code: "INVALID_NESTING",
        blockId: block.id,
        parentId,
        path,
        message: `${parentType} cannot contain ${block.type}.`
      });
    }

    if (
      parentType === "section" &&
      primitiveBlockTypes.includes(block.type)
    ) {

      addViolation(violations, {
        severity: "error",
        code: "INVALID_NESTING",
        blockId: block.id,
        parentId,
        path,
        message:
          `section cannot contain primitive ${block.type} directly. Wrap it in flex/grid -> flexItem/gridItem.`
      });
    }

    if (block.type === "gridItem") {
  const legalParent =
    parentType === "grid";

  if (!legalParent) {
    addViolation(violations, {
      severity: "error",
      code: "ILLEGAL_WRAPPER",
      blockId: block.id,
      parentId,
      path,
      message:
        "gridItem must be owned by grid."
    });
  }
}

if (block.type === "flexItem") {
  const legalParent =
    parentType === "flex" ||
    parentType === "navbar";

  if (!legalParent) {
    addViolation(violations, {
      severity: "error",
      code: "ILLEGAL_WRAPPER",
      blockId: block.id,
      parentId,
      path,
      message:
        "flexItem must be owned by flex/navbar."
    });
  }
}

    block.children?.forEach((child, index) => {
      visit(
        child,
        block.type,
        block.id,
        `${path}.children[${index}]`
      );
    });

    objectStack.delete(block);
  };

  blocks.forEach((block, index) => {
    visit(block, rootType, "root", `blocks[${index}]`);
  });

  return {
    valid: !violations.some((violation) => violation.severity === "error"),
    violations,
    parentMap
  };
};

export class InvariantViolationException extends Error {
  violations: InvariantViolation[];

  constructor(violations: InvariantViolation[]) {
    super(violations.map((violation) => violation.message).join("\n"));
    this.name = "InvariantViolationException";
    this.violations = violations;
  }
}

export const assertTreeInvariants = (blocks: Block[]) => {
  logEmptyTextBlocks(
    blocks
  );

  const report = validateTreeInvariants(blocks);

  if (!report.valid) {


    throw new InvariantViolationException(report.violations);
  }

  return report;
};
