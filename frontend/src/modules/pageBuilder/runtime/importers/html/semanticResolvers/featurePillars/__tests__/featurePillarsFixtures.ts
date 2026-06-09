import type {
  Block
} from "../../../../../../types/page.types";

import type {
  FeaturePillarsPayload
} from "../../../semanticContracts/FeaturePillarsPayload";

import {
  runSemanticPipeline
} from "../../../../pipeline/runSemanticPipeline";

type ExpectedCard = {
  title: string;
  description: string;
  chips: string[];
};

type FeaturePillarsFixture = {
  name: string;
  css: string;
  body: string;
  expected: {
    claimedSelector: string;
    sourceSelector: string;
    cardCount: number;
    cards: ExpectedCard[];
    cardStyle: {
      backgroundIncludes: string[];
      paddingTop: string;
      borderRadius: string;
    };
  };
};

type FeaturePillarsFixtureReport = {
  name: string;
  semanticType: string;
  claimedNode: string;
  sourceNode: string;
  cardCount: number;
  cardTitles: string[];
  emittedCardStyles: Record<string, unknown>[];
};

const fixtures: FeaturePillarsFixture[] = [
  {
    name: ".pillars + article cards",
    css: `
      .scenario-pillars { background:#071523; color:#eef7ff; padding:72px 24px; }
      .scenario-pillars .pillars { display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); gap:24px; }
      .scenario-pillars article.pillar { background:#0b2745; color:#eaf6ff; padding:33px 29px; border:1px solid rgba(120,160,210,.32); border-radius:21px; }
      .scenario-pillars .tags span { display:inline-block; padding:5px 10px; border-radius:999px; background:#12395f; }
    `,
    body: `
      <section class="scenario-pillars" data-fixture="pillars-articles">
        <div class="container">
          <div class="sec-head">
            <p class="eyebrow">Three pillars</p>
            <h2>Strategic pillars</h2>
            <p>Purpose-built feature cards.</p>
          </div>
          <div class="pillars">
            <article class="pillar"><h3>AI Strategy<span class="sub">Responsible systems</span></h3><p>Map high-value AI programs.</p><div class="tags"><span>AI</span><span>Governance</span></div></article>
            <article class="pillar"><h3>Digital Banking<span class="sub">Modern rails</span></h3><p>Modernize core workflows.</p><div class="tags"><span>Core</span><span>Payments</span></div></article>
            <article class="pillar"><h3>Green Finance<span class="sub">Impact capital</span></h3><p>Structure measurable ESG finance.</p><div class="tags"><span>ESG</span><span>Impact</span></div></article>
          </div>
        </div>
      </section>
    `,
    expected: {
      claimedSelector: "section.scenario-pillars",
      sourceSelector: ".pillars",
      cardCount: 3,
      cards: [
        { title: "AI Strategy", description: "Map high-value AI programs.", chips: ["AI", "Governance"] },
        { title: "Digital Banking", description: "Modernize core workflows.", chips: ["Core", "Payments"] },
        { title: "Green Finance", description: "Structure measurable ESG finance.", chips: ["ESG", "Impact"] }
      ],
      cardStyle: {
        backgroundIncludes: ["rgb(11, 39, 69)", "#0b2745"],
        paddingTop: "33px",
        borderRadius: "21px"
      }
    }
  },
  {
    name: ".features + div cards",
    css: `
      .scenario-features { background:#ffffff; color:#101828; padding:64px 20px; }
      .scenario-features .features { display:flex; gap:18px; }
      .scenario-features .feature-card { background:#f0f7ff; padding:27px 25px; border:1px solid #b9d7ff; border-radius:16px; }
      .scenario-features .chip { display:inline-block; color:#155eef; }
    `,
    body: `
      <section class="scenario-features" data-fixture="features-divs">
        <header><h2>Feature suite</h2><p>Reusable card pattern.</p></header>
        <div class="features">
          <div class="feature-card"><h3>Planning<span class="sub">Roadmaps</span></h3><p>Prioritize the right bets.</p><span class="chip">Strategy</span><span class="chip">Ops</span></div>
          <div class="feature-card"><h3>Automation<span class="sub">Workflow</span></h3><p>Remove repeated manual work.</p><span class="chip">No-code</span><span class="chip">Scale</span></div>
          <div class="feature-card"><h3>Analytics<span class="sub">Signals</span></h3><p>Turn usage into decisions.</p><span class="chip">Data</span><span class="chip">Insight</span></div>
        </div>
      </section>
    `,
    expected: {
      claimedSelector: "section.scenario-features",
      sourceSelector: ".features",
      cardCount: 3,
      cards: [
        { title: "Planning", description: "Prioritize the right bets.", chips: ["Strategy", "Ops"] },
        { title: "Automation", description: "Remove repeated manual work.", chips: ["No-code", "Scale"] },
        { title: "Analytics", description: "Turn usage into decisions.", chips: ["Data", "Insight"] }
      ],
      cardStyle: {
        backgroundIncludes: ["rgb(240, 247, 255)", "#f0f7ff"],
        paddingTop: "27px",
        borderRadius: "16px"
      }
    }
  },
  {
    name: ".services + grid items",
    css: `
      .scenario-services { background:#fbfbff; color:#172033; padding:68px 24px; }
      .scenario-services .services { display:grid; grid-template-columns:repeat(3, 1fr); gap:20px; }
      .scenario-services .service-item { background:#fff8ea; padding:30px 28px; border:1px solid #f0c36a; border-radius:14px; }
      .scenario-services .pill { color:#855b00; }
    `,
    body: `
      <section class="scenario-services" data-fixture="services-grid">
        <div class="intro"><h2>Services</h2><p>Three service offers.</p></div>
        <div class="services">
          <div class="service-item"><h3>Advisory<span class="sub">Senior counsel</span></h3><p>Shape investment decisions.</p><span class="pill">Board</span><span class="pill">Risk</span></div>
          <div class="service-item"><h3>Implementation<span class="sub">Delivery pods</span></h3><p>Ship the operating model.</p><span class="pill">Build</span><span class="pill">Launch</span></div>
          <div class="service-item"><h3>Enablement<span class="sub">Capability</span></h3><p>Train teams to sustain change.</p><span class="pill">People</span><span class="pill">Playbooks</span></div>
        </div>
      </section>
    `,
    expected: {
      claimedSelector: "section.scenario-services",
      sourceSelector: ".services",
      cardCount: 3,
      cards: [
        { title: "Advisory", description: "Shape investment decisions.", chips: ["Board", "Risk"] },
        { title: "Implementation", description: "Ship the operating model.", chips: ["Build", "Launch"] },
        { title: "Enablement", description: "Train teams to sustain change.", chips: ["People", "Playbooks"] }
      ],
      cardStyle: {
        backgroundIncludes: ["rgb(255, 248, 234)", "#fff8ea"],
        paddingTop: "30px",
        borderRadius: "14px"
      }
    }
  },
  {
    name: "no semantic class, repeated children",
    css: `
      .scenario-repeated { background:#ffffff; color:#111827; padding:60px 24px; }
      .scenario-repeated .offer-grid { display:grid; grid-template-columns:repeat(3, 1fr); gap:16px; }
      .scenario-repeated .offer-card { background:#eefdf5; padding:26px 22px; border:1px solid #83d6a9; border-radius:15px; }
      .scenario-repeated .tag { color:#067647; }
    `,
    body: `
      <section class="scenario-repeated" data-fixture="plain-repeated">
        <h2>Capability areas</h2>
        <p>Pattern should be inferred from repeated topology.</p>
        <div class="offer-grid">
          <div class="offer-card"><h3>Discover<span class="sub">Audit</span></h3><p>Find high-leverage work.</p><span class="tag">Map</span><span class="tag">Score</span></div>
          <div class="offer-card"><h3>Design<span class="sub">Blueprint</span></h3><p>Create the operating plan.</p><span class="tag">Model</span><span class="tag">Plan</span></div>
          <div class="offer-card"><h3>Deploy<span class="sub">Rollout</span></h3><p>Move teams into execution.</p><span class="tag">Ship</span><span class="tag">Measure</span></div>
        </div>
      </section>
    `,
    expected: {
      claimedSelector: "section.scenario-repeated",
      sourceSelector: ".offer-grid",
      cardCount: 3,
      cards: [
        { title: "Discover", description: "Find high-leverage work.", chips: ["Map", "Score"] },
        { title: "Design", description: "Create the operating plan.", chips: ["Model", "Plan"] },
        { title: "Deploy", description: "Move teams into execution.", chips: ["Ship", "Measure"] }
      ],
      cardStyle: {
        backgroundIncludes: ["rgb(238, 253, 245)", "#eefdf5"],
        paddingTop: "26px",
        borderRadius: "15px"
      }
    }
  },
  {
    name: "light theme cards",
    css: `
      .scenario-light { background:#f8fafc; color:#0f172a; padding:66px 24px; }
      .scenario-light .features { display:grid; grid-template-columns:repeat(3, 1fr); gap:18px; }
      .scenario-light .feature-card { background:#ffffff; padding:29px 27px; border:1px solid #d7dee9; border-radius:19px; box-shadow:0 10px 22px rgba(15,23,42,.06); }
      .scenario-light .chip { color:#475569; }
    `,
    body: `
      <section class="scenario-light" data-fixture="light-theme">
        <h2>Light feature cards</h2>
        <div class="features">
          <div class="feature-card"><h3>Teams<span class="sub">Roles</span></h3><p>Clarify responsibility.</p><span class="chip">Org</span><span class="chip">RACI</span></div>
          <div class="feature-card"><h3>Systems<span class="sub">Tools</span></h3><p>Connect the stack.</p><span class="chip">CRM</span><span class="chip">BI</span></div>
          <div class="feature-card"><h3>Controls<span class="sub">Quality</span></h3><p>Keep delivery reliable.</p><span class="chip">QA</span><span class="chip">Risk</span></div>
        </div>
      </section>
    `,
    expected: {
      claimedSelector: "section.scenario-light",
      sourceSelector: ".features",
      cardCount: 3,
      cards: [
        { title: "Teams", description: "Clarify responsibility.", chips: ["Org", "RACI"] },
        { title: "Systems", description: "Connect the stack.", chips: ["CRM", "BI"] },
        { title: "Controls", description: "Keep delivery reliable.", chips: ["QA", "Risk"] }
      ],
      cardStyle: {
        backgroundIncludes: ["rgb(255, 255, 255)", "#ffffff"],
        paddingTop: "29px",
        borderRadius: "19px"
      }
    }
  },
  {
    name: "dark theme cards",
    css: `
      .scenario-dark { background:#030712; color:#f8fafc; padding:70px 24px; }
      .scenario-dark .features { display:grid; grid-template-columns:repeat(3, 1fr); gap:22px; }
      .scenario-dark .feature-card { background:#111c33; color:#edf5ff; padding:32px 28px; border:1px solid rgba(148,163,184,.25); border-radius:20px; }
      .scenario-dark .chip { color:#93c5fd; }
    `,
    body: `
      <section class="scenario-dark" data-fixture="dark-theme">
        <h2>Dark feature cards</h2>
        <div class="features">
          <div class="feature-card"><h3>Signals<span class="sub">Monitoring</span></h3><p>Track market movement.</p><span class="chip">Live</span><span class="chip">Alert</span></div>
          <div class="feature-card"><h3>Defense<span class="sub">Controls</span></h3><p>Reduce operational risk.</p><span class="chip">Policy</span><span class="chip">Audit</span></div>
          <div class="feature-card"><h3>Growth<span class="sub">Expansion</span></h3><p>Scale new segments.</p><span class="chip">Go-to-market</span><span class="chip">Sales</span></div>
        </div>
      </section>
    `,
    expected: {
      claimedSelector: "section.scenario-dark",
      sourceSelector: ".features",
      cardCount: 3,
      cards: [
        { title: "Signals", description: "Track market movement.", chips: ["Live", "Alert"] },
        { title: "Defense", description: "Reduce operational risk.", chips: ["Policy", "Audit"] },
        { title: "Growth", description: "Scale new segments.", chips: ["Go-to-market", "Sales"] }
      ],
      cardStyle: {
        backgroundIncludes: ["rgb(17, 28, 51)", "#111c33"],
        paddingTop: "32px",
        borderRadius: "20px"
      }
    }
  }
];

