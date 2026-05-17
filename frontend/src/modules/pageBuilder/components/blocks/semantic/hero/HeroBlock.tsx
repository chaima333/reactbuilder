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

import {
  ActionsRow
} from "../shared/ActionsRow";

interface HeroBlockProps {

  data: any;

  device?:
    | "desktop"
    | "tablet"
    | "mobile";
}

export const HeroBlock = ({
  data,
  device = "desktop"
}: HeroBlockProps) => {

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
        actions={[data.props.primaryAction]}
        device={device}
      />

    </SectionShell>
  );
};
