import React from "react";

import {
  Alert,
  Box,
  CircularProgress
} from "@mui/material";

import {
  useParams
} from "react-router-dom";

import {
  useSelector
} from "react-redux";

import type {
  RootState
} from "../../../../redux/store";

import {
  useGetVisitorPublicPageByIdQuery,
  useGetVisitorPublicPageBySlugQuery
} from "../../../../redux/services/publicRuntime.api";

import {
  PublicPageRuntime
} from "./PublicPageRuntime";
import { VisitorAuthRequired } from "../../../siteVisitors/components/VisitorAuthRequired";

const getErrorStatus = (
  error: unknown
): number | undefined => {
  if (
    error &&
    typeof error === "object" &&
    "status" in error
  ) {
    const status =
      (error as {
        status?: number | string;
      }).status;

    return typeof status === "number"
      ? status
      : undefined;
  }

  return undefined;
};

export const PublicPage = () => {
  const {
    siteId,
    slug,
    pageId
  } = useParams();

  const numericSiteId =
    Number(siteId);

  const numericPageId =
    Number(pageId);

  const isPageIdRoute =
    Boolean(pageId);

  const visitorSession =
    useSelector(
      (state: RootState) =>
        state.visitorAuth.sessions[
          String(numericSiteId)
        ]
    );

  const visitorId =
    visitorSession?.visitor?.id;

  const {
    data: pageById,
    isLoading: loadingById,
    error: errorById
  } =
    useGetVisitorPublicPageByIdQuery(
      {
        siteId:
          numericSiteId,

        pageId:
          numericPageId,

        visitorId
      },
      {
        skip:
          !Number.isInteger(
            numericSiteId
          ) ||
          numericSiteId <= 0 ||
          !Number.isInteger(
            numericPageId
          ) ||
          numericPageId <= 0
      }
    );

  const {
    data: pageBySlug,
    isLoading: loadingBySlug,
    error: errorBySlug
  } =
    useGetVisitorPublicPageBySlugQuery(
      {
        siteId:
          numericSiteId,

        slug:
          slug || "",

        visitorId
      },
      {
        skip:
          isPageIdRoute ||
          !Number.isInteger(
            numericSiteId
          ) ||
          numericSiteId <= 0 ||
          !slug
      }
    );

  const page =
    isPageIdRoute
      ? pageById
      : pageBySlug;

  const isLoading =
    isPageIdRoute
      ? loadingById
      : loadingBySlug;

  const error =
    isPageIdRoute
      ? errorById
      : errorBySlug;

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

  const errorStatus =
    getErrorStatus(error);

if (errorStatus === 401) {
  return (
    <VisitorAuthRequired />
  );
}

  if (errorStatus === 403) {
    return (
      <Box
        p={6}
        maxWidth={600}
        mx="auto"
      >
        <Alert severity="error">
          Votre compte ne peut pas accéder à cette page.
        </Alert>
      </Box>
    );
  }

  if (error || !page) {
    return (
      <Box
        p={10}
        textAlign="center"
      >
        <h2>Page introuvable</h2>

        <p>
          La page demandée n’existe pas ou n’est pas publiée.
        </p>
      </Box>
    );
  }

  return (
    <PublicPageRuntime
      page={page}
      site={(page as any).site}
    />
  );
};