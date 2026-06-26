import type {
  Block
} from "../types/page.types";

import type {
  ContactLayoutPayload
} from "../runtime/importers/html/semanticContracts/ContactLayoutPayload";

const generateId = () =>
  globalThis.crypto
    ?.randomUUID?.() ||
  Math.random()
    .toString(36)
    .slice(2);

const responsive = (
  desktop: Record<string, any>,
  mobile: Record<string, any> = {},
  tablet: Record<string, any> = {}
) => ({
  desktop,
  tablet,
  mobile
});

const cleanStyle = (
  style: any = {}
): Record<string, any> => {
  if (
    !style ||
    typeof style !== "object" ||
    Array.isArray(style)
  ) {
    return {};
  }

  const source =
    style.desktop &&
    typeof style.desktop === "object" &&
    !Array.isArray(style.desktop)
      ? style.desktop
      : style;

  return Object.fromEntries(
    Object.entries(source).filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        value !== "" &&
        (
          typeof value === "string" ||
          typeof value === "number" ||
          typeof value === "boolean"
        )
    )
  ) as Record<string, any>;
};
const omitStyleKeys = (
  style: Record<string, any> = {},
  keys: string[] = []
) => {
  const next = {
    ...style
  };

  keys.forEach(
    key => {
      delete next[key];
    }
  );

  return next;
};

const pickValue = (
  ...values: any[]
) =>
  values.find(
    value =>
      value !== undefined &&
      value !== null &&
      value !== "" &&
      value !== "none"
  );

const toCssString = (
  value: unknown
): string | undefined =>
  typeof value === "string"
    ? value
    : undefined;

const isTransparentPaint = (
  value: unknown
) => {
  const normalized =
    (toCssString(value) || "")
      .replace(/\s+/g, "")
      .toLowerCase();

  return (
    !normalized ||
    normalized === "transparent" ||
    normalized === "none" ||
    normalized === "rgba(0,0,0,0)" ||
    normalized.includes("rgba(0,0,0,0)")
  );
};

const pickPaint = (
  own?: unknown,
  inherited?: unknown
) => {
  const ownPaint =
    toCssString(own);

  const inheritedPaint =
    toCssString(inherited);

  return !isTransparentPaint(ownPaint)
    ? ownPaint
    : inheritedPaint;
};

const styleOf = (
  style: any = {},
  fallback: Record<string, any> = {}
) =>
  responsive({
    ...fallback,
    ...cleanStyle(style)
  });

const titleBlock = (
  content: string,
  style: any = {},
  level: string = "h3"
): Block => ({
  id: generateId(),
  type: "title",
  data: {
    props: {
      content,
      level
    },
    style:
      styleOf(style)
  },
  children: []
});

const textBlock = (
  content: string,
  style: any = {}
): Block => ({
  id: generateId(),
  type: "text",
  data: {
    props: {
      content
    },
    style:
      styleOf(style)
  },
  children: []
});

const fieldBlock = (
  field: NonNullable<
    ContactLayoutPayload["formRows"]
  >[number]["fields"][number]
): Block => {
  const type =
    field.tag === "textarea"
      ? "textarea"
      : field.tag === "select"
        ? "select"
        : "input";

  const rawFieldStyle =
    cleanStyle(field.style);

  const safeFieldStyle =
    omitStyleKeys(
      rawFieldStyle,
      [
        "width",
        "minWidth",
        "maxWidth",
        "position",
        "left",
        "right",
        "top",
        "bottom"
      ]
    );

  return {
    id: generateId(),
    type,
    data: {
      props: {
        label:
          field.label || "",

        name:
          field.name || "",

        placeholder:
          field.placeholder || "",

        type:
          field.type || "text",

        ...(type === "select"
          ? {
              options:
                field.options || []
            }
          : {})
      },
      style:
        styleOf(
          safeFieldStyle,
          {
            width: "100%",
            minWidth: "0",
            maxWidth: "100%",
            boxSizing: "border-box"
          }
        )
    },
    children: []
  } as Block;
};

const formRow = (
  row: NonNullable<
    ContactLayoutPayload["formRows"]
  >[number]
): Block => {
  const rawRowStyle =
    cleanStyle(row.style);

  const safeRowStyle =
    omitStyleKeys(
      rawRowStyle,
      [
        "width",
        "minWidth",
        "maxWidth",
        "gridTemplateColumns",
        "position",
        "left",
        "right",
        "top",
        "bottom"
      ]
    );

  const fieldCount =
    row.fields?.length || 0;

  return {
    id: generateId(),
    type: "grid",
    data: {
      props: {},
      style: {
        desktop: {
          ...safeRowStyle,
          display: "grid",
          gridTemplateColumns:
            fieldCount >= 2
              ? "repeat(2, minmax(0, 1fr))"
              : "minmax(0, 1fr)",
          width: "100%",
          minWidth: "0",
          maxWidth: "100%",
          boxSizing: "border-box"
        },
        tablet: {
          display: "grid",
          gridTemplateColumns:
            fieldCount >= 2
              ? "repeat(2, minmax(0, 1fr))"
              : "minmax(0, 1fr)"
        },
        mobile: {
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr)"
        }
      }
    },
    children: (row.fields || []).map(
      field => ({
        id: generateId(),
        type: "gridItem",
        data: {
          props: {},
          style: responsive({
            width: "100%",
            minWidth: "0",
            maxWidth: "100%"
          })
        },
        children: [
          fieldBlock(field)
        ]
      } as Block)
    )
  };
};

