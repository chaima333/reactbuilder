// frontend/src/modules/pageBuilder/runtime/operations/types.ts

import { BlockType } from "../../types/page.types";

export interface SerializedBlock {
  id: string;
  type: BlockType;
  props: Record<string, unknown>;
  style: {
    desktop?: Record<string, unknown>;
    tablet?: Record<string, unknown>;
    mobile?: Record<string, unknown>;
  };
  children?: SerializedBlock[];
}

export type Operation =
  | InsertBlockOperation
  | RemoveBlockOperation
  | MoveBlockOperation
  | UpdatePropsOperation
  | UpdateStyleOperation;

export interface BaseOperation {
  type: string;
  id: string;
  timestamp: number;
}

export interface InsertBlockOperation extends BaseOperation {
  type: "insert_block";
  parentId: string;
  index: number;
  block: SerializedBlock; // ✅ تم التحويل إلى SerializedBlock لمنع تسريب الـ Runtime Metadata
}

export interface RemoveBlockOperation extends BaseOperation {
  type: "remove_block";
  blockId: string;
}

export interface MoveBlockOperation extends BaseOperation {
  type: "move_block";
  blockId: string;
  targetParentId: string;
  targetIndex: number;
}

export interface UpdatePropsOperation extends BaseOperation {
  type: "update_props";
  blockId: string;
  propsPatch: Record<string, unknown>;
}

export interface UpdateStyleOperation extends BaseOperation {
  type: "update_style";
  blockId: string;
  device: "desktop" | "tablet" | "mobile"; // ✅ إجبارية لتفادي الـ Shallow Overwrite
  stylePatch: Record<string, unknown>;
}