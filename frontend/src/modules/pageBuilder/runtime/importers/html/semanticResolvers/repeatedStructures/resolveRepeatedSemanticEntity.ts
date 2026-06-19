import type {
  RepeatedSemanticEntityPayload
} from "../../semanticContracts/RepeatedSemanticEntityPayload";
import type {
  StructuralNode
} from "../../structure/buildStructuralGraph";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const normalizeText = (value: string | null | undefined) =>
  (value || "").replace(/\s+/g, " ").trim();

const isRepeatedCandidateNode = (node: StructuralNode) =>
  node.candidates.some(
    c =>
      c.type === "REPEATED_PATTERN" ||
      c.type === "GRID" ||
      c.metadata?.repeated === true ||
      c.metadata?.layoutMode === "REPEAT" ||
      c.metadata?.layoutMode === "GRID"
  );

const directChildren = (node: StructuralNode) =>
  Array.from(node.element.children) as HTMLElement[];

const containsInsightsContent = (
  node: StructuralNode
) =>
  !!node.element.querySelector(
    ".insights-grid, [class*='insights-grid'], article.insight, article[class*='insight']"
  );

// ---------------------------------------------------------------------------
// Card grid guard
// Card = heading + paragraph بدون أي label/value structure
// لا نعتمد على ":" في النص — unreliable
// ---------------------------------------------------------------------------

const looksLikeCardGridNode = (children: HTMLElement[]): boolean =>
  children.every(child => {
    const hasHeading      = !!child.querySelector("h2,h3,h4");
    const hasParagraph    = !!child.querySelector("p");
    const hasLabelEl      = !!child.querySelector("label, .label, .k, dt, [class*='label'], [class*='key']");
    const hasValueEl      = !!child.querySelector(".value, .v, dd, [class*='value']");
    return hasHeading && hasParagraph && !hasLabelEl && !hasValueEl;
  });

// ---------------------------------------------------------------------------
// extractLabelValuePairs
// Strategy 1: colon pattern  "Email: test@test.com"
// Strategy 2: explicit .label + .value DOM structure
// h2 + p alone → NOT a pair (card)
// ---------------------------------------------------------------------------

const extractLabelValuePairs = (
  children: HTMLElement[]
): { id: string; label: string; value: string }[] =>
  children
    .map((child, index) => {
      // Strategy 1 — colon in direct text
      const allText = normalizeText(child.textContent);
      const colonMatch = allText.match(/^([^:\n]{1,40}):\s*(.{1,120})$/);
      if (colonMatch) {
        return {
          id: `label-value-${index}`,
          label: colonMatch[1].trim(),
          value: colonMatch[2].trim(),
        };
      }

      // Strategy 2 — explicit label/value elements
      const labelEl =
        child.querySelector(".label, .k, dt, th, label") ||
        child.querySelector("[class*='label'], [class*='key']");
      const valueEl =
        child.querySelector(".value, .v, dd, td") ||
        child.querySelector("[class*='value'], [class*='val']");

      if (labelEl && valueEl) {
        const label = normalizeText(labelEl.textContent);
        const value = normalizeText(valueEl.textContent);
        if (label && value && label !== value && label.length < 40) {
          return { id: `label-value-${index}`, label, value };
        }
      }

      return null;
    })
    .filter((p): p is { id: string; label: string; value: string } => p !== null);

// ---------------------------------------------------------------------------
// extractFormFields
// ---------------------------------------------------------------------------

const extractFormFields = (children: HTMLElement[]) =>
  children
    .flatMap((child, index) =>
      Array.from(child.querySelectorAll("input,textarea,select")).map(
        (input, inputIndex) => {
          const htmlInput = input as HTMLInputElement;
          const parent = input.parentElement;
          return {
            id: `form-field-${index}-${inputIndex}`,
            label: normalizeText(
              parent?.querySelector("label,.label")?.textContent
            ),
            placeholder: htmlInput.getAttribute("placeholder") || "",
            inputType: htmlInput.getAttribute("type") || "",
            tag: htmlInput.tagName.toLowerCase(),
          };
        }
      )
    )
    .filter(field => !!field.label || !!field.placeholder);

// ---------------------------------------------------------------------------
// extractActions
// ---------------------------------------------------------------------------

