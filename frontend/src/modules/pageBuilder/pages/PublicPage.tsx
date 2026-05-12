import React from "react";

import { useParams }
from "react-router-dom";

import {
  useGetPublicPageQuery
} from "../../../redux/services/pages.api";

import {

  Box,

  CircularProgress,

  Typography,

  Paper,

  Container

} from "@mui/material";

import { BlockRenderer }
from "../components/editor/BlockRenderer";

import { blockRegistry }
from "../core/blockRegistry";

export const PublicPage = () => {

  const {

    siteId,

    slug

  } = useParams<{

    siteId: string;

    slug: string;

  }>();

  // =========================
  // DEBUG
  // =========================

  console.log(
    "PublicPage Params:",
    {
      siteId,
      slug
    }
  );

  // =========================
  // FETCH PAGE
  // =========================

  const {

    data,

    isLoading,

    error,

  } = useGetPublicPageQuery(

    {

      siteId,

      slug

    },

    {

      skip:
        !siteId ||
        !slug
    }
  );

  // =========================
  // LOADING
  // =========================

  if (isLoading) {

    return (

      <Box

        display="flex"

        justifyContent="center"

        alignItems="center"

        minHeight="100vh"
      >

        <CircularProgress />

        <Typography
          sx={{ ml: 2 }}
        >
          Chargement de la page...
        </Typography>

      </Box>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error || !data) {

    console.error(
      "Fetch Public Page Error:",
      error
    );

    return (

      <Box

        display="flex"

        justifyContent="center"

        alignItems="center"

        minHeight="100vh"
      >

        <Paper

          elevation={3}

          sx={{

            p: 4,

            textAlign:
              "center",

            maxWidth:
              500
          }}
        >

          <Typography

            variant="h4"

            color="error"

            gutterBottom
          >
            404
          </Typography>

          <Typography
            variant="h6"
          >
            Page Non Trouvée
          </Typography>

          <Typography

            color="text.secondary"

            sx={{ mt: 1 }}
          >

            Désolé, la page que vous recherchez
            n'existe pas ou n'est pas encore publiée.

          </Typography>

          {error && (

            <Typography

              variant="caption"

              display="block"

              sx={{

                mt: 2,

                color:
                  "grey.500"
              }}
            >

              Error Detail:

              {

                JSON.stringify(

                  (error as any)
                    ?.data
                    ?.message ||

                  "Unknown Error"
                )
              }

            </Typography>
          )}

        </Paper>

      </Box>
    );
  }

  // =========================
  // SUCCESS
  // =========================

  return (

    <Container

      maxWidth="lg"

      sx={{

        py: 4
      }}
    >

      {/* ===================== */}
      {/* PAGE HEADER */}
      {/* ===================== */}

      <Box

        component="header"

        sx={{

          mb: 4,

          borderBottom:
            "1px solid #eee",

          pb: 2
        }}
      >

        <Typography

          variant="h3"

          component="h1"

          fontWeight="bold"
        >

          {data.title}

        </Typography>

        <Typography
          color="text.secondary"
        >

          Slug:

          /{data.slug}

        </Typography>

      </Box>

      {/* ===================== */}
      {/* RUNTIME BLOCKS */}
      {/* ===================== */}

      <Box>

        {data.blocks?.map(

          (block: any) => (

            <BlockRenderer

              key={block.id}

              block={block}

              registry={
                blockRegistry
              }

              preview={true}
            />
          )
        )}

      </Box>

    </Container>
  );
};