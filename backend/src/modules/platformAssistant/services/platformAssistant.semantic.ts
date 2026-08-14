import {
  PLATFORM_CAPABILITIES
} from "./platformAssistant.capabilities";
import type {
  PlatformAssistantContext,
  PlatformAssistantHistoryMessage,
  PlatformAssistantInput
} from "./platformAssistant.service";
import {
  HelpCenterService
} from "./helpCenter.service";
import {
  PlatformAssistantIntent,
  normalizePlatformAssistantText
} from "./platformAssistant.intent";
import {
  AiProviderFactory
} from "../../ia/providers/aiProvider.factory";
import {
  generateTextForProvider
} from "../../ia/llm/llm.client";

export type PlatformAssistantSemanticResult = {
  intent: PlatformAssistantIntent;
  confidence: number;
  capabilityKeys: string[];
  needsClarification: boolean;
};

type ProviderRuntime = {
  name: "claude" | "openai" | "gemini";
  model: string;
};

const SUPPORTED_INTENTS: PlatformAssistantIntent[] = [
  "GREETING",
  "GENERAL_CONVERSATION",
  "PRODUCT_DESCRIPTION",
  "ASSISTANT_CAPABILITIES",
  "MODULE_LIST",
  "VISITOR_AUTHENTICATION",
  "FORMS",
  "PARTNER_APPLICATIONS",
  "DYNAMIC_SITE_CAPABILITIES",
  "PLATFORM_HELP",
  "FEATURE_EXPLANATION",
  "HOW_TO",
  "TROUBLESHOOTING",
  "ROLE_PERMISSION_QUESTION",
  "CURRENT_CONTEXT_QUESTION",
  "DOCUMENTATION_SEARCH",
  "CLARIFICATION_REQUIRED",
  "UNSUPPORTED_REQUEST"
];

const SUPPORTED_INTENT_SET =
  new Set(SUPPORTED_INTENTS);

const CAPABILITY_KEYS =
  new Set(
    PLATFORM_CAPABILITIES.map(
      capability => capability.id
    )
  );

const FAST_PATH_INTENTS =
  new Set<PlatformAssistantIntent>([
    "GREETING",
    "GENERAL_CONVERSATION",
    "PRODUCT_DESCRIPTION",
    "ASSISTANT_CAPABILITIES",
    "MODULE_LIST"
  ]);

export const shouldUseSemanticRouter = (
  intent: PlatformAssistantIntent
) =>
  !FAST_PATH_INTENTS.has(intent);

const safeJsonParse = (
  raw: string
) => {
  const trimmed =
    raw.trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    const match =
      trimmed.match(/\{[\s\S]*\}/);

    if (!match) {
      return null;
    }

    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
};

export const validateSemanticResult = (
  value: unknown
): PlatformAssistantSemanticResult | null => {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return null;
  }

  const record =
    value as Record<string, unknown>;

  if (
    typeof record.intent !== "string" ||
    !SUPPORTED_INTENT_SET.has(
      record.intent as PlatformAssistantIntent
    )
  ) {
    return null;
  }

  const confidence =
    Number(record.confidence);

  if (
    !Number.isFinite(confidence) ||
    confidence < 0 ||
    confidence > 1
  ) {
    return null;
  }

  if (
    !Array.isArray(record.capabilityKeys) ||
    record.capabilityKeys.some(
      key =>
        typeof key !== "string" ||
        !CAPABILITY_KEYS.has(key)
    )
  ) {
    return null;
  }

  if (
    typeof record.needsClarification !==
    "boolean"
  ) {
    return null;
  }

  return {
    intent:
      record.intent as PlatformAssistantIntent,
    confidence,
    capabilityKeys:
      record.capabilityKeys as string[],
    needsClarification:
      record.needsClarification
  };
};

const sanitizeContext = (
  context?: PlatformAssistantContext
) => ({
  pathname: context?.pathname || "",
  module: context?.module || "",
  siteId: context?.siteId || null,
  pageId: context?.pageId || null,
  globalRole: context?.globalRole || null,
  locale: context?.locale || null
});

const formatHistory = (
  history: PlatformAssistantHistoryMessage[] = []
) =>
  history
    .slice(-6)
    .map(
      item =>
        `${item.role}: ${item.content.slice(0, 500)}`
    )
    .join("\n");

const compactCapabilityRegistry = () =>
  PLATFORM_CAPABILITIES.map(
    capability => ({
      key: capability.id,
      name: capability.name,
      summary: capability.summary
    })
  );

const buildClassifierPrompt = (
  input: PlatformAssistantInput
) =>
  [
    "You classify questions for the read-only ReactBuilder product assistant.",
    "Return strict JSON only. Do not answer the user.",
    "Allowed intents:",
    SUPPORTED_INTENTS.join(", "),
    "Allowed capabilityKeys:",
    Array.from(CAPABILITY_KEYS).join(", "),
    "ReactBuilder capability registry:",
    JSON.stringify(compactCapabilityRegistry()),
    "Safe current app context:",
    JSON.stringify(sanitizeContext(input.context)),
    "Recent bounded conversation history:",
    formatHistory(input.history),
    "User question:",
    input.message,
    "Return exactly this schema:",
    "{\"intent\":\"VISITOR_AUTHENTICATION\",\"confidence\":0.94,\"capabilityKeys\":[\"visitor-auth\"],\"needsClarification\":false}"
  ].join("\n\n");

