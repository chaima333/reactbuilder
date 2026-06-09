import {
  usePageEditor
} from "../hooks/usePageEditor";

import {
  RuntimeProvider
} from "../runtime/context/RuntimeProvider";

import {
  RenderTree
} from "../runtime/renderer/RenderTree";

export const PagePreview = () => {

  const {
    blocks,
    tokens
  } = usePageEditor("edit");

  return (
<RuntimeProvider
  value={{
  mode: "preview",
  device: "desktop",
  tokens
}}
>
      <div className="public-view">

        <RenderTree
          blocks={blocks}
        />

      </div>

    </RuntimeProvider>
  );
};
