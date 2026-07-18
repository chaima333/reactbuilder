import {
  beforeEach,
  describe,
  expect,
  it,
  vi
} from "vitest";

const mocks = vi.hoisted(() => ({
  pageFindOne: vi.fn(),
  pageCreate: vi.fn()
}));

vi.mock("../../models", () => ({
  Page: {
    findOne: mocks.pageFindOne,
    create: mocks.pageCreate
  }
}));

import {
  PAGE_SYSTEM_TYPES,
  assertCanCreateNormalPage,
  assertSystemPageCanBeDeleted,
  assertSystemPageMutationAllowed,
  createMissingSystemPagesForSite,
  getDefaultSystemPageBlocks
} from "./systemPages";

describe("system page guards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not create duplicate system pages for a site", async () => {
    mocks.pageFindOne
      .mockResolvedValueOnce({ id: 1 })
      .mockResolvedValueOnce({ id: 2 });

    await createMissingSystemPagesForSite(
      10,
      20,
      "tx"
    );

    expect(mocks.pageCreate).not.toHaveBeenCalled();
    expect(mocks.pageFindOne).toHaveBeenCalledWith({
      where: {
        siteId: 10,
        systemType:
          PAGE_SYSTEM_TYPES.VISITOR_LOGIN
      },
      transaction: "tx"
    });
    expect(mocks.pageFindOne).toHaveBeenCalledWith({
      where: {
        siteId: 10,
        systemType:
          PAGE_SYSTEM_TYPES.VISITOR_REGISTER
      },
      transaction: "tx"
    });
  });

  it("promotes existing login/register slug pages before creating missing system pages", async () => {
    const existingLogin = {
      get: vi.fn().mockReturnValue(null),
      update: vi.fn()
    };

    mocks.pageFindOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(existingLogin)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    mocks.pageCreate.mockResolvedValue({
      id: 3
    });

    await createMissingSystemPagesForSite(
      10,
      20,
      "tx"
    );

    expect(existingLogin.update).toHaveBeenCalledWith(
      expect.objectContaining({
        systemType:
          PAGE_SYSTEM_TYPES.VISITOR_LOGIN,
        status: "published",
        isHomepage: false,
        visibility: "public"
      }),
      { transaction: "tx" }
    );

    expect(mocks.pageCreate).toHaveBeenCalledTimes(1);
    expect(mocks.pageCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        siteId: 10,
        userId: 20,
        slug: "register",
        systemType:
          PAGE_SYSTEM_TYPES.VISITOR_REGISTER,
        status: "published",
        isHomepage: false
      }),
      { transaction: "tx" }
    );
  });

  it("rejects delete for system pages", () => {
    expect(() =>
      assertSystemPageCanBeDeleted({
        systemType:
          PAGE_SYSTEM_TYPES.VISITOR_LOGIN
      })
    ).toThrow(
      "SYSTEM_PAGE_CANNOT_BE_DELETED"
    );

    expect(() =>
      assertSystemPageCanBeDeleted({
        systemType: null
      })
    ).not.toThrow();
  });

  it("rejects system page slug mutation", () => {
    expect(() =>
      assertSystemPageMutationAllowed(
        {
          systemType:
            PAGE_SYSTEM_TYPES.VISITOR_LOGIN
        },
        {
          slug: "signin"
        }
      )
    ).toThrow(
      "SYSTEM_PAGE_SLUG_CANNOT_BE_CHANGED"
    );
  });

  it("rejects system_type mutation and normal page escalation", () => {
    expect(() =>
      assertSystemPageMutationAllowed(
        {
          systemType:
            PAGE_SYSTEM_TYPES.VISITOR_REGISTER
        },
        {
          systemType:
            PAGE_SYSTEM_TYPES.VISITOR_LOGIN
        }
      )
    ).toThrow(
      "SYSTEM_TYPE_CANNOT_BE_CHANGED"
    );

    expect(() =>
      assertSystemPageMutationAllowed(
        {
          systemType: null
        },
        {
          systemType:
            PAGE_SYSTEM_TYPES.VISITOR_LOGIN
        }
      )
    ).toThrow(
      "NORMAL_PAGE_CANNOT_SET_SYSTEM_TYPE"
    );
  });

  it("rejects making a system page the homepage while normal pages remain unchanged", () => {
    expect(() =>
      assertSystemPageMutationAllowed(
        {
          systemType:
            PAGE_SYSTEM_TYPES.VISITOR_LOGIN
        },
        {
          isHomepage: true
        }
      )
    ).toThrow(
      "SYSTEM_PAGE_CANNOT_BE_HOMEPAGE"
    );

    expect(() =>
      assertSystemPageMutationAllowed(
        {
          systemType: null
        },
        {
          slug: "about",
          isHomepage: true
        }
      )
    ).not.toThrow();

    expect(() =>
      assertCanCreateNormalPage({
        title: "About",
        slug: "about"
      })
    ).not.toThrow();
  });

  it("rejects manual system page creation through normal page creation", () => {
    expect(() =>
      assertCanCreateNormalPage({
        title: "Login",
        slug: "login",
        systemType:
          PAGE_SYSTEM_TYPES.VISITOR_LOGIN
      })
    ).toThrow(
      "NORMAL_PAGE_CANNOT_SET_SYSTEM_TYPE"
    );
  });

  it("uses dedicated visitor auth block types for backend system page defaults", () => {
    expect(
      getDefaultSystemPageBlocks(
        PAGE_SYSTEM_TYPES.VISITOR_LOGIN
      )[0].children[0].type
    ).toBe("visitorLogin");

    expect(
      getDefaultSystemPageBlocks(
        PAGE_SYSTEM_TYPES.VISITOR_REGISTER
      )[0].children[0].type
    ).toBe("visitorRegister");
  });
});
