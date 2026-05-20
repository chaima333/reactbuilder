// src/modules/pageBuilder/components/blocks/primitive/text/TextBlock.tsx
import { useResolvedStyle } from "../../../../core/theme/useResolvedStyle";

type Device = "desktop" | "tablet" | "mobile";

export const TextBlock = ({ data, device }: any) => {
  const resolvedStyle = useResolvedStyle(data.style, (device || "desktop") as Device);
  const currentDevice = device || "desktop";
  const rawExtractedStyles = data?.style?.[currentDevice] || {};

  return (
    <div
      style={{
        ...resolvedStyle,      
        ...rawExtractedStyles,  
        outline: "none",
        minHeight: "1.2em",
        pointerEvents: "none" 
      }}
    >
      {data.props?.content}
    </div>
  );
};