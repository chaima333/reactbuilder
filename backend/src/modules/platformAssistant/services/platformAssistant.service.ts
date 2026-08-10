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
  capabilities: PlatformCapability[],
  french = false
) => {
  const userFacingDescriptions: Record<
    string,
    {
      fr: string;
      en: string;
    }
  > = {
    authentication: {
      fr: "Authentification : connexion, inscription, reinitialisation de mot de passe et sessions JWT.",
      en: "Authentication: login, registration, password reset and JWT sessions."
    },
    sites: {
      fr: "Sites : creation et gestion des sites.",
      en: "Sites: create and manage sites."
    },
    pages: {
      fr: "Pages : creation, edition, sauvegarde, publication, suppression et restauration de versions.",
      en: "Pages: create, edit, save, publish, delete and restore versions."
    },
    "page-builder": {
      fr: "Page Builder : edition visuelle, blocs, glisser-deposer, arborescence et apercus responsive.",
      en: "Page Builder: visual editing, blocks, drag and drop, structure editing and responsive previews."
    },
    "page-ai": {
      fr: "IA de page et Design Copilot : generation de pages, suggestions, edition de bloc selectionne et ameliorations de design.",
      en: "Page AI and Design Copilot: page generation, suggestions, selected-block editing and design improvements."
    },
    cms: {
      fr: "CMS : collections, champs, entrees, rendu public et bindings dynamiques.",
      en: "CMS: collections, fields, entries, public rendering and dynamic bindings."
    },
    forms: {
      fr: "Forms : creation de formulaires, gestion des champs et consultation des soumissions.",
      en: "Forms: create forms, manage fields and review submissions."
    },
    media: {
      fr: "Media Library : televersement, organisation, mise a jour et suppression des images et fichiers.",
      en: "Media Library: upload, organize, update and delete images and files."
    },
    seo: {
      fr: "SEO : metadonnees de pages, widgets SEO et support via plugins.",
      en: "SEO: page metadata, SEO widgets and plugin support."
    },
    imports: {
      fr: "Imports : import HTML/ZIP de sites existants.",
      en: "Imports: HTML/ZIP import for existing site structures."
    },
    figma: {
      fr: "Figma : generation de token plugin et passerelle d'import.",
      en: "Figma: plugin token generation and import bridge."
    },
    plugins: {
      fr: "Plugins/Marketplace : installation, activation, desactivation et suppression de plugins.",
      en: "Plugins/Marketplace: install, enable, disable and uninstall plugins."
    },
    "static-export": {
      fr: "Export statique : export de sites et analyse de compatibilite des blocs.",
      en: "Static export: site export and block compatibility analysis."
    },
    "visitor-auth": {
      fr: "Authentification visiteurs : connexion, inscription, sessions et blocs associes.",
      en: "Visitor authentication: login, registration, sessions and related blocks."
    },
    "partner-applications": {
      fr: "Candidatures partenaires : soumission publique et revue cote site.",
      en: "Partner applications: public submission and site-side review."
    },
    dashboard: {
      fr: "Dashboard : widgets, activite, analytics et vues de synthese.",
      en: "Dashboard: widgets, activity, analytics and overview data."
    },
    "users-admin": {
      fr: "Roles et utilisateurs : administration globale des utilisateurs et parametres admin.",
      en: "Roles and users: global user administration and admin settings."
    }
  };

  return capabilities
    .map(capability => {
      const display =
        userFacingDescriptions[capability.id];

      if (display) {
        return `- ${french ? display.fr : display.en}`;
      }

      return `- ${capability.name}: ${capability.summary}`;
    })
    .join("\n");
};

const getCoreCapabilities = () =>
  PLATFORM_CAPABILITIES.filter(capability =>
    [
      "sites",
      "pages",
      "page-builder",
      "cms",
      "forms",
      "media",
      "seo",
      "imports",
      "plugins",
      "dashboard",
      "users-admin"
    ].includes(capability.id)
  );

const answerProductDescription = (
  input: PlatformAssistantInput
) =>
  makeAnswer(
    "PRODUCT_DESCRIPTION",
    prefersFrench(input)
      ? "ReactBuilder est une plateforme SaaS de creation et de gestion de sites web. Elle permet de creer des pages avec un editeur visuel, gerer du contenu avec le CMS, creer des formulaires, gerer les medias, le SEO, les plugins, puis publier ou exporter des sites."
      : "ReactBuilder is a SaaS platform for creating and managing websites. It lets users build pages with a visual editor, manage content with the CMS, create forms, manage media, SEO and plugins, then publish or export sites."
  );

const answerAssistantCapabilities = (
  input: PlatformAssistantInput
) =>
  makeAnswer(
    "ASSISTANT_CAPABILITIES",
    prefersFrench(input)
      ? "Je peux vous aider a comprendre ReactBuilder, expliquer ses fonctionnalites, vous guider dans les workflows, expliquer le CMS, Forms, SEO, les imports, plugins et roles, diagnostiquer des problemes courants, et expliquer la zone actuelle de l'application quand le contexte est disponible. Je suis en lecture seule : je ne peux pas modifier directement vos sites, pages, blocs, utilisateurs, formulaires, donnees CMS, plugins ou parametres."
      : "I can help you understand ReactBuilder, explain features, guide workflows, explain CMS, Forms, SEO, imports, plugins and roles, troubleshoot common issues, and explain the current area of the application when context is available. I am read-only: I cannot directly modify sites, pages, blocks, users, forms, CMS data, plugins or settings."
  );

