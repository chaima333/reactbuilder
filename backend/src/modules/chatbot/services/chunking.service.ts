import type {
  PublishedSiteKnowledge,
  PublishedSiteKnowledgePage
} from "./pageTextExtractor.service";

const MIN_CHUNK_LENGTH = 80;
const TARGET_CHUNK_LENGTH = 760;
const MAX_CHUNK_LENGTH = 900;

export type SiteKnowledgeChunk = {
  siteId: number;
  pageId: number;
  title: string;
  slug: string;
  chunkIndex: number;
  content: string;
};

export type ChunkedSiteKnowledge = {
  siteId: number;
  chunks: SiteKnowledgeChunk[];
};

const normalizeWhitespace = (
  value: string
): string =>
  value
    .replace(/\s+/g, " ")
    .trim();

const splitIntoSentences = (
  text: string
): string[] =>
  text
    .split(/(?<=[.!?])\s+/)
    .map(normalizeWhitespace)
    .filter(Boolean);

const splitLongText = (
  text: string
): string[] => {
  const normalized =
    normalizeWhitespace(text);

  if (
    normalized.length <=
    MAX_CHUNK_LENGTH
  ) {
    return [normalized];
  }

  const words =
    normalized.split(/\s+/);

  const chunks: string[] = [];
  let current: string[] = [];

  for (const word of words) {
    const next =
      [...current, word].join(" ");

    if (
      next.length >
      TARGET_CHUNK_LENGTH &&
      current.length > 0
    ) {
      chunks.push(
        current.join(" ")
      );

      current = [word];
    } else {
      current.push(word);
    }
  }

  if (current.length > 0) {
    chunks.push(
      current.join(" ")
    );
  }

  return chunks;
};

const buildPageChunks = (
  page: PublishedSiteKnowledgePage
): string[] => {
  const text =
    normalizeWhitespace(page.text || "");

  if (!text) {
    return [];
  }

  if (
    text.length <=
    MAX_CHUNK_LENGTH
  ) {
    return [text];
  }

  const sentences =
    splitIntoSentences(text);

  if (sentences.length <= 1) {
    return splitLongText(text);
  }

  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    const candidate =
      current
        ? `${current} ${sentence}`
        : sentence;

    if (
      candidate.length >
      MAX_CHUNK_LENGTH &&
      current.length >=
        MIN_CHUNK_LENGTH
    ) {
      chunks.push(current);
      current = sentence;
      continue;
    }

    current = candidate;

    if (
      current.length >=
      TARGET_CHUNK_LENGTH
    ) {
      chunks.push(current);
      current = "";
    }
  }

  if (current) {
    if (
      current.length <
        MIN_CHUNK_LENGTH &&
      chunks.length > 0
    ) {
      const previous =
        chunks.pop() || "";

      const merged =
        normalizeWhitespace(
          `${previous} ${current}`
        );

      if (
        merged.length <=
        MAX_CHUNK_LENGTH
      ) {
        chunks.push(merged);
      } else {
        chunks.push(previous);
        chunks.push(current);
      }
    } else {
      chunks.push(current);
    }
  }

  return chunks.flatMap(chunk =>
    chunk.length > MAX_CHUNK_LENGTH
      ? splitLongText(chunk)
      : [chunk]
  );
};

export const chunkSiteKnowledge = (
  knowledge: PublishedSiteKnowledge
): ChunkedSiteKnowledge => {
  if (
    !Number.isInteger(knowledge.siteId) ||
    knowledge.siteId <= 0
  ) {
    throw new Error("INVALID_SITE_ID");
  }

  const chunks: SiteKnowledgeChunk[] =
    knowledge.pages.flatMap(page => {
      const pageChunks =
        buildPageChunks(page);

      return pageChunks.map(
        (content, index) => ({
          siteId: knowledge.siteId,
          pageId: page.pageId,
          title: page.title,
          slug: page.slug,
          chunkIndex: index,
          content
        })
      );
    });

  return {
    siteId: knowledge.siteId,
    chunks
  };
};