import { useRef } from "react";
import { applyStyles } from "../../core/styleEngine";

export const TitleBlock = ({ data, onChange, preview }: any) => {
  const ref = useRef<HTMLHeadingElement>(null);

  const handleBlur = () => {
    if (preview) return;

    const content = ref.current?.innerText || "";

    onChange({
      props: {
        ...data.props,
        content,
      },
    });
  };

  return (
    <h1
      ref={ref}
      contentEditable={!preview}
      suppressContentEditableWarning
      onBlur={handleBlur}
      style={{
        ...applyStyles(data.style),
        margin: 0,
        cursor: preview ? "default" : "text",
      }}
    >
      {data.props?.content || "Titre..."}
    </h1>
  );
};