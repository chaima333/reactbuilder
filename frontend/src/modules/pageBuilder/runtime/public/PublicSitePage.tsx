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

  const { siteId } = useParams();

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

  if (error || !siteData) {

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
  // HOMEPAGE
  // =========================

 const homepage =
  publishedPages[0];
  
  // =========================
  // RENDER
  // =========================

  return (

    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f8fafc"
      }}
    >

      {/* ===================== */}
      {/* HOMEPAGE RUNTIME */}
      {/* ===================== */}

      {homepage ? (

        <PublicPageRuntime
  page={homepage}
  site={siteData}
/>

      ) : (

        <Container sx={{ py: 10 }}>

          <Alert severity="info">
            Aucun homepage publié
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