import {
  describe,
  expect,
  it
} from "vitest";

import {
  makeSafeImportedPageSlug
} from "./importedPageIdentity";

describe("HTML ZIP import page identity", () => {
  it("keeps client-portal as a normal imported page slug", () => {
    const usedSlugs =
      new Set<string>();

    expect(
      makeSafeImportedPageSlug(
        "client-portal",
        usedSlugs
      )
    ).toBe("client-portal");
  });

  it("keeps imported login/register pages separate from system pages", () => {
    const usedSlugs =
      new Set<string>();

    expect(
      makeSafeImportedPageSlug(
        "login",
        usedSlugs
      )
    ).toBe("login-imported");

    expect(
      makeSafeImportedPageSlug(
        "register",
        usedSlugs
      )
    ).toBe("register-imported");
  });

  it("deduplicates imported page slugs deterministically", () => {
    const usedSlugs =
      new Set<string>();

    expect(
      makeSafeImportedPageSlug(
        "client-portal",
        usedSlugs
      )
    ).toBe("client-portal");

    expect(
      makeSafeImportedPageSlug(
        "client-portal",
        usedSlugs
      )
    ).toBe("client-portal-2");
  });
});
