import {
  describe,
  expect,
  it,
  vi
} from "vitest";

const migration = require(
  "../../../migrations/20260718120000-add-system-type-to-pages.js"
);

describe("system page migration", () => {
  it("adds nullable system_type and a partial unique index", async () => {
    const addColumn = vi.fn();
    const query = vi
      .fn()
      .mockResolvedValue([[]]);
    const transaction = vi.fn(
      async (callback) => callback("tx")
    );

    await migration.up(
      {
        addColumn,
        sequelize: {
          query,
          transaction
        }
      },
      {
        ENUM: vi.fn(
          (...values: string[]) => ({
            type: "enum",
            values
          })
        )
      }
    );

    expect(addColumn).toHaveBeenCalledWith(
      "pages",
      "system_type",
      expect.objectContaining({
        allowNull: true
      }),
      { transaction: "tx" }
    );

    expect(transaction).toHaveBeenCalledTimes(1);

    expect(
      query.mock.calls
        .map((call) => call[0])
        .join("\n")
    ).toContain(
      'CREATE UNIQUE INDEX "pages_site_system_type_unique"'
    );
    expect(
      query.mock.calls
        .map((call) => call[0])
        .join("\n")
    ).toContain(
      'WHERE "system_type" IS NOT NULL'
    );
    expect(
      query.mock.calls.every(
        (call) => call[1]?.transaction === "tx"
      )
    ).toBe(true);
  });

  it("uses one transaction so backfill failure rolls back the up migration", async () => {
    const addColumn = vi.fn();
    const query = vi
      .fn()
      .mockResolvedValueOnce([[]])
      .mockRejectedValueOnce(
        new Error("BACKFILL_FAILED")
      );

    const transaction = vi.fn(
      async (callback) => callback("tx")
    );

    await expect(
      migration.up(
        {
          addColumn,
          sequelize: {
            query,
            transaction
          }
        },
        {
          ENUM: vi.fn()
        }
      )
    ).rejects.toThrow("BACKFILL_FAILED");

    expect(transaction).toHaveBeenCalledTimes(1);
    expect(addColumn).toHaveBeenCalledWith(
      "pages",
      "system_type",
      expect.any(Object),
      { transaction: "tx" }
    );
    expect(query).toHaveBeenCalledTimes(2);
  });

  it("backfills login and register without creating duplicates", () => {
    expect(
      migration.backfillSystemPagesSql
    ).toContain(
      "\"system_type\" = 'visitor_login'"
    );
    expect(
      migration.backfillSystemPagesSql
    ).toContain(
      "\"system_type\" = 'visitor_register'"
    );
    expect(
      migration.backfillSystemPagesSql
    ).toContain(
      "NOT EXISTS"
    );
    expect(
      migration.backfillSystemPagesSql
    ).toContain(
      "slug_page"
    );
    expect(
      migration.backfillSystemPagesSql
    ).toContain(
      "'published'"
    );
    expect(
      migration.backfillSystemPagesSql
    ).toContain(
      '"is_homepage" = false'
    );
  });

  it("never assigns an unrelated platform user when a site has no SiteMember", () => {
    expect(
      migration.backfillSystemPagesSql
    ).not.toContain("FROM \"users\"");
    expect(
      migration.backfillSystemPagesSql
    ).not.toContain("first_user");
    expect(
      migration.backfillSystemPagesSql
    ).not.toContain("COALESCE(owner_user");
    expect(
      migration.backfillSystemPagesSql
    ).toContain("JOIN LATERAL");
    expect(
      migration.backfillSystemPagesSql
    ).toContain("\"site_members\"");
    expect(
      migration.orphanedSitesSql
    ).toContain("NOT EXISTS");
  });

  it("makes the down migration transactional where PostgreSQL supports it", async () => {
    const removeColumn = vi.fn();
    const query = vi.fn();
    const transaction = vi.fn(
      async (callback) => callback("tx")
    );

    await migration.down({
      removeColumn,
      sequelize: {
        query,
        transaction
      }
    });

    expect(transaction).toHaveBeenCalledTimes(1);
    expect(removeColumn).toHaveBeenCalledWith(
      "pages",
      "system_type",
      { transaction: "tx" }
    );
    expect(
      query.mock.calls.every(
        (call) => call[1]?.transaction === "tx"
      )
    ).toBe(true);
  });
});
