import {
  normalizePlatformAssistantText
} from "./platformAssistant.intent";

export type HelpLocale =
  | "en"
  | "fr";

export type LocalizedText = {
  en: string;
  fr: string;
};

export type PlatformAssistantDoc = {
  id: string;
  slug: string;
  title: string;
  category: string;
  content: string;
  summary: string;
  keywords: string[];
  order: number;
  active: boolean;
  published: boolean;
};

export type HelpCategory = {
  id: string;
  slug: string;
  name: LocalizedText;
  description: LocalizedText;
  order: number;
  active: boolean;
};

export type HelpArticle = {
  id: string;
  slug: string;
  categoryId: string;
  title: LocalizedText;
  summary: LocalizedText;
  content: LocalizedText;
  keywords: string[];
  order: number;
  active: boolean;
  published: boolean;
};

export type HelpSearchResult = PlatformAssistantDoc & {
  score: number;
};

export const HELP_CATEGORIES: HelpCategory[] = [
  {
    id: "getting-started",
    slug: "getting-started",
    name: {
      en: "Getting Started",
      fr: "Bien démarrer"
    },
    description: {
      en: "Core ReactBuilder workflow and orientation.",
      fr: "Workflow principal et orientation dans ReactBuilder."
    },
    order: 10,
    active: true
  },
  {
    id: "sites-pages",
    slug: "sites-pages",
    name: {
      en: "Sites, pages and publishing",
      fr: "Sites, pages et publication"
    },
    description: {
      en: "Create sites, manage pages, preview and publish.",
      fr: "Créer des sites, gérer les pages, prévisualiser et publier."
    },
    order: 20,
    active: true
  },
  {
    id: "page-builder",
    slug: "page-builder",
    name: {
      en: "Page Builder",
      fr: "Page Builder"
    },
    description: {
      en: "Visual editing, blocks, structure tree and responsive modes.",
      fr: "Édition visuelle, blocs, arbre de structure et modes responsives."
    },
    order: 30,
    active: true
  },
  {
    id: "content",
    slug: "content",
    name: {
      en: "CMS, forms and media",
      fr: "CMS, formulaires et médias"
    },
    description: {
      en: "Structured content, public forms and media library.",
      fr: "Contenu structuré, formulaires publics et médiathèque."
    },
    order: 40,
    active: true
  },
  {
    id: "growth",
    slug: "growth",
    name: {
      en: "SEO, plugins and partners",
      fr: "SEO, plugins et partenaires"
    },
    description: {
      en: "SEO settings, marketplace plugins and partner applications.",
      fr: "Paramètres SEO, plugins du marketplace et candidatures partenaires."
    },
    order: 50,
    active: true
  },
  {
    id: "ai",
    slug: "ai",
    name: {
      en: "AI",
      fr: "IA"
    },
    description: {
      en: "Global Assistant, Page Builder AI and Design Copilot.",
      fr: "Assistant global, IA du Page Builder et Design Copilot."
    },
    order: 60,
    active: true
  },
  {
    id: "security",
    slug: "security",
    name: {
      en: "Roles and visitor accounts",
      fr: "Rôles et comptes visiteurs"
    },
    description: {
      en: "Platform users, site roles and public visitor authentication.",
      fr: "Utilisateurs plateforme, rôles de site et authentification des visiteurs."
    },
    order: 70,
    active: true
  },
  {
    id: "troubleshooting",
    slug: "troubleshooting",
    name: {
      en: "Troubleshooting",
      fr: "Dépannage"
    },
    description: {
      en: "Common issues and checks.",
      fr: "Problèmes courants et vérifications."
    },
    order: 80,
    active: true
  }
];

