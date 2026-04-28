import { BlockRenderer } from "../components/editor/BlockRenderer";
import { usePageEditor } from "../hooks/usePageEditor";

export const PagePreview = () => {
  const { blocks, registry } = usePageEditor("edit"); // جيب الـ registry

  return (
    <div className="public-view">
      <BlockRenderer blocks={blocks} registry={registry} preview={true} />
    </div>
  );
};