import type { Block } from "../../types/page.types";
import { hydrateTree } from "../normalize/NormalizeTree";
import { assertTreeInvariants } from "../validation/invariants";

export type AICanonicalTreeResult = {
  blocks: Block[];
};

export const acceptAICanonicalTree = (
  input: unknown
): AICanonicalTreeResult => {
  if (!Array.isArray(input)) {
    throw new Error("AI output must be a canonical block tree array.");
  }

  const blocks = hydrateTree(input as any[]);

  assertTreeInvariants(blocks);

  return { blocks };
};
