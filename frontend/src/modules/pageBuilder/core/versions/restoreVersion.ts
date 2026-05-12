import { normalizeVersion }
from "./normalizeVersion";

export const restoreVersion = ({
  version,
  currentBlocks
}: any) => {

  return {

    undoSnapshot:
      structuredClone(
        currentBlocks
      ),

    restoredBlocks:
      normalizeVersion(
        version
      ),

    selection:
      null
  };
};