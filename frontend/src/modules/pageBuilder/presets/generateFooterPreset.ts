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

const textBlock = (
  text: string,
  style: Record<string, any> = {}
) => ({
  id: makeId("footer-text"),
  type: "text",
  data: {
    props: {
      text,
      content: text
    },
    style: responsive({
      fontSize: "16px",
      color: "#cbd5e1",
      lineHeight: "1.7",
      ...style
    })
  },
  children: []
});

const titleBlock = (
  text: string,
  style: Record<string, any> = {}
) => ({
  id: makeId("footer-title"),
  type: "title",
  data: {
    props: {
      text,
      content: text
    },
    style: responsive({
      fontSize: "22px",
      fontWeight: 800,
      color: "#ffffff",
      marginBottom: "14px",
      ...style
    })
  },
  children: []
});

const footerColumn = (
  children: any[]
) => ({
  id: makeId("footer-column"),
  type: "flexItem",
  data: {
    props: {},
    style: responsive({
      flex: "1 1 0%",
      minWidth: "180px",
      display: "flex",
      flexDirection: "column",
      gap: "10px"
    })
  },
  children
});

export const generateFooterPreset = () => ({
  id: makeId("footer-section"),
  type: "footer",
  data: {
    props: {},
    meta: {
      semanticType: "FOOTER_SECTION"
    },
    style: responsive({
      width: "100%",
      padding: "70px 40px 35px",
      backgroundColor: "#020617",
      boxSizing: "border-box"
    })
  },
  children: [
    {
      id: makeId("footer-container"),
      type: "flex",
      data: {
        props: {},
        style: responsive({
          maxWidth: "1180px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "row",
          gap: "48px",
          flexWrap: "wrap",
          justifyContent: "space-between"
        })
      },
      children: [
        footerColumn([
          titleBlock("Your Brand"),
          textBlock("Building modern digital experiences with clarity and impact.")
        ]),
        footerColumn([
          titleBlock("Company", {
            fontSize: "18px"
          }),
          textBlock("About"),
          textBlock("Services"),
          textBlock("Pricing"),
          textBlock("Contact")
        ]),
        footerColumn([
          titleBlock("Resources", {
            fontSize: "18px"
          }),
          textBlock("Help Center"),
          textBlock("Documentation"),
          textBlock("API"),
          textBlock("Community")
        ]),
        footerColumn([
          titleBlock("Contact", {
            fontSize: "18px"
          }),
          textBlock("contact@example.com"),
          textBlock("+216 XX XXX XXX"),
          textBlock("Tunis, Tunisia")
        ])
      ]
    },
    {
      id: makeId("footer-bottom"),
      type: "text",
      data: {
        props: {
          text: "© 2026 Your Brand. All rights reserved.",
          content: "© 2026 Your Brand. All rights reserved."
        },
        style: responsive({
          maxWidth: "1180px",
          margin: "40px auto 0",
          paddingTop: "24px",
          borderTop: "1px solid rgba(255,255,255,0.12)",
          textAlign: "center",
          color: "#94a3b8",
          fontSize: "14px"
        })
      },
      children: []
    }
  ]
});
