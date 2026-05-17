import React from "react";
import { Box, Container } from "@mui/material";
import { RenderTree } from "../renderer/RenderTree";
import { RuntimeProvider } from "../context/RuntimeProvider"; // 👈 ثبت المسار

export const PublicPageRuntime = ({ page }: any) => {
  return (
    <RuntimeProvider
      value={{
        mode: "public",
        device: "desktop",
        tokens: {} 
      }}
    >
      <Box sx={{ width: "100%", py: 8 }}>
        <Container maxWidth="lg">
          <RenderTree blocks={page.blocks || []} />
        </Container>
      </Box>
    </RuntimeProvider>
  );
};
