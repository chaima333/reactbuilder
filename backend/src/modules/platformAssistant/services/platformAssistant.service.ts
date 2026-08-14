import {
  PLATFORM_CAPABILITIES,
  PlatformCapability
} from "./platformAssistant.capabilities";
import {
  PlatformAssistantDoc
} from "./platformAssistant.docs";
import {
  HelpCenterService
} from "./helpCenter.service";
import {
  PlatformAssistantIntent,
  classifyPlatformAssistantIntent,
  normalizePlatformAssistantText
} from "./platformAssistant.intent";
import {
  classifyPlatformAssistantSemantically,
  generateGroundedPlatformAssistantAnswer
} from "./platformAssistant.semantic";

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
    "configure",
    "configurer",
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

const searchDocumentation = async (
  message: string,
  locale?: string | null
) => {
  const questionTokens =
    tokenize(message);

  if (!questionTokens.length) {
    return [];
  }

  const docs =
    await HelpCenterService.listArticles({
      locale,
      fallbackOnFailure: true
    });

  return docs
    .flatMap(chunkDocument)
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
  ranked: Array<{
    chunk: KnowledgeChunk;
    score: number;
  }>
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

const isTechnicalQuestion = (
  message: string
) => {
  const text =
    normalizePlatformAssistantText(message);

  return /\b(api|route|routes|endpoint|endpoints|technique|techniquement|siteid|url)\b/.test(text);
};

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
  if (text.includes("visitor") || text.includes("visiteur") || text.includes("login") || text.includes("register")) return "visitor-auth";
  if (text.includes("partenaire") || text.includes("partner")) return "partner-applications";
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
    cms: ["cms", "collection", "collections", "entry", "entries", "article", "articles", "contenu", "dynamique"],
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
      fr: "Authentification : connexion, inscription, réinitialisation de mot de passe et sessions.",
      en: "Authentication: login, registration, password reset and JWT sessions."
    },
    sites: {
      fr: "Sites : création et gestion des sites.",
      en: "Sites: create and manage sites."
    },
    pages: {
      fr: "Pages : création, édition, sauvegarde, publication, suppression et restauration de versions.",
      en: "Pages: create, edit, save, publish, delete and restore versions."
    },
    "page-builder": {
      fr: "Page Builder : édition visuelle, blocs, glisser-déposer, arborescence et aperçus responsive.",
      en: "Page Builder: visual editing, blocks, drag and drop, structure editing and responsive previews."
    },
    "page-ai": {
      fr: "IA de page et Design Copilot : génération de pages, suggestions, édition de bloc sélectionné et améliorations de design.",
      en: "Page AI and Design Copilot: page generation, suggestions, selected-block editing and design improvements."
    },
    cms: {
      fr: "CMS : collections, champs, entrées, rendu public et bindings dynamiques.",
      en: "CMS: collections, fields, entries, public rendering and dynamic bindings."
    },
    forms: {
      fr: "Forms : création de formulaires, gestion des champs et consultation des soumissions.",
      en: "Forms: create forms, manage fields and review submissions."
    },
    media: {
      fr: "Media Library : téléversement, organisation, mise à jour et suppression des images et fichiers.",
      en: "Media Library: upload, organize, update and delete images and files."
    },
    seo: {
      fr: "SEO : métadonnées de pages, widgets SEO et support via plugins.",
      en: "SEO: page metadata, SEO widgets and plugin support."
    },
    imports: {
      fr: "Imports : import HTML/ZIP de sites existants.",
      en: "Imports: HTML/ZIP import for existing site structures."
    },
    figma: {
      fr: "Figma : génération de token plugin et passerelle d’import.",
      en: "Figma: plugin token generation and import bridge."
    },
    plugins: {
      fr: "Plugins/Marketplace : installation, activation, désactivation et suppression de plugins.",
      en: "Plugins/Marketplace: install, enable, disable and uninstall plugins."
    },
    "static-export": {
      fr: "Export statique : export de sites et analyse de compatibilité des blocs.",
      en: "Static export: site export and block compatibility analysis."
    },
    "visitor-auth": {
      fr: "Authentification visiteurs : connexion, inscription, sessions et blocs associés.",
      en: "Visitor authentication: login, registration, sessions and related blocks."
    },
    "partner-applications": {
      fr: "Candidatures partenaires : soumission publique et revue côté site.",
      en: "Partner applications: public submission and site-side review."
    },
    dashboard: {
      fr: "Dashboard : widgets, activité, analytics et vues de synthèse.",
      en: "Dashboard: widgets, activity, analytics and overview data."
    },
    "users-admin": {
      fr: "Rôles et utilisateurs : administration globale des utilisateurs et paramètres admin.",
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
      ? "ReactBuilder est une plateforme SaaS de création et de gestion de sites web. Elle permet de créer des pages avec un éditeur visuel, de gérer du contenu avec le CMS, de créer des formulaires, de gérer les médias, le SEO et les plugins, puis de publier ou exporter des sites."
      : "ReactBuilder is a SaaS platform for creating and managing websites. It lets users build pages with a visual editor, manage content with the CMS, create forms, manage media, SEO and plugins, then publish or export sites."
  );

