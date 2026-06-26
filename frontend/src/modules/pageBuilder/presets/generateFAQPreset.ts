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
    style: responsive({
      fontSize: "40px",
      fontWeight: 800,
      textAlign: "center",
      color: "#111827",
      marginBottom: "16px",
      ...style
    })
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
    style: responsive({
      fontSize: "18px",
      lineHeight: "1.7",
      color: "#475569",
      textAlign: "center",
      ...style
    })
  },
  children: []
});

const faqItem = (
  question: string,
  answer: string
) => ({
  id: makeId("faq-item"),
  type: "flex",
  data: {
    props: {},
    style: responsive({
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      padding: "24px",
      borderRadius: "18px",
      backgroundColor: "#ffffff",
      border: "1px solid #e5e7eb",
      boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)"
    })
  },
  children: [
    {
      id: makeId("faq-question"),
      type: "title",
      data: {
        props: {
          text: question,
          content: question
        },
        style: responsive({
          fontSize: "20px",
          fontWeight: 700,
          color: "#111827",
          margin: 0
        })
      },
      children: []
    },
    {
      id: makeId("faq-answer"),
      type: "text",
      data: {
        props: {
          text: answer,
          content: answer
        },
        style: responsive({
          fontSize: "16px",
          lineHeight: "1.7",
          color: "#64748b",
          margin: 0
        })
      },
      children: []
    }
  ]
});

export const generateFAQPreset = () => ({
  id: makeId("faq-section"),
  type: "section",
  data: {
    props: {},
    meta: {
      semanticType: "FAQ_SECTION"
    },
    style: responsive({
      width: "100%",
      padding: "90px 40px",
      backgroundColor: "#f8fafc",
      boxSizing: "border-box"
    })
  },
  children: [
    {
      id: makeId("faq-container"),
      type: "flex",
      data: {
        props: {},
        style: responsive({
          maxWidth: "980px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "28px"
        })
      },
      children: [
        titleBlock("Frequently Asked Questions"),
        textBlock(
          "Find clear answers to the most common questions about our services."
        ),
        faqItem(
          "How can I get started?",
          "You can contact our team and we will guide you through the first steps."
        ),
        faqItem(
          "Can I customize this section?",
          "Yes, every question, answer, color, spacing and layout can be edited in the builder."
        ),
        faqItem(
          "Is this section responsive?",
          "Yes, it is designed to work across desktop, tablet and mobile devices."
        )
      ]
    }
  ]
});