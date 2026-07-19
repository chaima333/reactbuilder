import {
  beforeEach,
  describe,
  expect,
  it,
  vi
} from "vitest";

const mocks = vi.hoisted(() => ({
  createPage: vi.fn(),
  getPages: vi.fn(),
  updatePage: vi.fn(),
  deletePage: vi.fn(),
  dispatch: vi.fn()
}));

vi.mock("../services/page.service", () => ({
  PageService: {
    createPage: mocks.createPage,
    getPages: mocks.getPages,
    updatePage: mocks.updatePage,
    deletePage: mocks.deletePage
  }
}));

vi.mock("../services/pageVersion.service", () => ({
  PageVersionService: {}
}));

vi.mock("../../../core/plugins/event.dispatcher", () => ({
  EventDispatcher: {
    dispatch: mocks.dispatch
  }
}));

vi.mock("../../siteVisitors/siteVisitorPageAccess", () => ({
  getPublicPageAccessDecision: vi.fn(() => ({
    allowed: true
  }))
}));

import {
  createPage,
  deletePage,
  getPages,
  updatePage
} from "./page.controller";

const makeResponse = () => {
  const res: any = {
    statusCode: 200,
    body: null,
    status: vi.fn((code: number) => {
      res.statusCode = code;
      return res;
    }),
    json: vi.fn((body: any) => {
      res.body = body;
      return res;
    })
  };

  return res;
};

const makeRequest = (overrides: any = {}) => ({
  siteContext: {
    siteId: 10,
    role: "OWNER"
  },
  user: {
    id: 20
  },
  params: {
    pageId: "30"
  },
  body: {},
  ...overrides
});

describe("page controller guard error handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    [
      "delete",
      deletePage,
      "SYSTEM_PAGE_CANNOT_BE_DELETED",
      409
    ],
    [
      "update slug",
      updatePage,
      "SYSTEM_PAGE_SLUG_CANNOT_BE_CHANGED",
      409
    ],
    [
      "update homepage",
      updatePage,
      "SYSTEM_PAGE_CANNOT_BE_HOMEPAGE",
      409
    ],
    [
      "update system type",
      updatePage,
      "SYSTEM_TYPE_CANNOT_BE_CHANGED",
      409
    ],
    [
      "create normal with system type",
      createPage,
      "NORMAL_PAGE_CANNOT_SET_SYSTEM_TYPE",
      400
    ],
    [
      "duplicate visitor auth block",
      createPage,
      "PAGE_VISITOR_AUTH_BLOCK_DUPLICATED",
      409
    ],
    [
      "mixed visitor auth blocks",
      updatePage,
      "PAGE_CANNOT_MIX_VISITOR_AUTH_BLOCKS",
      409
    ],
    [
      "missing system visitor auth block",
      updatePage,
      "SYSTEM_PAGE_VISITOR_AUTH_BLOCK_REQUIRED",
      409
    ],
    [
      "wrong system visitor auth block",
      updatePage,
      "SYSTEM_PAGE_WRONG_VISITOR_AUTH_BLOCK",
      409
    ],
    [
      "duplicate system visitor auth block",
      updatePage,
      "SYSTEM_PAGE_VISITOR_AUTH_BLOCK_DUPLICATED",
      409
    ]
  ])(
    "returns explicit HTTP status/code for %s guard failures",
    async (_name, handler, code, status) => {
      mocks.createPage.mockRejectedValue(
        new Error(code)
      );
      mocks.updatePage.mockRejectedValue(
        new Error(code)
      );
      mocks.deletePage.mockRejectedValue(
        new Error(code)
      );

      const res = makeResponse();

      await handler(
        makeRequest({
          params: {
            pageId: String(status) + code.length
          }
        }),
        res
      );

      expect(res.status).toHaveBeenCalledWith(
        status
      );
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: code,
        code
      });
    }
  );
});

describe("page controller admin listing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("still includes system pages in the admin page list", async () => {
    mocks.getPages.mockResolvedValue([
      {
        id: 1,
        title: "Login",
        slug: "login",
        systemType: "visitor_login",
        visibility: "public"
      },
      {
        id: 2,
        title: "Home",
        slug: "home",
        systemType: null,
        visibility: "public"
      }
    ]);

    const res = makeResponse();

    await getPages(
      makeRequest(),
      res
    );

    expect(mocks.getPages).toHaveBeenCalledWith(10);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: [
        expect.objectContaining({
          slug: "login",
          systemType: "visitor_login"
        }),
        expect.objectContaining({
          slug: "home",
          systemType: null
        })
      ]
    });
  });
});
