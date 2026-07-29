import {
  beforeEach,
  describe,
  expect,
  it,
  vi
} from "vitest";

const mocks = vi.hoisted(() => ({
  findAll: vi.fn(),
  findById: vi.fn(),
  findBySlug: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn()
}));

vi.mock("./blockPattern.repository", () => ({
  BlockPatternRepository: mocks
}));

import { BlockPatternService } from "./blockPattern.service";

const sectionBlock = () => ({
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
      id: "flex-1",
      type: "flex",
      data: {
        props: {},
        style: {}
      },
      children: []
    }
  ]
});

describe("BlockPatternService", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.findBySlug.mockResolvedValue(null);
    mocks.create.mockImplementation(async (data) => ({
      id: 1,
      ...data
    }));
    mocks.update.mockImplementation(async (pattern, data) => ({
      ...pattern,
      ...data
    }));
    mocks.delete.mockResolvedValue(undefined);
  });

  it("creates a valid section pattern", async () => {
    const pattern =
      await BlockPatternService.createPattern(
        10,
        20,
        {
          name: "Hero Pattern",
          description: "Reusable hero",
          rootBlock: sectionBlock(),
          metadata: {
            source: "test"
          },
          siteId: 999
        }
      );

    expect(mocks.create).toHaveBeenCalledWith(
      expect.objectContaining({
        siteId: 10,
        createdBy: 20,
        name: "Hero Pattern",
        slug: "hero-pattern",
        blockType: "section",
        description: "Reusable hero",
        metadata: {
          source: "test"
        }
      })
    );
    expect(pattern.siteId).toBe(10);
  });

  it("rejects a non-section root", async () => {
    await expect(
      BlockPatternService.createPattern(
        10,
        20,
        {
          name: "Bad",
          rootBlock: {
            ...sectionBlock(),
            type: "flex"
          }
        }
      )
    ).rejects.toThrow(
      "PATTERN_ROOT_MUST_BE_SECTION"
    );

    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("rejects duplicate IDs inside the tree", async () => {
    const root =
      sectionBlock();

    root.children.push({
      id: "flex-1",
      type: "grid",
      data: {},
      children: []
    });

    await expect(
      BlockPatternService.createPattern(
        10,
        20,
        {
          name: "Duplicate",
          rootBlock: root
        }
      )
    ).rejects.toThrow(
      "PATTERN_DUPLICATE_BLOCK_ID"
    );
  });

  it("uses site id in every single-pattern lookup", async () => {
    mocks.findById.mockResolvedValue({
      id: 7,
      siteId: 10
    });

    await BlockPatternService.getPattern(
      10,
      7
    );

    expect(mocks.findById).toHaveBeenCalledWith(
      10,
      7
    );
  });

  it("throws a stable not found error", async () => {
    mocks.findById.mockResolvedValue(null);

    await expect(
      BlockPatternService.getPattern(
        10,
        404
      )
    ).rejects.toThrow(
      "PATTERN_NOT_FOUND"
    );
  });

  it("generates a unique slug with numeric suffix", async () => {
    mocks.findBySlug
      .mockResolvedValueOnce({
        id: 1
      })
      .mockResolvedValueOnce({
        id: 2
      })
      .mockResolvedValueOnce(null);

    const pattern =
      await BlockPatternService.createPattern(
        10,
        20,
        {
          name: "Hero Pattern",
          rootBlock: sectionBlock()
        }
      );

    expect(pattern.slug).toBe(
      "hero-pattern-3"
    );
  });

  it("updates a pattern", async () => {
    mocks.findById.mockResolvedValue({
      id: 9,
      siteId: 10,
      name: "Old",
      slug: "old",
      update: vi.fn()
    });

    const updated =
      await BlockPatternService.updatePattern(
        10,
        9,
        {
          name: "New Name",
          description: "Updated",
          rootBlock: sectionBlock(),
          metadata: {
            edited: true
          }
        }
      );

    expect(mocks.update).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 9,
        siteId: 10
      }),
      expect.objectContaining({
        name: "New Name",
        slug: "new-name",
        description: "Updated",
        blockType: "section",
        metadata: {
          edited: true
        }
      })
    );
    expect(updated.name).toBe("New Name");
  });

  it("deletes a pattern", async () => {
    const pattern = {
      id: 9,
      siteId: 10
    };

    mocks.findById.mockResolvedValue(pattern);

    await expect(
      BlockPatternService.deletePattern(
        10,
        9
      )
    ).resolves.toBe(true);

    expect(mocks.delete).toHaveBeenCalledWith(
      pattern
    );
  });
});
