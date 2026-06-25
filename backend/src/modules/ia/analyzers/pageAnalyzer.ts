export interface HeroAnalysis {
  exists: boolean;
  score: number;
  needsImprovement: boolean;
  reasons: string[];
}

export interface PageAnalysis {
  hero: HeroAnalysis;

  hasFAQ: boolean;
  hasCTA: boolean;
  hasTestimonials: boolean;
  hasServices: boolean;

  overallScore: number;
}

const flattenBlocks = (blocks: any[] = []) => {
  const result: any[] = [];

  for (const block of blocks) {
    result.push(block);

    if (Array.isArray(block.children)) {
      result.push(...flattenBlocks(block.children));
    }
  }

  return result;
};

const getText = (block: any) =>
  [
    block?.id,
    block?.type,
    block?.data?.props?.title,
    block?.data?.props?.content,
    block?.data?.props?.text,
    block?.data?.props?.label,
    block?.data?.meta?.semanticType,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

const analyzeHero = (blocks: any[]): HeroAnalysis => {
  const flat = flattenBlocks(blocks);

  const hero = flat.find((b) => {
    const text = getText(b);

    return (
      text.includes("hero") ||
      text.includes("banner")
    );
  });

  if (!hero) {
    return {
      exists: false,
      score: 0,
      needsImprovement: false,
      reasons: [],
    };
  }

  let score = 100;
  const reasons: string[] = [];

  const title =
    hero?.data?.props?.title ||
    hero?.data?.props?.content ||
    "";

  if (title.length < 25) {
    score -= 20;
    reasons.push("Hero title is too short");
  }

  return {
    exists: true,
    score,
    needsImprovement: score < 80,
    reasons,
  };
};
export const analyzePage = (
  blocks: any[]
): PageAnalysis => {

  const flat = flattenBlocks(blocks);

 const hero = analyzeHero(blocks);

const hasHero = hero.exists;

  const hasFAQ = flat.some((b) => {
    const text = getText(b);

    return (
      text.includes("faq") ||
      text.includes("frequently asked")
    );
  });

  const hasCTA = flat.some((b) => {
    const text = getText(b);

    return (
      text.includes("contact us") ||
      text.includes("book now") ||
      text.includes("get started") ||
      text.includes("ready to")
    );
  });

  const hasTestimonials = flat.some((b) => {
    const text = getText(b);

    return (
      text.includes("testimonial") ||
      text.includes("review") ||
      text.includes("guests say") ||
      text.includes("clients say")
    );
  });

  const hasServices = flat.some((b) => {
    const text = getText(b);

    return (
      text.includes("services") ||
      text.includes("our services")
    );
  });

  let score = 100;

  if (!hasHero) { score -= 20;} else if (hero.needsImprovement) { score -= 10;}
  if (!hasServices) score -= 20;
  if (!hasCTA) score -= 20;
  if (!hasFAQ) score -= 20;
  if (!hasTestimonials) score -= 20;

  return {
    hero,
    hasFAQ,
    hasCTA,
    hasTestimonials,
    hasServices,
    overallScore: score,
  };
};