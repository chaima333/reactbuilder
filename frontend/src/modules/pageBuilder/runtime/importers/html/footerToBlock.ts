import type {
  Block
} from "../../../types/page.types";

type ResponsiveFooterStyle = {
  desktop?: Record<string, unknown>;
  tablet?: Record<string, unknown>;
  mobile?: Record<string, unknown>;
};

const createId = (
  prefix: string
) =>
  `${prefix}-${crypto.randomUUID()}`;

const normalizeText = (
  value?: string | null
) =>
  (value || "")
    .replace(/\s+/g, " ")
    .trim();

const makeTextBlock = (
  content: string,
  style: ResponsiveFooterStyle = {}
): Block => ({
  id: createId("footer-text"),
  type: "text",
  data: {
    props: {
      content
    },
    style: {
      desktop: style.desktop || {},
      tablet: style.tablet || {},
      mobile: style.mobile || {}
    }
  },
  children: []
});

const makeTitleBlock = (
  content: string,
  style: ResponsiveFooterStyle = {}
): Block => ({
  id: createId("footer-title"),
  type: "title",
  data: {
    props: {
      content
    },
    style: {
      desktop: style.desktop || {},
      tablet: style.tablet || {},
      mobile: style.mobile || {}
    }
  },
  children: []
});

const makeLinkBlock = (
  label: string,
  href: string,
  style: ResponsiveFooterStyle = {}
): Block => ({
  id: createId("footer-link"),
  type: "link",
  data: {
    props: {
      label,
      text: label,
      href
    },
    style: {
      desktop: style.desktop || {},
      tablet: style.tablet || {},
      mobile: style.mobile || {}
    }
  },
  children: []
});

const makeFlexItem = (
  children: Block[],
  style: ResponsiveFooterStyle = {}
): Block => ({
  id: createId("footer-flex-item"),
  type: "flexItem",
  data: {
    props: {},
    style: {
      desktop: {
        minWidth: "0",
        ...(style.desktop || {})
      },
      tablet: style.tablet || {},
      mobile: style.mobile || {}
    }
  },
  children
});

const makeFlex = (
  children: Block[],
  style: ResponsiveFooterStyle = {}
): Block => ({
  id: createId("footer-flex"),
  type: "flex",
  data: {
    props: {},
    style: {
      desktop: {
        display: "flex",
        ...(style.desktop || {})
      },
      tablet: style.tablet || {},
      mobile: style.mobile || {}
    }
  },
  children
});

