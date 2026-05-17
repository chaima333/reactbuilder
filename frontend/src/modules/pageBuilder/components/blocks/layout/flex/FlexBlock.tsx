// src/modules/pageBuilder/components/blocks/layout/flex/FlexBlock.tsx

import React from "react";

interface FlexBlockProps {

  data: any;

  children?: React.ReactNode;

  device?:
    | "desktop"
    | "tablet"
    | "mobile";
}

export const FlexBlock = ({

  children

}: FlexBlockProps) => {

  return (

    <div
      style={{

        width: "100%",

        display: "flex",

        flexDirection: "row",

        flexWrap: "wrap",

        justifyContent: "flex-start",

        alignItems: "stretch",

        gap: "24px",

        boxSizing: "border-box"
      }}
    >

      {children}

    </div>
  );
};