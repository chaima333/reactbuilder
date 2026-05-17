// src/modules/pageBuilder/components/blocks/primitive/text/TextBlock.tsx
import { useResolvedStyle } from "../../../../core/theme/useResolvedStyle";

type Device = "desktop" | "tablet" | "mobile";

export const TextBlock = ({ data, onChange, preview, device }: any) => {
  // 1. قراءة الـ Styles اللي حلّها الـ Theme
  const resolvedStyle = useResolvedStyle(data.style, (device || "desktop") as Device);

  // 2. قراءة الـ Raw Styles المستخرجة والمفلترة مباشرة من الـ State (إذا وُجدت)
  const currentDevice = device || "desktop";
  const rawExtractedStyles = data?.style?.[currentDevice] || {};

  return (
    <div
      style={{
        ...resolvedStyle,       // الـ Tokens الافتراضية
        ...rawExtractedStyles,  // 👑 حقن الـ Raw CSS المشفوط (مثل 16px، rgb...) مباشرة ليتغلّب بصرياً!
        outline: "none",
        minHeight: "1.2em",
      }}
    >
      {data.props?.content}
    </div>
  );
};