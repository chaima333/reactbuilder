
import React from "react";
import { SectionShell } from "../shared/SectionShell";
import { Headline } from "../shared/Headline";
import { Subtext } from "../shared/Subtext";
import { ActionsRow } from "../shared/ActionsRow";

interface CTABlockProps {
  data: any;
  device?: "desktop" | "tablet" | "mobile";
}

export const CTABlock = ({
  data,
  device = "desktop"
}: CTABlockProps) => {
  return (
    <SectionShell style={data.style} device={device}>

      <Headline
        text={data.props.headline}
        style={data.style}
        device={device}
      />

      <Subtext
        text={data.props.subtext}
        style={data.style}
        device={device}
      />

      <ActionsRow
        actions={data.props.actions}
        device={device}
      />

    </SectionShell>
  );
};
