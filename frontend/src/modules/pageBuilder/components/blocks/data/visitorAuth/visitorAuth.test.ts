import {
  describe,
  expect,
  it,
  vi
} from "vitest";
import React from "react";
import {
  renderToString
} from "react-dom/server";

vi.hoisted(() => {
  const storage = new Map<string, string>();

  (globalThis as any).localStorage = {
    getItem: (key: string) =>
      storage.get(key) || null,
    setItem: (key: string, value: string) => {
      storage.set(key, value);
    },
    removeItem: (key: string) => {
      storage.delete(key);
    },
    clear: () => {
      storage.clear();
    }
  };
});

import {
  readFileSync
} from "fs";

import {
  resolve
} from "path";

vi.mock(
  "../../../../../../redux/services/visitorAuth.api",
  () => ({
    useLoginVisitorMutation: () => [
      vi.fn(),
      { isLoading: false }
    ],
    useRegisterVisitorMutation: () => [
      vi.fn(),
      { isLoading: false }
    ]
  })
);

import {
  blockRegistry
} from "../../../../core/blockRegistry";

import {
  submitVisitorLogin,
  submitVisitorRegister
} from "./actions";

import {
  getSafeVisitorRedirectPath
} from "./redirect";

import {
  applyVisitorAuthPresentationToBlock,
  extractVisitorAuthPresentation
} from "./presentation";

import {
  canAddVisitorAuthBlockForPage,
  canDeleteBlockForPage,
  canDuplicateBlockForPage
} from "../../../../core/visitorAuthBlockPolicy";

import {
  createVisitorAuthBlockFromForm,
  detectImportedAuthForm
} from "../../../../runtime/importers/html/authFormDetection";

import {
  RuntimeProvider
} from "../../../../runtime/context/RuntimeProvider";

const makeInput = (
  attrs: Record<string, string>
) => ({
  type: attrs.type || "text",
  name: attrs.name || "",
  id: attrs.id || "",
  autocomplete: attrs.autocomplete || "",
  placeholder: attrs.placeholder || "",
  getAttribute: (key: string) =>
    attrs[key] || ""
});

const makeButton = (
  text: string
) => ({
  value: "",
  textContent: text,
  getAttribute: () => ""
});

const makeForm = ({
  text,
  inputs,
  submit,
  className = ""
}: {
  text: string;
  inputs: any[];
  submit: string;
  className?: string;
}) => ({
  className,
  textContent: text,
  querySelectorAll: (selector: string) => {
    if (selector === "input") {
      return inputs;
    }

    if (
      selector ===
      "button,input[type='submit']"
    ) {
      return [makeButton(submit)];
    }

    return [];
  },
  querySelector: (selector: string) => {
    if (selector === "input") {
      return inputs[0] || null;
    }

    if (
      selector ===
      "button,input[type='submit']"
    ) {
      return makeButton(submit);
    }

    if (selector === "label") {
      return null;
    }

    return null;
  }
});