const contactValueBlock = (
  content: string,
  style: any = {}
): Block =>
  textBlock(
    content,
    {
      ...style,
      whiteSpace:
        style?.whiteSpace || "pre-line"
    }
  );

const contactRow = (
  row: NonNullable<
    ContactLayoutPayload["contactRows"]
  >[number]
): Block => {
  const rawStyle =
    cleanStyle(row.style);

  const safeStyle =
    omitStyleKeys(
      rawStyle,
      [
        "width",
        "maxWidth",
        "minWidth",
        "gridTemplateColumns"
      ]
    );

  return {
    id: generateId(),
    type: "grid",
    data: {
      props: {},
      style: responsive(
        {
          ...safeStyle,
          display: "grid",
          gridTemplateColumns:
            pickValue(
              rawStyle.gridTemplateColumns,
              "120px minmax(0, 1fr)"
            ),
          gap:
            pickValue(
              rawStyle.gap,
              "24px"
            ),
          width: "100%",
          minWidth: "0",
          boxSizing: "border-box"
        },
        {
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "12px",
          width: "100%",
          minWidth: "0"
        }
      )
    },
    children: [
      {
        id: generateId(),
        type: "gridItem",
        data: {
          props: {},
          style: responsive({
            width: "100%",
            minWidth: "0"
          })
        },
        children: [
          textBlock(
            row.label || "",
            row.labelStyle
          )
        ]
      },
      {
        id: generateId(),
        type: "gridItem",
        data: {
          props: {},
          style: responsive({
            width: "100%",
            minWidth: "0"
          })
        },
        children: [
          contactValueBlock(
            row.value || "",
            row.valueStyle
          )
        ]
      }
    ]
  };
};

const buildSubmitButton = (
  payload: ContactLayoutPayload
): Block => {
  const submitStyle =
    cleanStyle(
      payload.submitStyle
    );

  return {
    id: generateId(),
    type: "button",
    data: {
      props: {
        label:
          payload.submitLabel ||
          "Submit",

        submit:
          true
      },
      style:
        styleOf(
          submitStyle,
          {
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxSizing: "border-box"
          }
        )
    },
    children: []
  } as Block;
};

const buildContactRows = (
  payload: ContactLayoutPayload
): NonNullable<ContactLayoutPayload["contactRows"]> =>
  payload.contactRows ||
  (payload.sections || [])
    .flatMap(section =>
      section.items.map(
        item => ({
          label:
            section.title || "",

          value:
            item || "",

          style:
            section.style
        })
      )
    );

const buildSectionStyle = (
  payload: ContactLayoutPayload
) => {
  const rawSectionStyle =
    cleanStyle(payload.sectionStyle);

  const inheritedPageStyle =
    cleanStyle(payload.inheritedPageStyle);

  const safeSectionStyle =
    omitStyleKeys(
      rawSectionStyle,
      [
        "width",
        "minWidth",
        "maxWidth",
        "margin",
        "marginLeft",
        "marginRight",
        "paddingLeft",
        "paddingRight"
      ]
    );

  return styleOf({
    ...safeSectionStyle,

    background:
      pickPaint(
        rawSectionStyle.background,
        inheritedPageStyle.background
      ),

    backgroundColor:
      pickPaint(
        rawSectionStyle.backgroundColor,
        inheritedPageStyle.backgroundColor
      ),

    color:
      pickValue(
        rawSectionStyle.color,
        inheritedPageStyle.color
      ),

    width: "100%",
    boxSizing: "border-box"
  });
};

const buildContainerStyle = (
  payload: ContactLayoutPayload
) => {
  const payloadAny =
    payload as any;

  const rawSectionStyle =
    cleanStyle(payload.sectionStyle);

  const inheritedPageStyle =
    cleanStyle(payload.inheritedPageStyle);

  const rawContainerStyle =
    cleanStyle(
      payloadAny.containerStyle ||
      payloadAny.wrapperStyle ||
      payloadAny.innerStyle ||
      {}
    );

  const resolvedMaxWidth =
    pickValue(
      rawContainerStyle.maxWidth,
      rawSectionStyle.maxWidth,
      inheritedPageStyle.maxWidth
    );

  const resolvedPaddingLeft =
    pickValue(
      rawContainerStyle.paddingLeft,
      rawSectionStyle.paddingLeft,
      inheritedPageStyle.paddingLeft
    );

  const resolvedPaddingRight =
    pickValue(
      rawContainerStyle.paddingRight,
      rawSectionStyle.paddingRight,
      inheritedPageStyle.paddingRight
    );

  return responsive({
    ...omitStyleKeys(
      rawContainerStyle,
      [
        "background",
        "backgroundColor",
        "color"
      ]
    ),

    width:
      pickValue(
        rawContainerStyle.width,
        rawSectionStyle.width,
        "100%"
      ),

    maxWidth:
      resolvedMaxWidth,

    marginLeft:
      pickValue(
        rawContainerStyle.marginLeft,
        rawSectionStyle.marginLeft,
        resolvedMaxWidth ? "auto" : undefined
      ),

    marginRight:
      pickValue(
        rawContainerStyle.marginRight,
        rawSectionStyle.marginRight,
        resolvedMaxWidth ? "auto" : undefined
      ),

    paddingLeft:
      resolvedPaddingLeft,

    paddingRight:
      resolvedPaddingRight,

    boxSizing:
      "border-box",

    minWidth:
      "0"
  });
};

