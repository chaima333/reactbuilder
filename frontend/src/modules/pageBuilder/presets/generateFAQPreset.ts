const makeId = (prefix: string) =>
  `${prefix}-${crypto.randomUUID?.() || Math.random().toString(36).slice(2)}`;

const responsive = (
  desktop: Record<string, any>,
  tablet: Record<string, any> = {},
  mobile: Record<string, any> = {}
) => ({
  desktop,
  tablet,
  mobile
});

const titleBlock = (
  text: string,
  style: Record<string, any> = {}
) => ({
  id: makeId("faq-title"),
  type: "title",
  data: {
    props: {
      text,
      content: text
    },
    style: responsive(
      {
        fontSize: "40px",
        fontWeight: 800,
        textAlign: "center",
        color: "#111827",
        marginBottom: "0",
        ...style
      },
      {},
      {
        fontSize: "30px",
        lineHeight: "1.2"
      }
    )
  },
  children: []
});

const textBlock = (
  text: string,
  style: Record<string, any> = {}
) => ({
  id: makeId("faq-text"),
  type: "text",
  data: {
    props: {
      text,
      content: text
    },
    style: responsive(
      {
        fontSize: "17px",
        lineHeight: "1.7",
        color: "#475569",
        textAlign: "center",
        marginBottom: "0",
        ...style
      },
      {},
      {
        fontSize: "15px"
      }
    )
  },
  children: []
});

const flexItem = (
  children: any[],
  style: Record<string, any> = {}
) => ({
  id: makeId("faq-flex-item"),
  type: "flexItem",
  data: {
    props: {},
    style: responsive({
      width: "100%",
      ...style
    })
  },
  children
});

const faqItem = (
  question: string,
  answer: string
) => ({
  id: makeId("faq-grid-item"),
  type: "gridItem",
  data: {
    props: {},
    style: responsive({
      minWidth: "0"
    })
  },
  children: [
    {
      id: makeId("faq-card"),
      type: "flex",
      data: {
        props: {},
        style: responsive(
          {
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            minHeight: "190px",
            padding: "26px",
            borderRadius: "16px",
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
            boxShadow: "0 12px 28px rgba(15, 23, 42, 0.07)"
          },
          {},
          {
            padding: "22px",
            minHeight: "auto"
          }
        )
      },
      children: [
        flexItem([
          titleBlock(question, {
            fontSize: "20px",
            fontWeight: 800,
            textAlign: "left",
            color: "#0f172a",
            marginBottom: "0"
          })
        ]),
        flexItem([
          textBlock(answer, {
            fontSize: "15px",
            textAlign: "left",
            color: "#64748b"
          })
        ])
      ]
    }
  ]
});

export const generateFAQPreset = () => ({
  id: makeId("faq-section"),
  type: "section",
  meta: {
    semanticType: "FAQ_SECTION",
    displayName: "FAQ Section"
  },
  data: {
    props: {},
    meta: {
      semanticType: "FAQ_SECTION"
    },
    style: responsive(
      {
        width: "100%",
        padding: "88px 40px",
        backgroundColor: "#f8fafc",
        boxSizing: "border-box"
      },
      {
        padding: "72px 28px"
      },
      {
        padding: "56px 18px"
      }
    )
  },
  children: [
    {
      id: makeId("faq-intro"),
      type: "flex",
      data: {
        props: {},
        style: responsive(
          {
            width: "100%",
            maxWidth: "760px",
            margin: "0 auto 34px auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "14px"
          }
        )
      },
      children: [
        flexItem([
          titleBlock("Frequently Asked Questions")
        ]),
        flexItem([
          textBlock(
            "Quick answers to help visitors understand your services, process, and next steps.",
            {
              maxWidth: "680px",
              marginLeft: "auto",
              marginRight: "auto"
            }
          )
        ])
      ]
    },
    {
      id: makeId("faq-grid"),
      type: "grid",
      data: {
        props: {},
        style: responsive(
          {
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "22px",
            width: "100%",
            maxWidth: "1080px",
            margin: "0 auto"
          },
          {
            gridTemplateColumns: "1fr"
          },
          {
            gridTemplateColumns: "1fr",
            gap: "16px"
          }
        )
      },
      children: [
        faqItem(
          "How can I get started?",
          "Reach out with your goals and we will guide you through the first steps."
        ),
        faqItem(
          "Can I customize this section?",
          "Yes. Every question, answer, color, spacing, and layout can be edited in the builder."
        ),
        faqItem(
          "Is this section responsive?",
          "Yes. The layout adapts cleanly across desktop, tablet, and mobile screens."
        ),
        faqItem(
          "Can I add more questions?",
          "Yes. Duplicate an item or add new editable blocks to expand the FAQ."
        )
      ]
    }
  ]
});