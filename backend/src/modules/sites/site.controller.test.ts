import {
  beforeEach,
  describe,
  expect,
  it,
  vi
} from "vitest";

const mocks = vi.hoisted(() => ({
  siteFindOne: vi.fn(),
  siteFindByPk: vi.fn(),
  siteUpdate: vi.fn(),
  siteMemberFindOne: vi.fn(),
  siteMemberFindAll: vi.fn(),
  dispatch: vi.fn(),
  createSite: vi.fn(),
  updateSiteService: vi.fn(),
  updateGlobalLayoutService: vi.fn(),
  updateThemeService: vi.fn()
}));

vi.mock("../../models", () => ({
  Site: {
    findOne: mocks.siteFindOne,
    findByPk: mocks.siteFindByPk,
    update: mocks.siteUpdate
  },
  Page: {},
  SiteMember: {
    findOne: mocks.siteMemberFindOne,
    findAll: mocks.siteMemberFindAll
  }
}));

vi.mock("../sites/site.service", () => ({
  SiteService: {
    createSite: mocks.createSite,
    updateSiteService: mocks.updateSiteService,
    updateGlobalLayoutService: mocks.updateGlobalLayoutService,
    updateThemeService: mocks.updateThemeService
  }
}));

vi.mock("../../core/plugins/event.dispatcher", () => ({
  EventDispatcher: {
    dispatch: mocks.dispatch
  }
}));

vi.mock("../siteVisitors/siteVisitorAuth.middleware", () => ({}));

import { getPublicSite } from "./site.controller";

const makeResponse = () => {
  const res: any = {
    statusCode: 200,
    headers: {},
    body: null,
    set: vi.fn((key: string, value: string) => {
      res.headers[key] = value;
      return res;
    }),
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

describe("getPublicSite navigation page listing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.siteFindOne.mockResolvedValue({
      id: 10,
      pages: []
    });
  });

  it("excludes visitor_login pages from public site listing", async () => {
    await getPublicSite(
      {
        params: {
          siteId: "10"
        }
      } as any,
      makeResponse()
    );

    const include =
      mocks.siteFindOne.mock.calls[0][0].include[0];

    expect(include.where).toMatchObject({
      status: "published",
      systemType: null,
      visibility: "public"
    });
  });

  it("excludes visitor_register pages from public site listing", async () => {
    await getPublicSite(
      {
        params: {
          siteId: "10"
        }
      } as any,
      makeResponse()
    );

    const include =
      mocks.siteFindOne.mock.calls[0][0].include[0];

    expect(include.where.systemType).toBeNull();
  });

  it("keeps normal published public pages included", async () => {
    await getPublicSite(
      {
        params: {
          siteId: "10"
        }
      } as any,
      makeResponse()
    );

    const include =
      mocks.siteFindOne.mock.calls[0][0].include[0];

    expect(include.where).toMatchObject({
      status: "published",
      visibility: "public",
      systemType: null
    });
  });

  it("keeps members_only pages available for authenticated visitors", async () => {
    await getPublicSite(
      {
        params: {
          siteId: "10"
        },
        siteVisitor: {
          id: 22
        }
      } as any,
      makeResponse()
    );

    const include =
      mocks.siteFindOne.mock.calls[0][0].include[0];

    expect(include.where).toMatchObject({
      status: "published",
      systemType: null
    });
    expect(include.where).not.toHaveProperty(
      "visibility"
    );
  });

  it("does not expose systemType in public navigation metadata", async () => {
    await getPublicSite(
      {
        params: {
          siteId: "10"
        }
      } as any,
      makeResponse()
    );

    const include =
      mocks.siteFindOne.mock.calls[0][0].include[0];

    expect(include.attributes).not.toContain(
      "systemType"
    );
  });
});
