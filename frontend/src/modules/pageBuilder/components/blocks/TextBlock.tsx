import { useResolvedStyle } from "../../core/theme/useResolvedStyle";

type Device = "desktop" | "tablet" | "mobile";

export const TextBlock = ({ data, onChange, preview, device }: any) => {
  const style = useResolvedStyle(data.style, (device || "desktop") as Device);

  return (
    <div
      style={{
        ...style,
        outline: "none",
        minHeight: "1.2em",
      }}
    >
      {data.props?.content}
    </div>
  );
};
