import {
  v4 as uuidv4
} from "uuid";
import type {
  Block
} from "../types/page.types";
import type {
  ServicePageSectionPayload
} from "../runtime/importers/html/semanticResolvers/semanticContracts/ServicePageSectionPayload";
import {
  extractTitleSegments
} from "../runtime/importers/html/typography/extractTitleSegments";

const computedStyle = (
  element?: HTMLElement | null
) =>
  element?.ownerDocument
    .defaultView
    ?.getComputedStyle(
      element
    );

const responsive = (
  desktop: Record<string, any>,
  mobile: Record<string, any> = {}
) => ({
  desktop,
  tablet: {},
  mobile
});

const layoutStyle = (
  element?: HTMLElement | null
) => {
  const style =
    element
      ? computedStyle(
          element
        )
      : null;

  return responsive({
    display:
      style?.display,
    flexDirection:
      style?.flexDirection,
    flexWrap:
      style?.flexWrap,
    justifyContent:
      style?.justifyContent,
    alignItems:
      style?.alignItems,
    gap:
      style?.gap,
    width:
      style?.width,
    maxWidth:
      style?.maxWidth,
    padding:
      style?.padding,
    margin:
      style?.margin,
    marginTop:
      style?.marginTop,
    marginBottom:
      style?.marginBottom,
    background:
      style?.background,
    backgroundColor:
      style?.backgroundColor,
    backgroundImage:
      style?.backgroundImage,
    border:
      style?.border,
    borderRadius:
      style?.borderRadius,
    boxShadow:
      style?.boxShadow,
    boxSizing:
      style?.boxSizing
  });
};

const typographyStyle = (
  element?: HTMLElement | null
) => {
  const style =
    element
      ? computedStyle(
          element
        )
      : null;

  return responsive({
    color:
      style?.color,
    fontFamily:
      style?.fontFamily,
    fontSize:
      style?.fontSize,
    fontWeight:
      style?.fontWeight,
    lineHeight:
      style?.lineHeight,
    letterSpacing:
      style?.letterSpacing,
    textAlign:
      style?.textAlign,
    textTransform:
      style?.textTransform,
    margin:
      style?.margin,
    marginTop:
      style?.marginTop,
    marginBottom:
      style?.marginBottom
  });
};

const text = (
  element?: Element | null
) =>
  element?.textContent
    ?.replace(/\s+/g, " ")
    .trim() || "";

const createText = (
  content: string,
  element?: HTMLElement | null,
  props: Record<string, any> = {}
): Block => ({
  id:
    uuidv4(),
  type:
    "text",
  data: {
    props: {
      content,
      ...props
    },
    style: {
      ...layoutStyle(
        element
      ),
      desktop: {
        ...layoutStyle(
          element
        ).desktop,
        ...typographyStyle(
          element
        ).desktop
      }
    }
  },
  children: []
});

const createTitle = (
  element?: HTMLElement | null
): Block => ({
  id:
    uuidv4(),
  type:
    "title",
  data: {
    props: {
      content:
        text(
          element
        ),
      level:
        element?.tagName
          .toLowerCase() ||
        "h2",
      segments:
        extractTitleSegments(
          element
        )
    },
    style:
      typographyStyle(
        element
      )
  },
  children: []
});

const createLink = (
  element: HTMLElement,
  label =
    text(
      element
    )
): Block => ({
  id:
    uuidv4(),
  type:
    "link",
  data: {
    props: {
      label:
        label,
      href:
        element.getAttribute(
          "href"
        ) ||
        "#"
    },
    style: {
      ...layoutStyle(
        element
      ),
      desktop: {
        ...layoutStyle(
          element
        ).desktop,
        ...typographyStyle(
          element
        ).desktop
      }
    }
  },
  children: []
});

const flexItem = (
  children: Block[],
  element?: HTMLElement | null,
  desktop: Record<string, any> = {}
): Block => ({
  id:
    uuidv4(),
  type:
    "flexItem",
  data: {
    props: {},
    style: responsive({
      ...layoutStyle(
        element
      ).desktop,
      minWidth: "0",
      ...desktop
    })
  },
  children
});

const gridItem = (
  children: Block[],
  element?: HTMLElement | null
): Block => ({
  id:
    uuidv4(),
  type:
    "gridItem",
  data: {
    props: {},
    style:
      layoutStyle(
        element
      )
  },
  children
});

