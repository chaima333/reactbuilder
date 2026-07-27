import {
  describe,
  expect,
  it,
  vi
} from "vitest";
import {
  readFileSync
} from "fs";

const mocks = vi.hoisted(() => ({
  importHtmlDocument: vi.fn(),
  footerHtmlToBlock: vi.fn()
}));

vi.mock("../importHtmlDocument", () => ({
  importHtmlDocument:
    mocks.importHtmlDocument
}));

vi.mock("../footerToBlock", () => ({
  footerHtmlToBlock:
    mocks.footerHtmlToBlock
}));

import {
  executeZipWebsiteImport
} from "./executeZipWebsiteImport";

const mutationResult = (
  value: unknown
) => ({
  unwrap:
    vi.fn().mockResolvedValue(
      value
    )
});

const makeImportedBlocks = (
  slug: string
) => [
  {
    id: `${slug}-section`,
    type: "section",
    data: {
      props: {},
      style: {
        desktop: {
          backgroundColor: "#020b18",
          color: "#f8fafc"
        }
      }
    },
    children: [
      {
        id: `${slug}-title`,
        type: "title",
        data: {
          props: {
            content:
              slug === "client-portal"
                ? "Accédez à vos livrables & dashboards."
                : "Imported login page with enough title text"
          },
          style: {
            desktop: {
              color: "#f8fafc"
            }
          }
        },
        children: []
      },
      ...(slug === "client-portal"
        ? [
            {
              id:
                "visitorLogin-client-portal-imported",
              type: "visitorLogin",
              data: {
                props: {
                  title: "Espace Client"
                },
                style: {
                  desktop: {
                    "--visitor-auth-card-bg":
                      "rgba(6, 32, 61, 0.7)",
                    "--visitor-auth-title-color":
                      "#f8fafc",
                    "--visitor-auth-input-bg":
                      "rgba(2, 11, 24, 0.6)",
                    "--visitor-auth-input-border":
                      "1px solid rgba(10, 132, 255, 0.2)",
                    "--visitor-auth-button-bg":
                      "linear-gradient(90deg, rgb(232, 93, 4), rgb(247, 127, 0), rgb(255, 170, 59))",
                    "--visitor-auth-button-color":
                      "#0A0A0A",
                    "--visitor-auth-link-color":
                      "#F77F00"
                  }
                }
              },
              children: []
            }
          ]
        : [])
    ]
  }
];