const buildMainGridStyle = (
  payload: ContactLayoutPayload
) => {
  const payloadAny =
    payload as any;

  const rawGridStyle =
    cleanStyle(
      payloadAny.gridStyle ||
      payloadAny.layoutStyle ||
      payloadAny.contactGridStyle ||
      {}
    );

  return {
    desktop: {
      ...rawGridStyle,
      display: "grid",
      gridTemplateColumns:
        pickValue(
          rawGridStyle.gridTemplateColumns,
          "minmax(0, 0.85fr) minmax(0, 1.15fr)"
        ),
      alignItems:
        pickValue(
          rawGridStyle.alignItems,
          "start"
        ),
      width:
        pickValue(
          rawGridStyle.width,
          "100%"
        ),
      gap:
        pickValue(
          rawGridStyle.gap,
          "40px"
        ),
      minWidth: "0",
      boxSizing: "border-box"
    },
    tablet: {
      display: "grid",
      gridTemplateColumns: "minmax(0, 1fr)",
      gap:
        pickValue(
          rawGridStyle.gap,
          "40px"
        ),
      width: "100%",
      minWidth: "0",
      boxSizing: "border-box"
    },
    mobile: {
      display: "grid",
      gridTemplateColumns: "minmax(0, 1fr)",
      gap: "24px",
      width: "100%",
      minWidth: "0",
      boxSizing: "border-box"
    }
  };
};

export const generateContactLayoutPreset = (
  payload: ContactLayoutPayload
): Block => {
  console.log(
    "CONTACT_LAYOUT_PAYLOAD",
    {
      contactRows:
        payload.contactRows?.length || 0,

      sections:
        payload.sections?.length || 0,

      formRows:
        payload.formRows?.length || 0,

      hasSectionStyle:
        !!payload.sectionStyle,

      hasInheritedPageStyle:
        !!payload.inheritedPageStyle
    }
  );

  const contactRows =
    buildContactRows(payload);

  const formChildren: Block[] = [];

  if (payload.formTitle) {
    formChildren.push(
      titleBlock(
        payload.formTitle,
        payload.formTitleStyle
      )
    );
  }

  if (payload.formDescription) {
    formChildren.push(
      textBlock(
        payload.formDescription,
        payload.formDescriptionStyle
      )
    );
  }

  formChildren.push(
    ...(payload.formRows || []).map(formRow)
  );

  formChildren.push(
    buildSubmitButton(payload)
  );

  const emitted: Block = {
    id: generateId(),
    type: "section",
    meta: {
      semanticType: "CONTACT_LAYOUT"
    } as any,
    data: {
      props: {},
      style:
        buildSectionStyle(payload)
    },
    children: [
      {
        id: generateId(),
        type: "flex",
        data: {
          props: {},
          style:
            buildContainerStyle(payload)
        },
        children: [
          {
            id: generateId(),
            type: "flexItem",
            data: {
              props: {},
              style: responsive({
                width: "100%",
                minWidth: "0"
              })
            },
            children: [
              {
                id: generateId(),
                type: "grid",
                data: {
                  props: {},
                  style:
                    buildMainGridStyle(payload)
                },
                children: [
                  {
                    id: generateId(),
                    type: "gridItem",
                    data: {
                      props: {},
                      style: responsive({
                        width: "100%",
                        minWidth: "0"
                      })
                    },
                    children:
                      contactRows.map(contactRow)
                  },
                 {
  id: generateId(),
  type: "gridItem",
  data: {
    props: {},
    style: responsive({
      display: "flex",
      flexDirection: "column",
      width: "100%",
      minWidth: "0",
      boxSizing: "border-box"
    })
  },
  children: [
    {
      id: generateId(),
      type: "flex",
      data: {
        props: {},
        style: styleOf(
          payload.formStyle,
          {
            display: "flex",
            flexDirection: "column",
            width: "100%",
            minWidth: "0",
            boxSizing: "border-box"
          }
        )
      },
      children:
        formChildren
    }
  ]
}
                ]
              }
            ]
          }
        ]
      }
    ]
  };

  console.log(
    "CONTACT_LAYOUT_EMIT",
    {
      contactRowCount:
        contactRows.length,

      formRowCount:
        payload.formRows?.length || 0,

      formFieldCount:
        payload.formRows?.reduce(
          (count, row) =>
            count + row.fields.length,
          0
        ) || 0
    }
  );
  return emitted;
};