const answerModuleList = (
  input: PlatformAssistantInput
) => {
  const french =
    prefersFrench(input);

  return makeAnswer(
    "MODULE_LIST",
    [
      french
        ? "Voici les principaux modules de ReactBuilder :"
        : "Here are the main ReactBuilder modules:",
      "",
      formatCapabilities(
        getCoreCapabilities(),
        french
      )
    ].join("\n")
  );
};

const answerVisitorAuthentication = (
  input: PlatformAssistantInput
) => {
  const text =
    normalizePlatformAssistantText(input.message);

  if (prefersFrench(input)) {
    if (
      text.includes("difference") ||
      (
        text.includes("reactbuilder") &&
        text.includes("visiteur")
      )
    ) {
      return makeAnswer(
        "VISITOR_AUTHENTICATION",
        "Un utilisateur ReactBuilder et un visiteur de site sont deux comptes differents. Le compte ReactBuilder sert a se connecter a la plateforme pour creer et gerer des sites. Le compte visiteur appartient a un site public genere : il est enregistre dans SiteVisitor, utilise des sessions SiteVisitorSession, et sert aux parcours Login/Register du site public."
      );
    }

    if (
      text.includes("site public") ||
      text.includes("fonctionne")
    ) {
      return makeAnswer(
        "VISITOR_AUTHENTICATION",
        "Oui. Visitor Authentication fonctionne cote site public : les routes publiques exposent register, login, refresh, logout et me sous /api/public/sites/:siteId/visitor-auth. Les blocs Visitor Login et Visitor Register soumettent leurs formulaires uniquement en mode public."
      );
    }

    if (
      text.includes("comment") ||
      text.includes("ajouter")
    ) {
      return makeAnswer(
        "VISITOR_AUTHENTICATION",
        "Oui. Pour ajouter Login et Register dans un site ReactBuilder, creez ou ouvrez les pages voulues dans le Page Builder, puis ajoutez les blocs Visitor Login et Visitor Register. Ils appellent l'authentification dediee aux visiteurs du site public. Ces comptes visiteurs restent distincts des comptes utilisateurs ReactBuilder."
      );
    }

    return makeAnswer(
      "VISITOR_AUTHENTICATION",
      "Oui. ReactBuilder dispose d'une authentification dediee aux visiteurs des sites generes. Dans le Page Builder, des blocs Visitor Login et Visitor Register permettent d'ajouter des interfaces de connexion et d'inscription. Les visiteurs peuvent creer un compte, se connecter, rafraichir leur session, se deconnecter et consulter leur profil via les routes publiques du site. Ces comptes visiteurs sont distincts des comptes utilisateurs ReactBuilder."
    );
  }

  return makeAnswer(
    "VISITOR_AUTHENTICATION",
    "Yes. ReactBuilder has visitor authentication for generated public sites. The Page Builder includes Visitor Login and Visitor Register blocks, backed by public register, login, refresh, logout and me routes. Visitor accounts are separate from ReactBuilder platform user accounts."
  );
};

const answerFormsCapability = (
  input: PlatformAssistantInput
) => {
  const text =
    normalizePlatformAssistantText(input.message);

  if (prefersFrench(input)) {
    if (
      text.includes("soumission") ||
      text.includes("soumissions") ||
      text.includes("voir")
    ) {
      return makeAnswer(
        "FORMS",
        "Les soumissions se consultent dans le module Forms du site, sur le detail du formulaire. Le backend expose les soumissions par formulaire et permet aussi de changer leur statut ou de les supprimer selon les droits du site."
      );
    }

    if (
      text.includes("afficher") ||
      text.includes("page")
    ) {
      return makeAnswer(
        "FORMS",
        "Pour afficher un formulaire dans une page, creez d'abord le formulaire dans le module Forms du site, puis ajoutez un bloc Form dans le Page Builder et selectionnez ce formulaire. Le bloc charge le schema public du formulaire et l'envoie via l'endpoint public de soumission."
      );
    }

    if (
      text.includes("visiteur") ||
      text.includes("envoyer")
    ) {
      return makeAnswer(
        "FORMS",
        "Oui. Un visiteur peut envoyer un formulaire depuis le site public. Le bloc Form utilise l'endpoint public /api/public/sites/:siteId/forms/:formId/submit, avec une limitation de debit, puis la soumission est stockee dans les soumissions du formulaire."
      );
    }

    return makeAnswer(
      "FORMS",
      "Pour creer un formulaire, ouvrez le module Forms du site, creez un formulaire, configurez ses champs et ses parametres, puis ajoutez un bloc Form dans une page pour le lier au formulaire. Les visiteurs soumettent le formulaire sur le site public et les reponses se consultent dans le detail du formulaire."
    );
  }

  return makeAnswer(
    "FORMS",
    "To create a form, open the site's Forms module, create the form, configure its fields and settings, then add a Form block in the Page Builder and select that form. Public visitors can submit it through the public submit endpoint, and submissions are reviewed from the form detail page."
  );
};

