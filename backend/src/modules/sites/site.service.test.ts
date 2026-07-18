import {
  beforeEach,
  describe,
  expect,
  it,
  vi
} from "vitest";

const mocks = vi.hoisted(() => ({
  transaction: {
    commit: vi.fn(),
    rollback: vi.fn()
  },
  sequelizeTransaction: vi.fn(),
  siteCreate: vi.fn(),
  siteMemberCreate: vi.fn(),
  siteMemberCount: vi.fn(),
  getSettings: vi.fn(),
  createMissingSystemPagesForSite: vi.fn()
}));

vi.mock("../../core/database/connection", () => ({
  sequelize: {
    transaction:
      mocks.sequelizeTransaction
  }
}));

vi.mock("../../models", () => ({
  Site: {
    create: mocks.siteCreate,
    findByPk: vi.fn()
  },
  SiteMember: {
    create: mocks.siteMemberCreate,
    count: mocks.siteMemberCount,
    findOne: vi.fn()
  }
}));

vi.mock("../admin/adminSettings.service", () => ({
  AdminSettingsService: {
    getSettings: mocks.getSettings
  }
}));

vi.mock("../pages/systemPages", () => ({
  createMissingSystemPagesForSite:
    mocks.createMissingSystemPagesForSite
}));

import { SiteService } from "./site.service";

describe("SiteService system pages", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.sequelizeTransaction.mockResolvedValue(
      mocks.transaction
    );
    mocks.transaction.commit.mockResolvedValue(
      undefined
    );
    mocks.transaction.rollback.mockResolvedValue(
      undefined
    );
    mocks.getSettings.mockResolvedValue({
      maxSitesPerUser: 5
    });
    mocks.siteMemberCount.mockResolvedValue(0);
    mocks.siteCreate.mockResolvedValue({
      id: 42
    });
    mocks.siteMemberCreate.mockResolvedValue({
      id: 1
    });
    mocks.createMissingSystemPagesForSite
      .mockResolvedValue([]);
  });

  it("automatically creates published visitor auth system pages transactionally for new sites", async () => {
    const site =
      await SiteService.createSite(
        7,
        {
          name: "Acme",
          subdomain: "acme",
          title: "Acme"
        },
        "ADMIN"
      );

    expect(site).toEqual({
      id: 42
    });
    expect(mocks.siteCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Acme",
        status: "active"
      }),
      { transaction: mocks.transaction }
    );
    expect(mocks.siteMemberCreate).toHaveBeenCalledWith(
      {
        userId: 7,
        siteId: 42,
        role: "OWNER"
      },
      { transaction: mocks.transaction }
    );
    expect(
      mocks.createMissingSystemPagesForSite
    ).toHaveBeenCalledWith(
      42,
      7,
      mocks.transaction
    );
    expect(mocks.transaction.commit).toHaveBeenCalled();
    expect(mocks.transaction.rollback).not.toHaveBeenCalled();
  });

  it("rolls back site creation if system page creation fails", async () => {
    mocks.createMissingSystemPagesForSite
      .mockRejectedValue(
        new Error("SYSTEM_PAGE_FAILED")
      );

    await expect(
      SiteService.createSite(
        7,
        {
          name: "Acme",
          subdomain: "acme",
          title: "Acme"
        },
        "ADMIN"
      )
    ).rejects.toThrow(
      "SYSTEM_PAGE_FAILED"
    );

    expect(mocks.transaction.commit).not.toHaveBeenCalled();
    expect(mocks.transaction.rollback).toHaveBeenCalled();
  });
});
