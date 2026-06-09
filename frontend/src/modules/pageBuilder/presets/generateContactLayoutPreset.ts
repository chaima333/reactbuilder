import {
  ContactLayoutPayload
} from "../runtime/importers/html/semanticContracts/ContactLayoutPayload";

// =====================================
// ID GENERATOR
// =====================================

const generateId = () => {

  if (
    typeof globalThis !== "undefined" &&
    globalThis.crypto?.randomUUID
  ) {

    return globalThis
      .crypto
      .randomUUID();
  }

  return Math.random()
    .toString(36)
    .slice(2);
};


// =====================================
// TAG REGISTRY
// =====================================

const TAG_TO_BLOCK_TYPE:
Record<string, string> = {

  textarea:
    "textarea",

  select:
    "select",

  input:
    "input"
};

// =====================================
// NORMALIZE PAYLOAD
// =====================================

const normalizePayload = (
  payload: ContactLayoutPayload
) => {

  return {

    sections:

      (payload.sections || [])
      .map(section => ({

        title:
          section?.title || "",

        items:
          section?.items || [],

        style:
          section?.style || {}
      })),

    formRows:

      (payload.formRows || [])
      .map(row => ({

        style:
          row?.style || {},

        fields:

          (row?.fields || [])
          .map(field => ({

            tag:
              field?.tag || "input",

            placeholder:
              field?.placeholder || "",

            type:
              field?.type || "text",

            label:
              field?.label || "",

            options:
              field?.options || [],

            style:
              field?.style || {}
          }))
      })),

    formTitle:
      payload.formTitle ||
      "Envoyer un message",

    formDescription:
      payload.formDescription ||
      "Nous orienterons votre demande vers le practice lead concerné.",

    submitLabel:
      payload.submitLabel ||
      "ENVOYER LE MESSAGE"
  };
};

// =====================================
// NODE BUILDERS
// =====================================

const makeTitle = (
  content: string,
  style: any = {},
  role: "heroTitle" | "sectionTitle" | "eyebrowLabel" | "microLabel" = "sectionTitle",
  level: 1 | 2 | 3 | 4 | 5 | 6 = 2
) => ({
  id: generateId(),
  type: "title",
  data: {
    props: {
      content,
      role,
      level
    },
    style
  },
  children: []
});

const makeText = (
  content: string,
  style: any = {}
) => ({

  id:
    generateId(),

  type:
    "text",

  data: {

    props: {
      content
    },

    style
  },

  children: []
});

const makeButton = (
  text: string
) => ({

  id:
    generateId(),

  type:
    "button",

  data: {

    props: {

      text,

      submit:
        true,

      role:
        "submit"
    },

    style: {

      desktop: {

        width:
          "100%",

        padding:
          "18px 24px",

        borderRadius:
          "14px",

        fontWeight:
          "700",

        marginTop:
          "12px"
      }
    }
  },

  children: []
});

const makeFieldBlock = (
  field: any
) => {

  const blockType =

    TAG_TO_BLOCK_TYPE[
      field.tag
    ];

  if (!blockType) {

    console.warn(
      "⚠️ Unknown field tag:",
      field.tag
    );
  }

  const resolvedType =
    blockType || "input";

  return {

    id:
      generateId(),

    type:
      resolvedType,

    data: {

      props: {

        label:
          field.label || "",

        placeholder:
          field.placeholder || "",

        type:
          field.type || "text",

        ...(resolvedType === "select"

          ? {

              options:
                field.options || []
            }

          : {})
      },

      style: {

        desktop: {

          flex:
            1,

          width:
            "100%",

          boxSizing:
            "border-box",

          borderRadius:
            "14px",

          padding:
            "14px 16px"
        }
      }
    },

    children: []
  };
};

