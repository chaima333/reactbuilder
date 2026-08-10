export type PlatformAssistantIntent =
  | "GREETING"
  | "GENERAL_CONVERSATION"
  | "PRODUCT_DESCRIPTION"
  | "ASSISTANT_CAPABILITIES"
  | "MODULE_LIST"
  | "VISITOR_AUTHENTICATION"
  | "FORMS"
  | "PARTNER_APPLICATIONS"
  | "DYNAMIC_SITE_CAPABILITIES"
  | "PLATFORM_HELP"
  | "FEATURE_EXPLANATION"
  | "HOW_TO"
  | "TROUBLESHOOTING"
  | "ROLE_PERMISSION_QUESTION"
  | "CURRENT_CONTEXT_QUESTION"
  | "DOCUMENTATION_SEARCH"
  | "CLARIFICATION_REQUIRED"
  | "UNSUPPORTED_REQUEST";

export const normalizePlatformAssistantText = (
  value: string
) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[-_'\u2019]/g, " ")
    .replace(/[?!.,;:]+/g, "")
    .replace(/\s+/g, " ")
    .trim();

const greetings = new Set([
  "bonjour",
  "salut",
  "hello",
  "hi",
  "bonsoir"
]);

const conversation = new Set([
  "merci",
  "thanks",
  "thank you",
  "ok",
  "okay",
  "daccord",
  "d accord",
  "ca marche"
]);

const hasAny = (
  text: string,
  terms: string[]
) =>
  terms.some(term =>
    text.includes(term)
  );

export const isGreeting = (
  message: string
) => greetings.has(
  normalizePlatformAssistantText(message)
);

export const classifyPlatformAssistantIntent = (
  message: string
): PlatformAssistantIntent => {
  const text =
    normalizePlatformAssistantText(message);

  if (greetings.has(text)) {
    return "GREETING";
  }

  if (conversation.has(text)) {
    return "GENERAL_CONVERSATION";
  }

  if (
    text === "ca ne marche pas" ||
    text === "it does not work" ||
    text === "it doesnt work" ||
    text === "probleme" ||
    text === "problem"
  ) {
    return "CLARIFICATION_REQUIRED";
  }

  if (
    text.includes("ou suis je") ||
    text.includes("que puis je faire ici") ||
    text.includes("c est quoi cette page") ||
    text.includes("explique moi cette page") ||
    text.includes("where am i") ||
    text.includes("what can i do here")
  ) {
    return "CURRENT_CONTEXT_QUESTION";
  }

  if (
    text.includes("owner") ||
    text.includes("admin") ||
    text.includes("editor") ||
    text.includes("viewer") ||
    text.includes("role") ||
    text.includes("permission")
  ) {
    return "ROLE_PERMISSION_QUESTION";
  }

  if (
    text.includes("ne fonctionne pas") ||
    text.includes("je ne peux pas") ||
    text.includes("why") ||
    text.includes("pourquoi") ||
    text.includes("troubleshoot") ||
    text.includes("erreur") ||
    text.includes("error")
  ) {
    return "TROUBLESHOOTING";
  }

  const mentionsVisitorAuth =
    hasAny(text, [
      "visiteur",
      "visitor",
      "client",
      "clients",
      "compte visiteur",
      "site public",
      "generated site",
      "site genere"
    ]) &&
    hasAny(text, [
      "login",
      "register",
      "connexion",
      "inscription",
      "authentification",
      "authentication",
      "compte",
      "espace membre",
      "membre",
      "membres",
      "session"
    ]);

  const mentionsSiteLogin =
    hasAny(text, [
      "page login",
      "page de login",
      "page connexion",
      "page de connexion"
    ]) &&
    hasAny(text, [
      "site",
      "reactbuilder"
    ]);

  const mentionsMemberArea =
    hasAny(text, [
      "espace membre",
      "espace client",
      "connexion sur mon site",
      "login register",
      "s inscrire",
      "sinscrire"
    ]);

  const asksAccountDistinction =
    hasAny(text, [
      "difference",
      "different"
    ]) &&
    hasAny(text, [
      "reactbuilder",
      "plateforme"
    ]) &&
    hasAny(text, [
      "visiteur",
      "visitor"
    ]);

  if (
    mentionsVisitorAuth ||
    mentionsSiteLogin ||
    mentionsMemberArea ||
    asksAccountDistinction
  ) {
    return "VISITOR_AUTHENTICATION";
  }

  if (
    hasAny(text, [
      "formulaire",
      "formulaires",
      "form ",
      "forms",
      "soumission",
      "soumissions",
      "message envoye",
      "messages envoyes",
      "reponse des visiteurs",
      "reponses des visiteurs",
      "formulaire de contact"
    ])
  ) {
    return "FORMS";
  }

  if (
    hasAny(text, [
      "devenir partenaire",
      "partner application",
      "partner applications",
      "partner apply",
      "partner apply",
      "demande partenaire",
      "demandes partenaires",
      "formulaire partenaire",
      "siteid"
    ]) ||
    (
      hasAny(text, [
        "partenaire",
        "partner"
      ]) &&
      hasAny(text, [
        "bouton",
        "button",
        "link",
        "lien",
      "siteid",
      "demande",
      "demander",
      "formulaire"
      ])
    )
  ) {
    return "PARTNER_APPLICATIONS";
  }

  if (
    hasAny(text, [
      "site dynamique",
      "sites dynamiques",
      "dynamic site",
      "dynamic sites",
      "site statique",
      "static pages",
      "pages statiques",
      "limite a des pages statiques",
      "limited to static pages"
    ])
  ) {
    return "DYNAMIC_SITE_CAPABILITIES";
  }

  if (
    hasAny(text, [
      "contenu sans modifier",
      "articles dynamiquement",
      "afficher mes articles",
      "contenu dynamique"
    ])
  ) {
    return "FEATURE_EXPLANATION";
  }

  if (
    hasAny(text, [
      "utilisateur ne peut pas modifier",
      "ne peut pas modifier la page",
      "cannot edit the page"
    ])
  ) {
    return "ROLE_PERMISSION_QUESTION";
  }

  if (
    text.includes("que peux tu faire") ||
    text.includes("what can you do")
  ) {
    return "ASSISTANT_CAPABILITIES";
  }

  if (
    text.includes("qu est ce que reactbuilder") ||
    text.includes("what is reactbuilder")
  ) {
    return "PRODUCT_DESCRIPTION";
  }

  if (
    text.includes("quels sont les modules") ||
    text.includes("modules de reactbuilder") ||
    text.includes("modules existent") ||
    text.includes("modules exist")
  ) {
    return "MODULE_LIST";
  }

  if (
    text.startsWith("comment ") ||
    text.startsWith("how ") ||
    text.includes("comment creer") ||
    text.includes("comment ajouter") ||
    text.includes("comment importer") ||
    text.includes("comment publier") ||
    text.includes("comment exporter")
  ) {
    return "HOW_TO";
  }

  if (
    text.includes("a quoi sert") ||
    text.includes("c est quoi") ||
    text.includes("collection") ||
    text.includes("what is") ||
    text.includes("explain") ||
    text.includes("fonctionne")
  ) {
    return "FEATURE_EXPLANATION";
  }

  if (
    text.includes("native mobile") ||
    text.includes("application mobile native") ||
    text.includes("application android native") ||
    text.includes("app android native") ||
    text.includes("monter des videos") ||
    text.includes("montage video") ||
    text.includes("checkout ecommerce") ||
    text.includes("payment processor")
  ) {
    return "UNSUPPORTED_REQUEST";
  }

  return "DOCUMENTATION_SEARCH";
};
