import {
  analyzeStructure
} from "../html/analysis/analyzeStructure";

import {
  normalizeCandidates
} from "../html/analysis/normalizeCandidates";

import type {
  StructuralCandidate
} from "../html/analysis/StructuralCandidate.types";

import {
  resolveOwnership
} from "../html/semantic/ownership/resolveOwnership";

import {
  emitSemanticBlock
} from "../html/emitters/emitSemanticBlock";

import {
  resolveSemanticStructure
} from "../html/semanticResolvers/resolveSemanticStructure";

import {
  buildStructuralGraph
} from "../html/structure/buildStructuralGraph";
import {
  getElementClassName
} from "../html/domGuards";

const summarizeDomSubtree = (
  element: HTMLElement | undefined,
  depth = 0
): any => {
  if (!element || depth > 2) {
    return null;
  }

  return {
    tag:
      element.tagName,
    className:
      getElementClassName(element),
    text:
      (element.textContent || "")
        .trim()
        .slice(0, 120),
    childCount:
      element.children.length,
    children:
      Array.from(element.children)
        .slice(0, 8)
        .map(child =>
          summarizeDomSubtree(
            child as HTMLElement,
            depth + 1
          )
        )
  };
};

const summarizeBlockTree = (
  block: any,
  depth = 0
): any => {
  if (!block || depth > 3) {
    return null;
  }

  return {
    type:
      block.type,
    semanticType:
      block.meta?.semanticType,
    content:
      block.data?.props?.content ||
      block.data?.props?.label ||
      block.data?.props?.title ||
      "",
    childCount:
      block.children?.length || 0,
    children:
      (block.children || [])
        .slice(0, 8)
        .map((child: any) =>
          summarizeBlockTree(
            child,
            depth + 1
          )
        )
  };
};

const textOf = (
  element?: Element | null
) =>
  element?.textContent
    ?.trim()
    .replace(/\s+/g, " ") || "";

const directTextOf = (
  element?: Element | null
) =>
  element
    ? Array.from(
        element.childNodes
      )
        .filter(
          node =>
            node.nodeType ===
            Node.TEXT_NODE
        )
        .map(
          node =>
            node.textContent || ""
        )
        .join(" ")
        .replace(/\s+/g, " ")
        .trim()
    : "";

const blockTextValues = (
  block: any
): string[] => {
  if (!block) {
    return [];
  }

  const value =
    block.data?.props?.content ||
    block.data?.props?.label ||
    block.data?.props?.title ||
    "";

  return [
    value,
    ...(block.children || []).flatMap(
      blockTextValues
    )
  ].filter(Boolean);
};

const collectBlockTypes = (
  block: any
): string[] =>
  block
    ? [
        block.type,
        ...(block.children || []).flatMap(
          collectBlockTypes
        )
      ].filter(Boolean)
    : [];

const summarizePayload = (
  semanticResult: any
) => {
  if (!semanticResult) {
    return null;
  }

  const base = {
    semanticType:
      semanticResult.type,
    confidence:
      semanticResult.confidence,
    reason:
      semanticResult.reason
  };

  if (
    semanticResult.type === "HERO_SECTION"
  ) {
    return {
      ...base,
      title:
        semanticResult.title,
      subtitle:
        semanticResult.subtitle,
      ctaText:
        semanticResult.ctaText,
      buttons:
        semanticResult.buttons || [],
      kpiItems:
        semanticResult.kpiItems || [],
      partnerItems:
        semanticResult.partnerItems || []
    };
  }

  if (
    semanticResult.type === "FEATURE_PILLARS" ||
    semanticResult.type === "INSIGHTS_SECTION"
  ) {
    return {
      ...base,
      title:
        semanticResult.title,
      description:
        semanticResult.description,
      itemCount:
        semanticResult.items?.length || 0,
      items:
        (semanticResult.items || [])
          .slice(0, 8)
          .map((item: any) => ({
            title:
              item.title,
            description:
              item.description,
            meta:
              item.meta,
            href:
              item.href,
            ctaLabel:
              item.ctaLabel
          }))
    };
  }

  if (
    semanticResult.type === "CTA_SECTION" ||
    semanticResult.type === "CTA_GROUP"
  ) {
    return {
      ...base,
      title:
        semanticResult.title,
      text:
        semanticResult.text,
      actionCount:
        semanticResult.actions?.length || 0,
      actions:
        semanticResult.actions || []
    };
  }

  return base;
};

