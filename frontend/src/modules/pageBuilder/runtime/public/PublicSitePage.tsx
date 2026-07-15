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


  console.log(
    "PUBLIC SITE DATA",
    siteData
  );


  console.log(
    "GLOBAL LAYOUT",
    (siteData as any).globalLayout
  );


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
    )
    ||
    publishedPages.find(
      (p: any) =>
        p.slug === "home"
    )
    ||
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



  // =========================
  // THEME
  // =========================

  const siteTheme =
    siteData.theme ||
    (siteData as any)?.settings?.theme ||
    {};


  const runtimeTheme =
    selectedPage?.theme ||
    siteTheme;



  // =========================
  // RENDER
  // =========================

  return (

    <Box
      sx={{
        minHeight: "100vh",

        bgcolor:
          runtimeTheme?.colors?.background?.default ||
          runtimeTheme?.colors?.muted ||
          "#f8fafc"
      }}
    >

      {
        selectedPage
          ?

          <PublicPageRuntime

            page={selectedPage}
            site={{
              ...siteData,
              theme: siteTheme
            }}

          />

          :

          <Container sx={{ py: 10 }}>

            <Alert severity="info">

              {
                isRequestedSlugMissing
                  ?
                  "Page non trouvée ou non publiée"
                  :
                  "Aucun homepage publié"
              }

            </Alert>

          </Container>
      }


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