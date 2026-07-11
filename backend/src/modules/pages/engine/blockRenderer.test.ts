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

  it("rewrites static export internal navigation links while preserving special links", async () => {
    const rewriteUrl = (url: string) => {
      if (
        url === "/site/420" ||
        url === "/site/420/" ||
        url === "/site/420/home"
      ) {
        return "/";
      }

      if (url === "/site/420/services-finance") {
        return "/services-finance/";
      }

      if (url === "services-finance") {
        return "/services-finance/";
      }

      return url;
    };

    const html =
      await renderBlocks(
        [
          {
            id: "home-link",
            type: "link",
            data: {
              props: {
                href: "/site/420/home",
                label: "Home",
              },
            },
            children: [],
          },
          {
            id: "service-button",
            type: "button",
            data: {
              props: {
                href: "/site/420/services-finance",
                label: "Services",
              },
            },
            children: [],
          },
          {
            id: "known-slug-link",
            type: "link",
            data: {
              props: {
                href: "services-finance",
                label: "Known slug",
              },
            },
            children: [],
          },
          {
            id: "external-link",
            type: "link",
            data: {
              props: {
                href: "https://example.com/page",
                label: "External",
              },
            },
            children: [],
          },
          {
            id: "anchor-link",
            type: "link",
            data: {
              props: {
                href: "#contact",
                label: "Anchor",
              },
            },
            children: [],
          },
          {
            id: "mailto-link",
            type: "link",
            data: {
              props: {
                href: "mailto:hello@example.com",
                label: "Email",
              },
            },
            children: [],
          },
        ],
        420,
        {
          rewriteUrl,
        }
      );

    expect(html).toContain('href="/"');
    expect(
      html.match(/href="\/services-finance\/"/g)
    ).toHaveLength(2);
    expect(html).toContain('href="https://example.com/page"');
    expect(html).toContain('href="#contact"');
    expect(html).toContain('href="mailto:hello@example.com"');
  });

  it("keeps real page content between global navbar and footer", async () => {
    const html =
      await renderBlocks([
        {
          id: "nav",
          type: "navbar",
          data: {
            style: {
              desktop: {},
            },
          },
          children: [],
        },
        {
          id: "content",
          type: "section",
          data: {
            style: {
              desktop: {},
            },
          },
          children: [
            {
              id: "title",
              type: "title",
              data: {
                props: {
                  content: "Industries content",
                },
                style: {
                  desktop: {},
                },
              },
              children: [],
            },
          ],
        },
        {
          id: "footer",
          type: "footer",
          data: {
            style: {
              desktop: {},
            },
          },
          children: [],
        },
      ]);

    expect(html.indexOf("pb-navbar")).toBeGreaterThan(-1);
    expect(html.indexOf("Industries content")).toBeGreaterThan(
      html.indexOf("pb-navbar")
    );
    expect(html.indexOf("Industries content")).toBeLessThan(
      html.indexOf("pb-footer")
    );
  });

  it("lets long titles wrap even when imported HTML saved nowrap styles", async () => {
    const html =
      await renderBlocks([
        {
          id: "long-title",
          type: "title",
          data: {
            props: {
              content:
                "Nous ne sommes pas un cabinet de conseil traditionnel",
            },
            style: {
              desktop: {
                width: "max-content",
                maxWidth: "900px",
                whiteSpace: "nowrap",
                wordBreak: "keep-all",
                overflowWrap: "normal",
              },
            },
          },
          children: [],
        },
      ]);

    expect(html).toMatch(/white-space:normal/);
    expect(html).toMatch(/overflow-wrap:break-word/);
    expect(html).not.toMatch(/white-space:nowrap/);
  });

  it("ignores imported fixed flex and grid heights while preserving intentional minHeight", async () => {
    const html =
      await renderBlocks([
        {
          id: "imported-flex",
          type: "flex",
          data: {
            style: {
              desktop: {
                height: "900px",
                minHeight: "220px",
              },
            },
          },
          children: [],
        },
        {
          id: "imported-grid",
          type: "grid",
          data: {
            style: {
              desktop: {
                height: "640px",
                minHeight: "180px",
              },
            },
          },
          children: [],
        },
      ]);

    expect(html).not.toContain("height:900px");
    expect(html).not.toContain("height:640px");
    expect(html).toContain("min-height:220px");
    expect(html).toContain("min-height:180px");
  });

  it("renders animated initial hidden states as visible in static export", async () => {
    const html =
      await renderBlocks([
        {
          id: "animated",
          type: "text",
          data: {
            props: {
              content: "Animated content",
            },
            style: {
              desktop: {
                opacity: 0,
                visibility: "hidden",
                animation: "fade-in 400ms ease forwards",
              },
            },
          },
          children: [],
        },
      ]);

    expect(html).toContain("opacity:1");
    expect(html).toContain("visibility:visible");
    expect(html).toContain("Animated content");
  });

  it("maps unique published slugs to unique static archive paths", () => {
    const getArchivePath = (slug: string) =>
      slug === "home" || slug === "index"
        ? "index.html"
        : `${slug}/index.html`;

    const slugs = [
      "home",
      "industries",
      "about",
      "vi-platform",
    ];

    const paths =
      slugs.map(getArchivePath);

    expect(new Set(paths).size).toBe(paths.length);
    expect(paths).toEqual([
      "index.html",
      "industries/index.html",
      "about/index.html",
      "vi-platform/index.html",
    ]);
  });
});