const makeSectionGroup = (
  section: any
) => ({

  id:
    generateId(),

  type:
    "flex",

  data: {

    props: {

      role:
        "contact-section"
    },

    style: {

      desktop: {

        display:
          "flex",

        flexDirection:
          "column",

        gap:
          "8px",

        width:
          "100%"
      }
    }
  },

  children: [

    makeTitle(
      section.title,

      {
        desktop: {

          fontSize:
            "18px",

          fontWeight:
            "700",

          marginTop:
            "28px",

          marginBottom:
            "8px",

          textTransform:
            "uppercase",

          letterSpacing:
            "1px"
        }
      }
    ),

    ...(section.items || [])
    .map((item: string) =>

      makeText(
        item,

        {
          desktop: {

            fontSize:
              "16px",

            lineHeight:
              "1.8",

            whiteSpace:
              "pre-line"
          }
        }
      )
    )
  ]
});

const makeFormRow = (
  row: any
) => {

  const fields =

    row.fields ||
    row.inputs ||
    row.children ||
    [];

  console.log(
    "🔥 FORM ROW FIELDS",
    fields
  );

  return {

    id:
      generateId(),

    type:
      "grid",

    data: {

      style: {

        desktop: {

          display:
            "grid",

          gridTemplateColumns:

            fields.length >= 2
              ? "1fr 1fr"
              : "1fr",

          gap:
            "16px",

          width:
            "100%"
        }
      }
    },

    children:

      fields.map((field: any) => ({

        id:
          generateId(),

        type:
          "gridItem",

        data: {

          style: {

            desktop: {

              width:
                "100%"
            }
          }
        },

        children: [

          makeFieldBlock(
            field
          )
        ]
      }))
  };
};
// =====================================
// MAIN GENERATOR
// =====================================

export const generateContactLayoutPreset = (
  rawPayload: ContactLayoutPayload
) => {
  console.log(
    "🔥 RAW CONTACT PAYLOAD",
    JSON.stringify(
      rawPayload,
      null,
      2
    )
  );
  const payload =
    normalizePayload(
      rawPayload
    );

  return {

    id:
      generateId(),

    type:
      "section",

    data: {

      style: {

        desktop: {

          width:
            "100%",

          padding:
            "80px 48px",

          boxSizing:
            "border-box"
        }
      }
    },

    children: [

      {
        id:
          generateId(),

        type:
          "grid",

        data: {

          style: {

            desktop: {

              gridTemplateColumns:
                "1fr 1fr",

              gap:
                "64px",

              alignItems:
                "start"
            },

            tablet: {

              gridTemplateColumns:
                "1fr",

              alignItems:
                "start"
            },

            mobile: {

              gridTemplateColumns:
                "1fr",

              alignItems:
                "start"
            }
          }
        },

        children: [

          // =====================================
          // LEFT COLUMN
          // =====================================

          {
            id:
              generateId(),

            type:
              "gridItem",

            data: {

              style: {

                desktop: {

                  display:
                    "flex",

                  flexDirection:
                    "column",

                  gap:
                    "18px",

                  width:
                    "100%"
                }
              }
            },

            children: [

              ...(payload.sections || [])
              .map(
                makeSectionGroup
              )
            ]
          },

          // =====================================
          // RIGHT COLUMN
          // =====================================

          {
            id:
              generateId(),

            type:
              "gridItem",

            data: {

              style: {

                desktop: {

                  backgroundColor:
                    "rgba(6,32,61,.75)",

                  borderRadius:
                    "28px",

                  padding:
                    "40px",

                  display:
                    "flex",

                  flexDirection:
                    "column",

                  gap:
                    "20px",

                  width:
                    "100%",

                  boxSizing:
                    "border-box"
                }
              }
            },

            children: [

              makeTitle(
                payload.formTitle,

                {
                  desktop: {

                    fontSize:
                      "10px",

                    lineHeight:
                      "1.1",

                    fontWeight:
                      "700",

                    marginBottom:
                      "8px"
                  }
                }
              ),

              makeText(
                payload.formDescription,

                {
                  desktop: {

                    fontSize:
                      "15px",

                    lineHeight:
                      "1.7",

                    marginBottom:
                      "12px"
                  }
                }
              ),

              ...(payload.formRows || [])
              .map(
                makeFormRow
              ),

              makeButton(
                payload.submitLabel
              )
            ]
          }
        ]
      }
    ]
  };
};