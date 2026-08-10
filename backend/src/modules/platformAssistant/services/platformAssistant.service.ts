import {
  PLATFORM_CAPABILITIES,
  PlatformCapability
} from "./platformAssistant.capabilities";
import {
  PLATFORM_ASSISTANT_DOCS,
  PlatformAssistantDoc
} from "./platformAssistant.docs";
import {
  PlatformAssistantIntent,
  classifyPlatformAssistantIntent,
  normalizePlatformAssistantText
} from "./platformAssistant.intent";

type KnowledgeChunk = {
  docId: string;
  title: string;
  category: string;
  content: string;
  index: number;
};

export type PlatformAssistantSource = {
  docId: string;
  title: string;
  category: string;
  excerpt: string;
  score: number;
};

export type PlatformAssistantContext = {
  pathname?: string;
  module?: string;
  siteId?: string | number | null;
  pageId?: string | number | null;
  globalRole?: string | null;
  locale?: string | null;
};

export type PlatformAssistantHistoryMessage = {
  role: "user" | "assistant";
  content: string;
};

export type PlatformAssistantInput = {
  message: string;
  context?: PlatformAssistantContext;
  history?: PlatformAssistantHistoryMessage[];
  userRole?: string | null;
};

export type PlatformAssistantAnswer = {
  answer: string;
  sources: PlatformAssistantSource[];
  confidence: "none" | "low" | "medium";
  intent: PlatformAssistantIntent;
};

const STOP_WORDS =
  new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "of",
    "to",
    "in",
    "on",
    "for",
    "with",
    "is",
    "are",
    "how",
    "what",
    "why",
    "can",
    "do",
    "does",
    "i",
    "you",
    "me",
    "my",
    "your",
    "comment",
    "quoi",
    "pourquoi",
    "dans",
    "avec",
    "pour",
    "est",
    "une",
    "des",
    "les"
  ]);

const tokenize = (
  value: string
) =>
  normalizePlatformAssistantText(value)
    .split(" ")
    .filter(
      token =>
        token.length >= 3 &&
        !STOP_WORDS.has(token)
    );

const makeExcerpt = (
  content: string,
  maxLength = 220
) => {
  const clean =
    content
      .replace(/\s+/g, " ")
      .trim();

  if (clean.length <= maxLength) {
    return clean;
  }

  return `${clean.slice(0, maxLength)}...`;
};

const chunkDocument = (
  doc: PlatformAssistantDoc
): KnowledgeChunk[] => {
  const paragraphs =
    doc.content
      .split("\n")
      .map(item => item.trim())
      .filter(Boolean);

  return paragraphs.map(
    (paragraph, index) => ({
      docId: doc.id,
      title: doc.title,
      category: doc.category,
      content: paragraph,
      index
    })
  );
};

const getAllChunks = () =>
  PLATFORM_ASSISTANT_DOCS.flatMap(
    chunkDocument
  );

const scoreChunk = (
  questionTokens: string[],
  chunk: KnowledgeChunk
) => {
  const chunkText =
    `${chunk.title} ${chunk.category} ${chunk.content}`;

  const contentTokens =
    tokenize(chunkText);

  const contentSet =
    new Set(contentTokens);

  const matchedTokens =
    questionTokens.filter(
      token => contentSet.has(token)
    );

  let score =
    matchedTokens.length * 10;

  const normalizedTitle =
    normalizePlatformAssistantText(chunk.title);

  const normalizedCategory =
    normalizePlatformAssistantText(chunk.category);

  const normalizedContent =
    normalizePlatformAssistantText(chunk.content);

  for (const token of questionTokens) {
    if (normalizedTitle.includes(token)) {
      score += 8;
    }

    if (normalizedCategory.includes(token)) {
      score += 5;
    }

    if (normalizedContent.includes(token)) {
      score += 2;
    }
  }

  return score;
};

const searchDocumentation = (
  message: string
) => {
  const questionTokens =
    tokenize(message);

  if (!questionTokens.length) {
    return [];
  }

  return getAllChunks()
    .map(chunk => ({
      chunk,
      score:
        scoreChunk(
          questionTokens,
          chunk
        )
    }))
    .filter(item => item.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score
    )
    .slice(0, 8);
};

const toSources = (
  ranked: ReturnType<typeof searchDocumentation>
): PlatformAssistantSource[] =>
  Array.from(
    new Map(
      ranked.map(item => [
        item.chunk.docId,
        item
      ])
    ).values()
  )
    .slice(0, 3)
    .map(
      item => ({
        docId: item.chunk.docId,
        title: item.chunk.title,
        category: item.chunk.category,
        excerpt:
          makeExcerpt(
            item.chunk.content
          ),
        score: item.score
      })
    );