const extractActions = (children: HTMLElement[]) =>
  children
    .flatMap((child, index) =>
      Array.from(child.querySelectorAll("a,button")).map((action, actionIndex) => ({
        id: `cta-${index}-${actionIndex}`,
        label: normalizeText(action.textContent),
        href: action.getAttribute("href") || "",
        tag: action.tagName.toLowerCase(),
      }))
    )
    .filter(action => !!action.label);

// ---------------------------------------------------------------------------
// Signals
// ---------------------------------------------------------------------------

const hasContactSignal = (pairs: { label: string; value: string }[]) => {
  const joined = pairs.map(p => `${p.label} ${p.value}`).join(" ").toLowerCase();
  return (
    /@/.test(joined) ||
    /\+?\d[\d\s().-]{6,}/.test(joined) ||
    joined.includes("email") ||
    joined.includes("phone") ||
    joined.includes("tel") ||
    joined.includes("address") ||
    joined.includes("adresse") ||
    joined.includes("contact")
  );
};

const hasOfficeSignal = (pairs: { label: string; value: string }[]) => {
  const joined = pairs.map(p => `${p.label} ${p.value}`).join(" ").toLowerCase();
  return (
    joined.includes("office") ||
    joined.includes("hub") ||
    joined.includes("siege") ||
    joined.includes("social") ||
    joined.includes("paris") ||
    joined.includes("san francisco") ||
    joined.includes("tun") ||
    joined.includes("wilmington") ||
    /[a-z]+\s+[-]\s+[a-z]/i.test(joined)
  );
};

// ---------------------------------------------------------------------------
// Main resolver
// ---------------------------------------------------------------------------

export const resolveRepeatedSemanticEntity = (
  node: StructuralNode
): RepeatedSemanticEntityPayload | null => {

  if (!isRepeatedCandidateNode(node)) return null;

  if (containsInsightsContent(node)) {
    console.log(
      "INSIGHTS CONTENT — skip repeated semantic entity",
      node.element.className
    );
    return null;
  }

  const children = directChildren(node);
  if (children.length < 2) return null;

  // Guard: card grid → skip entirely
  if (looksLikeCardGridNode(children)) {
    console.log("🛑 CARD GRID — skip", node.element.className);
    return null;
  }

  const pairs   = extractLabelValuePairs(children);
  const fields  = extractFormFields(children);
  const actions = extractActions(children);
  const reason  = ["repeated-topology"];

  // Form fields
  if (fields.length >= 1 && fields.length >= Math.ceil(children.length * 0.5)) {
    return {
      type: "FORM_FIELD",
      confidence: 0.9,
      reason: [...reason, "form-controls", "label-or-placeholder"],
      fields,
      claimedNode: node,
    };
  }

  // CTA group
 const className =
  String(node.element.className || "").toLowerCase();

const hasCtaIdentity =
  className.includes("cta") ||
  className.includes("call-to-action") ||
  className.includes("final");

const childrenLookLikeCards =
  children.every(child =>
    !!child.querySelector("h2,h3,h4") &&
    !!child.querySelector("p")
  );

if (
  actions.length >= 2 &&
  hasCtaIdentity &&
  !childrenLookLikeCards
) {
  return {
    type: "CTA_GROUP",
    confidence: 0.86,
    reason: [...reason, "multiple-actions"],
    actions,
    claimedNode: node,
  };
}

  console.log("🚨 CONTACT CHECK", {
    className: node.element.className,
    pairs,
    signal: hasContactSignal(pairs),
  });

  // Contact table — labels courts + signal contact
  if (
    pairs.length >= 2 &&
    pairs.every(p => p.label.length < 35) &&
    hasContactSignal(pairs)
  ) {
    return {
      type: "CONTACT_TABLE",
      confidence: 0.88,
      reason: [...reason, "label-value-pairs", "contact-signal"],
      pairs,
      claimedNode: node,
    };
  }

  // Office list
  if (pairs.length >= 2 && hasOfficeSignal(pairs)) {
    return {
      type: "OFFICE_LIST",
      confidence: 0.87,
      reason: [...reason, "label-value-pairs", "office-signal"],
      items: pairs,
      claimedNode: node,
    };
  }

  console.log("🔥 REPEATED ENTITY", {
    className: node.element.className,
    pairs,
    fields,
    actions,
  });

  // Generic label/value group
  if (pairs.length >= 2) {
    return {
      type: "LABEL_VALUE_GROUP",
      confidence: 0.82,
      reason: [...reason, "label-value-pairs"],
      pairs,
      claimedNode: node,
    };
  }

  return null;
};
