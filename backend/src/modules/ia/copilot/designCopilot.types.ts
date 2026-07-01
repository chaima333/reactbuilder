export type DesignActionType =
  | "CENTER_LAYOUT"
  | "IMPROVE_SPACING"
  | "IMPROVE_CARDS"
  | "IMPROVE_BUTTONS"
  | "IMPROVE_IMAGES"
  | "IMPROVE_FORMS"
  | "IMPROVE_STATS"
  | "APPLY_PROFILE";

export interface DesignAction {
  type: DesignActionType;
  target?: string;
  payload?: Record<string, any>;
}

export interface DesignSuggestion {
  id: string;
  title: string;
  description: string;
  actions: DesignAction[];
}

export interface DesignCopilotRequest {
  message: string;
  category?: string;
  pageType?: string;
  pageTitle?: string;
  slug?: string;
  blocks: any[];
}

export interface DesignCopilotResponse {
  reply: string;
  designProfile: string;
  suggestions: DesignSuggestion[];
}