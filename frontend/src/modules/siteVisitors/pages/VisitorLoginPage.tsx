import React, {
  FormEvent,
  useState
} from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";

import {
  Link,
  useNavigate,
  useParams,
  useSearchParams
} from "react-router-dom";

import {
  useLoginVisitorMutation
} from "../../../redux/services/visitorAuth.api";

const getApiErrorMessage = (
  error: unknown
): string => {
  if (
    error &&
    typeof error === "object" &&
    "data" in error
  ) {
    const data =
      (error as {
        data?: {
          message?: string;
        };
      }).data;

    if (data?.message) {
      return data.message;
    }
  }

  return "Connexion impossible. Vérifiez vos informations.";
};

export const VisitorLoginPage: React.FC =
  () => {
    const {
      siteId
    } = useParams();

    const numericSiteId =
      Number(siteId);

    const navigate =
      useNavigate();

    const [
      searchParams
    ] =
      useSearchParams();

    const [
      email,
      setEmail
    ] =
      useState("");

    const [
      password,
      setPassword
    ] =
      useState("");

    const [
      formError,
      setFormError
    ] =
      useState<string | null>(
        null
      );

    const [
      loginVisitor,
      {
        isLoading
      }
    ] =
      useLoginVisitorMutation();

    const handleSubmit =
      async (
        event: FormEvent
      ) => {
        event.preventDefault();

        setFormError(null);

        if (
          !Number.isInteger(
            numericSiteId
          ) ||
          numericSiteId <= 0
        ) {
          setFormError(
            "Site invalide."
          );

          return;
        }

        try {
          await loginVisitor({
            siteId:
              numericSiteId,

            email:
              email.trim(),

            password
          }).unwrap();

          const redirect =
            searchParams.get(
              "redirect"
            );

          const safeRedirect =
            redirect &&
            redirect.startsWith("/")
              ? redirect
              : `/site/${numericSiteId}`;

          navigate(
            safeRedirect,
            {
              replace: true
            }
          );
        } catch (error) {
          setFormError(
            getApiErrorMessage(
              error
            )
          );
        }
      };

    return (
      <Box
        sx={{
          minHeight:
            "100vh",

          display:
            "flex",

          alignItems:
            "center",

          bgcolor:
            "#f8fafc",

          py: 6
        }}
      >
        <Container
          maxWidth="sm"
        >
          <Paper
            elevation={3}
            sx={{
              p: {
                xs: 3,
                sm: 5
              },

              borderRadius: 3
            }}
          >
            <Stack
              spacing={3}
              component="form"
              onSubmit={
                handleSubmit
              }
            >
              <Box>
                <Typography
                  variant="h4"
                  fontWeight={700}
                >
                  Connexion
                </Typography>

                <Typography
                  color="text.secondary"
                  sx={{
                    mt: 1
                  }}
                >
                  Connectez-vous pour accéder
                  aux pages réservées aux membres.
                </Typography>
              </Box>

              {formError && (
                <Alert severity="error">
                  {formError}
                </Alert>
              )}

              <TextField
                label="Adresse e-mail"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                required
                fullWidth
                autoComplete="email"
              />

              <TextField
                label="Mot de passe"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                required
                fullWidth
                autoComplete="current-password"
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={
                  isLoading
                }
              >
                {isLoading ? (
                  <CircularProgress
                    size={24}
                    color="inherit"
                  />
                ) : (
                  "Se connecter"
                )}
              </Button>

              <Typography
                textAlign="center"
                color="text.secondary"
              >
                Pas encore de compte ?{" "}
                <Link
                  to={`/site/${numericSiteId}/register`}
                >
                  Créer un compte
                </Link>
              </Typography>
            </Stack>
          </Paper>
        </Container>
      </Box>
    );
  };
