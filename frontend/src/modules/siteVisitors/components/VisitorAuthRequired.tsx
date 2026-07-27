import React from "react";

import {
  Alert,
  Box,
  Button,
  Stack
} from "@mui/material";

import {
  useLocation,
  useParams
} from "react-router-dom";

export const VisitorAuthRequired:
  React.FC = () => {
    const {
      siteId
    } = useParams();

    const location =
      useLocation();

    const redirect =
      encodeURIComponent(
        `${location.pathname}${location.search}`
      );

    const loginUrl =
      `/site/${siteId}/login?redirect=${redirect}`;

    const registerUrl =
      `/site/${siteId}/register?redirect=${redirect}`;

    return (
      <Box
        sx={{
          minHeight:
            "100vh",

          display:
            "flex",

          alignItems:
            "center",

          justifyContent:
            "center",

          p: 3
        }}
      >
        <Alert
          severity="warning"
          sx={{
            width:
              "100%",

            maxWidth:
              560
          }}
        >
          <Stack
            spacing={2}
          >
            <Box>
              Cette page est réservée
              aux membres. Connectez-vous
              pour continuer.
            </Box>

            <Stack
              direction={{
                xs: "column",
                sm: "row"
              }}
              spacing={1}
            >
              <Button
                variant="contained"
                href={loginUrl}
              >
                Se connecter
              </Button>

              <Button
                variant="outlined"
                href={registerUrl}
              >
                Créer un compte
              </Button>
            </Stack>
          </Stack>
        </Alert>
      </Box>
    );
  };
