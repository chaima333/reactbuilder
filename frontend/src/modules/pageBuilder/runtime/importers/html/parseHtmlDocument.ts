// src/modules/pageBuilder/runtime/importers/html/parseHtmlDocument.ts

export const parseHtmlDocument = (
  html: string
): Document => {

  const parser =
    new DOMParser();

  return parser.parseFromString(
    html,
    "text/html"
  );
};