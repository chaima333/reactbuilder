import {
  extractPublishedSiteKnowledge
} from "./pageTextExtractor.service";

import {
  chunkSiteKnowledge
} from "./chunking.service";

import {
  retrieveRelevantChunks
} from "./keywordRetrieval.service";

export type ChatbotSource = {
  pageId: number;
  title: string;
  slug: string;
  chunkIndex: number;
  excerpt: string;
  score: number;
};

export type ChatbotAnswerResult = {
  answer: string;
  mode: "retrieval";
  sources: ChatbotSource[];
  confidence: "none" | "low" | "medium";
};

const normalizeQuestion = (
  question: string
): string =>
  question
    .replace(/\s+/g, " ")
    .trim();

const makeExcerpt = (
  content: string,
  maxLength = 260
): string => {
  const normalized =
    content
      .replace(/\s+/g, " ")
      .trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength).trim()}...`;
};

const buildRetrievalAnswer = (
  sources: ChatbotSource[]
): string => {
  if (sources.length === 0) {
    return (
      "I couldn't find a relevant answer in this website content."
    );
  }

  const sourceList =
    sources
      .slice(0, 3)
      .map(source =>
        `- ${source.title}: ${source.excerpt}`
      )
      .join("\n");

  return [
    "I found these relevant sections on this website:",
    sourceList
  ].join("\n");
};

export const answerSiteQuestion = async (
  siteId: number,
  question: string
): Promise<ChatbotAnswerResult> => {
  if (!Number.isInteger(siteId) || siteId <= 0) {
    throw new Error("INVALID_SITE_ID");
  }

  const cleanQuestion =
    normalizeQuestion(question || "");

  if (cleanQuestion.length < 3) {
    return {
      answer:
        "Please ask a more specific question about this website.",
      mode: "retrieval",
      sources: [],
      confidence: "none"
    };
  }

  if (cleanQuestion.length > 500) {
    throw new Error("QUESTION_TOO_LONG");
  }

  const knowledge =
    await extractPublishedSiteKnowledge(siteId);

  const chunked =
    chunkSiteKnowledge(knowledge);

  const retrieved =
    retrieveRelevantChunks(
      cleanQuestion,
      chunked.chunks,
      5
    );

  const sources: ChatbotSource[] =
    retrieved.map(chunk => ({
      pageId: chunk.pageId,
      title: chunk.title,
      slug: chunk.slug,
      chunkIndex: chunk.chunkIndex,
      excerpt: makeExcerpt(chunk.content),
      score: chunk.score
    }));

  const confidence =
    sources.length === 0
      ? "none"
      : sources[0].score >= 20
        ? "medium"
        : "low";

  return {
    answer: buildRetrievalAnswer(sources),
    mode: "retrieval",
    sources,
    confidence
  };
};