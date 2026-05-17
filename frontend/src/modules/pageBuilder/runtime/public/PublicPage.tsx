import React from "react";

import {
  Box,
  CircularProgress
} from "@mui/material";

import {
  useParams
} from "react-router-dom";

import {
  useGetPublicPageQuery
} from "../../../../redux/services/pages.api";

import {
  RenderTree
} from "../../runtime/renderer/RenderTree";

import {
  RuntimeProvider
} from "../context/RuntimeProvider";

export const PublicPage = () => {

  const {
    siteId,
    slug
  } = useParams();

  const {
    data,
    isLoading,
    error
  } = useGetPublicPageQuery(
    {
      siteId,
      slug
    },
    {
      skip: !siteId || !slug
    }
  );

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box
        p={10}
        textAlign="center"
      >
        Page not found
      </Box>
    );
  }

  return (
    <RuntimeProvider
      value={{
        mode: "public",
        device: "desktop"
      }}
    >
      <RenderTree
        blocks={data.blocks || []}
      />
    </RuntimeProvider>
  );
};
