import React from "react";

import {
  Box,
  Container
} from "@mui/material";

import {
  RenderTree
} from "../renderer/RenderTree";

import {
  RuntimeProvider
} from "../context/RuntimeProvider";

export const PublicPageRuntime = ({
  page,
  site
}: any) => {

  // =========================
  // GLOBAL LAYOUT
  // =========================

  const globalLayout =
  site?.globalLayout || {};

  // =========================
  // NAVBAR
  // =========================

const navbarBlocks: any[] =
  globalLayout?.navbar
    ? [globalLayout.navbar]
    : [];

  // =========================
  // PAGE BLOCKS
  // =========================

  const pageBlocks =
    page?.blocks || [];



  // =========================
  // RENDER
  // =========================

  return (

    <RuntimeProvider
      value={{
        mode: "public",
        device: "desktop",
        tokens:
          page?.theme ||
          site?.theme ||
          {}
      }}
    >

      <Box
        sx={{
          width: "100%",
          minHeight: "100vh",
          bgcolor: "#f8fafc"
        }}
      >
 {/* GLOBAL NAVBAR */}

{navbarBlocks.length > 0 && (

  <RenderTree
    blocks={navbarBlocks}
  />

)}

{/* PAGE CONTENT */}

<Box
  sx={{
    width: "100%"
  }}
>

  <RenderTree
    blocks={pageBlocks}
  />

</Box>


      </Box>

    </RuntimeProvider>
  );
};
