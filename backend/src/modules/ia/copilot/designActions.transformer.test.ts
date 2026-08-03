import {
  describe,
  expect,
  it,
} from "vitest";

import {
  applyDesignActions,
} from "./designActions.transformer";

const responsiveStyle = (
  desktop: Record<string, unknown> = {},
) => ({
  desktop,
  tablet: {},
  mobile: {},
});

const button = (
  id: string,
  style: Record<string, unknown> = {},
) => ({
  id,
  type: "button",
  data: {
    props: {
      label: id,
    },
    style: responsiveStyle(style),
  },
  children: [],
});

describe("applyDesignActions targeting safety", () => {
  it("improves only the targeted button", () => {
    const blocks = [
      button("hero-cta"),
      button("footer-cta"),
    ];

    const result = applyDesignActions(
      blocks,
      [
        {
          type: "IMPROVE_DESIGN",
          improvement: "IMPROVE_BUTTONS",
          target: "hero-cta",
          payload: {},
        },
      ],
    );

    expect(
      result[0].data?.style.desktop.borderRadius,
    ).toBe("14px");

    expect(
      result[1].data?.style.desktop.borderRadius,
    ).toBeUndefined();

    expect(
      result[1].data?.style.desktop.boxShadow,
    ).toBeUndefined();
  });

  it("does not classify a section as a card because a descendant contains pricing text", () => {
    const blocks = [
      {
        id: "pricing-section",
        type: "section",
        data: {
          props: {},
          style: responsiveStyle({
            padding: "64px",
          }),
        },
        children: [
          {
            id: "pricing-title",
            type: "title",
            data: {
              props: {
                content: "Simple pricing",
              },
              style: responsiveStyle({}),
            },
            children: [],
          },
        ],
      },
    ];

    const result = applyDesignActions(
      blocks,
      [
        {
          type: "IMPROVE_DESIGN",
          improvement: "IMPROVE_CARDS",
          target: "page",
          payload: {},
        },
      ],
    );

    expect(
      result[0].data?.style.desktop.borderRadius,
    ).toBeUndefined();

    expect(
      result[0].data?.style.desktop.boxShadow,
    ).toBeUndefined();

    expect(
      result[0].data?.style.desktop.padding,
    ).toBe("64px");
  });

  it("preserves an existing dark navbar background", () => {
    const blocks = [
      {
        id: "global-navbar",
        type: "navbar",
        data: {
          props: {},
          style: responsiveStyle({
            backgroundColor: "#020617",
            color: "#ffffff",
          }),
        },
        children: [],
      },
    ];

    const result = applyDesignActions(
      blocks,
      [
        {
          type: "IMPROVE_DESIGN",
          improvement: "IMPROVE_NAVBAR",
          target: "navbar",
          payload: {},
        },
      ],
    );

    expect(
      result[0].data?.style.desktop.backgroundColor,
    ).toBe("#020617");

    expect(
      result[0].data?.style.desktop.color,
    ).toBe("#ffffff");
  });

  it("preserves an existing footer color scheme", () => {
    const blocks = [
      {
        id: "global-footer",
        type: "footer",
        data: {
          props: {},
          style: responsiveStyle({
            backgroundColor: "#f8fafc",
            color: "#0f172a",
          }),
        },
        children: [],
      },
    ];

    const result = applyDesignActions(
      blocks,
      [
        {
          type: "IMPROVE_DESIGN",
          improvement: "IMPROVE_FOOTER",
          target: "footer",
          payload: {},
        },
      ],
    );

    expect(
      result[0].data?.style.desktop.backgroundColor,
    ).toBe("#f8fafc");

    expect(
      result[0].data?.style.desktop.color,
    ).toBe("#0f172a");
  });

  it("does not overwrite existing section spacing", () => {
    const blocks = [
      {
        id: "hero-section",
        type: "section",
        data: {
          props: {},
          style: responsiveStyle({
            padding: "72px 24px",
          }),
        },
        children: [],
      },
    ];

    const result = applyDesignActions(
      blocks,
      [
        {
          type: "IMPROVE_DESIGN",
          improvement: "IMPROVE_SPACING",
          target: "hero-section",
          payload: {},
        },
      ],
    );

    expect(
      result[0].data?.style.desktop.padding,
    ).toBe("72px 24px");
  });
});
