import React from "react";

import {
  Box
} from "@mui/material";

import type {
  Block,
  Device
} from "../types/page.types";

import {
  RuntimeProvider
} from "../runtime/context/RuntimeProvider";

import {
  RenderTree
} from "../runtime/renderer/RenderTree";

interface PageRendererProps {

  blocks: Block[];

  device: Device;
}

export const PageRenderer = ({
  blocks,
  device
}: PageRendererProps) => {

  return (
    <RuntimeProvider
  value={{

    mode: "preview",

    device
  }}
>

      <Box
        sx={{
          width: "100%",
          minHeight: "100vh",
          bgcolor: "#fff"
        }}
      >

        <RenderTree
          blocks={blocks}
        />

      </Box>

    </RuntimeProvider>
  );
};