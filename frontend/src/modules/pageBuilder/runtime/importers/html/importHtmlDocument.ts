import { extractStyleProps } from "../css/extractStyleProps";
import { semanticMatchers, SerializedBlock } from "./semanticMatchers"; // 👑 نحينا BLOCK_TYPES من الـ Import

// 👑 تعريف محلي ومباشر داخل الـ Document Compiler باش Vite ما تتبلوكاش
const COMPILER_BLOCK_TYPES = {
  SECTION: "section",
  TITLE: "title",
  TEXT: "text", 
  IMAGE: "image",
  BUTTON: "button",
} as const;

const generateUniqueId = () => Math.random().toString(36).substring(2, 9);

function fallbackCompileElement(element: HTMLElement): SerializedBlock[] {
  const tagName = element.tagName.toLowerCase();
  const blocks: SerializedBlock[] = [];

  if (["script", "style", "iframe", "head", "meta", "link"].includes(tagName)) {
    return [];
  }

  if (tagName === "section") {
    blocks.push({
      id: `block-${generateUniqueId()}`,
      type: COMPILER_BLOCK_TYPES.SECTION, // 🎯 استعمال الـ Local Token
      data: { props: {}, style: extractStyleProps(element) }, 
      children: Array.from(element.children).flatMap(child => parseDomToBlocks(child as HTMLElement))
    });
  } 
  else if (["h1", "h2", "h3", "h4", "h5", "h6"].includes(tagName)) {
    blocks.push({
      id: `block-${generateUniqueId()}`,
      type: COMPILER_BLOCK_TYPES.TITLE, // 🎯
      data: { 
        props: { content: element.textContent?.trim() || "", level: tagName },
        style: extractStyleProps(element)
      }
    });
  } 
  else if (tagName === "p") {
    blocks.push({
      id: `block-${generateUniqueId()}`,
      type: COMPILER_BLOCK_TYPES.TEXT, // 🎯
      data: { 
        props: { content: element.textContent?.trim() || "" },
        style: extractStyleProps(element)
      }
    });
  } 
  else if (tagName === "img") {
    const extractedSrc = element.getAttribute("src") || element.getAttribute("data-src") || "";
    const extractedAlt = element.getAttribute("alt") || "";
    const safeImage = extractedSrc.trim() !== "" ? extractedSrc : "https://images.unsplash.com/photo-1516321318423-f06f85e504b3";

    blocks.push({
      id: `block-${generateUniqueId()}`,
      type: COMPILER_BLOCK_TYPES.IMAGE, // 🎯
      data: { 
        props: { url: safeImage, alt: extractedAlt },
        style: extractStyleProps(element)
      }
    });
  } 
  else if (tagName === "button" || (tagName === "a" && element.classList.contains("btn"))) {
    blocks.push({
      id: `block-${generateUniqueId()}`,
      type: COMPILER_BLOCK_TYPES.BUTTON, // 🎯
      data: { 
        props: { label: element.textContent?.trim() || "Button" },
        style: extractStyleProps(element)
      }
    });
  } else {
    return Array.from(element.children).flatMap(child => parseDomToBlocks(child as HTMLElement));
  }

  return blocks;
}


function parseDomToBlocks(element: HTMLElement): SerializedBlock[] {
  let bestMatcher = null;
  let highestScore = 0;

  for (const matcher of semanticMatchers) {
    const score = matcher.getScore(element);
    if (score >= matcher.threshold && score > highestScore) {
      highestScore = score;
      bestMatcher = matcher;
    }
  }

  // 👑 الحصانة الملكية: لو الـ Semantic Matcher لقط العنصر، اقطع الـ Pipeline ورجعه فوراً بلا تشويه!
  if (bestMatcher) {
    console.log(`🎯 [Semantic Match] Element matched with '${bestMatcher.name}' (Score: ${highestScore})`);
    const compiledBlock = bestMatcher.compile(element, parseDomToBlocks);
    return [{ ...compiledBlock, id: `block-${generateUniqueId()}` }];
  }

  return fallbackCompileElement(element);
}

export function importHtmlDocument(htmlString: string): { blocks: SerializedBlock[] } {
  if (!htmlString || !htmlString.trim()) {
    return { blocks: [] };
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");
    const body = doc.body;

    const rootBlocks: SerializedBlock[] = [];
    
    Array.from(body.children).forEach(child => {
      if (child instanceof HTMLElement) {
        const compiled = parseDomToBlocks(child);
        if (compiled && compiled.length > 0) {
          rootBlocks.push(...compiled);
        }
      }
    });

    return { blocks: rootBlocks };

  } catch (error) {
    console.error("Critical error inside importHtmlDocument Pipeline:", error);
    return { blocks: [] };
  }
}