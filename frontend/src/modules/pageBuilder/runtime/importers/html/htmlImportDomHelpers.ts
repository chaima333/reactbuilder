import { SKIP_TEXT_COVERAGE_SELECTOR, MAX_IMPORT_CHILDREN } from "./htmlImportConstants";
import { getElementClassName, shouldSkipImportedElement } from "./domGuards";
import { normalizeDiagnosticText } from "./importHtmlUtils";

export const getElementWindow = (element: Element) =>
  element.ownerDocument.defaultView || window;

export const isHtmlElementLike = (
  element: Element
): element is HTMLElement =>
  element.nodeType === 1 &&
  typeof (element as HTMLElement).tagName === "string";

export const getSafeChildren = (
  element: HTMLElement
): HTMLElement[] =>
  Array.from(element.children)
    .filter(
      (child): child is HTMLElement =>
        isHtmlElementLike(child) &&
        !shouldSkipImportedElement(child)
    )
    .slice(0, MAX_IMPORT_CHILDREN);

export const hasMeaningfulElementContent = (
  element: HTMLElement
) =>
  isMeaningfulImportedText(
    element.textContent || ""
  ) ||
  !!element.querySelector(
    "img,svg,video,audio,input,textarea,select,button,a"
  );

export const getMeaningfulDirectTextNodes = (
  element: HTMLElement
) =>
  Array.from(element.childNodes).filter(
    node =>
      node.nodeType === 3 &&
      isMeaningfulImportedText(
        node.textContent || ""
      )
  );

const isMeaningfulImportedText = (
  value = ""
) => {
  const text = normalizeDiagnosticText(value);

  return (
    text.length >= 2 &&
    !/^[\s|/\\\-–—•·.,:;()[\]{}]+$/.test(text)
  );
};

type ImportTextNodeDiagnostic = {
  text: string;
  tag: string;
  className: string;
  path: string;
  parentText: string;
};

const getElementDomPath = (
  element: Element | null
) => {
  const parts: string[] = [];
  let current: Element | null = element;

  while (
    current &&
    current.tagName &&
    current.tagName.toLowerCase() !== "html"
  ) {
    const parent = current.parentElement;
    const index = parent
      ? Array.from(parent.children).indexOf(current)
      : 0;

    parts.unshift(`${current.tagName.toLowerCase()}[${index}]`);
    current = parent;
  }

  return parts.join(">");
};

export const collectDomTextNodes = (
  root: HTMLElement
): ImportTextNodeDiagnostic[] => {
  const walker = root.ownerDocument.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT
  );

  const texts: ImportTextNodeDiagnostic[] = [];
  let node = walker.nextNode();

  while (node) {
    const parent = node.parentElement;
    const text = normalizeDiagnosticText(node.textContent || "");

    if (
      parent &&
      isMeaningfulImportedText(text) &&
      !shouldSkipTextCoverageElement(parent)
    ) {
      texts.push({
        text,
        tag: parent.tagName,
        className: getElementClassName(parent),
        path: getElementDomPath(parent),
        parentText: normalizeDiagnosticText(
          parent.textContent || ""
        ).slice(0, 240)
      });
    }

    node = walker.nextNode();
  }

  return texts;
};

const shouldSkipTextCoverageElement = (
  element: Element | null
) =>
  !!element &&
  (
    shouldSkipImportedElement(element) ||
    !!element.closest(SKIP_TEXT_COVERAGE_SELECTOR)
  );
