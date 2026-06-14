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

  console.log(
  "PUBLIC_SITE_DATA",
  siteData
);

  // =========================
  // PUBLISHED PAGES
  // =========================

  const publishedPages =
    siteData.pages?.filter(
      (p: any) =>
        p.status === "published"
    ) || [];
    console.log(
  "PUBLISHED_PAGES_FULL",
  publishedPages.map((p:any) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    isHomepage: p.isHomepage
  }))
);

  // =========================
  // HOMEPAGE
  // =========================

 const homepage =
  publishedPages.find(
    (p: any) => p.isHomepage === true
  ) ||
  publishedPages.find(
    (p: any) => p.sourceFile === "index.html"
  ) ||
  publishedPages.find(
    (p: any) => p.slug?.startsWith("home")
  ) ||
  publishedPages[0];


  console.log(
  "RAW_HOMEPAGE",
  homepage
);

console.log(
  "RAW_HOMEPAGE_BLOCKS",
  homepage?.blocks
);

console.log(
  "RAW_HOMEPAGE_CONTENT",
  homepage
);
 console.log(
  "PUBLISHED_PAGES",
  publishedPages.map(p => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    isHomepage: p.isHomepage,
    blocks: p.blocks?.length
  }))
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