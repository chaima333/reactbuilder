// src/modules/pageBuilder/runtime/importers/html/compileHtmlDocument.ts
import { parseHtmlDocument } from "./parseHtmlDocument";
import { compileHtmlTree } from "./compileHtmlTree";
import type { PageDocument, SerializedBlock } from "../../../types/document/serialized.types";

export const compileHtmlDocument = (html: string): PageDocument => {
  // =========================
  // 1️⃣ Parse HTML to DOM
  // =========================
  const document = parseHtmlDocument(html);

  // =========================
  // 2️⃣ Compile body children recursively
  // =========================
  const blocks = Array.from(document.body.children)
    .map((element) => compileHtmlTree(element))
    .filter(Boolean) as SerializedBlock[];

  // =========================
  // 3️⃣ Return canonical page document structure
  // =========================
  return {
    schemaVersion: 1,
    schemaId: "page-builder-document", // 👑 العقد الحرفي الصحيح والمطابق 100% لـ ts(2322)
    createdWith: "html-importer-v1",
    blocks
  };
};