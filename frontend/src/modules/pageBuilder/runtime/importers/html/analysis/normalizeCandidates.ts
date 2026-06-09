import type {
  StructuralCandidate
} from "./StructuralCandidate.types";

const decorativeTokens = [

  "grid-lines",
  "overlay",
  "mesh",
  "background",
  "bg-grid",
  "decoration"
];

const weakWrapperTokens = [

  "container",
  "wrapper",
  "inner",
  "content",
  "row"
];

const isDecorativeCandidate = (
  candidate: StructuralCandidate
) => {

  const className =

  typeof candidate.metadata
    ?.className ===
    "string"

    ? candidate.metadata
        .className
        .toLowerCase()

    : "";

  return decorativeTokens.some(
    token =>
      className.includes(
        token
      )
  );
};

const isWeakWrapper = (
  candidate: StructuralCandidate
) => {

 const className =

  typeof candidate.metadata
    ?.className ===
    "string"

    ? candidate.metadata
        .className
        .toLowerCase()

    : "";

  return weakWrapperTokens.some(
    token =>
      className === token
  );
};

const deduplicateCandidates = (
  candidates: StructuralCandidate[]
) => {

  const seen =
    new Set<string>();

  return candidates.filter(
    candidate => {

      const key =

        `${candidate.type}:${candidate.path.join("-")}`;

      if (
        seen.has(key)
      ) {

        return false;
      }

      seen.add(
        key
      );

      return true;
    }
  );
};

export const normalizeCandidates = (
  candidates: StructuralCandidate[]
): StructuralCandidate[] => {

  console.log(
    "🧹 BEFORE NORMALIZATION",
    candidates
  );

  // =====================================
  // REMOVE DECORATIVE
  // =====================================

  const withoutDecorative =

    candidates.filter(
      candidate =>

        !isDecorativeCandidate(
          candidate
        )
    );

  // =====================================
  // REMOVE WEAK WRAPPERS
  // =====================================

  const withoutWrappers =

    withoutDecorative.filter(
      candidate =>

        !isWeakWrapper(
          candidate
        )
    );

  // =====================================
  // DEDUPLICATION
  // =====================================

  const normalized =

    deduplicateCandidates(
      withoutWrappers
    );

  console.log(
    "✅ NORMALIZED CANDIDATES",
    normalized
  );

  return normalized;
};