export const HELP_ARTICLES: HelpArticle[] = [
  {
    id: "getting-started",
    slug: "getting-started",
    categoryId: "getting-started",
    title: {
      en: "Getting started with ReactBuilder",
      fr: "Bien démarrer avec ReactBuilder"
    },
    summary: {
      en: "Understand the basic workflow: site, pages, builder, preview and publish.",
      fr: "Comprendre le workflow de base : site, pages, builder, aperçu et publication."
    },
    content: {
      en: "ReactBuilder is a SaaS platform for creating and managing websites. The usual workflow is to create a site, add pages, edit content with the visual Page Builder, preview the result and publish the page. Each site keeps its own pages, media, plugins, members and settings.",
      fr: "ReactBuilder est une plateforme SaaS de creation et de gestion de sites web. Le workflow habituel consiste a creer un site, ajouter des pages, modifier le contenu avec le Page Builder visuel, verifier l'apercu puis publier la page. Chaque site conserve ses propres pages, medias, plugins, membres et parametres."
    },
    keywords: ["start", "debut", "workflow", "site", "page", "publish", "publier"],
    order: 10,
    active: true,
    published: true
  },
  {
    id: "sites",
    slug: "sites",
    categoryId: "sites-pages",
    title: {
      en: "Creating and managing sites",
      fr: "Créer et gérer des sites"
    },
    summary: {
      en: "Create a site, define its identity and manage site-scoped workspace data.",
      fr: "Créer un site, définir son identité et gérer les données de son espace."
    },
    content: {
      en: "Open Sites to create a new site with a name, domain or subdomain and optional description. After creation, the site becomes a workspace with its own pages, media, plugins, members, dashboard and settings.",
      fr: "Ouvrez Sites pour creer un nouveau site avec un nom, un domaine ou sous-domaine et une description facultative. Apres creation, le site devient un espace de travail avec ses propres pages, medias, plugins, membres, tableau de bord et parametres."
    },
    keywords: ["sites", "workspace", "subdomain", "domaine", "sous domaine"],
    order: 20,
    active: true,
    published: true
  },
  {
    id: "pages-publishing",
    slug: "pages-publishing",
    categoryId: "sites-pages",
    title: {
      en: "Pages, preview and publishing",
      fr: "Pages, aperçu et publication"
    },
    summary: {
      en: "Save editable draft pages, preview them and publish when ready.",
      fr: "Enregistrer des brouillons éditables, les prévisualiser puis publier."
    },
    content: {
      en: "A page can be edited in the visual builder and saved as editable blocks. Draft pages stay private in the dashboard. Published pages become visible in the public renderer. Preview helps verify content, spacing and responsive behavior before publishing.",
      fr: "Une page peut etre modifiee dans le builder visuel puis enregistree sous forme de blocs editables. Les brouillons restent prives dans le tableau de bord. Les pages publiees deviennent visibles dans le rendu public. L'apercu permet de verifier le contenu, l'espacement et le comportement responsive avant publication."
    },
    keywords: ["page", "pages", "publish", "publier", "preview", "apercu", "draft", "brouillon"],
    order: 30,
    active: true,
    published: true
  },
  {
    id: "page-builder-blocks",
    slug: "page-builder-blocks",
    categoryId: "page-builder",
    title: {
      en: "Visual builder, blocks and structure tree",
      fr: "Builder visuel, blocs et arbre de structure"
    },
    summary: {
      en: "Build pages with editable blocks, drag and drop and structure controls.",
      fr: "Construire des pages avec des blocs éditables, le glisser-déposer et l'arbre de structure."
    },
    content: {
      en: "The Page Builder uses editable blocks such as sections, containers, text, images, buttons, cards, navbars, footers and semantic blocks. Users can drag and drop blocks into compatible areas and use the structure tree to inspect or reorganize the page. Desktop, tablet and mobile modes help check responsive layouts.",
      fr: "Le Page Builder utilise des blocs editables : sections, conteneurs, texte, images, boutons, cartes, navbars, footers et blocs semantiques. Les utilisateurs peuvent glisser-deposer des blocs dans des zones compatibles et utiliser l'arbre de structure pour inspecter ou reorganiser la page. Les modes desktop, tablette et mobile aident a verifier le responsive."
    },
    keywords: ["builder", "blocks", "blocs", "drag", "drop", "glisser", "deposer", "structure", "responsive"],
    order: 40,
    active: true,
    published: true
  },
  {
    id: "cms",
    slug: "cms",
    categoryId: "content",
    title: {
      en: "CMS collections and dynamic content",
      fr: "Collections CMS et contenu dynamique"
    },
    summary: {
      en: "Use collections, fields and entries to drive page content.",
      fr: "Utiliser les collections, champs et entrées pour alimenter les pages."
    },
    content: {
      en: "The CMS stores structured content per site. Create a collection, define fields, add entries, then bind page blocks to CMS data or render collection lists. This lets content change without rebuilding the whole page layout.",
      fr: "Le CMS stocke du contenu structure par site. Creez une collection, definissez ses champs, ajoutez des entrees, puis liez des blocs de page aux donnees CMS ou affichez des listes de collections. Cela permet de changer le contenu sans reconstruire toute la mise en page."
    },
    keywords: ["cms", "collection", "collections", "field", "fields", "champs", "entries", "entrees", "binding"],
    order: 50,
    active: true,
    published: true
  },
  {
    id: "forms",
    slug: "forms",
    categoryId: "content",
    title: {
      en: "Forms and submissions",
      fr: "Formulaires et soumissions"
    },
    summary: {
      en: "Create forms, link them to Form blocks and review submissions.",
      fr: "Créer des formulaires, les lier aux blocs Form et consulter les soumissions."
    },
    content: {
      en: "Open Forms, create a form, configure its fields, add a Form block to a page and select the form. Visitors submit the form on the public site. Submissions are visible in Forms for the current site.",
      fr: "Ouvrez Forms, creez un formulaire, configurez ses champs, ajoutez un bloc Form a une page puis selectionnez le formulaire. Les visiteurs envoient le formulaire depuis le site public. Les soumissions sont visibles dans Forms pour le site courant."
    },
    keywords: ["forms", "form", "formulaire", "formulaires", "submission", "soumission", "soumissions", "contact"],
    order: 60,
    active: true,
    published: true
  },
  {
    id: "media-library",
    slug: "media-library",
    categoryId: "content",
    title: {
      en: "Media Library",
      fr: "Médiathèque"
    },
    summary: {
      en: "Upload, reuse and manage images and files for a site.",
      fr: "Téléverser, réutiliser et gérer les images et fichiers d'un site."
    },
    content: {
      en: "The Media Library stores images and files used inside a site. Users with the right permissions can upload, list, update or delete media and reuse them in page blocks.",
      fr: "La Mediatheque stocke les images et fichiers utilises dans un site. Les utilisateurs ayant les bonnes permissions peuvent televerser, lister, modifier ou supprimer les medias et les reutiliser dans les blocs de page."
    },
    keywords: ["media", "mediatheque", "image", "images", "upload", "televerser", "file", "fichier"],
    order: 70,
    active: true,
    published: true
  },
  {
    id: "seo-settings",
    slug: "seo-settings",
    categoryId: "growth",
    title: {
      en: "SEO settings",
      fr: "Paramètres SEO"
    },
    summary: {
      en: "Configure page metadata to improve search result presentation.",
      fr: "Configurer les métadonnées de page pour améliorer l'affichage dans les moteurs de recherche."
    },
    content: {
      en: "SEO settings define metadata such as the page title, description, keywords and slug. Good metadata helps search engines and users understand the page. SEO can also be extended through marketplace plugins.",
      fr: "Les parametres SEO definissent les metadonnees comme le titre de page, la description, les mots-cles et le slug. De bonnes metadonnees aident les moteurs de recherche et les utilisateurs a comprendre la page. Le SEO peut aussi etre etendu avec des plugins du marketplace."
    },
    keywords: ["seo", "metadata", "metadonnees", "title", "description", "keywords", "slug", "referencement"],
    order: 80,
    active: true,
    published: true
  },
  {
    id: "imports-html-zip",
    slug: "imports-html-zip",
    categoryId: "sites-pages",
    title: {
      en: "HTML and ZIP import",
      fr: "Import HTML et ZIP"
    },
    summary: {
      en: "Import existing HTML or ZIP websites into editable ReactBuilder blocks.",
      fr: "Importer des sites HTML ou ZIP existants en blocs éditables ReactBuilder."
    },
    content: {
      en: "ReactBuilder supports HTML and ZIP website import. Imported structures are converted into editable blocks where possible, so the page remains manageable in the visual builder after import.",
      fr: "ReactBuilder prend en charge l'import de sites HTML et ZIP. Les structures importees sont converties en blocs editables lorsque c'est possible, afin que la page reste gerable dans le builder visuel apres l'import."
    },
    keywords: ["import", "html", "zip", "website import", "importer", "archive"],
    order: 90,
    active: true,
    published: true
  },
  {
    id: "static-export",
    slug: "static-export",
    categoryId: "sites-pages",
    title: {
      en: "Static export",
      fr: "Export statique"
    },
    summary: {
      en: "Export published site output when static export is available.",
      fr: "Exporter le rendu publié du site lorsque l'export statique est disponible."
    },
    content: {
      en: "Static export endpoints and block export checks are implemented. Export safety depends on whether the blocks used by the site are supported by the static runtime.",
      fr: "Les routes d'export statique et les controles de compatibilite des blocs sont implementes. La securite de l'export depend de la prise en charge des blocs du site par le runtime statique."
    },
    keywords: ["export", "static", "statique", "download", "telecharger"],
    order: 100,
    active: true,
    published: true
  },
  {
    id: "visitor-authentication",
    slug: "visitor-authentication",
    categoryId: "security",
    title: {
      en: "Visitor Authentication and Login/Register pages",
      fr: "Authentification visiteurs et pages Login/Register"
    },
    summary: {
      en: "Let public site visitors register and log in with accounts separate from ReactBuilder users.",
      fr: "Permettre aux visiteurs du site public de s'inscrire et se connecter avec des comptes séparés."
    },
    content: {
      en: "Login and Register pages are for visitors of the public site, not ReactBuilder platform users. Visitor accounts are separate from platform accounts. Add Visitor Login or Visitor Register blocks to public pages so visitors can register or log in on the generated site.",
      fr: "Les pages Login et Register sont destinees aux visiteurs du site public, pas aux utilisateurs de la plateforme ReactBuilder. Les comptes visiteurs sont separes des comptes plateforme. Ajoutez des blocs Visitor Login ou Visitor Register aux pages publiques pour permettre aux visiteurs de s'inscrire ou de se connecter sur le site genere."
    },
    keywords: ["visitor", "visiteur", "login", "register", "connexion", "inscription", "authentification", "compte"],
    order: 110,
    active: true,
    published: true
  },
  {
    id: "partner-applications",
    slug: "partner-applications",
    categoryId: "growth",
    title: {
      en: "Partner Applications and Become Partner buttons",
      fr: "Candidatures partenaires et boutons Devenir partenaire"
    },
    summary: {
      en: "Use Button or Link blocks to send visitors to the current site's partner form.",
      fr: "Utiliser les blocs Button ou Link pour envoyer les visiteurs vers le formulaire partenaire du site courant."
    },
    content: {
      en: "Partner Applications are supported per site. Button and Link blocks can use the Become Partner action. ReactBuilder generates the correct link for the current site automatically. Submitted applications are reviewed in the site's Partner Applications module.",
      fr: "Les candidatures partenaires sont prises en charge par site. Les blocs Button et Link peuvent utiliser l'action Devenir partenaire. ReactBuilder genere automatiquement le lien correspondant au site courant. Les candidatures recues sont consultees dans le module Partner Applications du site."
    },
    keywords: ["partner", "partenaire", "devenir partenaire", "application", "candidature", "button", "bouton", "link", "lien"],
    order: 120,
    active: true,
    published: true
  },
  {
    id: "plugins-marketplace",
    slug: "plugins-marketplace",
    categoryId: "growth",
    title: {
      en: "Marketplace and plugins",
      fr: "Marketplace et plugins"
    },
    summary: {
      en: "Install, enable, disable or uninstall site-scoped plugins.",
      fr: "Installer, activer, désactiver ou désinstaller des plugins par site."
    },
    content: {
      en: "The plugin marketplace adds optional site features such as chatbot, forms, SEO tools, analytics or dashboard widgets. A plugin must be installed and enabled for a specific site before its public feature appears.",
      fr: "Le marketplace de plugins ajoute des fonctionnalites optionnelles par site, comme le chatbot, les formulaires, les outils SEO, l'analytique ou les widgets de tableau de bord. Un plugin doit etre installe et active pour un site precis avant que sa fonctionnalite publique apparaisse."
    },
    keywords: ["plugin", "plugins", "marketplace", "install", "enable", "activer", "chatbot"],
    order: 130,
    active: true,
    published: true
  },
  {
    id: "ai-features",
    slug: "ai-features",
    categoryId: "ai",
    title: {
      en: "Global Assistant, Page Builder AI and Design Copilot",
      fr: "Assistant global, IA du Page Builder et Design Copilot"
    },
    summary: {
      en: "Understand which AI assistant helps with product guidance and which one changes pages.",
      fr: "Comprendre quel assistant IA guide l'utilisateur et lequel agit sur les pages."
    },
    content: {
      en: "The Global Assistant answers questions about ReactBuilder and is read-only. Page Builder AI works inside the page editor to generate pages, edit selected blocks and suggest design improvements. Design Copilot analyzes a page and proposes reviewable design actions.",
      fr: "L'Assistant global repond aux questions sur ReactBuilder et fonctionne en lecture seule. L'IA du Page Builder agit dans l'editeur de page pour generer des pages, modifier des blocs selectionnes et proposer des ameliorations de design. Design Copilot analyse une page et propose des actions de design a valider."
    },
    keywords: ["ai", "ia", "assistant", "global assistant", "page builder ai", "design copilot"],
    order: 140,
    active: true,
    published: true
  },
  {
    id: "roles-permissions",
    slug: "roles-permissions",
    categoryId: "security",
    title: {
      en: "Users, roles and permissions",
      fr: "Utilisateurs, rôles et permissions"
    },
    summary: {
      en: "Separate platform roles from site roles and permissions.",
      fr: "Distinguer les rôles plateforme, les rôles de site et les permissions."
    },
    content: {
      en: "ReactBuilder uses platform users and site members. Platform roles control global access, while site roles such as owner, admin, editor or viewer control what a member can do inside a specific site. Permissions protect site pages, media, plugins and settings.",
      fr: "ReactBuilder utilise des utilisateurs plateforme et des membres de site. Les roles plateforme controlent l'acces global, tandis que les roles de site comme owner, admin, editor ou viewer controlent ce qu'un membre peut faire dans un site precis. Les permissions protegent les pages, medias, plugins et parametres du site."
    },
    keywords: ["role", "roles", "permission", "permissions", "owner", "admin", "editor", "viewer", "utilisateur"],
    order: 150,
    active: true,
    published: true
  },
  {
    id: "dashboard",
    slug: "dashboard",
    categoryId: "getting-started",
    title: {
      en: "Dashboard",
      fr: "Tableau de bord"
    },
    summary: {
      en: "Use dashboard widgets to monitor site activity and key data.",
      fr: "Utiliser les widgets du tableau de bord pour suivre l'activité et les données du site."
    },
    content: {
      en: "The dashboard gives a site-oriented overview with widgets for activity, analytics, media, SEO, notifications and versions when those modules are available.",
      fr: "Le tableau de bord donne une vue d'ensemble orientee site, avec des widgets pour l'activite, l'analytique, les medias, le SEO, les notifications et les versions lorsque ces modules sont disponibles."
    },
    keywords: ["dashboard", "tableau de bord", "widget", "analytics", "activity", "activite"],
    order: 160,
    active: true,
    published: true
  },
  {
    id: "troubleshooting",
    slug: "troubleshooting",
    categoryId: "troubleshooting",
    title: {
      en: "Common troubleshooting checks",
      fr: "Vérifications de dépannage courantes"
    },
    summary: {
      en: "Check publication, permissions, plugin status, form links and deployment state.",
      fr: "Vérifier la publication, les permissions, les plugins, les liens de formulaire et l'état du déploiement."
    },
    content: {
      en: "If a page is not visible publicly, check that it is published. If a plugin feature is missing, check that the plugin is installed and enabled for the site. If a form receives no submissions, check that the form is active and linked to the correct Form block. If a recent change is missing, verify the latest deployment.",
      fr: "Si une page n'est pas visible publiquement, verifiez qu'elle est publiee. Si une fonctionnalite de plugin manque, verifiez que le plugin est installe et active pour le site. Si un formulaire ne recoit aucune soumission, verifiez que le formulaire est actif et lie au bon bloc Form. Si un changement recent manque, verifiez le dernier deploiement."
    },
    keywords: ["troubleshooting", "depannage", "erreur", "error", "plugin", "publish", "form", "deployment"],
    order: 170,
    active: true,
    published: true
  }
];

