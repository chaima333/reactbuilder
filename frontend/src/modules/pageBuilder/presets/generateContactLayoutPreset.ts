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
  mobile: Record<string, any> = {}
) => ({
  desktop,
  tablet: {},
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
    field.tag ===
      "textarea"
      ? "textarea"
      : field.tag ===
          "select"
        ? "select"
        : "input";

  return {
    id:
      generateId(),
    type,
    data: {
      props: {
        label:
          field.label ||
          "",
        name:
          field.name ||
          "",
        placeholder:
          field.placeholder ||
          "",
        type:
          field.type ||
          "text",
        ...(type ===
        "select"
          ? {
              options:
                field.options ||
                []
            }
          : {})
      },
      style:
        styleOf(
          field.style,
          {
            width:
              "100%",
            boxSizing:
              "border-box"
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
): Block => ({
  id:
    generateId(),
  type:
    "grid",
  data: {
    props: {},
    style: {
      ...styleOf(
        row.style
      ),
      desktop: {
        ...styleOf(
          row.style
        ).desktop,
        display:
          "grid",
        gridTemplateColumns:
          row.fields.length >=
          2
            ? (
                row.style
                  ?.gridTemplateColumns &&
                row.style
                  .gridTemplateColumns !==
                  "none"
                  ? row.style
                      .gridTemplateColumns
                  : "repeat(2, minmax(0, 1fr))"
              )
            : "minmax(0, 1fr)",
        width:
          "100%"
      },
      mobile: {
        gridTemplateColumns:
          "minmax(0, 1fr)"
      }
    }
  },
  children:
    row.fields.map(
      field => ({
        id:
          generateId(),
        type:
          "gridItem",
        data: {
          props: {},
          style:
            responsive({
              width:
                "100%",
              minWidth:
                "0"
            })
        },
        children: [
          fieldBlock(
            field
          )
        ]
      } as Block)
    )
});

const contactRow = (
  row: NonNullable<
    ContactLayoutPayload[
      "contactRows"
    ]
  >[number]
): Block => ({
  id:
    generateId(),
  type:
    "flex",
  data: {
    props: {
      semanticRole:
        "contactRow"
    },
    style:
      styleOf(
        row.style,
        {
          display:
            "flex",
          flexDirection:
            "column",
          width:
            "100%"
        }
      )
  },
  children: [
    {
      id:
        generateId(),
      type:
        "flexItem",
      data: {
        props: {},
        style:
          responsive({
            width:
              "100%"
          })
      },
      children: [
        textBlock(
          row.label,
          row.labelStyle
        ),
        textBlock(
          row.value,
          row.valueStyle
        )
      ]
    }
  ]
});

export const generateContactLayoutPreset = (
  payload: ContactLayoutPayload
): Block => {
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
  const formChildren:
    Block[] = [];

  if (payload.formTitle) {
    formChildren.push(
      titleBlock(
        payload.formTitle,
        payload.formTitleStyle
      )
    );
  }

  if (
    payload.formDescription
  ) {
    formChildren.push(
      textBlock(
        payload.formDescription,
        payload.formDescriptionStyle
      )
    );
  }

  formChildren.push(
    ...(payload.formRows ||
      []).map(
      formRow
    )
  );

  formChildren.push({
    id:
      generateId(),
    type:
      "button",
    data: {
      props: {
        text:
          payload.submitLabel ||
          "Submit",
        submit:
          true
      },
      style:
        styleOf(
          payload.submitStyle,
          {
            width:
              "100%"
          }
        )
    },
    children: []
  } as Block);

  const emitted: Block = {
    id:
      generateId(),
    type:
      "section",
    meta: {
      semanticType:
        "CONTACT_LAYOUT"
    } as any,
    data: {
      props: {},
      style:
        responsive({
          width:
            "100%",
          boxSizing:
            "border-box"
        })
    },
    children: [
      {
        id:
          generateId(),
        type:
          "grid",
        data: {
          props: {},
          style: {
            ...styleOf(
              payload.gridStyle
            ),
            desktop: {
              ...styleOf(
                payload.gridStyle
              ).desktop,
              display:
                "grid",
              gridTemplateColumns:
                payload.gridStyle
                  ?.gridTemplateColumns &&
                payload.gridStyle
                  .gridTemplateColumns !==
                  "none"
                  ? payload.gridStyle
                      .gridTemplateColumns
                  : "repeat(2, minmax(0, 1fr))",
              alignItems:
                payload.gridStyle
                  ?.alignItems ||
                "start",
              width:
                "100%"
            },
            mobile: {
              gridTemplateColumns:
                "minmax(0, 1fr)"
            }
          }
        },
        children: [
          {
            id:
              generateId(),
            type:
              "gridItem",
            data: {
              props: {},
              style:
                styleOf(
                  payload.contactTableStyle,
                  {
                    width:
                      "100%",
                    minWidth:
                      "0"
                  }
                )
            },
            children:
              contactRows.map(
                contactRow
              )
          },
          {
            id:
              generateId(),
            type:
              "gridItem",
            data: {
              props: {},
              style:
                styleOf(
                  payload.formStyle,
                  {
                    display:
                      "flex",
                    flexDirection:
                      "column",
                    width:
                      "100%",
                    minWidth:
                      "0",
                    boxSizing:
                      "border-box"
                  }
                )
            },
            children:
              formChildren
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
        payload.formRows
          ?.length ||
        0,
      formFieldCount:
        payload.formRows
          ?.reduce(
            (
              count,
              row
            ) =>
              count +
              row.fields.length,
            0
          ) ||
        0,
      gridColumns:
        (
          emitted.children[0]
            .data.style as any
        )?.desktop
          ?.gridTemplateColumns
    }
  );

  console.log(
    "CONTACT_LAYOUT_FINAL",
    {
      id:
        emitted.id,
      type:
        emitted.type,
      semanticType:
        emitted.meta
          ?.semanticType,
      childTypes:
        emitted.children.map(
          child =>
            child.type
        ),
      columnChildTypes:
        emitted.children[0]
          ?.children.map(
            child =>
              child.type
          )
    }
  );

  return emitted;
};
