import React from "react";

import { blockRegistry }
from "../core/blockRegistry";

import { Block }
from "../types/page.types";

export const renderBlock = (
  block: Block,
  children?: React.ReactNode
) => {

  const config =
    blockRegistry[block.type];

  if (!config) {
    return null;
  }

  const Component =
    config.component;

  return (
    <Component
      data={block.data}
    >
      {children}
    </Component>
  );
};