const assertFixture = (
  condition: unknown,
  message: string
) => {
  if (!condition) {
    throw new Error(
      `FEATURE_PILLARS_FIXTURE_ASSERTION_FAILED: ${message}`
    );
  }
};

const normalizeText = (
  value: unknown
) =>
  String(value || "")
    .replace(/\s+/g, " ")
    .trim();

const getElementLabel = (
  element?: HTMLElement | null
) => {
  if (!element) {
    return "";
  }

  const className =
    element.getAttribute("class") || "";

  return `${element.tagName.toLowerCase()}${className ? `.${className.replace(/\s+/g, ".")}` : ""}`;
};

const createElementIdFactory = () => {
  const ids =
    new WeakMap<HTMLElement, string>();

  let index = 0;

  return (
    element: HTMLElement
  ) => {
    const existing =
      ids.get(element);

    if (existing) {
      return existing;
    }

    const classPart =
      (element.getAttribute("class") || "")
        .trim()
        .replace(/\s+/g, "-") ||
      element.tagName.toLowerCase();

    const id =
      `${classPart}-${index++}`;

    ids.set(
      element,
      id
    );

    return id;
  };
};

const createFixtureSandbox = async (
  fixture: FeaturePillarsFixture
) => {
  assertFixture(
    typeof document !== "undefined",
    "fixtures must run in a browser-like document"
  );

  const iframe =
    document.createElement("iframe");

  iframe.style.position = "absolute";
  iframe.style.left = "-10000px";
  iframe.style.top = "0";
  iframe.style.width = "1280px";
  iframe.style.height = "900px";
  iframe.setAttribute(
    "aria-hidden",
    "true"
  );

  document.body.appendChild(
    iframe
  );

  const doc =
    iframe.contentDocument;

  assertFixture(
    doc,
    `${fixture.name}: iframe document was not created`
  );

  doc!.open();
  doc!.write(
    `<!doctype html><html><head><meta charset="utf-8"><style>${fixture.css}</style></head><body>${fixture.body}</body></html>`
  );
  doc!.close();

  await new Promise<void>(resolve => {
    const view =
      iframe.contentWindow;

    if (view?.requestAnimationFrame) {
      view.requestAnimationFrame(
        () => resolve()
      );
      return;
    }

    setTimeout(
      resolve,
      0
    );
  });

  return {
    doc: doc!,
    body: doc!.body as HTMLElement,
    cleanup: () => iframe.remove()
  };
};