const answerAssistantCapabilities = (
  input: PlatformAssistantInput
) =>
  makeAnswer(
    "ASSISTANT_CAPABILITIES",
    prefersFrench(input)
      ? "Je peux vous aider à comprendre ReactBuilder, expliquer ses fonctionnalités, vous guider dans les workflows, expliquer le CMS, Forms, SEO, les imports, les plugins et les rôles, diagnostiquer des problèmes courants, et expliquer la zone actuelle de l’application quand le contexte est disponible. Je suis en lecture seule : je ne peux pas modifier directement vos sites, pages, blocs, utilisateurs, formulaires, données CMS, plugins ou paramètres."
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
  const technical =
    isTechnicalQuestion(input.message);

  if (prefersFrench(input)) {
    if (technical) {
      return makeAnswer(
        "VISITOR_AUTHENTICATION",
        "Techniquement, l’authentification visiteur fonctionne sur le site public avec des actions d’inscription, de connexion, de renouvellement de session, de déconnexion et de récupération du visiteur courant. Ces comptes visiteurs restent indépendants des comptes utilisateurs ReactBuilder."
      );
    }

    if (
      text.includes("difference") ||
      (
        text.includes("reactbuilder") &&
        text.includes("visiteur")
      )
    ) {
      return makeAnswer(
        "VISITOR_AUTHENTICATION",
        "Un utilisateur ReactBuilder utilise son compte pour accéder à la plateforme, créer et gérer des sites. Un visiteur possède un compte propre au site public créé avec ReactBuilder, par exemple pour s’inscrire ou se connecter via les pages Login/Register. Les deux types de comptes sont indépendants."
      );
    }

    if (
      text.includes("site public") ||
      text.includes("fonctionne")
    ) {
      return makeAnswer(
        "VISITOR_AUTHENTICATION",
        "Oui. L’authentification visiteur fonctionne sur le site public. Les visiteurs peuvent s’inscrire, se connecter et se déconnecter via les pages ou blocs Login/Register du site. Ces comptes sont séparés des comptes utilisés pour accéder à la plateforme ReactBuilder."
      );
    }

    if (
      text.includes("comment") ||
      text.includes("ajouter")
    ) {
      return makeAnswer(
        "VISITOR_AUTHENTICATION",
        "Oui. Pour ajouter Login et Register dans un site ReactBuilder, créez ou ouvrez les pages voulues dans le Page Builder, puis ajoutez les blocs Visitor Login et Visitor Register. Ils servent à l’authentification dédiée aux visiteurs du site public. Ces comptes visiteurs restent distincts des comptes utilisateurs ReactBuilder."
      );
    }

    return makeAnswer(
      "VISITOR_AUTHENTICATION",
      "Oui. ReactBuilder dispose d’une authentification dédiée aux visiteurs des sites générés. Dans le Page Builder, des blocs Visitor Login et Visitor Register permettent d’ajouter des interfaces de connexion et d’inscription. Les visiteurs peuvent créer un compte, se connecter et se déconnecter sur le site public. Ces comptes visiteurs sont distincts des comptes utilisateurs ReactBuilder."
    );
  }

  return makeAnswer(
    "VISITOR_AUTHENTICATION",
    technical
      ? "Technically, visitor authentication works on the public site with registration, login, session renewal, logout and current-visitor retrieval. Visitor accounts remain independent from ReactBuilder platform user accounts."
      : "Yes. ReactBuilder has visitor authentication for generated public sites. The Page Builder includes Visitor Login and Visitor Register blocks for public-site registration and login. Visitor accounts are separate from ReactBuilder platform user accounts."
  );
};