const makeAnswer = (
  intent: PlatformAssistantIntent,
  answer: string,
  sources: PlatformAssistantSource[] = [],
  confidence: PlatformAssistantAnswer["confidence"] = "medium"
): PlatformAssistantAnswer => ({
  answer,
  sources,
  confidence,
  intent
});

const prefersFrench = (
  input: PlatformAssistantInput
) => {
  const locale =
    String(input.context?.locale || "")
      .toLowerCase();
  const text =
    normalizePlatformAssistantText(input.message);

  return (
    locale.startsWith("fr") ||
    /\b(comment|bonjour|salut|merci|quoi|peux|puis|creer|ajouter|publier)\b/.test(text)
  );
};

const getPreviousTopic = (
  history: PlatformAssistantHistoryMessage[] = []
) => {
  const recent =
    history
      .slice(-6)
      .map(item => item.content)
      .join(" ");

  const text =
    normalizePlatformAssistantText(recent);

  if (text.includes("cms") || text.includes("collection")) return "cms";
  if (text.includes("formulaire") || text.includes("form")) return "forms";
  if (text.includes("role") || text.includes("permission")) return "roles";
  if (text.includes("plugin") || text.includes("marketplace")) return "plugins";

  return "";
};

const findCapabilitiesForText = (
  message: string,
  history: PlatformAssistantHistoryMessage[] = []
) => {
  const text =
    `${normalizePlatformAssistantText(message)} ${getPreviousTopic(history)}`;

  const aliases: Record<string, string[]> = {
    cms: ["cms", "collection", "collections", "entry", "entries"],
    forms: ["form", "forms", "formulaire", "formulaires"],
    imports: ["zip", "html", "import"],
    plugins: ["plugin", "plugins", "marketplace"],
    seo: ["seo", "metadata", "referencement"],
    media: ["media", "image", "library"],
    "visitor-auth": ["visitor", "authentication", "authentification", "login", "register"],
    figma: ["figma"],
    "static-export": ["export", "exporter"],
    pages: ["page", "publish", "publier"],
    sites: ["site", "sites"],
    "partner-applications": ["partner", "partenaire"],
    dashboard: ["dashboard", "tableau"],
    "users-admin": ["user", "users", "utilisateur", "admin"]
  };

  return PLATFORM_CAPABILITIES.filter((capability) =>
    aliases[capability.id]?.some(alias =>
      text.includes(alias)
    )
  );
};

const formatCapabilities = (
  capabilities: PlatformCapability[]
) =>
  capabilities
    .map(capability =>
      `- ${capability.name}: ${capability.summary} (${capability.status}, ${capability.scope}).`
    )
    .join("\n");

const answerPlatformOverview = (
  input: PlatformAssistantInput
) => {
  const topCapabilities =
    PLATFORM_CAPABILITIES.filter(capability =>
      [
        "sites",
        "pages",
        "page-builder",
        "cms",
        "forms",
        "media",
        "plugins",
        "dashboard"
      ].includes(capability.id)
    );

  const intro = prefersFrench(input)
    ? "ReactBuilder est une plateforme pour creer, gerer et publier des sites web avec un builder visuel."
    : "ReactBuilder is a platform for creating, managing and publishing websites with a visual builder.";

  return makeAnswer(
    "PLATFORM_HELP",
    `${intro}\n\n${formatCapabilities(topCapabilities)}\n\nJe suis en lecture seule: je peux guider et expliquer, mais je ne modifie pas vos sites, pages, blocs, CMS, formulaires, plugins ou utilisateurs.`
  );
};

const answerRoles = (
  input: PlatformAssistantInput
) => {
  const role =
    input.context?.globalRole ||
    input.userRole ||
    "unknown";

  return makeAnswer(
    "ROLE_PERMISSION_QUESTION",
    [
      "ReactBuilder distingue deux niveaux de role:",
      "",
      "- Role plateforme: ADMIN, EDITOR, VIEWER. Il controle l'acces global, par exemple l'administration des utilisateurs pour ADMIN.",
      "- Role dans un site: OWNER, ADMIN, EDITOR, VIEWER. Il controle ce qu'un membre peut faire dans un site precis.",
      "",
      "OWNER est un role de site, pas un role plateforme. ADMIN peut exister aux deux niveaux, mais ce n'est pas la meme portee.",
      "Un VIEWER peut consulter, mais ne doit pas modifier une page. EDITOR peut generalement creer/editer des pages; la publication et les plugins demandent des roles plus eleves selon le contexte.",
      role !== "unknown"
        ? `Votre role plateforme detecte est ${role}; les droits exacts dans un site dependent aussi de votre role de membre pour ce site.`
        : "Je n'ai pas assez de contexte pour connaitre votre role exact ici."
    ].join("\n")
  );
};