const collectBlocks = (
  block: Block | null | undefined,
  predicate: (block: Block) => boolean,
  results: Block[] = []
) => {
  if (!block) {
    return results;
  }

  if (predicate(block)) {
    results.push(block);
  }

  for (const child of block.children || []) {
    collectBlocks(
      child,
      predicate,
      results
    );
  }

  return results;
};

const collectBlockTexts = (
  block: Block | null | undefined
) =>
  collectBlocks(
    block,
    candidate =>
      candidate.type === "title" ||
      candidate.type === "text" ||
      candidate.type === "button" ||
      candidate.type === "link"
  ).map(candidate =>
    normalizeText(
      candidate.data?.props?.content ||
      candidate.data?.props?.text ||
      candidate.data?.props?.label
    )
  ).filter(Boolean);

const blockContainsText = (
  block: Block,
  text: string
) =>
  collectBlockTexts(block).includes(
    text
  );

const findCardBlockByTitle = (
  emitted: Block,
  title: string
) =>
  collectBlocks(
    emitted,
    block =>
      block.type === "flexItem" &&
      blockContainsText(
        block,
        title
      )
  )[0];

const getDesktopStyle = (
  block?: Block
) =>
  (
    block?.data?.style?.desktop ||
    block?.data?.style ||
    {}
  ) as Record<string, unknown>;

