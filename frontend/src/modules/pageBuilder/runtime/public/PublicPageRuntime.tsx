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

  const runtimeTokens =
    page?.theme ||
    site?.theme ||
    {};

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

  const isFooterBlock = (block: any) => {
    const semanticType =
      block?.meta?.semanticType ||
      block?.data?.meta?.semanticType;

    return (
      block?.type === "footer" ||
      block?.id?.startsWith("footer-section-") ||
      semanticType === "FOOTER" ||
      semanticType === "FOOTER_SECTION"
    );
  };

  const pageOwnsNavbar =
    pageBlocks.some(
      (block: any) => block?.type === "navbar"
    );

  const pageOwnsFooter =
    pageBlocks.some(
      isFooterBlock
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
          runtimeTokens
      }}
    >

      <Box
        sx={{
          width: "100%",
          minHeight: "100vh",
          bgcolor:
            runtimeTokens?.colors?.surface ||
            "#f8fafc"
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
