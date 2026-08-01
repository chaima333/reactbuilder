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
  pageFindOne: vi.fn()
}));

vi.mock("../../models", () => ({
  CmsCollection: {
    findOne: mocks.collectionFindOne
  },
  CmsEntry: {
    findOne: mocks.entryFindOne
  },
  CmsField: {},
  Page: {
    findOne: mocks.pageFindOne
  }
}));

import { CmsDetailService } from "./cmsDetail.service";

const fields = [
  {
    id: 1,
    key: "title",
    name: "Title",
    type: "text"
  },
  {
    id: 2,
    key: "description",
    name: "Description",
    type: "textarea"
  }
];

const collection = {
  id: 20,
  siteId: 10,
  name: "Services",
  slug: "services",
  templatePageId: 30,
  fields
};

const entry = {
  id: 40,
  siteId: 10,
  collectionId: 20,
  slug: "web-design",
  status: "published",
  data: {
    title: "Web Design",
    description: "Design systems"
  },
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-02T00:00:00Z")
};

const templateBlocks = [
  {
    id: "title",
    type: "title",
    data: {
      props: {
        content: "{{cms.title}}"
      },
      style: {}
    },
    children: []
  }
];

const templatePage = {
  id: 30,
  siteId: 10,
  title: "Service Template",
  slug: "service-template",
  status: "published",
  blocks: templateBlocks
};

describe("CmsDetailService public detail resolution", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.collectionFindOne
      .mockResolvedValue(collection);
    mocks.entryFindOne
      .mockResolvedValue(entry);
    mocks.pageFindOne
      .mockResolvedValue(templatePage);
  });

  it("resolves a published entry with a published same-site template", async () => {
    const result =
      await CmsDetailService.resolvePublicDetail(
        10,
        "services",
        "web-design"
      );

    expect(result.slug).toBe(
      "web-design"
    );
    expect(result.template.pageId).toBe(30);
    expect(result.template.blocks)
      .toEqual([
        expect.objectContaining({
          data: expect.objectContaining({
            props: {
              content: "Web Design"
            },
            style: {}
          })
        })
      ]);
  });

  it("returns 404-style error for draft entries", async () => {
    mocks.entryFindOne.mockResolvedValue(null);

    await expect(
      CmsDetailService.resolvePublicDetail(
        10,
        "services",
        "draft-entry"
      )
    ).rejects.toThrow(
      "CMS_PUBLIC_ENTRY_NOT_FOUND"
    );

    expect(mocks.entryFindOne)
      .toHaveBeenCalledWith({
        where: {
          siteId: 10,
          collectionId: 20,
          slug: "draft-entry",
          status: "published"
        }
      });
  });

  it("returns 404-style error for draft templates", async () => {
    mocks.pageFindOne.mockResolvedValue(null);

    await expect(
      CmsDetailService.resolvePublicDetail(
        10,
        "services",
        "web-design"
      )
    ).rejects.toThrow(
      "CMS_TEMPLATE_NOT_PUBLIC"
    );

    expect(mocks.pageFindOne)
      .toHaveBeenCalledWith({
        where: {
          id: 30,
          siteId: 10,
          status: "published"
        }
      });
  });

  it("returns 404-style error for templates from another site", async () => {
    mocks.pageFindOne.mockResolvedValue(null);

    await expect(
      CmsDetailService.resolvePublicDetail(
        10,
        "services",
        "web-design"
      )
    ).rejects.toThrow(
      "CMS_TEMPLATE_NOT_PUBLIC"
    );
  });

  it("returns 404-style error when no template is configured", async () => {
    mocks.collectionFindOne.mockResolvedValue({
      ...collection,
      templatePageId: null
    });

    await expect(
      CmsDetailService.resolvePublicDetail(
        10,
        "services",
        "web-design"
      )
    ).rejects.toThrow(
      "CMS_TEMPLATE_NOT_CONFIGURED"
    );
  });

  it("resolves blocks with entry data", async () => {
    const result =
      await CmsDetailService.resolvePublicDetail(
        10,
        "services",
        "web-design"
      );

    expect(
      (result.template.blocks as any[])[0]
        .data.props.content
    ).toBe("Web Design");
  });

  it("does not mutate original stored page blocks", async () => {
    const original =
      structuredClone(templateBlocks);

    await CmsDetailService.resolvePublicDetail(
      10,
      "services",
      "web-design"
    );

    expect(templateBlocks).toEqual(original);
    expect(templatePage.blocks).toEqual(original);
  });
});