const routeModuleLabels: Array<{
  pattern: RegExp;
  module: string;
  answer: string;
}> = [
  {
    pattern: /^\/sites\/?$/,
    module: "sites",
    answer: "Vous etes sur la gestion des sites. Ici, vous pouvez consulter vos sites, creer un site si votre role le permet, et ouvrir un site pour gerer ses pages, media, plugins, CMS, formulaires et membres."
  },
  {
    pattern: /\/cms(?:\/|$)/,
    module: "cms",
    answer: "Vous etes dans le CMS du site. Cette zone sert a gerer les collections, champs et entrees, puis a les lier a des pages via les bindings CMS."
  },
  {
    pattern: /\/forms(?:\/|$)/,
    module: "forms",
    answer: "Vous etes dans Forms. Ici, vous pouvez creer des formulaires, configurer leurs champs et consulter les soumissions."
  },
  {
    pattern: /\/media(?:\/|$)/,
    module: "media",
    answer: "Vous etes dans la Media Library. Elle sert a televerser, organiser et reutiliser les images ou fichiers du site."
  },
  {
    pattern: /\/plugins(?:\/|$)/,
    module: "plugins",
    answer: "Vous etes dans le marketplace des plugins du site. Vous pouvez consulter les plugins et, avec les droits necessaires, les installer, activer, desactiver ou supprimer."
  },
  {
    pattern: /\/dashboard(?:\/|$)/,
    module: "dashboard",
    answer: "Vous etes sur le dashboard. Il donne une vue de synthese du site, de l'activite et des widgets disponibles."
  }
];

const answerCurrentContext = (
  input: PlatformAssistantInput
) => {
  const pathname =
    String(input.context?.pathname || "");

  const match =
    routeModuleLabels.find(item =>
      item.pattern.test(pathname)
    );

  if (match) {
    return makeAnswer(
      "CURRENT_CONTEXT_QUESTION",
      match.answer
    );
  }

  return makeAnswer(
    "CURRENT_CONTEXT_QUESTION",
    "Je peux utiliser le chemin courant pour vous orienter, mais cette route n'est pas encore decrite precisement. Dites-moi ce que vous essayez de faire ici."
  );
};

const answerHowToOrFeature = (
  input: PlatformAssistantInput,
  intent: PlatformAssistantIntent
) => {
  const text =
    normalizePlatformAssistantText(input.message);
  const capabilities =
    findCapabilitiesForText(
      input.message,
      input.history
    );

  if (text.includes("formulaire") || text.includes("form")) {
    return makeAnswer(
      intent,
      "Pour creer un formulaire: ouvrez Forms dans le site, creez un formulaire, configurez ses champs, puis ajoutez ou configurez un Form Block dans le Page Builder pour le lier au formulaire. Les soumissions se consultent dans la zone Forms."
    );
  }

  if (text.includes("zip") || text.includes("html") || text.includes("import")) {
    return makeAnswer(
      intent,
      "Pour importer un site HTML/ZIP: ouvrez le site concerne, utilisez l'import HTML/ZIP, chargez le fichier, puis verifiez les pages creees dans le Page Builder. L'import tente de convertir la structure en blocs editables."
    );
  }

  if (text.includes("cms") || text.includes("collection")) {
    return makeAnswer(
      intent,
      "Le CMS sert a gerer du contenu structure par site: collections, champs et entrees. Les pages peuvent afficher ce contenu avec des bindings CMS ou des blocs de liste de collection."
    );
  }

  if (text.includes("publier") || text.includes("publish")) {
    return makeAnswer(
      intent,
      "Pour publier une page: ouvrez la page dans le site, verifiez le contenu dans le Page Builder, enregistrez, puis utilisez Publish. Une page en brouillon reste editable mais n'est pas publique."
    );
  }

  if (text.includes("export")) {
    return makeAnswer(
      intent,
      "ReactBuilder contient des exports statiques. Utilisez la zone d'export prevue par l'interface; certains blocs dynamiques peuvent necessiter un runtime client ou un fallback."
    );
  }

  if (capabilities.length) {
    return makeAnswer(
      intent,
      formatCapabilities(capabilities)
    );
  }

  return null;
};