const localeFrom = (
  locale?: string | null
): HelpLocale =>
  String(locale || "")
    .toLowerCase()
    .startsWith("fr")
    ? "fr"
    : "en";

const categoryById = new Map(
  HELP_CATEGORIES.map(category => [
    category.id,
    category
  ])
);

const normalizeSearchText = (
  value: string
) =>
  normalizePlatformAssistantText(value)
    .replace(/\bforms?\b/g, " formulaire formulaires forms ")
    .replace(/\bformulaires?\b/g, " formulaire formulaires forms ")
    .replace(/\blogin\b/g, " login connexion authentification ")
    .replace(/\bconnexion\b/g, " login connexion authentification ")
    .replace(/\bauthentification\b/g, " login connexion authentification ")
    .replace(/\bpartner\b/g, " partner partenaire ")
    .replace(/\bpartenaire\b/g, " partner partenaire ")
    .replace(/\bvisiteurs?\b/g, " visitor visiteur visiteurs ")
    .replace(/\bvisitors?\b/g, " visitor visiteur visiteurs ")
    .replace(/\s+/g, " ")
    .trim();

const HELP_SEARCH_STOP_WORDS =
  new Set([
    "how",
    "do",
    "does",
    "can",
    "with",
    "for",
    "the",
    "about",
    "configure",
    "configurer",
    "comment",
    "est",
    "ce",
    "que",
    "dans",
    "avec",
    "pour",
    "mon",
    "ma",
    "mes"
  ]);

