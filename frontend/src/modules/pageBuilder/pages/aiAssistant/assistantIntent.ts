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

const conversationalPrompts = new Set([
  "bonjour",
  "salut",
  "hello",
  "hi",
  "bonsoir",
  "merci",
  "thanks",
  "thank you",
  "ok",
  "okay",
  "daccord",
  "d accord",
  "que peux tu faire",
  "what can you do"
]);

const greetingPrompts = new Set([
  "bonjour",
  "salut",
  "hello",
  "hi",
  "bonsoir"
]);

export const isObviousConversationalPrompt = (
  prompt: string
) => conversationalPrompts.has(
  normalizePrompt(prompt)
);

export const getConversationalAssistantMessage = (
  prompt: string
) => {
  const normalized = normalizePrompt(prompt);

  if (greetingPrompts.has(normalized)) {
    return "Bonjour ! Que souhaitez-vous creer ou modifier sur cette page ?";
  }

  if (
    normalized === "que peux tu faire" ||
    normalized === "what can you do"
  ) {
    return "Je peux analyser la page, suggerer des sections, generer une page, aider avec le Design Co-Pilot, ou modifier un bloc selectionne.";
  }

  return "Avec plaisir. Je peux vous aider a creer, analyser ou modifier cette page.";
};