const summarizeOriginalDomForSemantic = (
  semanticType: string,
  element?: HTMLElement
) => {
  if (!element) {
    return null;
  }

  const summary: any = {
    tag:
      element.tagName,
    id:
      element.id || "",
    className:
      getElementClassName(
        element
      ),
    childCount:
      element.children.length,
    text:
      textOf(element).slice(
        0,
        240
      )
  };

  if (
    semanticType === "HERO_SECTION"
  ) {
    const title =
      element.querySelector(
        "h1"
      );
    const ctas =
      Array.from(
        element.querySelectorAll(
          ".hero-ctas a, .hero-ctas button, a, button"
        )
      );
    const kpis =
      Array.from(
        element.querySelectorAll(
          ".kpi, .stat, .metric, [class*='kpi'], [class*='stat'], [class*='metric']"
        )
      );
    const partnerContainers =
      Array.from(
        element.querySelectorAll(
          ".partners, .partners-row, [class*='partner'], [class*='logo']"
        )
      );

    return {
      ...summary,
      titleLines:
        title
          ? Array.from(
              title.children
            )
              .map(child =>
                textOf(child)
              )
              .filter(Boolean)
          : [],
      titleText:
        textOf(title),
      subtitle:
        textOf(
          element.querySelector(
            "p"
          )
        ),
      ctas:
        ctas.map(cta => ({
          tag:
            cta.tagName,
          className:
            getElementClassName(
              cta as HTMLElement
            ),
          text:
            textOf(cta),
          href:
            cta.getAttribute(
              "href"
            )
        })),
      kpis:
        kpis.map(kpi => ({
          tag:
            kpi.tagName,
          className:
            getElementClassName(
              kpi as HTMLElement
            ),
          text:
            textOf(kpi),
          directText:
            directTextOf(kpi),
          dataValue:
            kpi.getAttribute(
              "data-value"
            ),
          dataTarget:
            kpi.getAttribute(
              "data-target"
            ),
          dataCount:
            kpi.getAttribute(
              "data-count"
            )
        })),
      partnerCandidates:
        partnerContainers.map(partner => ({
          tag:
            partner.tagName,
          className:
            getElementClassName(
              partner as HTMLElement
            ),
          text:
            textOf(partner)
        })),
      spacing:
        {
          style:
            element.getAttribute(
              "style"
            ) || "",
          className:
            getElementClassName(
              element
            )
        }
    };
  }

  return summary;
};

const getMissingFields = (
  semanticResult: any,
  emitted: any
) => {
  const texts =
    blockTextValues(
      emitted
    );
  const missing: string[] = [];
  const incorrect: string[] = [];

  if (
    semanticResult.type === "HERO_SECTION"
  ) {
    if (!semanticResult.title) {
      missing.push("payload.title");
    }

    if (!semanticResult.subtitle) {
      missing.push("payload.subtitle");
    }

    if (
      !(semanticResult.buttons || []).length &&
      !semanticResult.ctaText
    ) {
      missing.push("payload.buttons");
    }

    if (
      !(semanticResult.kpiItems || []).length &&
      !texts.some(value =>
        /kpi|projet|pays|expert|pilier|[$€£]?\d/i.test(
          value
        )
      )
    ) {
      missing.push("hero.kpis");
    }

    if (
      !(semanticResult.partnerItems || []).length
    ) {
      missing.push("payload.partnerItems");
    }
  }

  if (
    semanticResult.type === "FEATURE_PILLARS" &&
    !(semanticResult.items || []).length
  ) {
    missing.push("payload.items");
  }

  if (
    semanticResult.type === "INSIGHTS_SECTION" &&
    !(semanticResult.items || []).length
  ) {
    missing.push("payload.items");
  }

  if (
    (
      semanticResult.type === "CTA_SECTION" ||
      semanticResult.type === "CTA_GROUP"
    ) &&
    !(semanticResult.actions || []).length
  ) {
    missing.push("payload.actions");
  }

  if (
    !emitted
  ) {
    missing.push("emitted.block");
  }

  if (
    emitted &&
    !collectBlockTypes(
      emitted
    ).some(type =>
      type === "flex" ||
      type === "grid"
    )
  ) {
    incorrect.push("generated tree has no layout container");
  }

  return {
    missing,
    incorrect
  };
};

const scoreSemanticCompleteness = (
  semanticResult: any,
  emitted: any,
  missing: string[],
  incorrect: string[]
) => {
  const payloadScore =
    semanticResult.confidence
      ? Math.round(
          Math.min(
            100,
            semanticResult.confidence * 100
          )
        )
      : 82;
  const penalty =
    missing.length * 12 +
    incorrect.length * 8 +
    (!emitted ? 30 : 0);

  return Math.max(
    0,
    Math.min(
      100,
      payloadScore - penalty
    )
  );
};

const buildSemanticCompletenessReport = (
  semanticResults: any[],
  semanticBlocks: any[]
) =>
  semanticResults
    .filter(result =>
      [
        "HERO_SECTION",
        "FEATURE_PILLARS",
        "INSIGHTS_SECTION",
        "CTA_SECTION",
        "CTA_GROUP"
      ].includes(result.type)
    )
    .map(result => {
      const entry =
        semanticBlocks.find((blockEntry: any) =>
          blockEntry.claimedNode ===
          result.claimedNode
        );
      const emitted =
        entry?.emitted;
      const fields =
        getMissingFields(
          result,
          emitted
        );

      return {
        semanticType:
          result.type,
        originalDomSummary:
          summarizeOriginalDomForSemantic(
            result.type,
            result.claimedNode?.element
          ),
        extractedPayloadSummary:
          summarizePayload(
            result
          ),
        generatedBlockTreeSummary:
          summarizeBlockTree(
            emitted
          ),
        missingOrIncorrectFields:
          fields,
        confidenceScore:
          scoreSemanticCompleteness(
            result,
            emitted,
            fields.missing,
            fields.incorrect
          )
      };
    });

