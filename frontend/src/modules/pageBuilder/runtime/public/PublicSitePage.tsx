import React from "react";

import {
  useParams
} from "react-router-dom";

import {
  Box,
  Container,
  CircularProgress,
  Alert
} from "@mui/material";

// =========================
// API
// =========================

import {
  useGetPublicSiteQuery
} from "../../../../redux/services/sites.api";

// =========================
// RUNTIME
// =========================

import {
  PublicPageRuntime
} from "./PublicPageRuntime";

export const PublicSite: React.FC = () => {

  // =========================
  // PARAMS
  // =========================

  const {
    siteId,
    slug
  } = useParams();

  // =========================
  // FETCH SITE
  // =========================

  const {
    data: siteData,
    isLoading: loading,
    error
  } = useGetPublicSiteQuery(
    Number(siteId),
    {
      skip: !siteId
    }
  );

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return <LoadingSpinner />;
  }

  // =========================
  // ERROR
  // =========================

  if (
    error ||
    !siteData
  ) {

    return (

      <Container sx={{ py: 10 }}>

        <Alert severity="error">
          Site non trouvé
        </Alert>

      </Container>
    );
  }

  // =========================
  // PUBLISHED PAGES
  // =========================

  const publishedPages =
    siteData.pages?.filter(
      (p: any) =>
        p.status === "published"
    ) || [];

  // =========================
  // NORMALIZED SLUG
  // =========================

  const normalizedSlug =
    slug?.trim();

  // =========================
  // HOMEPAGE
  // =========================

  const homepage =
    publishedPages.find(
      (p: any) =>
        p.isHomepage === true
    ) ||
    publishedPages.find(
      (p: any) =>
        p.slug === "home"
    ) ||
    publishedPages[0];

  // =========================
  // ROUTE TYPE
  // =========================

  const isHomepageRoute =
    !normalizedSlug ||
    normalizedSlug === "home" ||
    /^home-\d+$/.test(
      normalizedSlug
    );

  // =========================
  // SELECTED PAGE
  // =========================

  const selectedPage =
    isHomepageRoute
      ? homepage
      : publishedPages.find(
          (p: any) =>
            p.slug === normalizedSlug
        );

  const isRequestedSlugMissing =
    !!normalizedSlug &&
    !isHomepageRoute &&
    !selectedPage;

  console.log(
    "PUBLIC_SITE_PAGE_RESOLUTION",
    {
      homepageId:
        homepage?.id,

      selectedPageId:
        selectedPage?.id,

      selectedSlug:
        selectedPage?.slug,

      requestedSlug:
        normalizedSlug,

      isHomepageRoute,

      isRequestedSlugMissing,

      isHomepage:
        selectedPage?.isHomepage,

      blocksCount:
        selectedPage?.blocks?.length || 0,

      publishedPages:
        publishedPages.map(
          (p: any) => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            status: p.status,
            isHomepage: p.isHomepage
          })
        )
    }
  );

  // =========================
  // RENDER
  // =========================

  return (

    <Box
      sx={{
        minHeight: "100vh",
        bgcolor:
          selectedPage?.theme?.colors?.surface ||
          siteData?.theme?.colors?.surface ||
          "#f8fafc"
      }}
    >

      {selectedPage ? (

        <PublicPageRuntime
          page={selectedPage}
          site={siteData}
        />

      ) : (

        <Container sx={{ py: 10 }}>

          <Alert severity="info">
            {isRequestedSlugMissing
              ? "Page non trouvée ou non publiée"
              : "Aucun homepage publié"}
          </Alert>

        </Container>

      )}

    </Box>
  );
};

// =========================
// LOADING
// =========================

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