const section = (
  source: HTMLElement,
  children: Block[],
  semanticVariant: string
): Block => {
  const sourceStyle =
    layoutStyle(
      source
    );
  const {
    display: _display,
    flexDirection: _flexDirection,
    flexWrap: _flexWrap,
    justifyContent: _justifyContent,
    alignItems: _alignItems,
    gridTemplateColumns: _gridTemplateColumns,
    gap: _gap,
    width: _width,
    ...sectionDesktop
  } =
    sourceStyle.desktop ||
    {};

  return {
    id:
      uuidv4(),
    type:
      "section",
    meta: {
      semanticType:
        "SERVICE_PAGE_SECTION",
      semanticVariant
    } as any,
    data: {
      props: {},
      style: {
        ...sourceStyle,
        desktop: {
          ...sectionDesktop,
          width: "100%"
        }
      }
    },
    children
  };
};

const emitIntroGrid = (
  source: HTMLElement
) => {
  const cards =
    Array.from(
      source.children
    ).filter(
      (
        element
      ): element is HTMLElement =>
        element.nodeType === 1 &&
        !!element.querySelector(
          "h2,h3"
        )
    );

  const grid: Block = {
    id:
      uuidv4(),
    type:
      "grid",
    data: {
      props: {},
      style: {
        ...layoutStyle(
          source
        ),
        desktop: {
          ...layoutStyle(
            source
          ).desktop,
          display: "grid",
          gridTemplateColumns:
            computedStyle(
              source
            )?.gridTemplateColumns ||
            "repeat(2, minmax(0, 1fr))"
        },
        mobile: {
          gridTemplateColumns:
            "1fr"
        }
      }
    },
    children:
      cards.map(card => {
        const tag =
          card.querySelector(
            ".tag"
          ) as HTMLElement | null;
        const title =
          card.querySelector(
            "h2,h3"
          ) as HTMLElement | null;
        const paragraph =
          card.querySelector(
            "p"
          ) as HTMLElement | null;

        return gridItem(
          [
            ...(tag
              ? [
                  createText(
                    text(tag),
                    tag,
                    {
                      semanticRole:
                        "serviceTag"
                    }
                  )
                ]
              : []),
            createTitle(
              title
            ),
            ...(paragraph
              ? [
                  createText(
                    text(
                      paragraph
                    ),
                    paragraph
                  )
                ]
              : [])
          ],
          card
        );
      })
  };

  return section(
    source,
    [
      grid
    ],
    "SERVICE_INTRO_GRID"
  );
};

const emitDeliverables = (
  source: HTMLElement
) => {
  const title =
    source.querySelector(
      "h2,h3"
    ) as HTMLElement | null;
  const subtitle =
    source.querySelector(
      ".sub"
    ) as HTMLElement | null;
  const rows =
    Array.from(
      source.querySelectorAll(
        "li"
      )
    ) as HTMLElement[];

  const content =
    flexItem(
      [
        createTitle(
          title
        ),
        ...(subtitle
          ? [
              createText(
                text(
                  subtitle
                ),
                subtitle
              )
            ]
          : []),
        ...rows.map(row =>
          createText(
            `→ ${text(row)}`,
            row,
            {
              semanticRole:
                "deliverableRow"
            }
          )
        )
      ],
      source,
      {
        display: "flex",
        flexDirection:
          "column"
      }
    );

  return section(
    source,
    [
      {
        id:
          uuidv4(),
        type:
          "flex",
        data: {
          props: {},
          style: responsive({
            display: "flex",
            flexDirection:
              "column"
          })
        },
        children: [
          content
        ]
      }
    ],
    "SERVICE_DELIVERABLES"
  );
};

const emitMarkets = (
  source: HTMLElement
) => {
  const label =
    source.querySelector(
      ".k"
    ) as HTMLElement | null;
  const value =
    source.querySelector(
      ".v"
    ) as HTMLElement | null;
  const action =
    source.querySelector(
      "a,button"
    ) as HTMLElement | null;

  return section(
    source,
    [
      {
        id:
          uuidv4(),
        type:
          "flex",
        data: {
          props: {},
          style: {
            ...layoutStyle(
              source
            ),
            desktop: {
              ...layoutStyle(
                source
              ).desktop,
              display: "flex",
              flexDirection:
                "row",
              justifyContent:
                "space-between",
              alignItems:
                "center"
            },
            mobile: {
              flexDirection:
                "column",
              alignItems:
                "stretch"
            }
          }
        },
        children: [
          flexItem(
            [
              ...(label
                ? [
                    createText(
                      text(label),
                      label
                    )
                  ]
                : []),
              ...(value
                ? [
                    createText(
                      text(value),
                      value
                    )
                  ]
                : [])
            ]
          ),
          ...(action
            ? [
                flexItem([
                  createLink(
                    action
                  )
                ])
              ]
            : [])
        ]
      }
    ],
    "SERVICE_MARKETS"
  );
};

