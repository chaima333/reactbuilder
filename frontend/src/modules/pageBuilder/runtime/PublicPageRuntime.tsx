import React from "react";

import {
  Box,
  Container
} from "@mui/material";

import {
  RenderTree
} from "../runtime/renderTree";

export const PublicPageRuntime = ({
  page
}: any) => {

  return (
    <Box
      sx={{
        width: "100%",
        py: 8
      }}
    >
      <Container maxWidth="lg">

        <RenderTree
          blocks={page.blocks || []}
          device="desktop"
        />

      </Container>
    </Box>
  );
};