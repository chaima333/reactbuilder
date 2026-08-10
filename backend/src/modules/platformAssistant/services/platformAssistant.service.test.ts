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

  it("defines ReactBuilder without returning the assistant capability answer", async () => {
    const result = await answerPlatformQuestion({
      message: "Qu'est-ce que ReactBuilder ?",
      context: {
        locale: "fr-FR"
      }
    });

    expect(result.intent).toBe("PRODUCT_DESCRIPTION");
    expect(result.answer).toContain("plateforme SaaS");
    expect(result.answer).toContain("editeur visuel");
    expect(result.answer).not.toContain("Je peux vous aider");
    expect(result.answer).not.toContain("lecture seule");
  });

  it("explains what the global assistant can do with its read-only limitation", async () => {
    const result = await answerPlatformQuestion({
      message: "Que peux-tu faire ?",
      context: {
        locale: "fr-FR"
      }
    });

    expect(result.intent).toBe("ASSISTANT_CAPABILITIES");
    expect(result.answer).toContain("Je peux vous aider");
    expect(result.answer).toContain("CMS");
    expect(result.answer).toContain("lecture seule");
    expect(result.answer).toContain("je ne peux pas modifier directement");
  });

  it("returns a user-facing ReactBuilder module list", async () => {
    const result = await answerPlatformQuestion({
      message: "Quels sont les modules de ReactBuilder ?",
      context: {
        locale: "fr-FR"
      }
    });

    expect(result.intent).toBe("MODULE_LIST");
    expect(result.answer).toContain("Sites : creation et gestion des sites.");
    expect(result.answer).toContain("CMS : collections");
    expect(result.answer).toContain("Forms : creation de formulaires");
  });

  it("keeps French capability responses in French", async () => {
    const result = await answerPlatformQuestion({
      message: "Quels sont les modules de ReactBuilder ?",
      context: {
        locale: "fr-FR"
      }
    });

    expect(result.answer).not.toContain("Users can");
    expect(result.answer).not.toContain("create and manage sites");
    expect(result.answer).not.toContain("Site-scoped");
  });

  it("does not expose internal capability metadata in user-facing responses", async () => {
    const questions = [
      "Que peux-tu faire ?",
      "Quels sont les modules de ReactBuilder ?",
      "Qu'est-ce que ReactBuilder ?"
    ];

    for (const message of questions) {
      const result = await answerPlatformQuestion({
        message,
        context: {
          locale: "fr-FR"
        }
      });

      expect(result.answer).not.toMatch(
        /\((implemented|partially_implemented|admin_only|site_scoped|experimental|disabled|not_implemented|global|site|page|public)[^)]*\)/
      );
    }
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

  it("routes Login page questions to Visitor Authentication knowledge", async () => {
    const result = await answerPlatformQuestion({
      message: "Est-ce que je peux ajouter une page Login a un site cree avec ReactBuilder ?",
      context: {
        locale: "fr-FR"
      }
    });

    expect(result.intent).toBe("VISITOR_AUTHENTICATION");
    expect(result.sources).toEqual([]);
    expect(result.answer).toContain("authentification dediee aux visiteurs");
    expect(result.answer).toContain("Visitor Login");
    expect(result.answer).toContain("distincts des comptes utilisateurs ReactBuilder");
    expect(result.answer).not.toContain("Voici ce que je peux confirmer");
  });

  it("answers that visitors can register with Visitor Authentication", async () => {
    const result = await answerPlatformQuestion({
      message: "Les visiteurs de mon site peuvent-ils creer un compte ?",
      context: {
        locale: "fr-FR"
      }
    });

    expect(result.intent).toBe("VISITOR_AUTHENTICATION");
    expect(result.answer).toContain("Visitor Register");
    expect(result.answer).toContain("creer un compte");
    expect(result.answer).toContain("routes publiques");
  });

  it("distinguishes ReactBuilder platform users from site visitors", async () => {
    const result = await answerPlatformQuestion({
      message: "Quelle difference entre mon compte ReactBuilder et un compte visiteur ?",
      context: {
        locale: "fr-FR"
      }
    });

    expect(result.intent).toBe("VISITOR_AUTHENTICATION");
    expect(result.answer).toContain("deux comptes differents");
    expect(result.answer).toContain("plateforme");
    expect(result.answer).toContain("site public genere");
  });

  it("explains how to create a form from the Forms implementation", async () => {
    const result = await answerPlatformQuestion({
      message: "comment creer un formulaire ?",
      context: {
        locale: "fr-FR"
      }
    });

    expect(result.intent).toBe("FORMS");
    expect(result.sources).toEqual([]);
    expect(result.answer).toContain("module Forms");
    expect(result.answer).toContain("bloc Form");
  });

  it("explains where form submissions are reviewed", async () => {
    const result = await answerPlatformQuestion({
      message: "Ou voir les soumissions ?",
      context: {
        locale: "fr-FR"
      }
    });

    expect(result.intent).toBe("FORMS");
    expect(result.answer).toContain("detail du formulaire");
    expect(result.answer).toContain("soumissions");
  });

  it("explains public form submission by visitors", async () => {
    const result = await answerPlatformQuestion({
      message: "Un visiteur peut-il envoyer un formulaire ?",
      context: {
        locale: "fr-FR"
      }
    });

    expect(result.intent).toBe("FORMS");
    expect(result.answer).toContain("endpoint public");
    expect(result.answer).toContain("/api/public/sites/:siteId/forms/:formId/submit");
  });

  it("explains the dynamic partner button action", async () => {
    const result = await answerPlatformQuestion({
      message: "Comment ajouter un bouton Devenir partenaire ?",
      context: {
        locale: "fr-FR"
      }
    });

    expect(result.intent).toBe("PARTNER_APPLICATIONS");
    expect(result.answer).toContain("bloc Button");
    expect(result.answer).toContain("action Devenir partenaire");
    expect(result.answer).toContain("/partner-apply/:siteId");
  });

  it("explains that Link supports the partner application action", async () => {
    const result = await answerPlatformQuestion({
      message: "Puis-je utiliser un Link pour devenir partenaire ?",
      context: {
        locale: "fr-FR"
      }
    });

    expect(result.intent).toBe("PARTNER_APPLICATIONS");
    expect(result.answer).toContain("bloc Link");
    expect(result.answer).toContain("genere dynamiquement");
  });

  it("explains automatic siteId resolution for partner applications", async () => {
    const result = await answerPlatformQuestion({
      message: "Le siteId est-il ajoute automatiquement ?",
      context: {
        locale: "fr-FR"
      }
    });

    expect(result.intent).toBe("PARTNER_APPLICATIONS");
    expect(result.answer).toContain("/partner-apply/403");
    expect(result.answer).toContain("/partner-apply/524");
    expect(result.answer).toContain("Il ne faut pas hardcoder");
  });

  it("explains implemented dynamic-site capabilities", async () => {
    const result = await answerPlatformQuestion({
      message: "Les sites generes sont-ils limites a des pages statiques ?",
      context: {
        locale: "fr-FR"
      }
    });

    expect(result.intent).toBe("DYNAMIC_SITE_CAPABILITIES");
    expect(result.answer).toContain("CMS");
    expect(result.answer).toContain("soumissions publiques");
    expect(result.answer).toContain("Login/Register");
    expect(result.answer).toContain("candidatures partenaires");
  });

  it("keeps French dynamic feature answers in French", async () => {
    const result = await answerPlatformQuestion({
      message: "Comment ajouter un bouton Devenir partenaire ?",
      context: {
        locale: "fr-FR"
      }
    });

    expect(result.answer).not.toContain("Use a Button");
    expect(result.answer).not.toContain("Become partner");
    expect(result.answer).not.toContain("Received applications");
  });

  it("does not expose internal capability metadata in dynamic feature responses", async () => {
    const questions = [
      "Est-ce que je peux ajouter une page Login a un site cree avec ReactBuilder ?",
      "Comment creer un formulaire ?",
      "Comment ajouter un bouton Devenir partenaire ?"
    ];

    for (const message of questions) {
      const result = await answerPlatformQuestion({
        message,
        context: {
          locale: "fr-FR"
        }
      });

      expect(result.answer).not.toMatch(
        /\((implemented|partially_implemented|admin_only|site_scoped|experimental|disabled|not_implemented|global|site|page|public)[^)]*\)/
      );
    }
  });

  it("does not use generic documentation fallback for known dynamic features", async () => {
    const result = await answerPlatformQuestion({
      message: "Est-ce que Visitor Authentication fonctionne sur le site public ?",
      context: {
        locale: "fr-FR"
      }
    });

    expect(result.intent).toBe("VISITOR_AUTHENTICATION");
    expect(result.sources).toEqual([]);
    expect(result.answer).not.toContain("Voici ce que je peux confirmer");
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
