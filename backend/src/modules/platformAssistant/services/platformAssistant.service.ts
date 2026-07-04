import {
  PLATFORM_ASSISTANT_DOCS,
  PlatformAssistantDoc
} from "./platformAssistant.docs";

type KnowledgeChunk = {
  docId: string;
  title: string;
  category: string;
  content: string;
  index: number;
};

export type PlatformAssistantSource = {
  docId: string;
  title: string;
  category: string;
  excerpt: string;
  score: number;
};

export type PlatformAssistantAnswer = {
  answer: string;
  sources: PlatformAssistantSource[];
  confidence: "none" | "low" | "medium";
};

const STOP_WORDS =
  new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "of",
    "to",
    "in",
    "on",
    "for",
    "with",
    "is",
    "are",
    "how",
    "what",
    "why",
    "can",
    "do",
    "does",
    "i",
    "you",
    "me",
    "my",
    "your",

    "comment",
    "quoi",
    "pourquoi",
    "dans",
    "avec",
    "pour",
    "est",
    "une",
    "des",
    "les",

    "كيفاش",
    "شنوة",
    "علاش",
    "انا",
    "نجم",
    "نحب"
  ]);

const normalizeText = (
  value: string
) =>
  value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

const tokenize = (
  value: string
) =>
  normalizeText(value)
    .split(" ")
    .filter(
      token =>
        token.length >= 3 &&
        !STOP_WORDS.has(token)
    );

const makeExcerpt = (
  content: string,
  maxLength = 220
) => {
  const clean =
    content
      .replace(/\s+/g, " ")
      .trim();

  if (clean.length <= maxLength) {
    return clean;
  }

  return `${clean.slice(0, maxLength)}...`;
};

const chunkDocument = (
  doc: PlatformAssistantDoc
): KnowledgeChunk[] => {
  const paragraphs =
    doc.content
      .split("\n")
      .map(item => item.trim())
      .filter(Boolean);

  return paragraphs.map(
    (paragraph, index) => ({
      docId: doc.id,
      title: doc.title,
      category: doc.category,
      content: paragraph,
      index
    })
  );
};

const getAllChunks = () =>
  PLATFORM_ASSISTANT_DOCS.flatMap(
    chunkDocument
  );

const scoreChunk = (
  questionTokens: string[],
  chunk: KnowledgeChunk
) => {
  const chunkText =
    `${chunk.title} ${chunk.category} ${chunk.content}`;

  const contentTokens =
    tokenize(chunkText);

  const contentSet =
    new Set(contentTokens);

  const matchedTokens =
    questionTokens.filter(
      token => contentSet.has(token)
    );

  let score =
    matchedTokens.length * 10;

  const normalizedTitle =
    normalizeText(chunk.title);

  const normalizedCategory =
    normalizeText(chunk.category);

  const normalizedContent =
    normalizeText(chunk.content);

  for (const token of questionTokens) {
    if (normalizedTitle.includes(token)) {
      score += 8;
    }

    if (normalizedCategory.includes(token)) {
      score += 5;
    }

    if (normalizedContent.includes(token)) {
      score += 2;
    }
  }

  return score;
};

export const answerPlatformQuestion = (
  message: string
): PlatformAssistantAnswer => {
  const cleanMessage =
    message?.trim();

  if (
    !cleanMessage ||
    cleanMessage.length < 3
  ) {
    return {
      answer:
        "Please ask a longer question about ReactBuilder.",
      sources: [],
      confidence: "none"
    };
  }

  const questionTokens =
    tokenize(cleanMessage);

  if (!questionTokens.length) {
    return {
      answer:
        "I need a more specific question about ReactBuilder.",
      sources: [],
      confidence: "none"
    };
  }

  const ranked =
    getAllChunks()
      .map(chunk => ({
        chunk,
        score:
          scoreChunk(
            questionTokens,
            chunk
          )
      }))
      .filter(item => item.score > 0)
      .sort(
        (a, b) =>
          b.score - a.score
      )
      .slice(0, 8);

  if (!ranked.length) {
    return {
      answer:
        "I could not find this information in the ReactBuilder help documentation yet.",
      sources: [],
      confidence: "none"
    };
  }

  const uniqueRanked =
    Array.from(
      new Map(
        ranked.map(item => [
          item.chunk.docId,
          item
        ])
      ).values()
    ).slice(0, 3);

  const sources =
    uniqueRanked.map(
      item => ({
        docId: item.chunk.docId,
        title: item.chunk.title,
        category: item.chunk.category,
        excerpt:
          makeExcerpt(
            item.chunk.content
          ),
        score: item.score
      })
    );

  const answer =
    [
      "I found this in the ReactBuilder documentation:",
      "",
      ...sources.map(
        source =>
          `- ${source.excerpt}`
      )
    ].join("\n");

  return {
    answer,
    sources,
    confidence:
      uniqueRanked[0]?.score >= 20
        ? "medium"
        : "low"
  };
};