import type {
  SiteKnowledgeChunk
} from "./chunking.service";

export type RetrievedKnowledgeChunk =
  SiteKnowledgeChunk & {
    score: number;
    matchedTerms: string[];
  };

const STOP_WORDS = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "to",
  "of",
  "in",
  "on",
  "for",
  "with",
  "is",
  "are",
  "what",
  "how",
  "do",
  "does",
  "you",
  "your",
  "we",
  "our",
  "can",
  "me",
  "about"
]);

const normalize = (
  value: string
): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const tokenize = (
  value: string
): string[] =>
  normalize(value)
    .split(" ")
    .map(token => token.trim())
    .filter(token =>
      token.length >= 3 &&
      !STOP_WORDS.has(token)
    );

const unique = (
  values: string[]
): string[] =>
  Array.from(new Set(values));

const scoreChunk = (
  questionTerms: string[],
  chunk: SiteKnowledgeChunk
): RetrievedKnowledgeChunk | null => {
  const content =
    normalize(
      `${chunk.title} ${chunk.slug} ${chunk.content}`
    );

  const matchedTerms =
    questionTerms.filter(term =>
      content.includes(term)
    );

  if (matchedTerms.length === 0) {
    return null;
  }

  const exactScore =
    matchedTerms.length * 10;

  const titleBoost =
    matchedTerms.some(term =>
      normalize(chunk.title).includes(term)
    )
      ? 5
      : 0;

  const slugBoost =
    matchedTerms.some(term =>
      normalize(chunk.slug).includes(term)
    )
      ? 3
      : 0;

  const densityScore =
    matchedTerms.length /
    Math.max(questionTerms.length, 1);

  const score =
    exactScore +
    titleBoost +
    slugBoost +
    densityScore;

  return {
    ...chunk,
    score,
    matchedTerms
  };
};

export const retrieveRelevantChunks = (
  question: string,
  chunks: SiteKnowledgeChunk[],
  limit = 5
): RetrievedKnowledgeChunk[] => {
  const questionTerms =
    unique(tokenize(question));

  if (
    questionTerms.length === 0 ||
    chunks.length === 0
  ) {
    return [];
  }

  return chunks
    .map(chunk =>
      scoreChunk(questionTerms, chunk)
    )
    .filter(
      (
        result
      ): result is RetrievedKnowledgeChunk =>
        !!result
    )
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};