const tokenizeHelpSearch = (
  value: string
) =>
  normalizeSearchText(value)
    .split(" ")
    .filter(token =>
      token.length >= 2 &&
      !HELP_SEARCH_STOP_WORDS.has(token)
    );

const localizeArticle = (
  article: HelpArticle,
  locale?: string | null
): PlatformAssistantDoc => {
  const lang =
    localeFrom(locale);
  const category =
    categoryById.get(article.categoryId);

  return {
    id: article.id,
    slug: article.slug,
    title: article.title[lang],
    category:
      category?.name[lang] ||
      article.categoryId,
    summary: article.summary[lang],
    content: article.content[lang],
    keywords: article.keywords,
    order: article.order,
    active: article.active,
    published: article.published
  };
};

export const getHelpCategories = (
  locale?: string | null
) => {
  const lang =
    localeFrom(locale);

  return HELP_CATEGORIES
    .filter(category => category.active)
    .sort((a, b) => a.order - b.order)
    .map(category => ({
      id: category.id,
      slug: category.slug,
      name: category.name[lang],
      description: category.description[lang],
      order: category.order,
      active: category.active
    }));
};

export const getHelpArticles = (
  locale?: string | null,
  options: {
    includeUnpublished?: boolean;
  } = {}
) =>
  HELP_ARTICLES
    .filter(article =>
      article.active &&
      (
        options.includeUnpublished ||
        article.published
      )
    )
    .sort((a, b) => a.order - b.order)
    .map(article =>
      localizeArticle(
        article,
        locale
      )
    );

