export type AssistantIntent =
  | "GREETING"
  | "GENERAL_CONVERSATION"
  | "BUILDER_HELP"
  | "PAGE_QUESTION"
  | "CLARIFICATION_REQUIRED"
  | "EDIT_SELECTED_BLOCK"
  | "EDIT_PAGE"
  | "CREATE_CONTENT"
  | "CREATE_PAGE"
  | "DESIGN_REQUEST"
  | "UNSUPPORTED_REQUEST"
  | "PAGE_ANALYSIS";

export type AssistantKind =
  | "message"
  | "clarification"
  | "suggestions"
  | "action";

export type AssistantIntentInput = {
  prompt: string;
  selectedBlockId?: string | null;
};

const normalizePrompt = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[-_'\u2019]/g, " ")
    .replace(/[?!.,;:]+/g, "")
    .replace(/\s+/g, " ")
    .trim();

const exactGreetings = new Set([
  "bonjour",
  "salut",
  "hello",
  "hi",
  "bonsoir"
]);

const exactConversation = new Set([
  "merci",
  "thanks",
  "thank you",
  "ok",
  "okay",
  "daccord",
  "d accord",
  "ca marche",
  "parfait"
]);

export const isObviousConversationalPrompt = (
  prompt: string
): boolean => {
  const normalized = normalizePrompt(prompt);

  return (
    exactGreetings.has(normalized) ||
    exactConversation.has(normalized) ||
    normalized === "que peux tu faire" ||
    normalized === "what can you do"
  );
};

export const classifyAssistantIntent = ({
  prompt,
  selectedBlockId
}: AssistantIntentInput): AssistantIntent => {
  const text = normalizePrompt(prompt);

  if (!text) {
    return "GENERAL_CONVERSATION";
  }

  if (exactGreetings.has(text)) {
    return "GREETING";
  }

  if (
    exactConversation.has(text) ||
    text.startsWith("merci ") ||
    text.startsWith("thanks ")
  ) {
    return "GENERAL_CONVERSATION";
  }

  if (
    text.includes("que peux tu faire") ||
    text.includes("what can you do") ||
    text.startsWith("comment ") ||
    text.startsWith("how ") ||
    text.includes("c est quoi") ||
    text.includes("a quoi sert") ||
    text.includes("help") ||
    text.includes("aide")
  ) {
    return "BUILDER_HELP";
  }

  if (
    text.includes("structure de cette page") ||
    text.includes("structure of this page") ||
    text.includes("combien de sections") ||
    text.includes("how many sections") ||
    text.includes("bloc est selectionne") ||
    text.includes("block is selected") ||
    text.includes("contient un formulaire") ||
    text.includes("contains a form")
  ) {
    return "PAGE_QUESTION";
  }

  const hasVagueReferent =
    text === "change ca" ||
    text === "change this" ||
    text === "modifie ca" ||
    text === "modifie ceci" ||
    text === "ameliore ca" ||
    text === "improve this";

  if (hasVagueReferent && !selectedBlockId) {
    return "CLARIFICATION_REQUIRED";
  }

  if (
    text.includes("cree une page") ||
    text.includes("create a page") ||
    text.includes("genere une landing page") ||
    text.includes("generate a landing page")
  ) {
    return "CREATE_PAGE";
  }

  if (
    text.includes("ajoute") ||
    text.includes("add ") ||
    text.includes("cree une section") ||
    text.includes("create a section")
  ) {
    return "CREATE_CONTENT";
  }

  if (
    text.includes("design") ||
    text.includes("style") ||
    text.includes("moderne") ||
    text.includes("modern") ||
    text.includes("navbar") ||
    text.includes("footer")
  ) {
    return "DESIGN_REQUEST";
  }

  if (
    selectedBlockId &&
    (
      text.includes("mets") ||
      text.includes("change") ||
      text.includes("modifie") ||
      text.includes("centre") ||
      text.includes("rends") ||
      text.includes("make ") ||
      text.includes("center ")
    )
  ) {
    return "EDIT_SELECTED_BLOCK";
  }

  if (
    text.includes("ameliore la page") ||
    text.includes("improve the page") ||
    text.includes("harmonise")
  ) {
    return "EDIT_PAGE";
  }

  if (
    text.includes("video call") ||
    text.includes("paiement") ||
    text.includes("payment") ||
    text.includes("ecommerce checkout")
  ) {
    return "UNSUPPORTED_REQUEST";
  }

  return "PAGE_ANALYSIS";
};

export const buildAssistantMessage = (
  intent: AssistantIntent,
  prompt: string
): string | null => {
  switch (intent) {
    case "GREETING":
      return "Bonjour ! Que souhaitez-vous creer ou modifier sur cette page ?";

    case "GENERAL_CONVERSATION":
      return "Avec plaisir. Je peux vous aider a analyser la page, suggerer des sections, generer une page, ou modifier un bloc selectionne.";

    case "BUILDER_HELP":
      return [
        "Aujourd'hui, je peux vous aider avec les fonctions deja presentes dans ReactBuilder : generation de pages, analyse de page, suggestions de sections, edition d'un bloc selectionne, Design Co-Pilot, blocs, responsive desktop/tablet/mobile, media, SEO, CMS, formulaires, import HTML/ZIP, Figma, publication et versions.",
        "Pour modifier la page, utilisez une demande explicite comme \"ajoute une FAQ\" ou selectionnez un bloc puis demandez sa modification."
      ].join(" ");

    case "PAGE_QUESTION":
      return null;

    case "CLARIFICATION_REQUIRED":
      return "Quel element souhaitez-vous modifier ?";

    case "CREATE_PAGE":
      return "Je peux generer une page avec le bouton Generate. Votre demande ressemble a une creation de page, donc je ne modifie rien depuis Ask.";

    case "CREATE_CONTENT":
      return null;

    case "DESIGN_REQUEST":
      return "Cette demande concerne le design. Utilisez l'onglet Co-Pilot pour obtenir des propositions appliquees avec validation.";

    case "EDIT_SELECTED_BLOCK":
      return "Cette demande cible le bloc selectionne. Utilisez Edit Block pour appliquer une modification valide au bloc selectionne.";

    case "EDIT_PAGE":
      return null;

    case "UNSUPPORTED_REQUEST":
      return `Je ne peux pas executer cette demande pour l'instant: "${prompt.trim()}". Je peux seulement utiliser les capacites actuellement implementees du builder.`;

    default:
      return null;
  }
};
