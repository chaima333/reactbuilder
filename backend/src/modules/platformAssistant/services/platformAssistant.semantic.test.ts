import {
  beforeEach,
  describe,
  expect,
  it,
  vi
} from "vitest";

const mocks = vi.hoisted(() => ({
  getActiveAiProvider: vi.fn(),
  generateTextForProvider: vi.fn()
}));

vi.mock("../../ia/providers/aiProvider.factory", () => ({
  AiProviderFactory: {
    getActiveAiProvider:
      mocks.getActiveAiProvider
  }
}));

vi.mock("../../ia/llm/llm.client", () => ({
  generateTextForProvider:
    mocks.generateTextForProvider
}));

import {
  answerPlatformQuestion
} from "./platformAssistant.service";
import {
  validateSemanticResult
} from "./platformAssistant.semantic";

const provider = {
  name: "openai" as const,
  model: "gpt-4.1-mini",
  configured: true
};

const classifierJson = (
  intent: string,
  capabilityKeys: string[],
  confidence = 0.92
) =>
  JSON.stringify({
    intent,
    confidence,
    capabilityKeys,
    needsClarification: false
  });

const mockSemantic = (
  intent: string,
  capabilityKeys: string[],
  answer: string
) => {
  mocks.getActiveAiProvider.mockResolvedValue(
    provider
  );
  mocks.generateTextForProvider.mockImplementation(
    async ({ prompt }: { prompt: string }) =>
      prompt.includes("Return exactly this schema")
        ? classifierJson(
            intent,
            capabilityKeys
          )
        : answer
  );
};

