import React from "react";

import {
  useParams,
  Link
} from "react-router-dom";

import {
  Box,
  Container,
  CircularProgress,
  AppBar,
  Toolbar,
  Typography,
  Alert
} from "@mui/material";

// =========================
// THEME
// =========================

import { useTheme }
from "../../core/theme/ThemeProvider";

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
  // THEME
  // =========================

  const { tokens } = useTheme();

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
    publishedPages.find(
      (p: any) => p.isHomepage
    );

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
      {/* NAVBAR */}
      {/* ===================== */}

      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "white",
          borderBottom: "1px solid #e2e8f0"
        }}
      >

        <Toolbar
          sx={{
            minHeight: "72px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 4
          }}
        >

          {/* LOGO */}

          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              color: tokens.colors.primary,
              whiteSpace: "nowrap",
              flexShrink: 0
            }}
          >
            {siteData.name}
          </Typography>

          {/* NAVIGATION */}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              flexWrap: "wrap",
              justifyContent: "flex-end"
            }}
          >

            {publishedPages.map((page: any) => (

              <Link
                key={page.id}
                to={`/p/${siteId}/${page.slug}`}
                style={{
                  textDecoration: "none",
                  color: "#111827",
                  fontWeight: 600,
                  fontSize: "15px"
                }}
              >
                {page.title}
              </Link>

            ))}

          </Box>

        </Toolbar>

      </AppBar>

      {/* ===================== */}
      {/* HOMEPAGE RUNTIME */}
      {/* ===================== */}

      {homepage ? (

        <PublicPageRuntime
          page={homepage}
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