const answerFormsCapability = (
  input: PlatformAssistantInput
) => {
  const text =
    normalizePlatformAssistantText(input.message);
  const technical =
    isTechnicalQuestion(input.message);

  if (prefersFrench(input)) {
    if (
      text.includes("soumission") ||
      text.includes("soumissions") ||
      text.includes("message") ||
      text.includes("messages") ||
      text.includes("reponse") ||
      text.includes("reponses") ||
      text.includes("voir")
    ) {
      return makeAnswer(
        "FORMS",
        "Les soumissions se consultent dans le module Forms du site, dans le détail du formulaire. Selon vos droits, vous pouvez aussi changer leur statut ou supprimer une soumission."
      );
    }

    if (
      text.includes("afficher") ||
      text.includes("page")
    ) {
      return makeAnswer(
        "FORMS",
        "Pour afficher un formulaire dans une page, créez d’abord le formulaire dans le module Forms du site, puis ajoutez un bloc Form dans le Page Builder et sélectionnez ce formulaire. Les visiteurs pourront ensuite l’envoyer depuis le site public."
      );
    }

    if (
      text.includes("visiteur") ||
      text.includes("envoyer")
    ) {
      return makeAnswer(
        "FORMS",
        technical
          ? "Oui. Un visiteur peut envoyer un formulaire depuis le site public. Techniquement, le bloc Form utilise la soumission publique du formulaire, puis la réponse est enregistrée dans les soumissions du module Forms."
          : "Oui. Un visiteur peut envoyer un formulaire depuis le site public. La réponse est ensuite enregistrée dans les soumissions du formulaire, visibles dans le module Forms."
      );
    }

    return makeAnswer(
      "FORMS",
      "Pour créer un formulaire, ouvrez le module Forms du site, créez un formulaire, configurez ses champs et ses paramètres, puis ajoutez un bloc Form dans une page pour le sélectionner et le lier. Les visiteurs soumettent le formulaire sur le site public et les réponses se consultent dans le détail du formulaire."
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
  const technical =
    isTechnicalQuestion(input.message);

  if (prefersFrench(input)) {
    if (
      text.includes("siteid") ||
      text.includes("automatique") ||
      text.includes("automatiquement") ||
      technical
    ) {
      return makeAnswer(
        "PARTNER_APPLICATIONS",
        "Oui. Pour l’action Devenir partenaire, l’identifiant du site est résolu automatiquement depuis le contexte du site courant. Techniquement, un site 403 pointe vers /partner-apply/403 et un site 524 vers /partner-apply/524. Il ne faut pas hardcoder l’identifiant du site dans le contenu."
      );
    }

    if (
      text.includes("link") ||
      text.includes("lien")
    ) {
      return makeAnswer(
        "PARTNER_APPLICATIONS",
        "Oui. Le bloc Link supporte l’action Devenir partenaire. Quand cette action est sélectionnée, ReactBuilder génère automatiquement le lien correspondant au site courant."
      );
    }

    if (
      text.includes("voir") ||
      text.includes("demandes") ||
      text.includes("recues")
    ) {
      return makeAnswer(
        "PARTNER_APPLICATIONS",
        "Les demandes partenaires reçues se consultent dans le module Partner Applications du site. Les statuts actuellement gérés sont PENDING, APPROVED et REJECTED, avec des actions d’approbation ou de rejet selon les permissions."
      );
    }

    if (
      text.includes("formulaire")
    ) {
      return makeAnswer(
        "PARTNER_APPLICATIONS",
        "Le formulaire partenaire est une page publique générée pour le site courant. Elle permet au visiteur d’envoyer sa candidature, puis la demande apparaît dans Partner Applications avec le statut PENDING et un niveau suggéré calculé à partir de l’expérience."
      );
    }

    return makeAnswer(
      "PARTNER_APPLICATIONS",
      "Pour ajouter un bouton Devenir partenaire, utilisez un bloc Button et choisissez l’action Devenir partenaire. ReactBuilder génère automatiquement le lien correspondant au site courant. Le même mécanisme existe aussi sur le bloc Link."
    );
  }

  return makeAnswer(
    "PARTNER_APPLICATIONS",
    technical
      ? "For the Become partner action, ReactBuilder resolves the current site id dynamically. Technically, site 403 points to /partner-apply/403 and site 524 points to /partner-apply/524, so you should not hardcode a site id."
      : "Use a Button or Link block and choose the Become partner action. ReactBuilder automatically generates the link for the current site. Received applications are managed in the site's Partner Applications module with PENDING, APPROVED and REJECTED statuses."
  );
};

const answerDynamicSiteCapabilities = (
  input: PlatformAssistantInput
) =>
  makeAnswer(
    "DYNAMIC_SITE_CAPABILITIES",
    prefersFrench(input)
      ? "Non, les sites générés avec ReactBuilder ne sont pas limités à des pages statiques. Le code actuel supporte des contenus dynamiques via le CMS, des formulaires avec soumissions publiques, l’authentification visiteur avec Login/Register, ainsi qu’un workflow de candidatures partenaires via une page publique et une gestion côté site."
      : "No. ReactBuilder-generated sites are not limited to static pages. The current code supports CMS-driven content, forms with public submissions, visitor Login/Register with sessions, and a partner application workflow with a public page and site-side management."
  );

const answerPlatformOverview = (
  input: PlatformAssistantInput
) => {
  const french =
    prefersFrench(input);

  const intro = french
    ? "ReactBuilder est une plateforme pour créer, gérer et publier des sites web avec un builder visuel."
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
      "ReactBuilder distingue deux niveaux de rôle :",
      "",
      "- Rôle plateforme : ADMIN, EDITOR, VIEWER. Il contrôle l’accès global, par exemple l’administration des utilisateurs pour ADMIN.",
      "- Rôle dans un site : OWNER, ADMIN, EDITOR, VIEWER. Il contrôle ce qu’un membre peut faire dans un site précis.",
      "",
      "OWNER est un rôle de site, pas un rôle plateforme. ADMIN peut exister aux deux niveaux, mais ce n’est pas la même portée.",
      "Un VIEWER peut consulter, mais ne doit pas modifier une page. EDITOR peut généralement créer ou éditer des pages ; la publication et les plugins demandent des rôles plus élevés selon le contexte.",
      role !== "unknown"
        ? `Votre rôle plateforme détecté est ${role}; les droits exacts dans un site dépendent aussi de votre rôle de membre pour ce site.`
        : "Je n’ai pas assez de contexte pour connaître votre rôle exact ici."
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
    answer: "Vous êtes sur la gestion des sites. Ici, vous pouvez consulter vos sites, créer un site si votre rôle le permet, et ouvrir un site pour gérer ses pages, médias, plugins, CMS, formulaires et membres."
  },
  {
    pattern: /\/cms(?:\/|$)/,
    module: "cms",
    answer: "Vous êtes dans le CMS du site. Cette zone sert à gérer les collections, champs et entrées, puis à les lier à des pages via les bindings CMS."
  },
  {
    pattern: /\/forms(?:\/|$)/,
    module: "forms",
    answer: "Vous êtes dans Forms. Ici, vous pouvez créer des formulaires, configurer leurs champs et consulter les soumissions."
  },
  {
    pattern: /\/media(?:\/|$)/,
    module: "media",
    answer: "Vous êtes dans la Media Library. Elle sert à téléverser, organiser et réutiliser les images ou fichiers du site."
  },
  {
    pattern: /\/plugins(?:\/|$)/,
    module: "plugins",
    answer: "Vous êtes dans le marketplace des plugins du site. Vous pouvez consulter les plugins et, avec les droits nécessaires, les installer, activer, désactiver ou supprimer."
  },
  {
    pattern: /\/dashboard(?:\/|$)/,
    module: "dashboard",
    answer: "Vous êtes sur le dashboard. Il donne une vue de synthèse du site, de l’activité et des widgets disponibles."
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
      "Pour créer un formulaire : ouvrez Forms dans le site, créez un formulaire, configurez ses champs, puis ajoutez ou configurez un Form Block dans le Page Builder pour le lier au formulaire. Les soumissions se consultent dans la zone Forms."
    );
  }

  if (text.includes("zip") || text.includes("html") || text.includes("import")) {
    return makeAnswer(
      intent,
      "Pour importer un site HTML/ZIP : ouvrez le site concerné, utilisez l’import HTML/ZIP, chargez le fichier, puis vérifiez les pages créées dans le Page Builder. L’import tente de convertir la structure en blocs éditables."
    );
  }

  if (text.includes("cms") || text.includes("collection") || text.includes("article") || text.includes("contenu dynamique")) {
    return makeAnswer(
      intent,
      "Le CMS sert à gérer du contenu structuré par site : collections, champs et entrées. Les pages peuvent afficher ce contenu avec des bindings CMS ou des blocs de liste de collection."
    );
  }

  if (text.includes("publier") || text.includes("publish")) {
    return makeAnswer(
      intent,
      "Pour publier une page : ouvrez la page dans le site, vérifiez le contenu dans le Page Builder, enregistrez, puis utilisez Publish. Une page en brouillon reste éditable mais n’est pas publique."
    );
  }

  if (text.includes("export")) {
    return makeAnswer(
      intent,
      "ReactBuilder contient des exports statiques. Utilisez la zone d'export prevue par l'interface; certains blocs dynamiques peuvent necessiter un runtime client ou un fallback."
    );
  }

  if (
    text.includes("saml") ||
    text.includes("sso") ||
    text.includes("single sign on")
  ) {
    return null;
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
      "Qu’est-ce qui ne marche pas exactement : publication, import, formulaire, plugin, connexion ou autre chose ?"
    );
  }

  if (text.includes("publier") || text.includes("publish")) {
    return makeAnswer(
      "TROUBLESHOOTING",
      "Si vous ne pouvez pas publier, vérifiez que vous êtes connecté, que votre rôle dans le site permet la publication, que la page existe et que le backend répond. Un VIEWER ne doit pas pouvoir publier."
    );
  }

  if (text.includes("formulaire") || text.includes("form")) {
    return makeAnswer(
      "TROUBLESHOOTING",
      "Si un formulaire ne reçoit rien, vérifiez que le formulaire est actif, que le Form Block est bien lié au bon formulaire, que les champs requis sont configurés et que l’API publique des formulaires répond."
    );
  }

  if (text.includes("figma")) {
    return makeAnswer(
      "TROUBLESHOOTING",
      "Si le plugin Figma est désactivé ou ne fonctionne pas, vérifiez le token Figma, l’état du plugin, les permissions du site et la disponibilité des routes Figma."
    );
  }

  return makeAnswer(
    "TROUBLESHOOTING",
    "Je peux aider à diagnostiquer, mais il me faut le module concerné et le message d’erreur exact. Est-ce lié à l’import, la publication, un formulaire, un plugin, le CMS ou la connexion ?"
  );
};

