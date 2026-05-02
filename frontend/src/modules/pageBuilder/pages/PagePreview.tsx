import { BlockRenderer } from "../components/editor/BlockRenderer";
import { usePageEditor } from "../hooks/usePageEditor";

export const PagePreview = () => {
  const { blocks, registry } = usePageEditor("edit"); 

  return (
    <div className="public-view">
      {/* 🟢 نعديو بالواحد بالواحد باستعمال map */}
      {blocks.map((b) => (
        <BlockRenderer 
          key={b.id}          // 👈 مهم جداً للـ React باش يحافظ على الـ Performance
          block={b}           // 👈 بدّل blocks لـ block (خاطر هو يحب بالواحد)
          registry={registry} 
          preview={true} 
        />
      ))}
    </div>
  );
};