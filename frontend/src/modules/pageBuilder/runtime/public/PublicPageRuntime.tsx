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
  site?.globalLayout ||
  page?.site?.globalLayout ||
  page?.globalLayout ||
  {};
  // =========================
  // NAVBAR
  // =========================

  const pageBlocks: any[] =
    page?.blocks || [];

  const pageOwnsNavbar =
    pageBlocks.some(
      (block: any) => block?.type === "navbar"
    );

  const pageOwnsFooter =
    pageBlocks.some(
      (block: any) =>
        block?.id?.startsWith("footer-section-")
    );

const navbarBlocks: any[] =
  globalLayout?.navbar && !pageOwnsNavbar
    ? [globalLayout.navbar]
    : [];

const footerBlocks: any[] =
  globalLayout?.footer && !pageOwnsFooter
    ? [globalLayout.footer]
    : [];

  console.log("NAVBAR_BLOCK_COUNT", {
    pageNavbarCount:
      pageBlocks.filter(
        (block: any) => block?.type === "navbar"
      ).length,
    injectedNavbarCount: navbarBlocks.length,
    renderedNavbarCount:
      pageBlocks.filter(
        (block: any) => block?.type === "navbar"
      ).length + navbarBlocks.length
  });

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

{/* GLOBAL FOOTER */}

{footerBlocks.length > 0 && (

  <RenderTree
    blocks={footerBlocks}
  />

)}


      </Box>

    </RuntimeProvider>
  );
};
