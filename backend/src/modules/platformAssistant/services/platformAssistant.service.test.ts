import { describe, expect, it } from "vitest";
import { answerPlatformQuestion } from "./platformAssistant.service";

describe("global platform assistant", () => {
  it.each([
    "bonjour",
    "salut",
    "hello",
    "hi",
    "bonsoir"
  ])("%s returns a greeting without documentation fallback", async (message) => {
    const result = await answerPlatformQuestion({
      message,
      context: {
        locale: message === "hello" || message === "hi"
          ? "en-US"
          : "fr-FR"
      }
    });

    expect(result.intent).toBe("GREETING");
    expect(result.sources).toEqual([]);
    expect(result.answer).not.toContain("could not find");
  });

  it("merci returns a conversational reply", async () => {
    const result = await answerPlatformQuestion({
      message: "merci",
      context: {
        locale: "fr-FR"
      }
    });

    expect(result.intent).toBe("GENERAL_CONVERSATION");
    expect(result.sources).toEqual([]);
    expect(result.answer).toContain("Avec plaisir");
  });

  it("answers platform capability overview", async () => {
    const result = await answerPlatformQuestion({
      message: "que peux-tu faire ?",
      context: {
        locale: "fr-FR"
      }
    });

    expect(result.intent).toBe("PLATFORM_HELP");
    expect(result.answer).toContain("ReactBuilder");
    expect(result.answer).toContain("Page Builder");
  });

  it("explains the CMS", async () => {
    const result = await answerPlatformQuestion({
      message: "a quoi sert le CMS ?",
      context: {
        locale: "fr-FR"
      }
    });

    expect(result.intent).toBe("FEATURE_EXPLANATION");
    expect(result.answer).toContain("collections");
    expect(result.answer).toContain("bindings CMS");
  });

  it("explains how to create a form", async () => {
    const result = await answerPlatformQuestion({
      message: "comment creer un formulaire ?",
      context: {
        locale: "fr-FR"
      }
    });

    expect(result.intent).toBe("HOW_TO");
    expect(result.answer).toContain("Forms");
    expect(result.answer).toContain("Form Block");
  });

  it("explains ZIP import", async () => {
    const result = await answerPlatformQuestion({
      message: "comment importer un ZIP ?",
      context: {
        locale: "fr-FR"
      }
    });

    expect(result.intent).toBe("HOW_TO");
    expect(result.answer).toContain("HTML/ZIP");
    expect(result.answer).toContain("blocs editables");
  });

  it("keeps platform ADMIN and site OWNER distinct", async () => {
    const result = await answerPlatformQuestion({
      message: "quelle difference entre Owner et Admin ?",
      context: {
        globalRole: "ADMIN",
        locale: "fr-FR"
      }
    });

    expect(result.intent).toBe("ROLE_PERMISSION_QUESTION");
    expect(result.answer).toContain("Role plateforme");
    expect(result.answer).toContain("Role dans un site");
    expect(result.answer).toContain("OWNER est un role de site");
  });

  it("uses current route context for /sites", async () => {
    const result = await answerPlatformQuestion({
      message: "que puis-je faire ici ?",
      context: {
        pathname: "/sites",
        module: "sites",
        locale: "fr-FR"
      }
    });

    expect(result.intent).toBe("CURRENT_CONTEXT_QUESTION");
    expect(result.answer).toContain("gestion des sites");
  });

  it("still retrieves documentation for known documentation questions", async () => {
    const result = await answerPlatformQuestion(
      "preview page before publishing"
    );

    expect(result.intent).toBe("DOCUMENTATION_SEARCH");
    expect(result.sources.length).toBeGreaterThan(0);
    expect(result.answer).toContain("aide ReactBuilder");
  });

  it("has a graceful fallback for unknown help questions", async () => {
    const result = await answerPlatformQuestion(
      "how do I configure SAML SSO?"
    );

    expect(result.intent).toBe("HOW_TO");
    expect(result.confidence).toBe("none");
    expect(result.answer).toContain("pas trouve");
  });

  it("never returns mutation actions", async () => {
    const result = await answerPlatformQuestion({
      message: "bonjour"
    });

    expect(result).not.toHaveProperty("action");
    expect(result).not.toHaveProperty("actions");
  });

  it("uses bounded history for follow-up context", async () => {
    const result = await answerPlatformQuestion({
      message: "et les collections ?",
      history: [
        {
          role: "user",
          content: "Explique-moi le CMS"
        },
        {
          role: "assistant",
          content: "Le CMS gere les collections et entrees."
        }
      ],
      context: {
        locale: "fr-FR"
      }
    });

    expect(result.intent).toBe("FEATURE_EXPLANATION");
    expect(result.answer).toContain("collections");
  });
});
