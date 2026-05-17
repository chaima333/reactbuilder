// src/modules/pageBuilder/components/blocks/layout/section/SectionBlock.tsx

import React from "react";

import {
  SectionShell
} from "../../semantic/shared/SectionShell";

type Device =
  | "desktop"
  | "tablet"
  | "mobile";

interface SectionBlockProps {

  children?: React.ReactNode;

  data: any;

  device?: Device;
}

export const SectionBlock = ({

  children,

  data,

  device = "desktop"

}: SectionBlockProps) => {

  return (

    <SectionShell
      style={data?.style}
      device={device}
    >

      {children}

      {React.Children.count(children) === 0 && (

        <div
          style={{

            color: "#aaa",

            textAlign: "center",

            padding: "40px",

            border:
              "1px dashed #ccc",

            marginTop: "24px"
          }}
        >

          Drop blocks here (Section)

        </div>
      )}

    </SectionShell>
  );
};