export const footerHtmlToBlock = (
  footerHtml: string
): Block | null => {
  if (!footerHtml?.trim()) {
    return null;
  }

  const document =
    new DOMParser().parseFromString(
      footerHtml,
      "text/html"
    );

  const root =
    document.querySelector("footer") ||
    document.body.firstElementChild ||
    document.body;

  if (!root) {
    return null;
  }

  const logoWord =
    normalizeText(
      root.querySelector(".logo .word")?.textContent ||
      root.querySelector(".logo")?.textContent ||
      "VIFCO"
    );

  const description =
    normalizeText(
      root.querySelector(".footer-desc")?.textContent
    );

  const socials =
    Array.from(
      root.querySelectorAll(
        ".socials a, .social-links a, [class*='social'] a"
      )
    )
      .map(link => ({
        label:
          normalizeText(
            link.textContent
          ) ||
          normalizeText(
            link.getAttribute("aria-label")
          ) ||
          "Social",
        href:
          link.getAttribute("href") || "#"
      }))
      .filter(link => link.label);

  const columns =
    Array.from(
      root.querySelectorAll(".footer-col")
    ).map(column => {
      const title =
        normalizeText(
          column.querySelector("h4")?.textContent
        );

      const links =
        Array.from(
          column.querySelectorAll("li a, a")
        )
          .map(link => ({
            label:
              normalizeText(
                link.textContent
              ),
            href:
              link.getAttribute("href") || "#"
          }))
          .filter(link => link.label);

      return {
        title,
        links
      };
    }).filter(column =>
      column.title || column.links.length
    );

  const bottom =
    root.querySelector(".footer-bottom");

  const bottomLinks =
    Array.from(
      bottom?.querySelectorAll(".links a, a") || []
    )
      .map(link => ({
        label:
          normalizeText(
            link.textContent
          ),
        href:
          link.getAttribute("href") || "#"
      }))
      .filter(link => link.label);

  const bottomClone =
    bottom?.cloneNode(true) as HTMLElement | null;

  bottomClone
    ?.querySelectorAll(".links, a")
    .forEach(node => node.remove());

  const copyright =
    normalizeText(
      bottomClone?.textContent
    );

  const brandChildren = [
    makeTitleBlock(
      logoWord,
      {
        desktop: {
          color: "#ffffff",
          fontSize: "26px",
          fontWeight: 900,
          letterSpacing: "0.12em",
          lineHeight: "1.1",
          textTransform: "uppercase"
        },
        mobile: {
          fontSize: "22px"
        }
      }
    ),
    ...(description
      ? [
          makeTextBlock(
            description,
            {
              desktop: {
                color: "rgba(122,158,192,0.9)",
                fontSize: "15px",
                lineHeight: "1.75",
                maxWidth: "380px"
              },
              mobile: {
                maxWidth: "100%"
              }
            }
          )
        ]
      : []),
    ...(socials.length
      ? [
          makeFlex(
            socials.map(social =>
              makeFlexItem(
                [
                  makeLinkBlock(
                    social.label,
                    social.href,
                    {
                      desktop: {
                        color: "rgba(255,255,255,0.72)",
                        fontSize: "13px",
                        fontWeight: 700,
                        textDecoration: "none"
                      }
                    }
                  )
                ],
                {
                  desktop: {
                    flex: "0 0 auto"
                  }
                }
              )
            ),
            {
              desktop: {
                flexDirection: "row",
                flexWrap: "wrap",
                gap: "14px",
                marginTop: "10px"
              },
              mobile: {
                gap: "10px"
              }
            }
          )
        ]
      : [])
  ];

  const brandItem =
    makeFlexItem(
      brandChildren,
      {
        desktop: {
          flex: "1 1 360px",
          maxWidth: "430px",
          display: "flex",
          flexDirection: "column",
          gap: "18px"
        },
        mobile: {
          flex: "1 1 100%",
          maxWidth: "100%"
        }
      }
    );

  const columnItems =
    columns.map(column =>
      makeFlexItem(
        [
          ...(column.title
            ? [
                makeTitleBlock(
                  column.title,
                  {
                    desktop: {
                      color: "#ffffff",
                      fontSize: "13px",
                      fontWeight: 800,
                      letterSpacing: "0.12em",
                      lineHeight: "1.25",
                      textTransform: "uppercase"
                    }
                  }
                )
              ]
            : []),
          ...column.links.map(link =>
            makeLinkBlock(
              link.label,
              link.href,
              {
                desktop: {
                  color: "rgba(122,158,192,0.92)",
                  fontSize: "14px",
                  lineHeight: "1.55",
                  textDecoration: "none"
                }
              }
            )
          )
        ],
        {
          desktop: {
            flex: "0 1 180px",
            display: "flex",
            flexDirection: "column",
            gap: "12px"
          },
          mobile: {
            flex: "1 1 100%"
          }
        }
      )
    );

  const topRow =
    makeFlex(
      [
        brandItem,
        ...columnItems
      ],
      {
        desktop: {
          flexDirection: "row",
          flexWrap: "wrap",
          gap: "56px",
          justifyContent: "space-between",
          alignItems: "flex-start",
          width: "100%"
        },
        tablet: {
          gap: "40px"
        },
        mobile: {
          flexDirection: "column",
          gap: "34px",
          alignItems: "stretch"
        }
      }
    );

  const bottomRow =
    makeFlex(
      [
        makeFlexItem(
          copyright
            ? [
                makeTextBlock(
                  copyright,
                  {
                    desktop: {
                      color: "rgba(122,158,192,0.72)",
                      fontSize: "13px",
                      lineHeight: "1.6"
                    }
                  }
                )
              ]
            : [],
          {
            desktop: {
              flex: "1 1 auto"
            },
            mobile: {
              flex: "1 1 100%"
            }
          }
        ),
        makeFlexItem(
          bottomLinks.map(link =>
            makeLinkBlock(
              link.label,
              link.href,
              {
                desktop: {
                  color: "rgba(122,158,192,0.72)",
                  fontSize: "13px",
                  textDecoration: "none"
                }
              }
            )
          ),
          {
            desktop: {
              flex: "0 1 auto",
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              gap: "18px",
              justifyContent: "flex-end"
            },
            mobile: {
              flex: "1 1 100%",
              justifyContent: "flex-start",
              gap: "12px"
            }
          }
        )
      ],
      {
        desktop: {
          flexDirection: "row",
          flexWrap: "wrap",
          gap: "20px",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid rgba(122,158,192,0.15)",
          paddingTop: "26px"
        },
        mobile: {
          flexDirection: "column",
          alignItems: "stretch"
        }
      }
    );

  return {
    id: createId("footer-section"),
    type: "section",
    meta: {
      semanticType: "FOOTER"
    },
    data: {
      props: {},
      style: {
        desktop: {
          backgroundColor: "#020B18",
          color: "#ffffff",
          padding: "72px 24px 30px",
          width: "100%"
        },
        tablet: {
          padding: "60px 22px 28px"
        },
        mobile: {
          padding: "48px 20px 26px"
        }
      }
    },
    children: [
      makeFlex(
        [
          topRow,
          bottomRow
        ],
        {
          desktop: {
            flexDirection: "column",
            gap: "38px",
            maxWidth: "1180px",
            margin: "0 auto",
            width: "100%"
          },
          mobile: {
            gap: "32px"
          }
        }
      )
    ]
  };
};