describe("platform assistant semantic LLM layer", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("validates structured classifier output and rejects unknown data", () => {
    expect(
      validateSemanticResult({
        intent: "VISITOR_AUTHENTICATION",
        confidence: 0.94,
        capabilityKeys: ["visitor-auth"],
        needsClarification: false
      })
    ).toEqual({
      intent: "VISITOR_AUTHENTICATION",
      confidence: 0.94,
      capabilityKeys: ["visitor-auth"],
      needsClarification: false
    });

    expect(
      validateSemanticResult({
        intent: "MAKE_NATIVE_APP",
        confidence: 0.94,
        capabilityKeys: ["visitor-auth"],
        needsClarification: false
      })
    ).toBeNull();

    expect(
      validateSemanticResult({
        intent: "VISITOR_AUTHENTICATION",
        confidence: 0.94,
        capabilityKeys: ["secret-capability"],
        needsClarification: false
      })
    ).toBeNull();
  });

  it.each([
    "Est-ce que les visiteurs peuvent créer un compte ?",
    "Je veux mettre une connexion sur mon site.",
    "Mes clients peuvent-ils s'inscrire ?",
    "Comment créer un espace membre ?"
  ])("routes visitor-auth paraphrase: %s", async (message) => {
    mockSemantic(
      "VISITOR_AUTHENTICATION",
      ["visitor-auth"],
      "Oui. Les visiteurs peuvent créer un compte et se connecter sur le site public. Ces comptes sont séparés des comptes ReactBuilder."
    );

    const result =
      await answerPlatformQuestion({
        message,
        context: {
          locale: "fr-FR"
        }
      });

    expect(result.intent).toBe(
      "VISITOR_AUTHENTICATION"
    );
    expect(result.answer).toContain(
      "visiteurs"
    );
  });

  it.each([
    "Je veux récupérer les messages envoyés depuis mon site.",
    "Comment ajouter un formulaire de contact ?",
    "Où arrivent les réponses des visiteurs ?"
  ])("routes forms paraphrase: %s", async (message) => {
    mockSemantic(
      "FORMS",
      ["forms"],
      "Les réponses des visiteurs arrivent dans les soumissions du module Forms."
    );

    const result =
      await answerPlatformQuestion({
        message,
        context: {
          locale: "fr-FR"
        }
      });

    expect(result.intent).toBe("FORMS");
    expect(result.answer).toContain(
      "soumissions"
    );
  });

  it("routes partner application paraphrases", async () => {
    mockSemantic(
      "PARTNER_APPLICATIONS",
      ["partner-applications"],
      "Utilisez un bouton ou un lien Devenir partenaire. ReactBuilder génère le lien du site courant."
    );

    const result =
      await answerPlatformQuestion({
        message:
          "Je veux permettre aux visiteurs de demander à devenir partenaires.",
        context: {
          locale: "fr-FR"
        }
      });

    expect(result.intent).toBe(
      "PARTNER_APPLICATIONS"
    );
    expect(result.answer).toContain(
      "Devenir partenaire"
    );
  });

  it("routes CMS semantic questions to grounded CMS knowledge", async () => {
    mockSemantic(
      "FEATURE_EXPLANATION",
      ["cms"],
      "Le CMS permet de gérer du contenu structuré et de l’afficher dynamiquement dans les pages."
    );

    const result =
      await answerPlatformQuestion({
        message:
          "Comment afficher mes articles dynamiquement ?",
        context: {
          locale: "fr-FR"
        }
      });

    expect(result.intent).toBe(
      "FEATURE_EXPLANATION"
    );
    expect(result.answer).toContain("CMS");
  });

  it("uses bounded history for semantic follow-up context", async () => {
    mockSemantic(
      "VISITOR_AUTHENTICATION",
      ["visitor-auth"],
      "Ajoutez les blocs Login/Register pour les visiteurs du site public."
    );

    const result =
      await answerPlatformQuestion({
        message: "Et comment je l'ajoute ?",
        history: [
          {
            role: "user",
            content:
              "Explique-moi l'authentification des visiteurs."
          },
          {
            role: "assistant",
            content:
              "Les visiteurs peuvent avoir un compte propre au site."
          }
        ],
        context: {
          locale: "fr-FR"
        }
      });

    expect(result.intent).toBe(
      "VISITOR_AUTHENTICATION"
    );
    expect(result.answer).toContain(
      "Login/Register"
    );
  });

  it("resolves the selected platform_ai provider for global assistant requests", async () => {
    mockSemantic(
      "FORMS",
      ["forms"],
      "Les formulaires collectent les réponses dans Forms."
    );

    await answerPlatformQuestion({
      message:
        "Où arrivent les réponses des visiteurs ?",
      context: {
        locale: "fr-FR"
      }
    });

    expect(
      mocks.getActiveAiProvider
    ).toHaveBeenCalledWith(
      "globalAssistant"
    );
    expect(
      mocks.generateTextForProvider
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: "openai",
        model: "gpt-4.1-mini"
      })
    );
  });

  it("does not invoke a provider when global assistant AI is disabled", async () => {
    mocks.getActiveAiProvider.mockResolvedValue(
      null
    );

    const result =
      await answerPlatformQuestion({
        message:
          "Comment ajouter un formulaire de contact ?",
        context: {
          locale: "fr-FR"
        }
      });

    expect(result.intent).toBe("FORMS");
    expect(
      mocks.generateTextForProvider
    ).not.toHaveBeenCalled();
  });

  it("falls back deterministically when the provider is unavailable", async () => {
    mocks.getActiveAiProvider.mockRejectedValue(
      new Error("OPENAI_API_KEY_MISSING")
    );

    const result =
      await answerPlatformQuestion({
        message:
          "Mes clients peuvent-ils s'inscrire ?",
        context: {
          locale: "fr-FR"
        }
      });

    expect(result.intent).toBe(
      "VISITOR_AUTHENTICATION"
    );
    expect(result.answer).not.toContain(
      "OPENAI_API_KEY"
    );
  });

  it("does not invent unsupported capabilities", async () => {
    mocks.getActiveAiProvider.mockResolvedValue(
      provider
    );

    const result =
      await answerPlatformQuestion({
        message:
          "Puis-je créer une application Android native ?",
        context: {
          locale: "fr-FR"
        }
      });

    expect(result.intent).toBe(
      "UNSUPPORTED_REQUEST"
    );
    expect(result.answer).toContain(
      "Je ne peux pas confirmer"
    );
  });

  it("does not expose internal metadata when using grounded generation", async () => {
    mockSemantic(
      "VISITOR_AUTHENTICATION",
      ["visitor-auth"],
      "Oui. Les visiteurs peuvent créer un compte sur le site public."
    );

    const result =
      await answerPlatformQuestion({
        message:
          "Est-ce que les visiteurs peuvent créer un compte ?",
        context: {
          locale: "fr-FR"
        }
      });

    expect(result.answer).not.toMatch(
      /\((implemented|site|global|page)[^)]*\)/
    );
    expect(result.answer).not.toContain(
      "visitor-auth"
    );
    expect(result.answer).not.toContain(
      "SiteVisitor"
    );
  });
});
