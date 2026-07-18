import {
  beforeEach,
  describe,
  expect,
  it,
  vi
} from "vitest";

const mocks = vi.hoisted(() => ({
  pageFindOne: vi.fn(),
  pageFindByPk: vi.fn(),
  slugMapFindOne: vi.fn()
}));

vi.mock("../../../models/page", () => ({
  Page: {
    findOne: mocks.pageFindOne,
    findByPk: mocks.pageFindByPk
  }
}));

vi.mock("../../../models/slug_map", () => ({
  SlugMap: {
    findOne: mocks.slugMapFindOne
  }
}));

import { RedirectGraphEngine } from "./redirectGraph.engine";

describe("RedirectGraphEngine system page slug lookup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not globally hide system pages from direct slug lookup", async () => {
    const loginPage = {
      id: 5,
      siteId: 10,
      slug: "login",
      status: "published",
      systemType: "visitor_login"
    };

    mocks.pageFindOne.mockResolvedValue(loginPage);

    const result =
      await RedirectGraphEngine.resolve(
        10,
        "login"
      );

    expect(mocks.pageFindOne).toHaveBeenCalledWith({
      where: {
        siteId: 10,
        slug: "login",
        status: "published"
      }
    });
    expect(result).toEqual({
      page: loginPage,
      isOriginal: true
    });
  });
});
