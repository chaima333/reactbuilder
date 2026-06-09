import type { Block } from "../../types/page.types";
import type { PageDocument } from "../../types/document/serialized.types";
import { serializePage } from "../serialization/serializePage";
import { validateDocument } from "../validation/validateDocument";
import { assertTreeInvariants } from "../validation/invariants";
import { hydrateTree } from "../hydrate/hydrateTree";

export type PublishingResult = {
  canonicalTree: Block[];
  document: PageDocument;
  staticRuntimeOutput: string;
};

const renderStaticRuntimeOutput = (document: PageDocument) => {
  return JSON.stringify(document);
};

export const publishCanonicalTree = (
  editorBlocks: Block[]
): PublishingResult => {
  const canonicalTree = hydrateTree(structuredClone(editorBlocks));

  assertTreeInvariants(canonicalTree);

  const document = serializePage(canonicalTree);
  const validatedDocument = validateDocument(document);

  return {
    canonicalTree,
    document: validatedDocument,
    staticRuntimeOutput: renderStaticRuntimeOutput(validatedDocument)
  };
};