describe("executeZipWebsiteImport fresh ZIP runtime", () => {
  it("creates normal client-portal while keeping system login separate", async () => {
    const backendPages =
      new Map<string, any>([
        [
          "login",
          {
            id: 1,
            slug: "login",
            systemType:
              "visitor_login",
            status: "published"
          }
        ],
        [
          "register",
          {
            id: 2,
            slug: "register",
            systemType:
              "visitor_register",
            status: "published"
          }
        ]
      ]);

    mocks.footerHtmlToBlock.mockResolvedValue(
      null
    );
    mocks.importHtmlDocument.mockImplementation(
      async (_html, context) => ({
        blocks:
          makeImportedBlocks(
            context.slug
          ),
        warnings: [],
        matcherHits: []
      })
    );

    const uploadHtmlZip = vi
      .fn()
      .mockReturnValue(
        mutationResult({
          success: true,
          assetMap: {},
          globalLayout: {
            navHtml: "",
            footerHtml: ""
          },
          pages: [
            {
              title:
                "Client Portal",
              originalSlug:
                "client-portal",
              slug:
                "client-portal",
              sourceFile:
                "client-portal.html",
              processedHtml:
                "<html><body>client portal</body></html>"
            },
            {
              title:
                "Login Imported",
              originalSlug:
                "login",
              slug:
                "login-imported",
              sourceFile:
                "login.html",
              processedHtml:
                "<html><body>login</body></html>"
            }
          ]
        })
      );

    const updateGlobalLayout = vi
      .fn()
      .mockReturnValue(
        mutationResult({})
      );

    const createPage = vi.fn(
      (payload) => {
        const {
          title,
          slug,
          blocks
        } = payload;

        if (
          backendPages.has(slug)
        ) {
          return mutationResult(
            Promise.reject({
              status: 500,
              data: {
                message:
                  "slug must be unique"
              }
            })
          );
        }

        const page = {
          id:
            backendPages.size + 1,
          title,
          slug,
          status: "draft",
          systemType: null,
          blocks
        };

        backendPages.set(
          slug,
          page
        );

        return mutationResult(page);
      }
    );

    const publishPage = vi.fn(
      ({ pageId }) => {
        for (const page of backendPages.values()) {
          if (page.id === pageId) {
            page.status = "published";
          }
        }

        return mutationResult({});
      }
    );

    const result =
      await executeZipWebsiteImport({
        zipFile:
          new File(["zip"], "vifco.zip"),
        siteId: 478,
        uploadHtmlZip,
        updateGlobalLayout,
        createPage,
        publishPage
      });

    expect(result.failedPages).toEqual(
      []
    );
    expect(
      backendPages.get("login")
        ?.systemType
    ).toBe("visitor_login");
    expect(
      backendPages.get(
        "client-portal"
      )?.systemType
    ).toBeNull();
    expect(
      backendPages.get(
        "client-portal"
      )?.status
    ).toBe("published");
    expect(
      backendPages.has(
        "login-imported"
      )
    ).toBe(true);

    const clientBlocks =
      backendPages.get(
        "client-portal"
      )?.blocks || [];

    const serialized =
      JSON.stringify(
        clientBlocks
      );

    expect(serialized).toContain(
      "Accédez à vos livrables"
    );
    expect(
      serialized.match(
        /"type":"visitorLogin"/g
      )?.length
    ).toBe(1);
    expect(serialized).not.toContain(
      "\"type\":\"visitorRegister\""
    );

    expect(createPage).toHaveBeenCalledWith(
      expect.objectContaining({
        siteId: 478,
        title:
          "Client Portal",
        slug:
          "client-portal",
        isHomepage:
          undefined
      })
    );
    expect(
      result.createdPages.map(
        page => page.slug
      )
    ).toEqual([
      "client-portal",
      "login-imported"
    ]);
  });

  it("syncs imported login presentation into the system register fallback", async () => {
    const systemRegisterBlock = {
      id: "system-register-auth",
      type: "visitorRegister",
      data: {
        props: {
          title: "Create account",
          fullNameLabel: "Full name",
          emailLabel: "Email",
          passwordLabel: "Password",
          confirmPasswordLabel:
            "Confirm password",
          submitText: "Create account"
        },
        style: {
          desktop: {
            maxWidth: "460px"
          },
          tablet: {},
          mobile: {}
        }
      },
      children: []
    };

    const backendPages =
      new Map<string, any>([
        [
          "login",
          {
            id: 1,
            slug: "login",
            systemType:
              "visitor_login",
            status: "published",
            blocks: []
          }
        ],
        [
          "register",
          {
            id: 2,
            slug: "register",
            systemType:
              "visitor_register",
            status: "published",
            blocks: [
              systemRegisterBlock
            ]
          }
        ]
      ]);

    mocks.footerHtmlToBlock.mockResolvedValue(
      null
    );
    mocks.importHtmlDocument.mockImplementation(
      async (_html, context) => ({
        blocks:
          makeImportedBlocks(
            context.slug
          ),
        warnings: [],
        matcherHits: []
      })
    );

    const uploadHtmlZip = vi
      .fn()
      .mockReturnValue(
        mutationResult({
          success: true,
          assetMap: {},
          globalLayout: {
            navHtml: "",
            footerHtml: ""
          },
          pages: [
            {
              title:
                "Client Portal",
              originalSlug:
                "client-portal",
              slug:
                "client-portal",
              sourceFile:
                "client-portal.html",
              processedHtml:
                "<html><body>client portal</body></html>"
            }
          ]
        })
      );

    const updateGlobalLayout = vi
      .fn()
      .mockReturnValue(
        mutationResult({})
      );

    const createPage = vi.fn(
      (payload) => {
        const page = {
          id:
            backendPages.size + 1,
          title:
            payload.title,
          slug:
            payload.slug,
          status: "draft",
          systemType: null,
          blocks:
            payload.blocks
        };

        backendPages.set(
          payload.slug,
          page
        );

        return mutationResult(page);
      }
    );

    const publishPage = vi.fn(
      ({ pageId }) => {
        for (const page of backendPages.values()) {
          if (page.id === pageId) {
            page.status = "published";
          }
        }

        return mutationResult({});
      }
    );

    const getPages = vi
      .fn()
      .mockReturnValue(
        mutationResult(
          Array.from(
            backendPages.values()
          )
        )
      );

    const updatePage = vi.fn(
      ({ pageId, blocks }) => {
        for (const page of backendPages.values()) {
          if (page.id === pageId) {
            page.blocks = blocks;
          }
        }

        return mutationResult({});
      }
    );

    await executeZipWebsiteImport({
      zipFile:
        new File(["zip"], "vifco.zip"),
      siteId: 481,
      uploadHtmlZip,
      updateGlobalLayout,
      createPage,
      publishPage,
      getPages,
      updatePage
    });

    expect(updatePage).toHaveBeenCalledWith(
      expect.objectContaining({
        siteId: 481,
        pageId: 2
      })
    );

    const updatedRegister =
      backendPages.get(
        "register"
      );

    const serialized =
      JSON.stringify(
        updatedRegister.blocks
      );

    expect(
      updatedRegister.slug
    ).toBe("register");
    expect(
      updatedRegister.systemType
    ).toBe("visitor_register");
    expect(
      updatedRegister.status
    ).toBe("published");
    expect(
      serialized.match(
        /"type":"visitorRegister"/g
      )?.length
    ).toBe(1);
    expect(serialized).not.toContain(
      "\"type\":\"visitorLogin\""
    );
    expect(serialized).toContain(
      "Full name"
    );
    expect(serialized).toContain(
      "--visitor-auth-card-bg"
    );
    expect(serialized).toContain(
      "linear-gradient"
    );
    expect(serialized).toContain(
      "\"loginPath\":\"/site/481/client-portal\""
    );
  });

  it("creates and publishes services-finance through the ZIP runtime when semantic import throws", async () => {
    const financeHtml =
      readFileSync(
        "C:/Users/kabou/Desktop/VIFCO/services-finance.html",
        "utf8"
      );

    expect(financeHtml).toContain(
      "Finance"
    );

    const backendPages =
      new Map<string, any>();

    mocks.footerHtmlToBlock.mockResolvedValue(
      null
    );
    mocks.importHtmlDocument.mockImplementation(
      async (_html, context) => {
        if (
          context.sourceFile ===
          "services-finance.html"
        ) {
          const error: any =
            new Error(
              "section cannot contain primitive title directly"
            );
          error.name =
            "InvariantViolationException";
          error.violations = [
            {
              code: "INVALID_NESTING",
              path: "blocks[0]",
              message:
                "section cannot contain primitive title directly"
            }
          ];
          throw error;
        }

        return {
          blocks:
            makeImportedBlocks(
              context.slug
            ),
          warnings: [],
          matcherHits: []
        };
      }
    );

    const uploadHtmlZip = vi
      .fn()
      .mockReturnValue(
        mutationResult({
          success: true,
          assetMap: {},
          globalLayout: {
            navHtml: "",
            footerHtml: ""
          },
          pages: [
            {
              title:
                "Services Ai",
              originalSlug:
                "services-ai",
              slug:
                "services-ai",
              sourceFile:
                "services-ai.html",
              processedHtml:
                "<html><body><h1>AI advisory services</h1></body></html>"
            },
            {
              title:
                "Services Finance",
              originalSlug:
                "services-finance",
              slug:
                "services-finance",
              sourceFile:
                "services-finance.html",
              processedHtml:
                financeHtml
            },
            {
              title:
                "Services Esg",
              originalSlug:
                "services-esg",
              slug:
                "services-esg",
              sourceFile:
                "services-esg.html",
              processedHtml:
                "<html><body><h1>ESG advisory services</h1></body></html>"
            }
          ]
        })
      );

    const updateGlobalLayout = vi
      .fn()
      .mockReturnValue(
        mutationResult({})
      );

    const createPage = vi.fn(
      (payload) => {
        const page = {
          id:
            backendPages.size + 1,
          title:
            payload.title,
          slug:
            payload.slug,
          status: "draft",
          systemType: null,
          blocks:
            payload.blocks
        };

        backendPages.set(
          payload.slug,
          page
        );

        return mutationResult(page);
      }
    );

    const publishPage = vi.fn(
      ({ pageId }) => {
        for (const page of backendPages.values()) {
          if (page.id === pageId) {
            page.status = "published";
          }
        }

        return mutationResult({});
      }
    );

    const result =
      await executeZipWebsiteImport({
        zipFile:
          new File(["zip"], "vifco.zip"),
        siteId: 482,
        uploadHtmlZip,
        updateGlobalLayout,
        createPage,
        publishPage
      });

    const financePage =
      backendPages.get(
        "services-finance"
      );

    expect(
      result.failedPages
    ).toEqual([]);
    expect(financePage).toBeTruthy();
    expect(
      financePage.status
    ).toBe("published");
    expect(
      financePage.systemType
    ).toBeNull();
    expect(
      financePage.blocks.length
    ).toBeGreaterThan(0);
    expect(
      JSON.stringify(
        financePage.blocks
      )
    ).toContain(
      "HTML_ZIP_RAW_FALLBACK"
    );
    expect(
      JSON.stringify(
        financePage.blocks
      )
    ).not.toContain(
      "visitorLogin"
    );
    expect(
      JSON.stringify(
        financePage.blocks
      )
    ).not.toContain(
      "visitorRegister"
    );

    expect(createPage).toHaveBeenCalledWith(
      expect.objectContaining({
        siteId: 482,
        title:
          "Services Finance",
        slug:
          "services-finance"
      })
    );
    expect(
      publishPage
    ).toHaveBeenCalledWith({
      siteId: 482,
      pageId:
        financePage.id
    });
    expect(
      Array.from(
        backendPages.keys()
      )
    ).toEqual([
      "services-ai",
      "services-finance",
      "services-esg"
    ]);
  });
});
