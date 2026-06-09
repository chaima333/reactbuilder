import React from "react";

import {
  useResolvedStyle
} from "../../../../core/theme/useResolvedStyle";

export const TextareaBlock = ({
  block,
  device = "desktop"
}: any) => {

  const resolved =
    useResolvedStyle(
      block?.data?.style || {},
      device
    );

  return (

    <textarea

      placeholder={
        block?.data?.props
          ?.placeholder || ""
      }

      style={{
        ...resolved
      }}
    />
  );
};