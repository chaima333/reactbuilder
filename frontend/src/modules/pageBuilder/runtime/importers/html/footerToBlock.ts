import type {
  Block
} from "../../../types/page.types";

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
  style: Record<string, unknown> = {}
): Block => ({
  id: createId("footer-text"),
  type: "text",
  data: {
    props: {
      content
    },
    style: {
      desktop: style,
      tablet: {},
      mobile: {}
    }
  },
  children: []
});

const makeTitleBlock = (
  content: string,
  style: Record<string, unknown> = {}
): Block => ({
  id: createId("footer-title"),
  type: "title",
  data: {
    props: {
      content
    },
    style: {
      desktop: style,
      tablet: {},
      mobile: {}
    }
  },
  children: []
});

const makeLinkBlock = (
  label: string,
  href: string,
  style: Record<string, unknown> = {}
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
      desktop: style,
      tablet: {},
      mobile: {}
    }
  },
  children: []
});

const makeFlexItem = (
  children: Block[],
  style: Record<string, unknown> = {}
): Block => ({
  id: createId("footer-flex-item"),
  type: "flexItem",
  data: {
    props: {},
    style: {
      desktop: {
        minWidth: "0",
        ...style
      },
      tablet: {},
      mobile: {}
    }
  },
  children
});

const makeFlex = (
  children: Block[],
  style: Record<string, unknown> = {}
): Block => ({
  id: createId("footer-flex"),
  type: "flex",
  data: {
    props: {},
    style: {
      desktop: {
        display: "flex",
        ...style
      },
      tablet: {},
      mobile: {}
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
        color: "#ffffff",
        fontSize: "24px",
        fontWeight: 800,
        lineHeight: "1.1"
      }
    ),
    ...(description
      ? [
          makeTextBlock(
            description,
            {
              color: "rgba(255,255,255,0.72)",
              fontSize: "15px",
              lineHeight: "1.7",
              maxWidth: "360px"
            }
          )
        ]
      : [])
  ];

  const brandItem =
    makeFlexItem(
      brandChildren,
      {
        flex: "1 1 320px",
        maxWidth: "420px"
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
                    color: "#ffffff",
                    fontSize: "14px",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase"
                  }
                )
              ]
            : []),
          ...column.links.map(link =>
            makeLinkBlock(
              link.label,
              link.href,
              {
                color: "rgba(255,255,255,0.68)",
                fontSize: "14px",
                textDecoration: "none"
              }
            )
          )
        ],
        {
          flex: "0 1 180px"
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
        flexDirection: "row",
        flexWrap: "wrap",
        gap: "48px",
        justifyContent: "space-between",
        alignItems: "flex-start",
        width: "100%"
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
                    color: "rgba(255,255,255,0.55)",
                    fontSize: "13px"
                  }
                )
              ]
            : [],
          {
            flex: "1 1 auto"
          }
        ),
        makeFlexItem(
          bottomLinks.map(link =>
            makeLinkBlock(
              link.label,
              link.href,
              {
                color: "rgba(255,255,255,0.6)",
                fontSize: "13px",
                textDecoration: "none"
              }
            )
          ),
          {
            flex: "0 1 auto",
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            gap: "18px"
          }
        )
      ],
      {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: "20px",
        justifyContent: "space-between",
        alignItems: "center",
        borderTop: "1px solid rgba(255,255,255,0.12)",
        paddingTop: "24px"
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
          padding: "64px 24px 28px",
          width: "100%"
        },
        tablet: {},
        mobile: {}
      }
    },
    children: [
      makeFlex(
        [
          topRow,
          bottomRow
        ],
        {
          flexDirection: "column",
          gap: "32px",
          maxWidth: "1180px",
          margin: "0 auto",
          width: "100%"
        }
      )
    ]
  };
};