// =====================================
// SEMANTIC PIPELINE
// =====================================

export const runSemanticPipeline = (
  body: HTMLElement,
  getElementId: (
    element: HTMLElement
  ) => string
) => {

  // =====================================
  // ANALYSIS PASS
  // =====================================

  const rawCandidates =

    analyzeStructure(
      body,
      [],
      getElementId
    );

  console.log(
    "🧩 RAW CANDIDATES",
    rawCandidates
  );
 

console.log(
  "RAW TYPES",
  rawCandidates.map(
    c => c.type
  )
);

  // =====================================
  // NORMALIZATION
  // =====================================

  const normalizedCandidates =

    normalizeCandidates(
      rawCandidates
    );


console.log(
  "NORMALIZED TYPES",
  normalizedCandidates.map(
    c => c.type
  )
);
  // =====================================
  // OWNERSHIP
  // =====================================

  const ownership =

    resolveOwnership(
      normalizedCandidates
    );



  // =====================================
  // OWNERSHIP SUMMARY
  // =====================================

  console.log(
    "🔥 OWNERSHIP SUMMARY",
    {

      relations:

        ownership.relations
          ?.length ?? 0,

      resolvedOwners:

        ownership.resolvedOwners
          ?.length ?? 0,

      unassigned:

        ownership.unassigned
          ?.length ?? 0,

      ownershipMap:

        ownership.ownershipMap

          ? Object.keys(
              ownership.ownershipMap
            ).length

          : 0
    }
  );

  // =====================================
  // OWNERSHIP CANDIDATES
  // =====================================

  const ownershipCandidates:

    StructuralCandidate[] =

      [

        ...(ownership.resolvedOwners || []),

        ...(ownership.unassigned || [])
      ];


  // =====================================
  // STRUCTURAL GRAPH
  // =====================================


  const structuralGraph =

    buildStructuralGraph(
      body,
      [],
      ownershipCandidates
    );

  // =====================================
  // EMPTY GRAPH GUARD
  // =====================================

  if (
    !structuralGraph
  ) {

    console.warn(
      "⚠️ STRUCTURAL GRAPH IS NULL"
    );

    return {

      rawCandidates,

      normalizedCandidates,

      ownershipCandidates,

      ownership,

      structuralGraph: null,

      semanticResults: [],

      semanticBlocks: []
    };
  }

  // =====================================
  // SEMANTIC RESOLUTION
  // =====================================

  const semanticResults =

    resolveSemanticStructure(
      structuralGraph
    );

  console.log(
    "🧱 FINAL SEMANTIC BEFORE PRESET",
    semanticResults.map((result: any) => ({
      semanticType:
        result.type,
      elementTag:
        result.claimedNode?.element?.tagName,
      className:
        getElementClassName(
          result.claimedNode?.element
        ),
      childCount:
        result.claimedNode?.element?.children?.length || 0,
      originalDom:
        summarizeDomSubtree(
          result.claimedNode?.element
        )
    }))
  );

 

  // =====================================
  // EMISSION
  // =====================================
const semanticBlocks =
  semanticResults.flatMap(
    result => {

      const emitted =
        emitSemanticBlock(
          result
        );

      if (!emitted) {
        return [];
      }

      const emittedBlocks =
        Array.isArray(emitted)
          ? emitted
          : [emitted];

      return emittedBlocks.map(
        block => {
          const emittedBlock = {
            ...block,
            meta: {
              ...(block as any).meta,
              resolverName:
                result.resolverName ||
                (block as any).meta?.resolverName
            }
          };

          return {
            claimedNode:
              result.claimedNode,

            resolverName:
              result.resolverName,

            semanticResult:
              result,

            emitted:
              emittedBlock
          };
        }
      );
    }
  );

console.log(
  "🧬 SEMANTIC DOM VS GENERATED BLOCK TREE",
  semanticBlocks.map((entry: any) => ({
    semanticType:
      entry.emitted?.meta?.semanticType ||
      entry.emitted?.type,
    original:
      summarizeDomSubtree(
        entry.claimedNode?.element
      ),
    generated:
      summarizeBlockTree(
        entry.emitted
      )
  }))
);

console.log(
  "SEMANTIC_COMPLETENESS_REPORT",
  buildSemanticCompletenessReport(
    semanticResults,
    semanticBlocks
  )
);


  // =====================================
  // RESULT
  // =====================================
  return {

    rawCandidates,

    normalizedCandidates,

    ownershipCandidates,

    ownership,

    structuralGraph,

    semanticResults,

    semanticBlocks
  };
};
