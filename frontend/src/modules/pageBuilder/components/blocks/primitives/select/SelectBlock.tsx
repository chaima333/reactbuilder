import React from "react";

import {
  useResolvedStyle
} from "../../../../core/theme/useResolvedStyle";

export const SelectBlock = ({
  block,
  device = "desktop"
}: any) => {

  const resolved =
    useResolvedStyle(
      block?.data?.style || {},
      device
    );

  const options =

    block?.data?.props
      ?.options || [];

  return (

    <select
      style={{
        ...resolved
      }}
    >

      {options.map(
        (
          option: string,
          index: number
        ) => (

          <option
            key={index}
          >

            {option}

          </option>
        )
      )}

    </select>
  );
};