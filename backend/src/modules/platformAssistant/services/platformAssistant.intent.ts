export type PlatformAssistantIntent =
  | "GREETING"
  | "GENERAL_CONVERSATION"
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

  if (
    text.includes("que peux tu faire") ||
    text.includes("what can you do") ||
    text.includes("qu est ce que reactbuilder") ||
    text.includes("what is reactbuilder") ||
    text.includes("modules existent") ||
    text.includes("modules exist")
  ) {
    return "PLATFORM_HELP";
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
    text.includes("checkout ecommerce") ||
    text.includes("payment processor")
  ) {
    return "UNSUPPORTED_REQUEST";
  }

  return "DOCUMENTATION_SEARCH";
};
