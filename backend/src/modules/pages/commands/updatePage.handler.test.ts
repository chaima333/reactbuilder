import {
  beforeEach,
  describe,
  expect,
  it,
  vi
} from "vitest";

const mocks = vi.hoisted(() => ({
  pageFindOne: vi.fn(),
  siteFindByPk: vi.fn(),
  pageVersionCreate: vi.fn(),
  transaction: vi.fn(),
  emitDomainEvent: vi.fn(),
  getSemanticDiff: vi.fn(),
  normalizePage: vi.fn(),
  activityLog: vi.fn()
}));

vi.mock("../../../models/page", () => ({
  Page: {
    findOne: mocks.pageFindOne
  }
}));

vi.mock("../../../models/site", () => ({
  Site: {
    findByPk: mocks.siteFindByPk
  }
}));

vi.mock("../../../models/pageVersion", () => ({
  default: {
    create: mocks.pageVersionCreate
  }
}));

vi.mock("../../../core/database/connection", () => ({
  sequelize: {
    transaction: mocks.transaction
  }
}));

vi.mock("../domain/diff", () => ({
  emitDomainEvent: mocks.emitDomainEvent,
  getSemanticDiff: mocks.getSemanticDiff
}));

vi.mock("../../../core/plugins/events/contracts/unified.contract", () => ({
  normalizePage: mocks.normalizePage
}));

vi.mock("../../dashboard/services/activity.service", () => ({
  ActivityService: {
    log: mocks.activityLog
  }
}));

import { updatePageHandler } from "./updatePage.handler";

const makePage = (overrides: any = {}) => {
  const page: any = {
    id: 7,
    siteId: 11,
    userId: 3,
    title: "Old",
    slug: "old",
    content: "",
    blocks: [],
    status: "published",
    systemType: null,
    get: vi.fn((key: string) => page[key]),
    toJSON: vi.fn(() => ({ ...page })),
    update: vi.fn(async (payload: any) => {
      Object.assign(page, payload);
      return page;
    }),
    ...overrides
  };

  page.toJSON = vi.fn(() => ({
    id: page.id,
    siteId: page.siteId,
    userId: page.userId,
    title: page.title,
    slug: page.slug,
    content: page.content,
    blocks: page.blocks,
    status: page.status,
    systemType: page.systemType
  }));

  return page;
};

describe("updatePageHandler system page slug handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.transaction.mockImplementation(
      async (callback) =>
        callback({
          LOCK: {
            UPDATE: "UPDATE"
          }
        })
    );

    mocks.getSemanticDiff.mockReturnValue([
      "title"
    ]);

    mocks.normalizePage.mockImplementation(
      (page: any) =>
        typeof page?.toJSON === "function"
          ? page.toJSON()
          : page
    );
  });

  it("edits a system page title and preserves its fixed slug", async () => {
    const page =
      makePage({
        title: "Login",
        slug: "login",
        systemType: "visitor_login"
      });

    mocks.pageFindOne.mockResolvedValue(page);

    const result =
      await updatePageHandler({
        payload: {
          pageId: 7,
          title: "Member Sign In"
        },
        context: {
          userId: 3,
          siteId: 11
        }
      });

    expect(result.success).toBe(true);
    expect(page.update).toHaveBeenCalledWith(
      {
        title: "Member Sign In"
      },
      {
        transaction: expect.any(Object)
      }
    );
    expect(result.data.slug).toBe("login");
  });

  it("rejects explicit system page slug mutation", async () => {
    mocks.pageFindOne.mockResolvedValue(
      makePage({
        slug: "login",
        systemType: "visitor_login"
      })
    );

    const result =
      await updatePageHandler({
        payload: {
          pageId: 7,
          slug: "signin"
        },
        context: {
          userId: 3,
          siteId: 11
        }
      });

    expect(result).toEqual({
      success: false,
      error: "SYSTEM_PAGE_SLUG_CANNOT_BE_CHANGED"
    });
  });

  it("keeps normal page title-to-slug behavior unchanged", async () => {
    const page =
      makePage({
        slug: "old",
        systemType: null
      });

    mocks.pageFindOne.mockResolvedValue(page);

    const result =
      await updatePageHandler({
        payload: {
          pageId: 7,
          title: "New Normal Page"
        },
        context: {
          userId: 3,
          siteId: 11
        }
      });

    expect(result.success).toBe(true);
    expect(page.update).toHaveBeenCalledWith(
      {
        title: "New Normal Page",
        slug: "new-normal-page"
      },
      {
        transaction: expect.any(Object)
      }
    );
  });
});
