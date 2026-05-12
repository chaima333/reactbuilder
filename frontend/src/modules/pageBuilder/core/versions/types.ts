import { Block } from "../../types/page.types";

export interface VersionSnapshot {
  id: string;
  blocks: Block[];
  createdAt: string;
}

export interface RestoreTransition {
  restoredBlocks: Block[];
  undoSnapshot: Block[];
  selection: string | null;
}