const styleValue = (
  style: Record<string, unknown>,
  key: string
) =>
  normalizeText(
    style[key]
  ).toLowerCase();

const assertStylePreserved = (
  fixture: FeaturePillarsFixture,
  emitted: Block
) => {
  const firstCard =
    findCardBlockByTitle(
      emitted,
      fixture.expected.cards[0].title
    );

  assertFixture(
    firstCard,
    `${fixture.name}: first emitted card block was not found`
  );

  const style =
    getDesktopStyle(
      firstCard
    );

  const background =
    `${styleValue(style, "background")} ${styleValue(style, "backgroundColor")}`;

  assertFixture(
    fixture.expected.cardStyle.backgroundIncludes.some(value =>
      background.includes(
        value.toLowerCase()
      )
    ),
    `${fixture.name}: extracted card background was not preserved; got ${background}`
  );

  assertFixture(
    styleValue(style, "paddingTop") ===
      fixture.expected.cardStyle.paddingTop.toLowerCase(),
    `${fixture.name}: extracted card paddingTop was not preserved; got ${styleValue(style, "paddingTop")}`
  );

  assertFixture(
    styleValue(style, "borderRadius") ===
      fixture.expected.cardStyle.borderRadius.toLowerCase(),
    `${fixture.name}: extracted card borderRadius was not preserved; got ${styleValue(style, "borderRadius")}`
  );
};

