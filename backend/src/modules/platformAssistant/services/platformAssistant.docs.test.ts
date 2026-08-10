import {
  describe,
  expect,
  it
} from "vitest";

import {
  getHelpArticles,
  retrieveRelevantHelpArticles,
  searchHelpArticles
} from "./platformAssistant.docs";

describe("Help Center documentation search", () => {
  it("returns all published articles for an empty query", () => {
    const results =
      searchHelpArticles(
        "",
        "fr-FR"
      );

    expect(results.length).toBeGreaterThan(5);
    expect(results[0].score).toBe(0);
  });

  it.each([
    ["login", "visitor-authentication"],
    ["connexion", "visitor-authentication"],
    ["authentification", "visitor-authentication"],
    ["formulaire", "forms"],
    ["formulaires", "forms"],
    ["forms", "forms"],
    ["partenaire", "partner-applications"],
    ["partner", "partner-applications"],
    ["CMS", "cms"],
    ["import zip", "imports-html-zip"],
    ["SEO", "seo-settings"]
  ])("finds %s", (query, expectedId) => {
    const results =
      searchHelpArticles(
        query,
        "fr-FR"
      );

    expect(results[0]?.id).toBe(expectedId);
  });

  it("is case-insensitive and accent-insensitive", () => {
    const lower =
      searchHelpArticles(
        "mediatheque",
        "fr-FR"
      );
    const upper =
      searchHelpArticles(
        "MÉDIATHÈQUE",
        "fr-FR"
      );

    expect(lower[0]?.id).toBe("media-library");
    expect(upper[0]?.id).toBe("media-library");
  });

  it("matches article content without returning unrelated top results", () => {
    const results =
      searchHelpArticles(
        "visiteurs peuvent creer un compte",
        "fr-FR"
      );

    expect(results[0]?.id).toBe("visitor-authentication");
    expect(results.slice(0, 3).map(result => result.id)).not.toContain(
      "getting-started"
    );
  });

  it("returns no results for unrelated terms", () => {
    const results =
      searchHelpArticles(
        "SAML enterprise identity provider",
        "fr-FR"
      );

    expect(results).toEqual([]);
  });

  it("localizes French articles instead of returning English content", () => {
    const docs =
      getHelpArticles("fr-FR");
    const visitorAuth =
      docs.find(doc => doc.id === "visitor-authentication");

    expect(visitorAuth?.title).toContain("Authentification visiteurs");
    expect(visitorAuth?.content).toContain("site public");
    expect(visitorAuth?.content).not.toContain("Visitor accounts are separate");
  });

  it("retrieves bounded relevant help for assistant grounding", () => {
    const results =
      retrieveRelevantHelpArticles(
        "Comment ajouter une connexion a mon site ?",
        "fr-FR",
        2
      );

    expect(results.length).toBeLessThanOrEqual(2);
    expect(results[0]?.id).toBe("visitor-authentication");
  });
});
