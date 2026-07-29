import {
  describe,
  expect,
  it,
  vi
} from "vitest";

import type {
  Block
} from "../../types/page.types";

import {
  canSaveBlockAsPattern,
  createIndependentPatternBlock,
  insertPatternAtPageEnd
} from "./patternActions";

const makeBlock = (
  overrides: Partial<Block> = {}
): Block => ({
  id: "section-1",
  type: "section",
  data: {
    props: {},
    style: {
      desktop: {},
      tablet: {},
      mobile: {}
    }
  },
  children: [
    {
      id: "text-1",
      type: "text",
      data: {
        props: {
          content: "Hello"
        },
        style: {
          desktop: {},
          tablet: {},
          mobile: {}
        }
      },
      children: []
    }
  ],
  ...overrides
});

describe("pattern actions", () => {
  it("only allows a section to be saved", () => {
    expect(
      canSaveBlockAsPattern(
        makeBlock()
      )
    ).toBe(true);

    expect(
      canSaveBlockAsPattern(
        makeBlock({
          type: "flex"
        })
      )
    ).toBe(false);

    expect(
      canSaveBlockAsPattern(null)
    ).toBe(false);
  });

  it("creates an independent duplicated tree with different IDs", () => {
    const original =
      makeBlock();

    const duplicated =
      createIndependentPatternBlock(
        original
      );

    expect(duplicated).not.toBe(original);
    expect(duplicated.id).not.toBe(original.id);
    expect(duplicated.children[0].id).not.toBe(
      original.children[0].id
    );
  });

  it("does not mutate the API rootBlock while inserting", () => {
    const original =
      makeBlock();

    const before =
      JSON.stringify(original);

    const addBlockTree =
      vi.fn();

    const inserted =
      insertPatternAtPageEnd(
        original,
        {
          addBlockTree
        }
      );

    expect(JSON.stringify(original)).toBe(before);
    expect(inserted.id).not.toBe(original.id);
    expect(addBlockTree).toHaveBeenCalledWith(
      inserted,
      "ROOT",
      "inside"
    );
  });
});