describe("visitor auth block registration", () => {
  it("registers both dedicated auth block definitions", () => {
    expect(
      blockRegistry.visitorLogin?.type
    ).toBe("visitorLogin");
    expect(
      blockRegistry.visitorRegister?.type
    ).toBe("visitorRegister");
  });

  it("renders an existing visitor auth block in editor mode", () => {
    const Component =
      blockRegistry.visitorLogin.component as any;

    const html =
      renderToString(
        React.createElement(
          RuntimeProvider as any,
          {
            value: {
              mode: "editor",
              device: "desktop",
              siteId: 10
            }
          },
          React.createElement(
            Component,
            {
              device: "desktop",
              data:
                blockRegistry.visitorLogin.defaultData
            }
          )
        )
      );

    expect(html).toContain("Log in");
  });

  it("renders labels outside inputs and placeholders inside inputs", () => {
    const Component =
      blockRegistry.visitorLogin.component as any;

    const html =
      renderToString(
        React.createElement(
          RuntimeProvider as any,
          {
            value: {
              mode: "editor",
              device: "desktop",
              siteId: 10
            }
          },
          React.createElement(Component, {
            device: "desktop",
            data: {
              props: {
                title: "Espace Client",
                emailLabel:
                  "Email professionnel",
                emailPlaceholder:
                  "vous@entreprise.com",
                passwordLabel:
                  "Mot de passe",
                passwordPlaceholder:
                  "Votre mot de passe",
                submitText:
                  "Se connecter"
              },
              style: {
                desktop: {
                  "--visitor-auth-title-color":
                    "#f8fafc",
                  "--visitor-auth-input-bg":
                    "rgba(2,11,24,.6)"
                }
              }
            }
          })
        )
      );

    expect(html).toContain(
      "Email professionnel"
    );
    expect(html).toContain(
      'placeholder="vous@entreprise.com"'
    );
    expect(html).not.toContain(
      "MuiInputLabel"
    );
  });

  it("shares compatible presentation tokens between login and register blocks", () => {
    const loginBlock: any = {
      id: "login",
      type: "visitorLogin",
      data: {
        props: {},
        style: {
          desktop: {
            "--visitor-auth-card-bg":
              "rgba(6, 32, 61, 0.7)",
            "--visitor-auth-title-color":
              "#f8fafc",
            "--visitor-auth-input-bg":
              "rgba(2, 11, 24, 0.6)",
            "--visitor-auth-button-bg":
              "linear-gradient(90deg, red, orange)",
            "--visitor-auth-link-color":
              "#ff9900"
          }
        }
      },
      children: []
    };

    const registerBlock: any = {
      id: "register",
      type: "visitorRegister",
      data: {
        props: {
          title: "Create account",
          fullNameLabel: "Full name"
        },
        style: {
          desktop: {
            maxWidth: "460px"
          }
        }
      },
      children: []
    };

    const presentation =
      extractVisitorAuthPresentation(
        loginBlock
      );

    expect(presentation).toMatchObject({
      cardBackground:
        "rgba(6, 32, 61, 0.7)",
      titleColor: "#f8fafc",
      inputBackground:
        "rgba(2, 11, 24, 0.6)",
      buttonBackground:
        "linear-gradient(90deg, red, orange)",
      linkColor: "#ff9900"
    });

    const updated =
      applyVisitorAuthPresentationToBlock(
        registerBlock,
        presentation!,
        {
          loginPath:
            "/site/10/client-portal"
        }
      );

    expect(updated.id).toBe(
      "register"
    );
    expect(updated.type).toBe(
      "visitorRegister"
    );
    expect(
      updated.data.props.fullNameLabel
    ).toBe("Full name");
    expect(
      updated.data.props.loginPath
    ).toBe(
      "/site/10/client-portal"
    );
    expect(
      updated.data.style.desktop[
        "--visitor-auth-button-bg"
      ]
    ).toBe(
      "linear-gradient(90deg, red, orange)"
    );
  });

  it("does not hardcode imported brand literals in auth defaults", () => {
    const loginDefaults =
      readFileSync(
        resolve(
          process.cwd(),
          "src/modules/pageBuilder/components/blocks/data/visitorLogin/defaults.ts"
        ),
        "utf8"
      );

    const registerDefaults =
      readFileSync(
        resolve(
          process.cwd(),
          "src/modules/pageBuilder/components/blocks/data/visitorRegister/defaults.ts"
        ),
        "utf8"
      );

    const defaults =
      `${loginDefaults}\n${registerDefaults}`;

    expect(defaults).not.toMatch(
      /VIFCO|Espace Client|F77F00|E85D04|Demander un acc/i
    );
  });

  it("uses a safe imported login path for register links and rejects external paths", () => {
    const Component =
      blockRegistry.visitorRegister.component as any;

    const safeHtml =
      renderToString(
        React.createElement(
          RuntimeProvider as any,
          {
            value: {
              mode: "editor",
              device: "desktop",
              siteId: 10
            }
          },
          React.createElement(Component, {
            device: "desktop",
            data: {
              props: {
                loginPath:
                  "/site/10/client-portal",
                loginLinkText:
                  "Back to portal"
              },
              style: {
                desktop: {}
              }
            }
          })
        )
      );

    expect(safeHtml).toContain(
      'href="/site/10/client-portal"'
    );

    const unsafeHtml =
      renderToString(
        React.createElement(
          RuntimeProvider as any,
          {
            value: {
              mode: "editor",
              device: "desktop",
              siteId: 10
            }
          },
          React.createElement(Component, {
            device: "desktop",
            data: {
              props: {
                loginPath:
                  "https://evil.example/login",
                loginLinkText:
                  "Back to portal"
              },
              style: {
                desktop: {}
              }
            }
          })
        )
      );

    expect(unsafeHtml).toContain(
      'href="/site/10/login"'
    );
    expect(unsafeHtml).not.toContain(
      "evil.example"
    );
  });

  it("uses imported dark-card readable colors", () => {
    const Component =
      blockRegistry.visitorLogin.component as any;

    const html =
      renderToString(
        React.createElement(
          RuntimeProvider as any,
          {
            value: {
              mode: "editor",
              device: "desktop",
              siteId: 10
            }
          },
          React.createElement(Component, {
            device: "desktop",
            data: {
              props: {
                title: "Espace Client",
                subtitle:
                  "Connectez-vous à votre portail sécurisé VIFCO.",
                submitText:
                  "Se connecter"
              },
              style: {
                desktop: {
                  "--visitor-auth-card-bg":
                    "rgba(6,32,61,.7)",
                  "--visitor-auth-title-color":
                    "#f8fafc",
                  "--visitor-auth-subtitle-color":
                    "#7A9EC0"
                }
              }
            }
          })
        )
      );

    expect(html).toContain(
      "--visitor-auth-title-color:#f8fafc"
    );
    expect(html).toContain(
      "--visitor-auth-subtitle-color:#7A9EC0"
    );
  });

  it("keeps visitor auth blocks hidden from the normal BlockLibrary", () => {
    const source =
      readFileSync(
        resolve(
          process.cwd(),
          "src/modules/pageBuilder/components/sidebar/BlockLibrary.tsx"
        ),
        "utf8"
      );

    expect(source).not.toContain(
      'type="visitorLogin"'
    );
    expect(source).not.toContain(
      'type="visitorRegister"'
    );
  });
});

