import React from "react";

import {
  RuntimeRenderer
} from "./RuntimeRenderer";

import {
  useRuntime
} from "../context/RuntimeProvider";

import type {
  Block
} from "../../types/page.types";

interface RenderTreeProps {

  blocks: Block[];
}

export const RenderTree = ({
  blocks
}: RenderTreeProps) => {

  const {
    device
  } = useRuntime();

  if (
    !blocks ||
    !blocks.length
  ) {

    return null;
  }
return (
  <>
    {blocks.map(
      (block) => {
        return (
          <RuntimeRenderer
            key={block.id}
            block={block}
            device={device}
          >
            {
              block.children &&
              block.children.length > 0 && (
                <RenderTree
                  blocks={block.children}
                />
              )
            }

          </RuntimeRenderer>
        );
      }
    )}
  </>
);
};