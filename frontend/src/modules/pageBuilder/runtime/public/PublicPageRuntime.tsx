import React from "react";

import {
  Box,
  useMediaQuery
} from "@mui/material";

import {
  RenderTree
} from "../renderer/RenderTree";

import {
  RuntimeProvider
} from "../context/RuntimeProvider";
import { PublicChatbotSlot } from "../../../chatbot/PublicChatbotSlot";

export const PublicPageRuntime = ({
  page,
  site
}: any) => {

  const isMobileViewport =
    useMediaQuery("(max-width:600px)");

  const isTabletViewport =
    useMediaQuery("(min-width:601px) and (max-width:1024px)");

  const runtimeTokens =
    page?.theme ||
    site?.theme ||
    site?.settings?.theme ||
    {};

  const pageBackground =
    runtimeTokens?.colors?.background?.default ||
    runtimeTokens?.colors?.muted ||
    "#f8fafc";

  const pageSurface =
    runtimeTokens?.colors?.background?.surface ||
    runtimeTokens?.colors?.surface ||
    "#ffffff";

  const fontFamily =
    runtimeTokens?.typography?.fontFamily ||
    "inherit";

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

  const hasHtmlImportedBlock = (
    blocks: any[]
  ): boolean =>
    (blocks || []).some(
      (block: any) =>
        block?.meta?.importSource === "html" ||
        hasHtmlImportedBlock(block?.children || [])
    );

  const isHtmlImportedPage =
    hasHtmlImportedBlock(pageBlocks);

  const runtimeDevice =
    isHtmlImportedPage
      ? isMobileViewport
        ? "mobile"
        : isTabletViewport
          ? "tablet"
          : "desktop"
      : "desktop";

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


  const publicSiteId =
  Number(
    site?.id ||
    page?.siteId ||
    page?.site?.id ||
    0
  );
 
  return (

    <RuntimeProvider
      value={{
        mode: "public",
        device: runtimeDevice,
        siteId:
          publicSiteId || null,
        pageId:
          page?.id || null,
        cms:
          page?.cms,
        tokens:
          runtimeTokens
      }}
    >

      <Box
        sx={{
          width: "100%",
          minHeight: "100vh",
          backgroundColor: pageBackground,
          "--rb-color-primary":
            runtimeTokens?.colors?.brand?.primary ||
            runtimeTokens?.colors?.primary ||
            "#2563eb",
          "--rb-color-on-primary":
            runtimeTokens?.colors?.brand?.onPrimary ||
            runtimeTokens?.colors?.onPrimary ||
            "#ffffff",
          "--rb-font-family": fontFamily,
          fontFamily: "var(--rb-font-family)",
          color:
            runtimeTokens?.colors?.brand?.secondary ||
            runtimeTokens?.colors?.text ||
            "#111827"
        } as any}
      >

{navbarBlocks.length > 0 && (
  <RenderTree
    blocks={navbarBlocks}
  />
)}


<Box
  sx={{
    width: "100%",
    minHeight: "100vh",
    backgroundColor: pageSurface,
    fontFamily: "var(--rb-font-family)"
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

{publicSiteId > 0 && (
  <PublicChatbotSlot
    siteId={publicSiteId}
  />
)}
      </Box>
    </RuntimeProvider>
  );
};
