// aiAssistant/index.ts

export { AssistantPanel } from "./AssistantPanel";
export type { AssistantSuggestion, AssistantResponse } from "./AssistantPanel";
export { findHeroBlock, findBlock, findTitleBlock, findTextBlock, findButtonBlock } from "./blockFinders";
export {
  getHeroStyleForCategory,
  getHeroTitleForCategory,
  getHeroTextForCategory,
  getHeroButtonForCategory,
} from "./heroPresets";
export type { HeroStyle } from "./heroPresets";