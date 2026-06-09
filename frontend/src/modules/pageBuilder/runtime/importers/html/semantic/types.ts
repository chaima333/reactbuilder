// semantic.types.ts

export interface SemanticMatchResult {

  matched: boolean;

  score: number;

  reason?: string[];
}