import {
  describe,
  expect,
  it
} from "vitest";

import {
  getHelpCenterLabels
} from "./HelpCenterPage";

describe("HelpCenterPage labels", () => {
  it("uses localized French labels", () => {
    const labels =
      getHelpCenterLabels("fr");

    expect(labels.title).toBe("Centre d'aide");
    expect(labels.searchPlaceholder).toBe(
      "Rechercher dans la documentation..."
    );
    expect(labels.description).toContain("les rôles");
    expect(labels.description).toContain("le dépannage");
  });

  it("does not show hardcoded English labels for French locale", () => {
    const labels =
      getHelpCenterLabels("fr");
    const text =
      Object.values(labels).join(" ");

    expect(text).not.toContain("Help Center");
    expect(text).not.toContain("Search documentation");
    expect(text).not.toContain("troubleshooting");
  });
});
