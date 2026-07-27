import React from "react";

import {
  Alert,
  Box,
  CircularProgress,
  Container
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
  useGetVisitorPublicPageBySlugQuery,
  useGetVisitorPublicSiteQuery
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

export const PublicSite: React.FC =
  () => {
    const {
      siteId,
      slug
    } = useParams();

    const numericSiteId =
      Number(siteId);

    const visitorSession =
      useSelector(
        (state: RootState) =>
          state.visitorAuth.sessions[
            String(numericSiteId)
          ]
      );

    const visitorId =
      visitorSession?.visitor?.id;

    /*
     * تجيب بيانات الموقع وقائمة الصفحات المنشورة.
     * القائمة ما تحتويش على blocks كاملة.
     */
    const {
      data: siteData,
      isLoading: siteLoading,
      error: siteError
    } =
      useGetVisitorPublicSiteQuery(
        {
          siteId:
            numericSiteId,

          visitorId
        },
        {
          skip:
            !Number.isInteger(
              numericSiteId
            ) ||
            numericSiteId <= 0
        }
      );

    const publishedPages =
      siteData?.pages?.filter(
        (page: any) =>
          page.status ===
          "published"
      ) || [];

    const normalizedSlug =
      slug?.trim() || "";

    const isHomepageRoute =
      !normalizedSlug ||
      normalizedSlug === "home" ||
      /^home-\d+$/.test(
        normalizedSlug
      );

    const homepage =
      publishedPages.find(
        (page: any) =>
          page.isHomepage === true
      ) ||
      publishedPages.find(
        (page: any) =>
          page.slug === "home"
      ) ||
      publishedPages[0];

    /*
     * في route homepage نختارو slug من قائمة الموقع.
     * في route عادية نستعمل slug الموجودة في URL مباشرة.
     *
     * مهم: نستعمل slug مباشرة حتى protected page
     * ترجع 401 بدل ما نظهروها كأنها غير موجودة.
     */
    const selectedSlug =
      isHomepageRoute
        ? homepage?.slug || ""
        : normalizedSlug;

    /*
     * تجيب الصفحة الكاملة:
     * blocks + content + SEO + site.
     */
    const {
      data: selectedPage,
      isLoading: pageLoading,
      error: pageError
    } =
      useGetVisitorPublicPageBySlugQuery(
        {
          siteId:
            numericSiteId,

          slug:
            selectedSlug,

          visitorId
        },
        {
          skip:
            siteLoading ||
            !Number.isInteger(
              numericSiteId
            ) ||
            numericSiteId <= 0 ||
            !selectedSlug
        }
      );

    if (
      siteLoading ||
      pageLoading
    ) {
      return (
        <LoadingSpinner />
      );
    }

    if (
      siteError ||
      !siteData
    ) {
      return (
        <Container
          sx={{
            py: 10
          }}
        >
          <Alert severity="error">
            Site non trouvé
          </Alert>
        </Container>
      );
    }

    const pageErrorStatus =
      getErrorStatus(
        pageError
      );

   if (
  pageErrorStatus === 401
) {
  return (
    <VisitorAuthRequired />
  );
}

    if (
      pageErrorStatus === 403
    ) {
      return (
        <Container
          sx={{
            py: 10
          }}
        >
          <Alert severity="error">
            Votre compte ne peut pas
            accéder à cette page.
          </Alert>
        </Container>
      );
    }

    if (
      !selectedSlug
    ) {
      return (
        <Container
          sx={{
            py: 10
          }}
        >
          <Alert severity="info">
            Aucun homepage publié
          </Alert>
        </Container>
      );
    }

    if (
      pageError ||
      !selectedPage
    ) {
      return (
        <Container
          sx={{
            py: 10
          }}
        >
          <Alert severity="info">
            Page non trouvée ou
            non publiée
          </Alert>
        </Container>
      );
    }

    const siteTheme =
      siteData.theme ||
      siteData?.settings?.theme ||
      {};

    const runtimeTheme =
      selectedPage?.theme ||
      siteTheme;

    return (
      <Box
        sx={{
          minHeight:
            "100vh",

          bgcolor:
            runtimeTheme?.colors
              ?.background
              ?.default ||
            runtimeTheme?.colors
              ?.muted ||
            "#f8fafc"
        }}
      >
        <PublicPageRuntime
          page={
            selectedPage
          }
          site={{
            ...siteData,
            theme:
              siteTheme
          }}
        />
      </Box>
    );
  };

const LoadingSpinner = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="100vh"
  >
    <CircularProgress
      sx={{
        color: "#00C49A"
      }}
    />
  </Box>
);