describe("visitor auth redirect validation", () => {
  it("rejects protocol-relative and external redirects", () => {
    expect(
      getSafeVisitorRedirectPath(
        "//evil.example",
        10
      )
    ).toBeNull();
    expect(
      getSafeVisitorRedirectPath(
        "https://evil.example",
        10
      )
    ).toBeNull();
    expect(
      getSafeVisitorRedirectPath(
        "%2F%2Fevil.example",
        10
      )
    ).toBeNull();
  });

  it("rejects cross-site redirects", () => {
    expect(
      getSafeVisitorRedirectPath(
        "/site/11/dashboard",
        10
      )
    ).toBeNull();
  });

  it("rejects parent path traversal", () => {
    expect(
      getSafeVisitorRedirectPath(
        "/site/456/../457/page",
        456
      )
    ).toBeNull();
  });

  it("rejects encoded parent path traversal", () => {
    expect(
      getSafeVisitorRedirectPath(
        "/site/456/%2e%2e/457/page",
        456
      )
    ).toBeNull();
  });

  it("rejects double encoded parent traversal", () => {
    expect(
      getSafeVisitorRedirectPath(
        "/site/456/%252e%252e/457/page",
        456
      )
    ).toBeNull();
  });

  it("rejects a cross-site path", () => {
    expect(
      getSafeVisitorRedirectPath(
        "/site/457/dashboard",
        456
      )
    ).toBeNull();
  });

  it("accepts valid same-site redirects", () => {
    expect(
      getSafeVisitorRedirectPath(
        "/site/10/members",
        10
      )
    ).toBe("/site/10/members");
    expect(
      getSafeVisitorRedirectPath(
        "/p/10/private",
        10
      )
    ).toBe("/p/10/private");
  });

  it("accepts a valid same-site path with query", () => {
    expect(
      getSafeVisitorRedirectPath(
        "/site/456/account?tab=profile",
        456
      )
    ).toBe(
      "/site/456/account?tab=profile"
    );
  });

  it("accepts the current public page path", () => {
    expect(
      getSafeVisitorRedirectPath(
        "/p/456/private-page",
        456
      )
    ).toBe(
      "/p/456/private-page"
    );
  });
});

