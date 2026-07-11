import {
  describe,
  expect,
  it,
} from "vitest";

import {
  renderBlocks,
} from "./blockRenderer";

describe("static block renderer parity", () => {
  it("keeps section backgrounds full bleed while constraining inner content", async () => {
    const html =
      await renderBlocks([
        {
          id: "hero-section",
          type: "section",
          data: {
            style: {
              desktop: {
                background: "#020b16",
                color: "#ffffff",
                maxWidth: "720px",
                paddingTop: "96px",
              },
            },
          },
          children: [],
        },
      ]);

    expect(html).toContain("pb-section-root");
    expect(html).toContain("pb-section-inner");
    expect(html).toMatch(/\.rb-block-1-root\{[^}]*background:#020b16/);
    expect(html).toMatch(/\.rb-block-1\{[^}]*max-width:100%/);
    expect(html).toMatch(/\.rb-block-1-inner\{[^}]*max-width:720px/);
  });

  it("serializes nested flex layout without forcing flex items to max-width 100%", async () => {
    const html =
      await renderBlocks([
        {
          id: "row",
          type: "flex",
          data: {
            style: {
              desktop: {
                gap: "16px",
              },
            },
          },
          children: [
            {
              id: "item",
              type: "flexItem",
              data: {
                style: {
                  desktop: {
                    flex: "0 0 auto",
                    width: "max-content",
                  },
                },
              },
              children: [],
            },
          ],
        },
      ]);

    expect(html).toMatch(/\.rb-block-2\{[^}]*display:flex/);
    expect(html).toMatch(/\.rb-block-2\{[^}]*flex-wrap:wrap/);
    expect(html).toMatch(/\.rb-block-1\{[^}]*flex:0 0 auto/);
    expect(html).toMatch(/\.rb-block-1\{[^}]*width:max-content/);
    expect(html).not.toMatch(/\.rb-block-1\{[^}]*max-width:100%/);
  });

  it("preserves gradient title segments and vendor text clipping", async () => {
    const html =
      await renderBlocks([
        {
          id: "headline",
          type: "title",
          data: {
            props: {
              content: "Finance the Visionary.",
              segments: [
                {
                  text: "Finance the ",
                },
                {
                  text: "Visionary",
                  variant: "accent",
                  style: {
                    backgroundImage:
                      "linear-gradient(90deg, #0A84FF, #F77F00)",
                  },
                },
                {
                  text: ".",
                },
              ],
            },
            style: {
              desktop: {
                fontSize: "64px",
              },
              mobile: {
                fontSize: "40px",
              },
            },
          },
          children: [],
        },
      ]);

    expect(html).toContain("Finance the ");
    expect(html).toContain("Visionary");
    expect(html).toContain("linear-gradient(90deg, #0A84FF, #F77F00)");
    expect(html).toContain("-webkit-background-clip:text");
    expect(html).toContain("-webkit-text-fill-color:transparent");
    expect(html).toContain("@media (max-width:600px)");
    expect(html).toMatch(/font-size:40px !important/);
  });

  it("keeps absolute decorative positioning styles", async () => {
    const html =
      await renderBlocks([
        {
          id: "decorative",
          type: "flexItem",
          data: {
            style: {
              desktop: {
                position: "absolute",
                top: "12px",
                right: "20px",
                transform: "translateY(-50%)",
                opacity: 0.4,
                backgroundImage:
                  "linear-gradient(135deg, var(--rb-color-primary), transparent)",
              },
            },
          },
          children: [],
        },
      ]);

    expect(html).toMatch(/position:absolute/);
    expect(html).toMatch(/top:12px/);
    expect(html).toMatch(/right:20px/);
    expect(html).toContain("transform:translateY(-50%)");
    expect(html).toContain("opacity:0.4");
    expect(html).toContain("var(--rb-color-primary)");
  });
});
