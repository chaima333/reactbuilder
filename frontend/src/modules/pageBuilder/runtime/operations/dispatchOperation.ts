import type { PageData } from "../../types/page.types";
import type { Operation } from "./types";
import { applyOperation } from "./applyOperation";

/**
 * 🏆 The Central Operation Gateway
 * All architecture capabilities (Validation, Undo/Redo, Transactions, AI patches)
 * will intercept the data flow here before reaching the pure transformer.
 */
export const dispatchOperation = (page: PageData, operation: Operation): PageData => {
  // 🚧 Hooks future implementation here:
  // 1. Normalize (Canonical formatting)
  // 2. Validate Invariants & Capabilities
  // 3. Transaction batch tracking
  // 4. History Logging (Undo/Redo snapshots)
  // 5. Remote Sync (Multiplayer CRDTs / AI logs)

  // Pass-through to the pure deterministic engine
  return applyOperation(page, operation);
};