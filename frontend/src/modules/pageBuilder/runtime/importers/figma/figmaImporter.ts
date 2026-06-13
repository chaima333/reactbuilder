import {
  fetchFigmaFile
} from "./figmaApiClient";

import {
  parseFigmaDocument,
  parseFigmaPluginPayload
} from "./parseFigmaDocument";

import {
  figmaNodeToBlock
} from "./figmaNodeToBlock";

import type {
  SerializedBlock
} from "../../../types/document/serialized.types";

export const runFigmaImport = async (
  fileKey: string,
  token: string,
  frameId?: string
): Promise<SerializedBlock[]> => {
  const figmaDoc =
    await fetchFigmaFile(
      fileKey,
      token
    );

  const nodes =
    parseFigmaDocument(
      figmaDoc,
      frameId
    );

  const blocks =
    nodes
      .map(node =>
        figmaNodeToBlock(
          node,
          true
        )
      )
      .filter(
        (block): block is SerializedBlock =>
          block !== null
      );

  console.log(
    "FIGMA_IMPORT_REPORT",
    {
      inputNodeCount: nodes.length,
      outputBlockCount: blocks.length
    }
  );

  return blocks;
};


import type {
  FigmaNode
} from "./figma.types";

export const runFigmaPluginImport = (
  payload: FigmaNode
): SerializedBlock[] => {
  const nodes =
    parseFigmaPluginPayload(
      payload
    );

  const blocks =
    nodes
      .map(node =>
        figmaNodeToBlock(
          node,
          true
        )
      )
      .filter(
        (block): block is SerializedBlock =>
          block !== null
      );

  console.log(
    "FIGMA_PLUGIN_IMPORT_REPORT",
    {
      inputNodeCount: nodes.length,
      outputBlockCount: blocks.length
    }
  );

  return blocks;
};