const answerTroubleshooting = (
  input: PlatformAssistantInput
) => {
  const text =
    normalizePlatformAssistantText(input.message);

  if (
    text === "ca ne marche pas" ||
    text === "it does not work"
  ) {
    return makeAnswer(
      "CLARIFICATION_REQUIRED",
      "Qu'est-ce qui ne marche pas exactement: publication, import, formulaire, plugin, connexion ou autre chose ?"
    );
  }

  if (text.includes("publier") || text.includes("publish")) {
    return makeAnswer(
      "TROUBLESHOOTING",
      "Si vous ne pouvez pas publier, verifiez que vous etes connecte, que votre role dans le site permet la publication, que la page existe et que le backend repond. Un VIEWER ne doit pas pouvoir publier."
    );
  }

  if (text.includes("formulaire") || text.includes("form")) {
    return makeAnswer(
      "TROUBLESHOOTING",
      "Si un formulaire ne recoit rien, verifiez que le formulaire est actif, que le Form Block est bien lie au bon formulaire, que les champs requis sont configures et que l'API publique des formulaires repond."
    );
  }

  if (text.includes("figma")) {
    return makeAnswer(
      "TROUBLESHOOTING",
      "Si le plugin Figma est desactive ou ne fonctionne pas, verifiez le token Figma, l'etat du plugin, les permissions du site et la disponibilite des routes Figma."
    );
  }

  return makeAnswer(
    "TROUBLESHOOTING",
    "Je peux aider a diagnostiquer, mais il me faut le module concerne et le message d'erreur exact. Est-ce lie a l'import, la publication, un formulaire, un plugin, le CMS ou la connexion ?"
  );
};

const answerFromDocs = (
  message: string,
  intent: PlatformAssistantIntent
) => {
  const ranked =
    searchDocumentation(message);

  if (!ranked.length) {
    return makeAnswer(
      intent,
      "Je n'ai pas trouve d'information fiable dans l'aide ReactBuilder pour cette question. Reformulez avec le module concerne, ou demandez-moi une fonctionnalite precise.",
      [],
      "none"
    );
  }

  const sources =
    toSources(ranked);

  const answer =
    [
      "Voici ce que je peux confirmer dans l'aide ReactBuilder:",
      "",
      ...sources.map(
        (source, index) =>
          `${index + 1}. ${source.excerpt}`
      )
    ].join("\n");

  return makeAnswer(
    intent,
    answer,
    sources,
    sources[0]?.score >= 20
      ? "medium"
      : "low"
  );
};

export const answerPlatformQuestion = async (
  inputOrMessage: PlatformAssistantInput | string
): Promise<PlatformAssistantAnswer> => {
  const input: PlatformAssistantInput =
    typeof inputOrMessage === "string"
      ? { message: inputOrMessage }
      : inputOrMessage;

  const cleanMessage =
    input.message?.trim();

  const intent =
    classifyPlatformAssistantIntent(
      cleanMessage || ""
    );

  if (
    !cleanMessage ||
    (
      cleanMessage.length < 3 &&
      intent !== "GREETING"
    )
  ) {
    return makeAnswer(
      "CLARIFICATION_REQUIRED",
      "Please ask a longer question about ReactBuilder.",
      [],
      "none"
    );
  }

  if (intent === "GREETING") {
    return makeAnswer(
      intent,
      prefersFrench(input)
        ? "Bonjour ! Comment puis-je vous aider avec ReactBuilder ?"
        : "Hi! How can I help you with ReactBuilder?"
    );
  }

  if (intent === "GENERAL_CONVERSATION") {
    return makeAnswer(
      intent,
      prefersFrench(input)
        ? "Avec plaisir. Posez-moi une question sur ReactBuilder, ses modules, les roles, ou un workflow."
        : "You are welcome. Ask me about ReactBuilder modules, roles, workflows, or troubleshooting."
    );
  }

  if (intent === "PLATFORM_HELP") {
    return answerPlatformOverview(input);
  }

  if (intent === "ROLE_PERMISSION_QUESTION") {
    return answerRoles(input);
  }

  if (intent === "CURRENT_CONTEXT_QUESTION") {
    return answerCurrentContext(input);
  }

  if (intent === "CLARIFICATION_REQUIRED") {
    return answerTroubleshooting(input);
  }

  if (
    intent === "HOW_TO" ||
    intent === "FEATURE_EXPLANATION"
  ) {
    const directAnswer =
      answerHowToOrFeature(
        input,
        intent
      );

    if (directAnswer) {
      return directAnswer;
    }
  }

  if (intent === "TROUBLESHOOTING") {
    return answerTroubleshooting(input);
  }

  if (intent === "UNSUPPORTED_REQUEST") {
    return makeAnswer(
      intent,
      "Je ne peux pas confirmer que ReactBuilder supporte cette fonctionnalite actuellement. Je peux vous guider sur les fonctions implementees: sites, pages, Page Builder, CMS, formulaires, media, SEO, imports HTML/ZIP, Figma, plugins, dashboard, roles et publication."
    );
  }

  return answerFromDocs(
    cleanMessage,
    intent
  );
};

export const getPlatformAssistantDocs = () =>
  PLATFORM_ASSISTANT_DOCS.map(
    doc => ({
      id: doc.id,
      title: doc.title,
      category: doc.category,
      content: doc.content
        .replace(/\s+/g, " ")
        .trim()
    })
  );
