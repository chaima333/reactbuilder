import type { Block, PageData } from "../../../types/page.types";
import { publishCanonicalTree } from "../../publishing/publishPipeline";
import { replayOperations, replayUndo } from "../replayOperations";
import type { Operation } from "../types";

const block = (
  id: string,
  type: Block["type"],
  children: Block[] = []
): Block => ({
  id,
  type,
  data: {
    props: {},
    style: {
      desktop: {},
      tablet: {},
      mobile: {}
    }
  },
  children
});

const initialPage: PageData = {
  id: 1,
  siteId: 1,
  title: "Replay Contract",
  blocks: [block("section-1", "section")]
};

const operations: Operation[] = [
  {
    type: "INSERT_BLOCK",
    id: "op-1",
    timestamp: 1,
    parentId: "section-1",
    index: 0,
    block: block("flex-1", "flex")
  },
  {
    type: "INSERT_BLOCK",
    id: "op-2",
    timestamp: 2,
    parentId: "flex-1",
    index: 0,
    block: block("flex-item-1", "flexItem")
  },
  {
    type: "INSERT_BLOCK",
    id: "op-3",
    timestamp: 3,
    parentId: "flex-item-1",
    index: 0,
    block: block("title-1", "title")
  }
];

const assert = (condition: unknown, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

export const runOperationReplayContract = () => {
  const replayed = replayOperations(initialPage, operations);

  assert(
    replayed.page.blocks[0].children[0].children[0].children[0].type ===
      "title",
    "move/insert replay should reconstruct Section -> Flex -> FlexItem -> Title"
  );

  const undone = replayUndo(initialPage, operations);

  assert(
    undone.page.blocks[0].children[0].children[0].children.length === 0,
    "undo replay should remove the latest operation effect"
  );

  const published = publishCanonicalTree(replayed.page.blocks);

  assert(
    published.document.blocks[0].children[0].children[0].children[0].type ===
      "title",
    "serialization replay should preserve canonical nesting"
  );

  const imported = JSON.parse(published.staticRuntimeOutput);

  assert(
    imported.blocks[0].children[0].children[0].children[0].type === "title",
    "import/export replay should round-trip canonical output"
  );

  return true;
};
