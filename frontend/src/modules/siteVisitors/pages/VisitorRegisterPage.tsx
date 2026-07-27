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
  useRegisterVisitorMutation
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
          code?: string;
          errors?: Array<{
            message?: string;
          }>;
        };
      }).data;

    if (
      data?.code ===
      "VISITOR_EMAIL_EXISTS"
    ) {
      return "Un compte existe déjà avec cette adresse e-mail.";
    }

    const firstValidationError =
      data?.errors?.[0]?.message;

    if (firstValidationError) {
      return firstValidationError;
    }

    if (data?.message) {
      return data.message;
    }
  }

  return "Création du compte impossible.";
};

export const VisitorRegisterPage:
  React.FC = () => {
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
      fullName,
      setFullName
    ] =
      useState("");

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
      confirmPassword,
      setConfirmPassword
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
      registerVisitor,
      {
        isLoading
      }
    ] =
      useRegisterVisitorMutation();

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

        if (
          fullName.trim().length < 2
        ) {
          setFormError(
            "Le nom complet doit contenir au moins 2 caractères."
          );

          return;
        }

        if (
          password.length < 8
        ) {
          setFormError(
            "Le mot de passe doit contenir au moins 8 caractères."
          );

          return;
        }

        if (
          !/[a-z]/.test(
            password
          )
        ) {
          setFormError(
            "Le mot de passe doit contenir une lettre minuscule."
          );

          return;
        }

        if (
          !/[A-Z]/.test(
            password
          )
        ) {
          setFormError(
            "Le mot de passe doit contenir une lettre majuscule."
          );

          return;
        }

        if (
          !/\d/.test(
            password
          )
        ) {
          setFormError(
            "Le mot de passe doit contenir un chiffre."
          );

          return;
        }

        if (
          !/[^A-Za-z0-9]/.test(
            password
          )
        ) {
          setFormError(
            "Le mot de passe doit contenir un caractère spécial."
          );

          return;
        }

        if (
          password !==
          confirmPassword
        ) {
          setFormError(
            "Les mots de passe ne correspondent pas."
          );

          return;
        }

        try {
          await registerVisitor({
            siteId:
              numericSiteId,

            fullName:
              fullName.trim(),

            email:
              email.trim(),

            password
          }).unwrap();

          const redirect =
            searchParams.get(
              "redirect"
            );

          const loginUrl =
            `/site/${numericSiteId}/login${
              redirect &&
              redirect.startsWith("/")
                ? `?redirect=${encodeURIComponent(
                    redirect
                  )}`
                : ""
            }`;

          navigate(
            loginUrl,
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

    const redirect =
      searchParams.get(
        "redirect"
      );

    const loginUrl =
      `/site/${numericSiteId}/login${
        redirect &&
        redirect.startsWith("/")
          ? `?redirect=${encodeURIComponent(
              redirect
            )}`
          : ""
      }`;

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
                  Créer un compte
                </Typography>

                <Typography
                  color="text.secondary"
                  sx={{
                    mt: 1
                  }}
                >
                  Inscrivez-vous pour accéder
                  aux pages réservées aux membres.
                </Typography>
              </Box>

              {formError && (
                <Alert severity="error">
                  {formError}
                </Alert>
              )}

              <TextField
                label="Nom complet"
                value={fullName}
                onChange={(event) =>
                  setFullName(
                    event.target.value
                  )
                }
                required
                fullWidth
                autoComplete="name"
              />

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
                autoComplete="new-password"
                helperText="8 caractères minimum, majuscule, minuscule, chiffre et caractère spécial."
              />

              <TextField
                label="Confirmer le mot de passe"
                type="password"
                value={
                  confirmPassword
                }
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value
                  )
                }
                required
                fullWidth
                autoComplete="new-password"
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
                  "Créer mon compte"
                )}
              </Button>

              <Typography
                textAlign="center"
                color="text.secondary"
              >
                Déjà membre ?{" "}

                <Link
                  to={loginUrl}
                >
                  Se connecter
                </Link>
              </Typography>
            </Stack>
          </Paper>
        </Container>
      </Box>
    );
  };