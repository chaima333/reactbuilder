import React from "react";

import {
  Box,
  Divider,
  Typography
} from "@mui/material";

import {
  blockRegistry
} from "../../core/blockRegistry";

import {
  BlockType,
  Device
} from "../../types/page.types";

import {
  DynamicInspector
} from "./DynamicInspector";

type Props = {
  block: any;
  device: Device;
  onChange: (
    newData: any
  ) => void;
};

export const InspectorPanel:
React.FC<Props> = ({
  block,
  device,
  onChange
}) => {
  if (!block) {
    return (
      <Box p={3}>
        Select a block
      </Box>
    );
  }

  const config =
    blockRegistry[
      block.type as BlockType
    ];

  if (!config) {
    return (
      <Box p={3}>
        Unknown block
      </Box>
    );
  }

  return (
    <Box p={2}>
      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 700
        }}
      >
        {config.label}
      </Typography>

      <Divider
        sx={{ my: 2 }}
      />

      <DynamicInspector
        block={block}
        fields={config.fields || []}
        device={device}
        onChange={onChange}
      />
    </Box>
  );
};
