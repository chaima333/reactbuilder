import type { Block, BlockType } from "../../types/page.types";
import {
  canAcceptChild,
  getWrapperRule
} from "../../core/schema/canonicalSchema";

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

export type InvariantReport = {
  valid: boolean;
  violations: InvariantViolation[];
  parentMap: Map<string, string>;
};

const isKnownType = (type: string): type is BlockType => {
  return [
    "root",
    "section",
    "text",
    "image",
    "button",
    "navbar",
    "title",
    "cta",
    "hero",
    "features",
    "flex",
    "flexItem",
    "grid",
    "gridItem"
  ].includes(type);
};

const addViolation = (
  violations: InvariantViolation[],
  violation: InvariantViolation
) => {
  violations.push(violation);
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
      (block.type === "gridItem" || block.type === "flexItem") &&
      !getWrapperRule(parentType, block.children?.[0]?.type as BlockType)
    ) {
      const legalParent =
        block.type === "gridItem" ? parentType === "grid" : parentType === "flex";

      if (!legalParent) {
        addViolation(violations, {
          severity: "error",
          code: "ILLEGAL_WRAPPER",
          blockId: block.id,
          parentId,
          path,
          message: `${block.type} must be owned by its matching layout parent.`
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
  const report = validateTreeInvariants(blocks);

  if (!report.valid) {
    throw new InvariantViolationException(report.violations);
  }

  return report;
};
