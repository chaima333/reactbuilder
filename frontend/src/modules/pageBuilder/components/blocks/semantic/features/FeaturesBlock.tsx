// src/modules/pageBuilder/components/blocks/semantic/features/FeaturesBlock.tsx

import React from "react";

import {
  SectionShell
} from "../shared/SectionShell";

import {
  Headline
} from "../shared/Headline";

import {
  Subtext
} from "../shared/Subtext";

interface FeaturesBlockProps {

  data: any;

  device?:
    | "desktop"
    | "tablet"
    | "mobile";

  children?: React.ReactNode;
}

export const FeaturesBlock = ({

  data,

  device = "desktop",

  children

}: FeaturesBlockProps) => {

  return (

    <SectionShell
      style={data?.style}
      device={device}
    >

      {/* =====================
          HEADER
      ===================== */}

      {data?.props?.headline && (

        <Headline
          text={data.props.headline}
          style={data?.style}
          device={device}
        />
      )}

      {data?.props?.subtext && (

        <Subtext
          text={data.props.subtext}
          style={data?.style}
          device={device}
        />
      )}

      {/* =====================
          👑 AUTHORITATIVE FLEX LAYOUT
      ===================== */}

      <div
        style={{

          width: "100%",

          display: "flex",

          flexDirection: "row",

          flexWrap: "wrap",

          justifyContent: "flex-start",

          alignItems: "stretch",

          gap: "24px",

          marginTop: "48px",

          boxSizing: "border-box"
        }}
      >

        {children}

      </div>

    </SectionShell>
  );
};