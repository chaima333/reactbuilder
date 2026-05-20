import type { Block } from "../../types/page.types";

export type OperationType =
  | "INSERT_BLOCK"
  | "MOVE_BLOCK"
  | "WRAP_BLOCK"
  | "DELETE_BLOCK"
  | "TRANSFORM_BLOCK"
  | "UPDATE_PROPS"
  | "UPDATE_STYLE";

export interface BaseOperation {
  type: OperationType;
  id: string;
  timestamp: number;
}

export interface InsertBlockOperation extends BaseOperation {
  type: "INSERT_BLOCK";
  parentId: string;
  index: number;
  block: Block;
}

export interface MoveBlockOperation extends BaseOperation {
  type: "MOVE_BLOCK";
  blockId: string;
  targetParentId: string;
  targetIndex: number;
}

export interface WrapBlockOperation extends BaseOperation {
  type: "WRAP_BLOCK";
  blockId: string;
  wrapper: Block;
}

export interface DeleteBlockOperation extends BaseOperation {
  type: "DELETE_BLOCK";
  blockId: string;
}

export interface TransformBlockOperation extends BaseOperation {
  type: "TRANSFORM_BLOCK";
  blockId: string;
  nextBlock: Block;
}

export interface UpdatePropsOperation extends BaseOperation {
  type: "UPDATE_PROPS";
  blockId: string;
  propsPatch: Record<string, unknown>;
}

export interface UpdateStyleOperation extends BaseOperation {
  type: "UPDATE_STYLE";
  blockId: string;
  device: "desktop" | "tablet" | "mobile";
  stylePatch: Record<string, unknown>;
}

export type Operation =
  | InsertBlockOperation
  | MoveBlockOperation
  | WrapBlockOperation
  | DeleteBlockOperation
  | TransformBlockOperation
  | UpdatePropsOperation
  | UpdateStyleOperation;

export type OperationDraft = Omit<Operation, "id" | "timestamp">;