const answerPartnerApplications = (
  input: PlatformAssistantInput
) => {
  const text =
    normalizePlatformAssistantText(input.message);

  if (prefersFrench(input)) {
    if (
      text.includes("siteid") ||
      text.includes("automatique") ||
      text.includes("automatiquement")
    ) {
      return makeAnswer(
        "PARTNER_APPLICATIONS",
        "Oui. Pour l'action Devenir partenaire, le siteId est resolu automatiquement depuis le contexte runtime du site. Un site 403 pointe vers /partner-apply/403, un site 524 vers /partner-apply/524. Il ne faut pas hardcoder l'identifiant du site dans le contenu."
      );
    }

    if (
      text.includes("link") ||
      text.includes("lien")
    ) {
      return makeAnswer(
        "PARTNER_APPLICATIONS",
        "Oui. Le bloc Link supporte l'action Devenir partenaire. Quand cette action est selectionnee, le lien cible est genere dynamiquement avec le siteId courant vers /partner-apply/:siteId."
      );
    }

    if (
      text.includes("voir") ||
      text.includes("demandes") ||
      text.includes("recues")
    ) {
      return makeAnswer(
        "PARTNER_APPLICATIONS",
        "Les demandes partenaires recues se consultent dans le module Partner Applications du site. Les statuts actuellement geres sont PENDING, APPROVED et REJECTED, avec des actions d'approbation ou de rejet selon les permissions."
      );
    }

    if (
      text.includes("formulaire")
    ) {
      return makeAnswer(
        "PARTNER_APPLICATIONS",
        "Le formulaire partenaire est une page publique /partner-apply/:siteId. Elle envoie la candidature vers l'endpoint public du site, puis la demande est stockee dans Partner Applications avec le statut PENDING et un niveau suggere calcule depuis l'experience."
      );
    }

    return makeAnswer(
      "PARTNER_APPLICATIONS",
      "Pour ajouter un bouton Devenir partenaire, utilisez un bloc Button et choisissez l'action Devenir partenaire. Le Button genere automatiquement l'URL /partner-apply/:siteId depuis le site courant, par exemple /partner-apply/403 pour le site 403. Le meme mecanisme existe aussi sur le bloc Link."
    );
  }

  return makeAnswer(
    "PARTNER_APPLICATIONS",
    "Use a Button or Link block and choose the Become partner action. ReactBuilder resolves the current siteId dynamically and sends visitors to /partner-apply/:siteId, so you should not hardcode a site id. Received applications are managed in the site's Partner Applications module with PENDING, APPROVED and REJECTED statuses."
  );
};

const answerDynamicSiteCapabilities = (
  input: PlatformAssistantInput
) =>
  makeAnswer(
    "DYNAMIC_SITE_CAPABILITIES",
    prefersFrench(input)
      ? "Non, les sites generes avec ReactBuilder ne sont pas limites a des pages statiques. Le code actuel supporte des contenus dynamiques via le CMS, des formulaires avec soumissions publiques, l'authentification visiteur avec Login/Register et sessions, ainsi qu'un workflow de candidatures partenaires via une page publique et une gestion cote site."
      : "No. ReactBuilder-generated sites are not limited to static pages. The current code supports CMS-driven content, forms with public submissions, visitor Login/Register with sessions, and a partner application workflow with a public page and site-side management."
  );

const answerPlatformOverview = (
  input: PlatformAssistantInput
) => {
  const french =
    prefersFrench(input);

  const intro = french
    ? "ReactBuilder est une plateforme pour creer, gerer et publier des sites web avec un builder visuel."
    : "ReactBuilder is a platform for creating, managing and publishing websites with a visual builder.";

  return makeAnswer(
    "PLATFORM_HELP",
    `${intro}\n\n${formatCapabilities(getCoreCapabilities(), french)}\n\n${
      french
        ? "Je suis en lecture seule : je peux guider et expliquer, mais je ne modifie pas vos sites, pages, blocs, CMS, formulaires, plugins ou utilisateurs."
        : "I am read-only: I can guide and explain, but I do not modify sites, pages, blocks, CMS, forms, plugins or users."
    }`
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
      formatCapabilities(
        capabilities,
        prefersFrench(input)
      )
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

  if (intent === "PRODUCT_DESCRIPTION") {
    return answerProductDescription(input);
  }

  if (intent === "ASSISTANT_CAPABILITIES") {
    return answerAssistantCapabilities(input);
  }

  if (intent === "MODULE_LIST") {
    return answerModuleList(input);
  }

  if (intent === "VISITOR_AUTHENTICATION") {
    return answerVisitorAuthentication(input);
  }

  if (intent === "FORMS") {
    return answerFormsCapability(input);
  }

  if (intent === "PARTNER_APPLICATIONS") {
    return answerPartnerApplications(input);
  }

  if (intent === "DYNAMIC_SITE_CAPABILITIES") {
    return answerDynamicSiteCapabilities(input);
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
