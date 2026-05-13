import React from 'react';

import {
  useParams,
  Link
} from 'react-router-dom';

import {
  Box,
  Container,
  CircularProgress,
  AppBar,
  Toolbar,
  Typography,
  Alert
} from '@mui/material';

// =========================
// RUNTIME
// =========================

import { useTheme }
from '../core/theme/ThemeProvider';

import { RenderTree }
from '../runtime/renderTree';

// =========================
// API
// =========================

import {
  useGetPublicSiteQuery
} from '../../../redux/services/sites.api';

export const PublicSite:
React.FC = () => {

  // =========================
  // PARAMS
  // =========================

  const {
    siteId
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
      skip:
        !siteId
    }
  );

  // =========================
  // THEME / DEVICE
  // =========================

  const { tokens } =
    useTheme();

  const device =
    "desktop";

  // =========================
  // LOADING
  // =========================

  if (loading) {

    return (
      <LoadingSpinner />
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error || !siteData) {

    return (

      <Container
        sx={{ py: 10 }}
      >

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

    siteData?.pages?.filter(

      (p: any) =>

        p.status ===
        "published"

    ) || [];

  // =========================
  // HOMEPAGE
  // =========================
console.log(
  "PAGES:",
  publishedPages
);
  const homepage =
    publishedPages.find(
      (p: any) =>
        p.isHomepage
    );

  // =========================
  // RENDER
  // =========================

  return (

    <Box

      sx={{

        bgcolor:
          '#f8fafc',

        minHeight:
          '100vh'
      }}
    >

      {/* ===================== */}
      {/* NAVBAR */}
      {/* ===================== */}

      <AppBar

        position="sticky"

        elevation={0}

        sx={{

          bgcolor:
            'white',

          borderBottom:
            '1px solid #e2e8f0'
        }}
      >

        <Toolbar>

          {/* LOGO / SITE NAME */}

          <Typography

            variant="h6"

            sx={{

              mr: 5,

              fontWeight: 800,

              color:
                tokens.colors.primary
            }}
          >

            {siteData.name}

          </Typography>

          {/* NAVIGATION */}

          <Box

            sx={{

              display:
                "flex",

              gap: 3
            }}
          >

            {publishedPages.map(

              (page: any) => (

                <Link

                  key={page.id}

                  to={`/p/${siteId}/${page.slug}`}

                  style={{

                    textDecoration:
                      "none",

                    color:
                      "#111",

                    fontWeight:
                      600
                  }}
                >

                  {page.title}

                </Link>
              )
            )}

          </Box>

        </Toolbar>

      </AppBar>

      {/* ===================== */}
      {/* HOMEPAGE */}
      {/* ===================== */}

      <Container

        maxWidth="lg"

        sx={{ py: 8 }}
      >

        {homepage && (

          <Box>
              <RenderTree

              blocks={
                homepage.blocks
              }

              device={
                device
              }
            />

          </Box>
        )}

      </Container>

    </Box>
  );
};

// =========================
// LOADING SPINNER
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

        color:
          '#00C49A'
      }}
    />

  </Box>
);