import { Page } from "../../../models/page";

const READABLE_PROP_KEYS = new Set([
  "text",
  "content",
  "title",
  "label",
  "description",
  "question",
  "answer"
]);

const SEMANTIC_ARRAY_KEYS = new Set([
  "services",
  "faqs",
  "faq",
  "testimonials"
]);

const SEMANTIC_ITEM_KEYS = new Set([
  ...READABLE_PROP_KEYS,
  "quote",
  "author",
  "name",
  "role"
]);

const SHARED_BLOCK_TYPES = new Set([
  "navbar",
  "footer"
]);

type UnknownRecord = Record<string, unknown>;

export type PublishedSiteKnowledgePage = {
  pageId: number;
  title: string;
  slug: string;
  text: string;
};

export type PublishedSiteKnowledge = {
  siteId: number;
  pages: PublishedSiteKnowledgePage[];
};

const isRecord = (
  value: unknown
): value is UnknownRecord =>
  !!value &&
  typeof value === "object" &&
  !Array.isArray(value);

const normalizeWhitespace = (
  value: string
): string =>
  value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();

const readableString = (
  value: unknown
): string | null => {
  if (
    typeof value !== "string" &&
    typeof value !== "number"
  ) {
    return null;
  }

  const normalized = normalizeWhitespace(
    String(value).replace(/\|/g, " — ")
  );

  return normalized || null;
};

const extractSemanticItem = (
  value: unknown
): string[] => {
  const direct = readableString(value);

  if (direct) {
    return [direct];
  }

  if (Array.isArray(value)) {
    return value.flatMap(extractSemanticItem);
  }

  if (!isRecord(value)) {
    return [];
  }

  return Object.entries(value).flatMap(
    ([key, nestedValue]) => {
      if (SEMANTIC_ITEM_KEYS.has(key)) {
        const text = readableString(nestedValue);
        return text ? [text] : [];
      }

      if (
        SEMANTIC_ARRAY_KEYS.has(key) &&
        Array.isArray(nestedValue)
      ) {
        return nestedValue.flatMap(
          extractSemanticItem
        );
      }

      return [];
    }
  );
};

const isSemanticCollectionBlock = (
  block: UnknownRecord
): boolean => {
  const type = String(block.type || "")
    .toLowerCase();
  const id = String(block.id || "")
    .toLowerCase();
  const data = isRecord(block.data)
    ? block.data
    : {};
  const dataMeta = isRecord(data.meta)
    ? data.meta
    : {};
  const blockMeta = isRecord(block.meta)
    ? block.meta
    : {};
  const semanticType = String(
    dataMeta.semanticType ||
    blockMeta.semanticType ||
    ""
  ).toLowerCase();

  return [
    type,
    id,
    semanticType
  ].some(value =>
    value.includes("service") ||
    value.includes("faq") ||
    value.includes("testimonial")
  );
};

const isSharedBlock = (
  block: UnknownRecord
): boolean => {
  const type = String(block.type || "")
    .toLowerCase();

  if (SHARED_BLOCK_TYPES.has(type)) {
    return true;
  }

  const id = String(block.id || "")
    .toLowerCase();
  const data = isRecord(block.data)
    ? block.data
    : {};
  const dataMeta = isRecord(data.meta)
    ? data.meta
    : {};
  const blockMeta = isRecord(block.meta)
    ? block.meta
    : {};
  const semanticType = String(
    dataMeta.semanticType ||
    blockMeta.semanticType ||
    ""
  ).toLowerCase();

  return (
    id.includes("navbar") ||
    id.includes("footer") ||
    semanticType.includes("navbar") ||
    semanticType.includes("footer")
  );
};

const extractProps = (
  props: UnknownRecord,
  semanticCollection: boolean
): string[] =>
  Object.entries(props).flatMap(
    ([key, value]) => {
      if (
        key === "semantic" &&
        isRecord(value)
      ) {
        return extractSemanticItem(value);
      }

      if (READABLE_PROP_KEYS.has(key)) {
        const direct =
          readableString(value);

        if (direct) {
          return [direct];
        }

        return extractSemanticItem(value);
      }

      if (
        SEMANTIC_ARRAY_KEYS.has(key) &&
        Array.isArray(value)
      ) {
        return value.flatMap(
          extractSemanticItem
        );
      }

      if (
        semanticCollection &&
        key === "items" &&
        Array.isArray(value)
      ) {
        return value.flatMap(
          extractSemanticItem
        );
      }

      return [];
    }
  );

const parseBlocks = (
  value: unknown
): unknown[] => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    try {
      return parseBlocks(JSON.parse(value));
    } catch {
      return [];
    }
  }

  if (isRecord(value)) {
    if (Array.isArray(value.blocks)) {
      return value.blocks;
    }

    if (Array.isArray(value.jsonTree)) {
      return value.jsonTree;
    }
  }

  return [];
};

const extractPageText = (
  blocks: unknown[],
  sharedTextSeen: Set<string>
): string => {
  const fragments: string[] = [];
  const pageTextSeen = new Set<string>();

  const addFragment = (
    fragment: string,
    shared: boolean
  ) => {

const dedupeKey = fragment.toLowerCase();
    if (pageTextSeen.has(dedupeKey)) {
      return;
    }

    if (shared && sharedTextSeen.has(dedupeKey)) {
      return;
    }

    pageTextSeen.add(dedupeKey);

    if (shared) {
      sharedTextSeen.add(dedupeKey);
    }

    fragments.push(fragment);
  };

  const visit = (
    value: unknown,
    insideSharedBlock = false
  ) => {
    if (!isRecord(value)) {
      return;
    }

    const shared =
      insideSharedBlock ||
      isSharedBlock(value);
    const data = isRecord(value.data)
      ? value.data
      : {};
    const props = isRecord(data.props)
      ? data.props
      : {};

    extractProps(
      props,
      isSemanticCollectionBlock(value)
    ).forEach(fragment =>
      addFragment(fragment, shared)
    );

    if (Array.isArray(value.children)) {
      value.children.forEach(child =>
        visit(child, shared)
      );
    }
  };

  blocks.forEach(block => visit(block));

  return fragments.join("\n");
};

export const extractPublishedSiteKnowledge = async (
  siteId: number
): Promise<PublishedSiteKnowledge> => {
  if (!Number.isInteger(siteId) || siteId <= 0) {
    throw new Error("INVALID_SITE_ID");
  }

  const pages = await Page.findAll({
    where: {
      siteId,
      status: "published"
    },
    order: [
      ["isHomepage", "DESC"],
      ["id", "ASC"]
    ]
  });

  const sharedTextSeen = new Set<string>();

  return {
    siteId,
    pages: pages.map(page => {
      const raw = page.get({ plain: true }) as
        UnknownRecord;
      const blocks = parseBlocks(
        raw.blocks || raw.jsonTree
      );

      return {
        pageId: Number(raw.id),
        title: normalizeWhitespace(
          String(raw.title || "")
        ),
        slug: normalizeWhitespace(
          String(raw.slug || "")
        ),
        text: extractPageText(
          blocks,
          sharedTextSeen
        )
      };
    })
  };
};
