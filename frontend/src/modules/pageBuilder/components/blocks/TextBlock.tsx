import { useRef } from "react";
import { applyStyles } from "../../core/styleEngine";

export const TextBlock = ({ data, onChange, preview }: any) => {
  const ref = useRef<HTMLDivElement>(null);

  const handleBlur = () => {
    if (preview) return;

    const content = ref.current?.innerText || "";

    // 🟢 رجّع data كاملة (مش props فقط)
    onChange({
      props: {
        ...data.props,
        content,
      },
    });
  };

  return (
    <div
      ref={ref}
      contentEditable={!preview}
      suppressContentEditableWarning
      style={{
        ...applyStyles(data.style),
        outline: "none",
        minHeight: "1.2em",
        cursor: preview ? "default" : "text",
      }}
      onBlur={handleBlur}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          document.execCommand("insertLineBreak");
        }
      }}
    >
      {data.props?.content}
    </div>
  );
};