const assertFeaturePillarsFixture = async (
  fixture: FeaturePillarsFixture
): Promise<FeaturePillarsFixtureReport> => {
  const sandbox =
    await createFixtureSandbox(
      fixture
    );

  try {
    const pipeline =
      runSemanticPipeline(
        sandbox.body,
        createElementIdFactory()
      );

    const featureResult =
      pipeline.semanticResults.find(
        (result: FeaturePillarsPayload) =>
          result.type === "FEATURE_PILLARS"
      ) as FeaturePillarsPayload | undefined;

    assertFixture(
      featureResult,
      `${fixture.name}: FEATURE_PILLARS was not detected`
    );

    const claimedElement =
      featureResult!.claimedNode?.element || null;

    const sourceElement =
      featureResult!.sourceNode?.element ||
      featureResult!.gridNode?.element ||
      null;

    assertFixture(
      claimedElement ===
        sandbox.doc.querySelector(
          fixture.expected.claimedSelector
        ),
      `${fixture.name}: claimedNode is ${getElementLabel(claimedElement)}, expected ${fixture.expected.claimedSelector}`
    );

    assertFixture(
      sourceElement ===
        sandbox.doc.querySelector(
          fixture.expected.sourceSelector
        ),
      `${fixture.name}: sourceNode is ${getElementLabel(sourceElement)}, expected ${fixture.expected.sourceSelector}`
    );

    assertFixture(
      featureResult!.items.length ===
        fixture.expected.cardCount,
      `${fixture.name}: expected ${fixture.expected.cardCount} cards, got ${featureResult!.items.length}`
    );

    const emitted =
      pipeline.semanticBlocks.find(
        (entry: { emitted?: Block }) =>
          entry.emitted?.meta?.semanticType ===
          "FEATURE_PILLARS"
      )?.emitted as Block | undefined;

    assertFixture(
      emitted,
      `${fixture.name}: FEATURE_PILLARS emitted block was not found`
    );

    const emittedTexts =
      collectBlockTexts(
        emitted
      );

    for (const expectedCard of fixture.expected.cards) {
      assertFixture(
        emittedTexts.includes(
          expectedCard.title
        ),
        `${fixture.name}: missing title "${expectedCard.title}"`
      );

      assertFixture(
        emittedTexts.includes(
          expectedCard.description
        ),
        `${fixture.name}: missing description "${expectedCard.description}"`
      );

      for (const chip of expectedCard.chips) {
        assertFixture(
          emittedTexts.includes(chip),
          `${fixture.name}: missing chip "${chip}"`
        );
      }
    }

    assertStylePreserved(
      fixture,
      emitted!
    );

    return {
      name:
        fixture.name,
      semanticType:
        featureResult!.type,
      claimedNode:
        getElementLabel(
          claimedElement
        ),
      sourceNode:
        getElementLabel(
          sourceElement
        ),
      cardCount:
        featureResult!.items.length,
      cardTitles:
        fixture.expected.cards.map(
          card => card.title
        ),
      emittedCardStyles:
        fixture.expected.cards.map(card =>
          getDesktopStyle(
            findCardBlockByTitle(
              emitted!,
              card.title
            )
          )
        )
    };
  } finally {
    sandbox.cleanup();
  }
};

export const runFeaturePillarsFixtureAssertions = async () => {
  const reports: FeaturePillarsFixtureReport[] = [];

  for (const fixture of fixtures) {
    reports.push(
      await assertFeaturePillarsFixture(
        fixture
      )
    );
  }

  console.log(
    "FEATURE_PILLARS_FIXTURE_ASSERTIONS",
    JSON.stringify(
      {
        passed:
          reports.length,
        reports
      },
      null,
      2
    )
  );

  return reports;
};

export {
  fixtures as featurePillarsFixtures
};