describe("visitor auth submission behavior", () => {
  it("does not call login mutation in editor or preview mode", async () => {
    const loginVisitor =
      vi.fn();

    await submitVisitorLogin({
      mode: "editor",
      siteId: 10,
      email: "a@example.com",
      password: "secret",
      loginVisitor
    });

    await submitVisitorLogin({
      mode: "preview",
      siteId: 10,
      email: "a@example.com",
      password: "secret",
      loginVisitor
    });

    expect(loginVisitor).not.toHaveBeenCalled();
  });

  it("calls login mutation in public mode", async () => {
    const loginVisitor =
      vi.fn(() => ({
        unwrap: vi.fn().mockResolvedValue({})
      })) as any;

    await submitVisitorLogin({
      mode: "public",
      siteId: 10,
      email: "a@example.com",
      password: "secret",
      loginVisitor
    });

    expect(loginVisitor).toHaveBeenCalledWith({
      siteId: 10,
      email: "a@example.com",
      password: "secret"
    });
  });

  it("does not call register mutation in editor or preview mode", async () => {
    const registerVisitor =
      vi.fn();

    await submitVisitorRegister({
      mode: "editor",
      siteId: 10,
      fullName: "Ada",
      email: "a@example.com",
      password: "secret",
      confirmPassword: "secret",
      registerVisitor
    });

    await submitVisitorRegister({
      mode: "preview",
      siteId: 10,
      fullName: "Ada",
      email: "a@example.com",
      password: "secret",
      confirmPassword: "secret",
      registerVisitor
    });

    expect(registerVisitor).not.toHaveBeenCalled();
  });

  it("calls register mutation in public mode", async () => {
    const registerVisitor =
      vi.fn(() => ({
        unwrap: vi.fn().mockResolvedValue({})
      })) as any;

    await submitVisitorRegister({
      mode: "public",
      siteId: 10,
      fullName: "Ada",
      email: "a@example.com",
      password: "secret",
      confirmPassword: "secret",
      registerVisitor
    });

    expect(registerVisitor).toHaveBeenCalledWith({
      siteId: 10,
      fullName: "Ada",
      email: "a@example.com",
      password: "secret"
    });
  });
});

describe("visitor auth builder policy", () => {
  const loginBlock: any = {
    id: "login",
    type: "visitorLogin",
    data: {
      props: {},
      style: {}
    },
    children: []
  };

  it("prevents deleting required system auth blocks", () => {
    expect(
      canDeleteBlockForPage({
        blocks: [loginBlock],
        blockId: "login",
        systemType: "visitor_login"
      })
    ).toBe(false);
  });

  it("prevents duplicating auth blocks on normal pages", () => {
    expect(
      canDuplicateBlockForPage({
        blocks: [loginBlock],
        blockId: "login",
        systemType: null
      })
    ).toBe(false);
  });

  it("prevents mixing login and register auth blocks", () => {
    expect(
      canAddVisitorAuthBlockForPage({
        blocks: [loginBlock],
        type: "visitorRegister",
        systemType: null
      })
    ).toBe(false);
  });

  it("keeps other blocks addable", () => {
    expect(
      canAddVisitorAuthBlockForPage({
        blocks: [loginBlock],
        type: "text",
        systemType: null
      })
    ).toBe(true);
  });
});

