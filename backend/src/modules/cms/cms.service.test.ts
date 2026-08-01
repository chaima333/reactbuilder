import {
  beforeEach,
  describe,
  expect,
  it,
  vi
} from "vitest";

const mocks = vi.hoisted(() => ({
  collectionFindOne: vi.fn(),
  entryFindOne: vi.fn(),
  entryCreate: vi.fn(),
  pageFindOne: vi.fn()
}));

vi.mock("../../models", () => ({
  CmsCollection: {
    findOne: mocks.collectionFindOne
  },
  CmsField: {},
  CmsEntry: {
    findOne: mocks.entryFindOne,
    create: mocks.entryCreate
  },
  Page: {
    findOne: mocks.pageFindOne
  }
}));

import { CmsService } from "./cms.service";

const collection = {
  id: 20,
  siteId: 10,
  fields: [
    {
      key: "title",
      type: "text",
      required: false
    },
    {
      key: "name",
      type: "text",
      required: false
    }
  ]
};

describe("CmsService entry slug behavior", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.collectionFindOne.mockResolvedValue(
      collection
    );
    mocks.entryFindOne.mockResolvedValue(null);
    mocks.entryCreate.mockImplementation(
      async (payload) => ({
        id: 1,
        ...payload
      })
    );
  });

  it("uses an explicit valid slug", async () => {
    const entry =
      await CmsService.createEntry(
        10,
        20,
        {
          slug: "  Développement Web  ",
          data: {
            title: "Ignored"
          }
        }
      );

    expect(entry.slug).toBe(
      "developpement-web"
    );
    expect(mocks.entryCreate)
      .toHaveBeenCalledWith(
        expect.objectContaining({
          siteId: 10,
          collectionId: 20,
          slug: "developpement-web"
        })
      );
  });

  it("generates slug from title", async () => {
    const entry =
      await CmsService.createEntry(
        10,
        20,
        {
          data: {
            title: "Service Design"
          }
        }
      );

    expect(entry.slug).toBe(
      "service-design"
    );
  });

  it("uses deterministic suffixes for generated slug conflicts", async () => {
    mocks.entryFindOne
      .mockResolvedValueOnce({
        id: 1
      })
      .mockResolvedValueOnce({
        id: 2
      })
      .mockResolvedValueOnce(null);

    const entry =
      await CmsService.createEntry(
        10,
        20,
        {
          data: {
            title: "Service"
          }
        }
      );

    expect(entry.slug).toBe("service-3");
    expect(mocks.entryFindOne)
      .toHaveBeenNthCalledWith(
        1,
        {
          where: {
            siteId: 10,
            collectionId: 20,
            slug: "service"
          }
        }
      );
    expect(mocks.entryFindOne)
      .toHaveBeenNthCalledWith(
        2,
        {
          where: {
            siteId: 10,
            collectionId: 20,
            slug: "service-2"
          }
        }
      );
    expect(mocks.entryFindOne)
      .toHaveBeenNthCalledWith(
        3,
        {
          where: {
            siteId: 10,
            collectionId: 20,
            slug: "service-3"
          }
        }
      );
  });

  it("returns conflict for an explicit duplicate slug", async () => {
    mocks.entryFindOne.mockResolvedValue({
      id: 99
    });

    await expect(
      CmsService.createEntry(
        10,
        20,
        {
          slug: "service",
          data: {
            title: "Service"
          }
        }
      )
    ).rejects.toThrow(
      "CMS_ENTRY_SLUG_CONFLICT"
    );
  });

  it("update excludes the current entry from duplicate checks", async () => {
    const update = vi.fn();

    mocks.entryFindOne
      .mockResolvedValueOnce({
        id: 7,
        siteId: 10,
        collectionId: 20,
        slug: "old",
        status: "draft",
        data: {
          title: "Old"
        },
        collection,
        update
      })
      .mockResolvedValueOnce(null);

    await CmsService.updateEntry(
      10,
      7,
      {
        slug: "old",
        data: {
          title: "Old"
        }
      }
    );

    const secondCall =
      mocks.entryFindOne.mock.calls[1][0];

    expect(secondCall.where).toMatchObject({
      siteId: 10,
      collectionId: 20,
      slug: "old"
    });
    expect(secondCall.where.id)
      .toBeDefined();
    expect(update)
      .toHaveBeenCalledWith(
        expect.objectContaining({
          slug: "old"
        })
      );
  });

  it("returns conflict for duplicate slug update", async () => {
    const update = vi.fn();

    mocks.entryFindOne
      .mockResolvedValueOnce({
        id: 7,
        siteId: 10,
        collectionId: 20,
        slug: "old",
        status: "draft",
        data: {
          title: "Old"
        },
        collection,
        update
      })
      .mockResolvedValueOnce({
        id: 8
      });

    await expect(
      CmsService.updateEntry(
        10,
        7,
        {
          slug: "service",
          data: {
            title: "Old"
          }
        }
      )
    ).rejects.toThrow(
      "CMS_ENTRY_SLUG_CONFLICT"
    );
    expect(update).not.toHaveBeenCalled();
  });

  it("rejects an explicit empty normalized slug", async () => {
    await expect(
      CmsService.createEntry(
        10,
        20,
        {
          slug: "!!!",
          data: {
            title: "Title"
          }
        }
      )
    ).rejects.toThrow(
      "CMS_ENTRY_SLUG_INVALID"
    );
  });

  it("keeps collection and site isolation in entry lookups", async () => {
    await CmsService.createEntry(
      10,
      20,
      {
        slug: "service",
        data: {
          title: "Service"
        }
      }
    );

    expect(mocks.collectionFindOne)
      .toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: 20,
            siteId: 10
          }
        })
      );

    expect(mocks.entryFindOne)
      .toHaveBeenCalledWith({
        where: {
          siteId: 10,
          collectionId: 20,
          slug: "service"
        }
      });
  });
});
