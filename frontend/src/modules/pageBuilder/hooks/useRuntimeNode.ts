import {
  useDroppable
} from "@dnd-kit/core";

import {
  useRuntime
} from "../runtime/context/RuntimeProvider";

export const useRuntimeNode = ({
  block,
  id,
  type,
  droppable = false
}: any) => {

  // =====================
  // RUNTIME
  // =====================

  const context =
    useRuntime();

  // =====================
  // NODE ID
  // =====================

  const nodeId =

    block?.id || id;

  // =====================
  // DND
  // =====================

  const dnd =

    context.mode === "editor" &&
    droppable

      ? useDroppable({

          id:
            nodeId,

          data: {

            type,

            blockId:
              nodeId
          }
        })

      : {

          setNodeRef:
            undefined,

          isOver:
            false
        };

  // =====================
  // ROOT PROPS
  // =====================

  const rootProps = {

    ref:
      dnd.setNodeRef as any,

    id:
      context.mode ===
      "editor"

        ? `pb-runtime-${nodeId}`

        : undefined,

    className:
      context.mode ===
      "editor"

        ? `pb-${type}`

        : undefined,

    "data-block-id":

      context.mode ===
      "editor"

        ? nodeId

        : undefined,

    "data-block-type":

      context.mode ===
      "editor"

        ? type

        : undefined,

    "data-droppable-container":

      context.mode ===
      "editor" &&
      droppable

        ? "true"

        : undefined
  };

  // =====================
  // RETURN
  // =====================

  return {

    context,

    isOver:
      dnd.isOver,

    rootProps
  };
};