const scoreArticle = (
  article: PlatformAssistantDoc,
  queryTokens: string[]
) => {
  const title = normalizeSearchText(article.title);
  const category = normalizeSearchText(article.category);
  const summary = normalizeSearchText(article.summary);
  const content = normalizeSearchText(article.content);
  const keywords = normalizeSearchText(article.keywords.join(" "));

  const haystack = `${title} ${category} ${summary} ${content} ${keywords}`;

  let score = 0;

  for (const token of queryTokens) {
    const exactToken = token.trim();

    if (!exactToken) continue;

    // Strongest signal: article title
    if (title.includes(exactToken)) {
      score += 40;
    }

    // Category is highly relevant
    if (category.includes(exactToken)) {
      score += 24;
    }

    // Keywords are explicit search signals
    if (keywords.includes(exactToken)) {
      score += 22;
    }

    // Summary is more relevant than body content
    if (summary.includes(exactToken)) {
      score += 14;
    }

    // Body content
    if (content.includes(exactToken)) {
      score += 4;
    }
  }

  // Reward articles matching several query concepts.
  const matchedTokens = queryTokens.filter(token =>
    haystack.includes(token)
  ).length;

  if (matchedTokens >= 2) {
    score += matchedTokens * 12;
  }

  if (matchedTokens >= 3) {
    score += 20;
  }

  // Strong semantic aliases for the most important ReactBuilder concepts.
  const normalizedQuery = queryTokens.join(" ");

  if (
    normalizedQuery.includes("login") ||
    normalizedQuery.includes("connexion") ||
    normalizedQuery.includes("authentification") ||
    normalizedQuery.includes("register") ||
    normalizedQuery.includes("inscription")
  ) {
    if (
      article.id === "visitor-authentication" ||
      article.slug === "visitor-authentication"
    ) {
      score += 80;
    }
  }

  if (
    normalizedQuery.includes("form") ||
    normalizedQuery.includes("formulaire") ||
    normalizedQuery.includes("contact")
  ) {
    if (article.id === "forms" || article.slug === "forms") {
      score += 70;
    }
  }

  if (
    normalizedQuery.includes("partner") ||
    normalizedQuery.includes("partenaire") ||
    normalizedQuery.includes("devenir")
  ) {
    if (
      article.id === "partner-applications" ||
      article.slug === "partner-applications"
    ) {
      score += 70;
    }
  }

  if (
    normalizedQuery.includes("cms") ||
    normalizedQuery.includes("collection") ||
    normalizedQuery.includes("collections") ||
    normalizedQuery.includes("entree") ||
    normalizedQuery.includes("entries")
  ) {
    if (article.id === "cms" || article.slug === "cms") {
      score += 70;
    }
  }

  if (
    normalizedQuery.includes("builder") ||
    normalizedQuery.includes("bloc") ||
    normalizedQuery.includes("blocs") ||
    normalizedQuery.includes("drag") ||
    normalizedQuery.includes("structure")
  ) {
    if (
      article.id === "page-builder-blocks" ||
      article.slug === "page-builder-blocks"
    ) {
      score += 70;
    }
  }

  return score;
};
export const rankHelpDocuments = (
  docs: PlatformAssistantDoc[],
  query: string,
  limit = 12
): HelpSearchResult[] => {
  const tokens =
    tokenizeHelpSearch(query);

  if (!tokens.length) {
    return docs
      .slice(0, limit)
      .map(article => ({
        ...article,
        score: 0
      }));
  }

  return docs
    .map(article => ({
      ...article,
      score:
        scoreArticle(
          article,
          tokens
        )
    }))
    .filter(article => article.score >= 10)
    .sort((a, b) =>
      b.score - a.score ||
      a.order - b.order
    )
    .slice(0, limit);
};

export const searchHelpArticles = (
  query: string,
  locale?: string | null,
  limit = 12
): HelpSearchResult[] => {
  return rankHelpDocuments(
    getHelpArticles(locale),
    query,
    limit
  );
};

export const findHelpArticleBySlug = (
  slug: string,
  locale?: string | null
) =>
  getHelpArticles(locale)
    .find(article => article.slug === slug) ||
  null;

export const retrieveRelevantHelpArticles = (
  query: string,
  locale?: string | null,
  limit = 4
) =>
  searchHelpArticles(
    query,
    locale,
    limit
  );

export const PLATFORM_ASSISTANT_DOCS: PlatformAssistantDoc[] =
  getHelpArticles("en");
