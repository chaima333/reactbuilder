import React from "react";

import {
  useResolvedStyle
} from "../../../../core/theme/useResolvedStyle";

export const InputBlock = ({
  block,
  device = "desktop"
}: any) => {

  const resolved =
    useResolvedStyle(
      block?.data?.style || {},
      device
    );

  return (

    <input

      type={
        block?.data?.props?.type ||
        "text"
      }

      placeholder={
        block?.data?.props?.placeholder ||
        ""
      }

      style={{
        ...resolved
      }}
    />
  );
};