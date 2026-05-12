import { useResolvedStyle } from "../../core/theme/useResolvedStyle";

type Device = "desktop" | "tablet" | "mobile";

export const TitleBlock = ({ data, device }: any) => {
  const style = useResolvedStyle(data.style, (device || "desktop") as Device);

  return (
    <h1 style={{
      margin: 0,
      padding: "10px 0",
      fontSize: style.fontSize || "32px",
      color: style.color || "inherit",
      textAlign: style.textAlign || "left",
      ...style
    }}>
      {data.props.content || "Title Text"}
    </h1>
  );
};