const getRuntimeProvider =
  async (): Promise<ProviderRuntime | null> => {
    const provider =
      await AiProviderFactory.getActiveAiProvider(
        "globalAssistant"
      );

    if (!provider) {
      return null;
    }

    return {
      name: provider.name,
      model: provider.model
    };
  };

export const classifyPlatformAssistantSemantically =
  async (
    input: PlatformAssistantInput,
    deterministicIntent: PlatformAssistantIntent
  ): Promise<PlatformAssistantSemanticResult | null> => {
    if (
      !shouldUseSemanticRouter(
        deterministicIntent
      )
    ) {
      return null;
    }

    try {
      const provider =
        await getRuntimeProvider();

      if (!provider) {
        return null;
      }

      const raw =
        await generateTextForProvider({
          prompt:
            buildClassifierPrompt(input),
          provider: provider.name,
          model: provider.model
        });

      const parsed =
        safeJsonParse(raw);

      return validateSemanticResult(parsed);
    } catch (error) {
      console.warn(
        "PLATFORM_ASSISTANT_SEMANTIC_CLASSIFIER_FALLBACK",
        error instanceof Error
          ? error.message
          : "unknown"
      );

      return null;
    }
  };

const knowledgeByCapability: Record<string, string> = {
  "visitor-auth":
    "Visitor Authentication is implemented for generated public sites. Visitor Login and Visitor Register blocks let site visitors register and log in on the public site. Visitor accounts are separate from ReactBuilder platform user accounts.",
  forms:
    "Forms are implemented per site. The workflow is: create a form in Forms, configure fields, add a Form block to a page, select the form, visitors submit it on the public site, and submissions are reviewed in Forms.",
  "partner-applications":
    "Partner Applications are implemented. Button and Link blocks can use the Devenir partenaire action. ReactBuilder generates the partner link for the current site. Received applications are reviewed in the site's Partner Applications module.",
  cms:
    "The CMS is implemented for site-scoped structured content. Collections, fields and entries can drive dynamic page content through CMS bindings and collection-list blocks.",
  "users-admin":
    "ReactBuilder uses platform roles and site roles. Platform roles govern global access; site roles govern what a member can do inside a specific site."
};

const buildAnswerPrompt = async ({
  input,
  semantic,
  fallbackAnswer
}: {
  input: PlatformAssistantInput;
  semantic: PlatformAssistantSemanticResult;
  fallbackAnswer: string;
}) => {
  const relevantKnowledge =
    semantic.capabilityKeys
      .map(key => knowledgeByCapability[key])
      .filter(Boolean);
  const relevantHelpArticles =
    await HelpCenterService.retrieveRelevantArticles(
      input.message,
      input.context?.locale,
      4
    );
  const helpKnowledge =
    relevantHelpArticles.map(article =>
      [
        `Help article: ${article.title}`,
        `Category: ${article.category}`,
        `Summary: ${article.summary}`,
        article.content
      ].join("\n")
    );

  return [
    "You are the read-only ReactBuilder product assistant.",
    "Answer only from the supplied ReactBuilder knowledge.",
    "If the supplied knowledge does not support a claim, say that the information is not confirmed.",
    "Do not invent menus, routes, features, permissions or workflows.",
    "Do not perform mutations.",
    "Do not expose internal capability keys, implementation metadata, class/model names, or API paths unless the user explicitly asks for technical implementation details.",
    "Use the user's locale. French must be fully natural French with correct accents.",
    "Safe current app context:",
    JSON.stringify(sanitizeContext(input.context)),
    "Relevant ReactBuilder knowledge:",
    relevantKnowledge.length
      ? relevantKnowledge.join("\n")
      : fallbackAnswer,
    "Relevant Help Center articles:",
    helpKnowledge.length
      ? helpKnowledge.join("\n\n")
      : "No relevant Help Center article found.",
    "Verified deterministic answer draft:",
    fallbackAnswer,
    "Recent bounded conversation history:",
    formatHistory(input.history),
    "User question:",
    input.message,
    "Answer concisely."
  ].join("\n\n");
};

const hasUnsafeUserFacingLeak = (
  text: string
) => {
  const normalized =
    normalizePlatformAssistantText(text);

  return (
    /\((implemented|partially_implemented|admin_only|site_scoped|global|site|page|public)[^)]*\)/i.test(text) ||
    text.includes("SiteVisitor") ||
    text.includes("SiteVisitorSession") ||
    normalized.includes("visitor auth") && normalized.includes("key")
  );
};

export const generateGroundedPlatformAssistantAnswer =
  async ({
    input,
    semantic,
    fallbackAnswer
  }: {
    input: PlatformAssistantInput;
    semantic: PlatformAssistantSemanticResult;
    fallbackAnswer: string;
  }): Promise<string | null> => {
    try {
      const provider =
        await getRuntimeProvider();

      if (!provider) {
        return null;
      }

      const text =
        await generateTextForProvider({
          prompt:
          await buildAnswerPrompt({
              input,
              semantic,
              fallbackAnswer
            }),
          provider: provider.name,
          model: provider.model
        });

      const clean =
        text.trim();

      if (
        !clean ||
        hasUnsafeUserFacingLeak(clean)
      ) {
        return null;
      }

      return clean;
    } catch (error) {
      console.warn(
        "PLATFORM_ASSISTANT_GROUNDED_ANSWER_FALLBACK",
        error instanceof Error
          ? error.message
          : "unknown"
      );

      return null;
    }
  };
