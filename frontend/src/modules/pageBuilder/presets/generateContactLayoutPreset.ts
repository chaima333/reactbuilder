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
) =>
  Object.fromEntries(
    Object.entries(
      style
    ).filter(
      (
        [
          ,
          value
        ]
      ) =>
        value !==
          undefined &&
        value !==
          null &&
        value !== ""
    )
  );

const styleOf = (
  style: any = {},
  fallback: Record<string, any> = {}
) =>
  responsive({
    ...fallback,
    ...cleanStyle(
      style
    )
  });

const titleBlock = (
  content: string,
  style: any = {}
): Block => ({
  id:
    generateId(),
  type:
    "title",
  data: {
    props: {
      content,
      level:
        "h3"
    },
    style:
      styleOf(
        style
      )
  },
  children: []
});

const textBlock = (
  content: string,
  style: any = {}
): Block => ({
  id:
    generateId(),
  type:
    "text",
  data: {
    props: {
      content
    },
    style:
      styleOf(
        style
      )
  },
  children: []
});

const fieldBlock = (
  field: NonNullable<
    ContactLayoutPayload[
      "formRows"
    ]
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

  const {
    width,
    minWidth,
    maxWidth,
    position,
    left,
    right,
    top,
    bottom,
    ...safeFieldStyle
  } = rawFieldStyle;

  return {
    id: generateId(),
    type,
    data: {
      props: {
        label: field.label || "",
        name: field.name || "",
        placeholder: field.placeholder || "",
        type: field.type || "text",
        ...(type === "select"
          ? { options: field.options || [] }
          : {})
      },
      style: styleOf(
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
    ContactLayoutPayload[
      "formRows"
    ]
  >[number]
): Block => {
  const rawRowStyle =
    cleanStyle(row.style);

  const {
    width,
    minWidth,
    maxWidth,
    gridTemplateColumns,
    position,
    left,
    right,
    top,
    bottom,
    ...safeRowStyle
  } = rawRowStyle;

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
            row.fields.length >= 2
              ? "repeat(2, minmax(0, 1fr))"
              : "minmax(0, 1fr)",
          width: "100%",
          minWidth: "0",
          maxWidth: "100%",
          boxSizing: "border-box"
        },
        tablet: {
          gridTemplateColumns:
            row.fields.length >= 2
              ? "repeat(2, minmax(0, 1fr))"
              : "minmax(0, 1fr)"
        },
        mobile: {
          gridTemplateColumns: "minmax(0, 1fr)"
        }
      }
    },
    children: row.fields.map(
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

const contactRow = (
  row: NonNullable<
    ContactLayoutPayload[
      "contactRows"
    ]
  >[number]
): Block => {
  const rawStyle = cleanStyle(row.style);
  
  const {
    width,
    maxWidth,
    minWidth,
    gridTemplateColumns,
    ...safeStyle
  } = rawStyle;
  
  console.log("CONTACT_ROW_EMIT", {
    label: row.label,
    value: row.value,
    rawStyle,
    safeStyle,
    removedFixedWidth: width,
    removedGridColumns: gridTemplateColumns
  });

  return {
    id: generateId(),
    type: "grid",
    data: {
      props: {},
      style: responsive(
        {
          ...safeStyle,
          display: "grid",
          gridTemplateColumns: "120px minmax(0, 1fr)",
          gap: row.style?.gap || "24px",
          width: "100%"
        },
        {
          gridTemplateColumns: "1fr",
          gap: "12px"
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
          textBlock(row.label, row.labelStyle)
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
          textBlock(row.value, row.valueStyle)
        ]
      }
    ]
  };
};

export const generateContactLayoutPreset = (
  payload: ContactLayoutPayload
): Block => {
  console.log("CONTACT_LAYOUT_PAYLOAD", JSON.stringify(payload, null, 2));

  const contactRows =
    payload.contactRows ||
    (payload.sections || [])
      .flatMap(section =>
        section.items.map(
          item => ({
            label:
              section.title,
            value:
              item,
            style:
              section.style
          })
        )
      );
  
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

  formChildren.push({
    id: generateId(),
    type: "button",
    data: {
      props: {
        text: payload.submitLabel || "Submit",
        submit: true
      },
      style: styleOf(payload.submitStyle, {
        width: "100%"
      })
    },
    children: []
  } as Block);


const rawSectionStyle =
  cleanStyle(payload.sectionStyle);

const {
  width,
  minWidth,
  maxWidth,
  paddingLeft,
  paddingRight,
  ...safeSectionStyle
} = rawSectionStyle;


  const emitted: Block = {
    id: generateId(),
    type: "section",
    meta: {
      semanticType: "CONTACT_LAYOUT"
    } as any,
    data: {
      props: {},
   style:
  styleOf(
    {
      ...safeSectionStyle,

      background:
        !payload.sectionStyle?.backgroundColor ||
        payload.sectionStyle.backgroundColor.includes("rgba(0, 0, 0, 0)")
          ? payload.inheritedPageStyle?.background
          : payload.sectionStyle?.background,

      backgroundColor:
        !payload.sectionStyle?.backgroundColor ||
        payload.sectionStyle.backgroundColor.includes("rgba(0, 0, 0, 0)")
          ? payload.inheritedPageStyle?.backgroundColor
          : payload.sectionStyle?.backgroundColor,

      color:
        payload.sectionStyle?.color ||
        payload.inheritedPageStyle?.color
    },
  {
  width: "100%",
  maxWidth: "1180px",
  marginLeft: "auto",
  marginRight: "auto",
  boxSizing: "border-box",
  paddingLeft: "24px",
  paddingRight: "24px"
}
  )
    },
    children: [
      {
        id: generateId(),
        type: "grid",
        data: {
          props: {},
          style: {
            desktop: {
              display: "grid",
              gridTemplateColumns: "minmax(0, 0.85fr) minmax(0, 1.15fr)",
              alignItems: "start",
              width: "100%",
              gap: "40px"
            },
            tablet: {
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr)",
              gap: "40px"
            },
            mobile: {
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr)",
              gap: "24px"
            }
          }
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
            children: contactRows.map(contactRow)
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
            children: formChildren
          }
        ]
      }
    ]
  };

  console.log("CONTACT_LAYOUT_EMIT", {
    contactRowCount: contactRows.length,
    formRowCount: payload.formRows?.length || 0,
    formFieldCount: payload.formRows?.reduce(
      (count, row) => count + row.fields.length,
      0
    ) || 0
  });

  return emitted;
};