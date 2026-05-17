import { useResolvedStyle } from "../../../../core/theme/useResolvedStyle";

type Device = "desktop" | "tablet" | "mobile";


export const TitleBlock = ({ data, device }: any) => {
  const rawStyle = data?.style?.[device || "desktop"] || {};

  const theme = {
    spacing: {
      xs: "8px",
      sm: "16px",
      md: "32px", // 👈 هذي اللي باش تسرّح الـ Margin Top
      lg: "48px",
      xl: "80px"
    },
    typography: {
      bodyMD: "20px",    // 👈 هذي اللي باش تسرّح الـ Font Size
      bodyLG: "28px",
      displayLG: "42px",
      displayXL: "60px"
    }
  };

  const getSpacing = (val: string) => theme.spacing[val as keyof typeof theme.spacing] || val;
  const getFontSize = (val: string) => theme.typography[val as keyof typeof theme.typography] || val;

  return (
    <h1
      style={{
        display: "block",
        width: "100%",
        margin: 0,
        padding: 0,
        
        marginTop: getSpacing(rawStyle.marginTop),
        marginBottom: getSpacing(rawStyle.marginBottom),
        fontSize: getFontSize(rawStyle.fontSize),
        
        textAlign: rawStyle.textAlign || "left",
        color: rawStyle.color || "inherit",
        fontWeight: rawStyle.fontWeight || "bold",
        
        ...rawStyle, // باش ما نضيعو حتى Style آخر
      }}
    >
      {data?.props?.content || "Title Text Content"}
    </h1>
  );
};