describe("imported auth form detection", () => {
  it("classifies a client portal login form as visitorLogin", () => {
    const result =
      detectImportedAuthForm({
        form: makeForm({
          text: "Client Portal",
          inputs: [
            makeInput({
              type: "email",
              name: "email"
            }),
            makeInput({
              type: "password",
              name: "password"
            })
          ],
          submit: "Sign in"
        }) as any,
        slug: "client-portal",
        sourceFile: "client-portal.html"
      });

    expect(result.kind).toBe("visitorLogin");
  });

  it("keeps client portal auth replacement scoped to the form block", () => {
    const form =
      makeForm({
        text:
          "Client Portal Access your shipments and documents",
        inputs: [
          makeInput({
            type: "email",
            name: "email"
          }),
          makeInput({
            type: "password",
            name: "password"
          })
        ],
        submit: "Continue"
      }) as any;

    const result =
      detectImportedAuthForm({
        form,
        slug: "client-portal",
        sourceFile: "client-portal.html"
      });

    const block =
      createVisitorAuthBlockFromForm(
        form,
        ["body", 2],
        "visitorLogin"
      );

    expect(result.kind).toBe("visitorLogin");
    expect(block.type).toBe("visitorLogin");
    expect(block).not.toHaveProperty("systemType");
    expect(block).not.toHaveProperty("slug");
  });

  it("maps imported VIFCO submit-button styling", () => {
    const form =
      makeForm({
        text: "Espace Client",
        className: "login-box reveal d1",
        inputs: [
          makeInput({
            type: "email",
            name: "email"
          }),
          makeInput({
            type: "password",
            name: "password"
          })
        ],
        submit: "Se connecter →"
      }) as any;

    const block =
      createVisitorAuthBlockFromForm(
        form,
        ["body", 1],
        "visitorLogin"
      ) as any;

    expect(
      block.data.style.desktop[
        "--visitor-auth-button-bg"
      ]
    ).toContain("linear-gradient");
    expect(
      block.data.style.desktop[
        "--visitor-auth-button-color"
      ]
    ).toBe("#0A0A0A");
    expect(
      block.data.props.dividerText
    ).toBe("ou");
  });

  it("keeps imported page context outside the auth replacement", () => {
    const surroundingBlocks = [
      {
        id: "hero",
        type: "section",
        children: [
          {
            id: "hero-title",
            type: "title",
            data: {
              props: {
                content:
                  "Accédez à vos livrables & dashboards."
              }
            },
            children: []
          }
        ]
      }
    ];

    const before =
      JSON.stringify(
        surroundingBlocks
      );

    createVisitorAuthBlockFromForm(
      makeForm({
        text: "Espace Client",
        className: "login-box",
        inputs: [
          makeInput({
            type: "email",
            name: "email"
          }),
          makeInput({
            type: "password",
            name: "password"
          })
        ],
        submit: "Se connecter →"
      }) as any,
      ["body", 1],
      "visitorLogin"
    );

    expect(
      JSON.stringify(
        surroundingBlocks
      )
    ).toBe(before);
  });

  it("classifies a signup form as visitorRegister", () => {
    const result =
      detectImportedAuthForm({
        form: makeForm({
          text: "Create account",
          inputs: [
            makeInput({
              name: "full_name",
              placeholder: "Full name"
            }),
            makeInput({
              type: "email",
              name: "email"
            }),
            makeInput({
              type: "password",
              name: "password"
            })
          ],
          submit: "Register"
        }) as any,
        slug: "signup"
      });

    expect(result.kind).toBe("visitorRegister");
  });

  it("keeps contact forms out of visitor auth", () => {
    const result =
      detectImportedAuthForm({
        form: makeForm({
          text: "Contact us",
          inputs: [
            makeInput({
              name: "name"
            }),
            makeInput({
              type: "email",
              name: "email"
            })
          ],
          submit: "Send message"
        }) as any,
        slug: "contact"
      });

    expect(result.kind).toBeNull();
  });

  it("does not convert weak ambiguous forms", () => {
    const result =
      detectImportedAuthForm({
        form: makeForm({
          text: "Subscribe",
          inputs: [
            makeInput({
              type: "email",
              name: "email"
            })
          ],
          submit: "Continue"
        }) as any,
        slug: "newsletter"
      });

    expect(result.kind).toBeNull();
  });
});