const answerFromDocs = async (
  message: string,
  intent: PlatformAssistantIntent,
  input?: PlatformAssistantInput
): Promise<PlatformAssistantAnswer> => {
  const ranked =
    await searchDocumentation(
      message,
      input?.context?.locale
    );

  if (!ranked.length) {
    return makeAnswer(
      intent,
      "Je n’ai pas trouvé d’information fiable dans l’aide ReactBuilder pour cette question. Reformulez avec le module concerné, ou demandez-moi une fonctionnalité précise.",
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

const buildPlatformAnswerForIntent = async (
  input: PlatformAssistantInput,
  cleanMessage: string,
  intent: PlatformAssistantIntent
): Promise<PlatformAssistantAnswer> => {
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
        ? "Avec plaisir. Posez-moi une question sur ReactBuilder, ses modules, les rÃ´les, ou un workflow."
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
      "Je ne peux pas confirmer que ReactBuilder supporte cette fonctionnalitÃ© actuellement. Je peux vous guider sur les fonctions implÃ©mentÃ©es : sites, pages, Page Builder, CMS, formulaires, mÃ©dias, SEO, imports HTML/ZIP, Figma, plugins, dashboard, rÃ´les et publication."
    );
  }

  return answerFromDocs(
    cleanMessage,
    intent,
    input
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

  const deterministicIntent =
    classifyPlatformAssistantIntent(
      cleanMessage || ""
    );

  if (
    !cleanMessage ||
    (
      cleanMessage.length < 3 &&
      deterministicIntent !== "GREETING"
    )
  ) {
    return makeAnswer(
      "CLARIFICATION_REQUIRED",
      "Please ask a longer question about ReactBuilder.",
      [],
      "none"
    );
  }

  const semantic =
    await classifyPlatformAssistantSemantically(
      input,
      deterministicIntent
    );

  const previousTopic =
    getPreviousTopic(input.history);

  const contextualIntent: PlatformAssistantIntent =
    (
      deterministicIntent === "HOW_TO" ||
      deterministicIntent === "DOCUMENTATION_SEARCH"
    ) && previousTopic === "visitor-auth"
      ? "VISITOR_AUTHENTICATION"
      : (
          (
            deterministicIntent === "HOW_TO" ||
            deterministicIntent === "DOCUMENTATION_SEARCH"
          ) && previousTopic === "partner-applications"
            ? "PARTNER_APPLICATIONS"
            : deterministicIntent
        );

  const intent: PlatformAssistantIntent =
    semantic?.needsClarification
      ? "CLARIFICATION_REQUIRED"
      : semantic?.intent || contextualIntent;

  const answer =
    await buildPlatformAnswerForIntent(
      input,
      cleanMessage,
      intent
    );

  if (
    semantic &&
    semantic.confidence >= 0.65 &&
    answer.confidence !== "none" &&
    intent !== "UNSUPPORTED_REQUEST" &&
    intent !== "CLARIFICATION_REQUIRED"
  ) {
    const groundedAnswer =
      await generateGroundedPlatformAssistantAnswer({
        input,
        semantic,
        fallbackAnswer:
          answer.answer
      });

    if (groundedAnswer) {
      return {
        ...answer,
        answer:
          groundedAnswer,
        intent:
          semantic.intent
      };
    }
  }

  return answer;
};

export const getPlatformAssistantDocs = () =>
  HelpCenterService.listArticles({
    fallbackOnFailure: true
  });

export const getPlatformAssistantDocumentation = ({
  locale,
  query
}: {
  locale?: string | null;
  query?: string | null;
} = {}) =>
  HelpCenterService.listArticles({
    locale,
    query,
    limit: 30
  }).then(docs =>
    docs.map(
      doc => ({
        id: doc.id,
        slug: doc.slug,
        title: doc.title,
        category: doc.category,
        summary: doc.summary,
        content: doc.content
          .replace(/\s+/g, " ")
          .trim(),
        keywords: doc.keywords,
        order: doc.order,
        score:
          "score" in doc
            ? doc.score
            : undefined
      })
    )
  );

export const getPlatformAssistantArticleBySlug = ({
  slug,
  locale
}: {
  slug: string;
  locale?: string | null;
}) =>
  HelpCenterService.getArticleBySlug(
    slug,
    {
      locale
    }
  );

export const searchPlatformAssistantDocumentation = ({
  query,
  locale,
  limit
}: {
  query: string;
  locale?: string | null;
  limit?: number;
}) =>
  HelpCenterService.retrieveRelevantArticles(
    query,
    locale,
    limit
  );
