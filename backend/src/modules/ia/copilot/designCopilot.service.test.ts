import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

vi.mock(
  "../llm/llm.client",
  () => ({
    generateTextWithTelemetry: vi.fn(
      async () => {
        throw new Error(
          "LLM must not be called for an exact hero-button request",
        );
      },
    ),
  }),
);

import {
  createDesignCopilotResponse,
  createFallbackDesignCopilotResponse,
} from "./designCopilot.service";

const button = (
  id: string,
  label: string,
) => ({
  id,
  type: "button",
  data: {
    props: {
      label,
    },
    style: {
      desktop: {},
      tablet: {},
      mobile: {},
    },
  },
  children: [],
});

const pageBlocks = [
  {
    id: "global-navbar",
    type: "navbar",
    data: {
      props: {},
      style: {
        desktop: {},
        tablet: {},
        mobile: {},
      },
    },
    children: [
      button(
        "navbar-shop-button",
        "Shop Now",
      ),
    ],
  },
  {
    id: "hero-section",
    type: "section",
    data: {
      props: {
        role: "hero",
      },
      style: {
        desktop: {},
        tablet: {},
        mobile: {},
      },
    },
    children: [
      {
        id: "hero-content",
        type: "flex",
        data: {
          props: {},
          style: {
            desktop: {},
            tablet: {},
            mobile: {},
          },
        },
        children: [
          button(
            "hero-shop-button",
            "Shop Now",
          ),
        ],
      },
    ],
  },
  {
    id: "services-section",
    type: "section",
    data: {
      props: {},
      style: {
        desktop: {},
        tablet: {},
        mobile: {},
      },
    },
    children: [
      button(
        "services-button",
        "Learn More",
      ),
    ],
  },
];

const request = {
  message:
    "Improve only the hero button",
  blocks:
    pageBlocks,
  pageTitle:
    "SmartBusiness Home",
  slug:
    "home",
} as any;

const expectExactHeroButtonSuggestion = (
  response: any,
) => {
  expect(
    response.suggestions,
  ).toHaveLength(1);

  expect(
    response.suggestions[0].id,
  ).toBe(
    "improve-hero-button",
  );

  expect(
    response.suggestions[0].actions,
  ).toEqual([
    {
      type:
        "IMPROVE_DESIGN",
      improvement:
        "IMPROVE_BUTTONS",
      target:
        "hero-shop-button",
      payload: {},
    },
  ]);

  const actions =
    response.suggestions.flatMap(
      (suggestion: any) =>
        suggestion.actions,
    );

  expect(
    actions.some(
      (action: any) =>
        action.target === "page",
    ),
  ).toBe(false);

  expect(
    actions.some(
      (action: any) =>
        action.improvement ===
        "IMPROVE_SPACING",
    ),
  ).toBe(false);

  expect(
    actions.some(
      (action: any) =>
        action.improvement ===
        "IMPROVE_CARDS",
    ),
  ).toBe(false);
};

describe(
  "Design Copilot scoped targeting",
  () => {
    it(
      "creates an exact fallback action for the hero button",
      () => {
        const response =
          createFallbackDesignCopilotResponse(
            request,
          );

        expectExactHeroButtonSuggestion(
          response,
        );
      },
    );

    it(
      "bypasses the LLM for an exact hero-button request",
      async () => {
        const response =
          await createDesignCopilotResponse(
            request,
          );

        expectExactHeroButtonSuggestion(
          response,
        );
      },
    );
  },
);
