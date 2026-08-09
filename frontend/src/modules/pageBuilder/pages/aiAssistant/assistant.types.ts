export type AssistantAction =
  | "IMPROVE_HERO"
  | "ADD_SERVICES"
  | "ADD_FAQ"
  | "ADD_CTA"
  | "ADD_TESTIMONIALS"
  | "ADD_PRICING";

export type AssistantSuggestion = {
  id: string;
  title: string;
  description: string;
  action: AssistantAction;
  payload?: any;
};

export type AssistantResponseKind =
  | "message"
  | "clarification"
  | "suggestions"
  | "action";

export type AssistantResponse = {
  kind?: AssistantResponseKind;
  intent?: string;
  message?: string;
  reply: string;
  category: string;
  suggestions?: AssistantSuggestion[];
};