const emitCta = (
  source: HTMLElement
) => {
  const title =
    source.querySelector(
      "h2,h3"
    ) as HTMLElement | null;
  const paragraph =
    source.querySelector(
      "p"
    ) as HTMLElement | null;
  const actions =
    Array.from(
      source.querySelectorAll(
        ".row a, .row button"
      )
    ) as HTMLElement[];

  return section(
    source,
    [
      {
        id:
          uuidv4(),
        type:
          "flex",
        data: {
          props: {},
          style: responsive({
            display: "flex",
            flexDirection:
              "column",
            alignItems:
              "center",
            textAlign:
              "center"
          })
        },
        children: [
          flexItem(
            [
              createTitle(
                title
              ),
              ...(paragraph
                ? [
                    createText(
                      text(
                        paragraph
                      ),
                      paragraph
                    )
                  ]
                : []),
              {
                id:
                  uuidv4(),
                type:
                  "flex",
                data: {
                  props: {},
                  style: responsive({
                    display:
                      "flex",
                    flexDirection:
                      "row",
                    flexWrap:
                      "wrap",
                    justifyContent:
                      "center",
                    gap:
                      computedStyle(
                        source.querySelector(
                          ".row"
                        ) as HTMLElement | null
                      )?.gap ||
                      "14px"
                  })
                },
                children:
                  actions.map(action =>
                    flexItem([
                      createLink(
                        action
                      )
                    ])
                  )
              }
            ]
          )
        ]
      }
    ],
    "SERVICE_CTA"
  );
};

const emitHeading = (
  source: HTMLElement
) => {
  const label =
    source.querySelector(
      ".section-tag"
    ) as HTMLElement | null;
  const title =
    source.querySelector(
      "h1,h2,h3"
    ) as HTMLElement | null;

  return section(
    source,
    [
      {
        id:
          uuidv4(),
        type:
          "flex",
        data: {
          props: {},
          style: responsive({
            display: "flex",
            flexDirection:
              "column"
          })
        },
        children: [
          flexItem([
            ...(label
              ? [
                  createText(
                    text(label),
                    label
                  )
                ]
              : []),
            createTitle(
              title
            )
          ])
        ]
      }
    ],
    "SERVICE_HEADING"
  );
};

const emitCards = (
  source: HTMLElement
) => {
  const cards =
    Array.from(
      source.children
    ).filter(
      (
        element
      ): element is HTMLElement =>
        element.nodeType === 1
    );

  return section(
    source,
    [
      {
        id:
          uuidv4(),
        type:
          "grid",
        data: {
          props: {},
          style: {
            ...layoutStyle(
              source
            ),
            desktop: {
              ...layoutStyle(
                source
              ).desktop,
              display: "grid",
              gridTemplateColumns:
                computedStyle(
                  source
                )?.gridTemplateColumns ||
                "repeat(3, minmax(0, 1fr))"
            },
            mobile: {
              gridTemplateColumns:
                "1fr"
            }
          }
        },
        children:
          cards.map(card => {
            const number =
              card.querySelector(
                ".s-num"
              ) as HTMLElement | null;
            const title =
              card.querySelector(
                "h2,h3"
              ) as HTMLElement | null;
            const paragraph =
              card.querySelector(
                "p"
              ) as HTMLElement | null;
            const linkLabel =
              card.querySelector(
                ".more"
              ) as HTMLElement | null;

            return gridItem(
              [
                ...(number
                  ? [
                      createText(
                        text(number),
                        number
                      )
                    ]
                  : []),
                createTitle(
                  title
                ),
                ...(paragraph
                  ? [
                      createText(
                        text(
                          paragraph
                        ),
                        paragraph
                      )
                    ]
                  : []),
                createLink(
                  card,
                  text(
                    linkLabel
                  ) ||
                  "Découvrir"
                )
              ],
              card
            );
          })
      }
    ],
    "SERVICE_CARDS"
  );
};

export const generateServicePageSectionPreset = (
  payload:
    ServicePageSectionPayload
): Block => {
  const source =
    payload.claimedNode.element;

  const emitted =
    payload.variant ===
      "SERVICE_INTRO_GRID"
      ? emitIntroGrid(
          source
        )
      : payload.variant ===
          "SERVICE_DELIVERABLES"
        ? emitDeliverables(
            source
          )
        : payload.variant ===
            "SERVICE_MARKETS"
          ? emitMarkets(
              source
            )
          : payload.variant ===
              "SERVICE_CTA"
            ? emitCta(
                source
              )
            : payload.variant ===
                "SERVICE_HEADING"
              ? emitHeading(
                  source
                )
              : emitCards(
                  source
                );

  console.log(
    "SERVICE_PAGE_EMITTED_BLOCKS",
    {
      variant:
        payload.variant,
      sourceClassName:
        source.className,
      emitted: {
        id:
          emitted.id,
        type:
          emitted.type,
        childTypes:
          emitted.children.map(
            child =>
              child.type
          )
      }
    }
  );

  return emitted;
};
