import {
  describe,
  expect,
  it,
  vi
} from "vitest";

const migration = require(
  "../../../migrations/20260718130000-replace-system-page-auth-placeholders.js"
);

describe("system page auth placeholder migration", () => {
  it("only replaces exact untouched placeholder blocks", () => {
    expect(
      migration.replacePlaceholdersSql
    ).toMatch(/"blocks"\s*=\s*jsonb_build_array/);
    expect(
      migration.replacePlaceholdersSql
    ).toContain(
      "visitor_login-copy"
    );
    expect(
      migration.replacePlaceholdersSql
    ).toContain(
      "visitor_register-copy"
    );
    expect(
      migration.replacePlaceholdersSql
    ).toContain(
      "'type', 'visitorLogin'"
    );
    expect(
      migration.replacePlaceholdersSql
    ).toContain(
      "'type', 'visitorRegister'"
    );
    expect(
      migration.replacePlaceholdersSql
    ).not.toContain(
      "WHERE \"system_type\" = 'visitor_login';"
    );
  });

  it("runs the replacement in a transaction", async () => {
    const query = vi.fn();
    const transaction = vi.fn(
      async (callback) => callback("tx")
    );

    await migration.up({
      sequelize: {
        query,
        transaction
      }
    });

    expect(transaction).toHaveBeenCalledTimes(1);
    expect(query).toHaveBeenCalledWith(
      migration.replacePlaceholdersSql,
      { transaction: "tx" }
    );
  });
});
