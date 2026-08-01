import {
  describe,
  expect,
  it
} from "vitest";

import {
  getSlugErrorMessage
} from "./CmsCollectionDetailsPage";

describe("CMS entry slug error mapping", () => {
  it("maps duplicate slug conflicts to a clear inline error", () => {
    expect(
      getSlugErrorMessage({
        data: {
          code: "CMS_ENTRY_SLUG_CONFLICT"
        }
      })
    ).toContain("already used");
  });

  it("maps invalid slug errors", () => {
    expect(
      getSlugErrorMessage({
        data: {
          code: "CMS_ENTRY_SLUG_INVALID"
        }
      })
    ).toContain("valid slug");
  });

  it("maps slug length errors", () => {
    expect(
      getSlugErrorMessage({
        data: {
          code: "CMS_ENTRY_SLUG_TOO_LONG"
        }
      })
    ).toContain("160");
  });
});
