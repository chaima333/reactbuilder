import React, { useState } from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

import {
  CheckCircleOutline,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import axios from "axios";

import {
  apiUrl,
} from "../../../config/api";

export const ResetPassword = () => {
  const {
    token,
  } = useParams<{
    token: string;
  }>();

  const navigate =
    useNavigate();

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    status,
    setStatus,
  ] = useState<
    "idle" |
    "loading" |
    "success" |
    "error"
  >("idle");

  const [
    errorMsg,
    setErrorMsg,
  ] = useState("");

  const handleSubmit =
    async (
      event: React.FormEvent
    ) => {
      event.preventDefault();

      if (!token) {
        setStatus("error");
        setErrorMsg(
          "Lien invalide : token manquant."
        );

        return;
      }

      if (
        password !==
        confirmPassword
      ) {
        setStatus("error");
        setErrorMsg(
          "Les mots de passe ne correspondent pas"
        );

        return;
      }

      if (
        password.length < 6
      ) {
        setStatus("error");
        setErrorMsg(
          "Le mot de passe doit contenir au moins 6 caractères"
        );

        return;
      }

      setStatus("loading");
      setErrorMsg("");

      try {
        await axios.post(
          apiUrl(
            `/auth/reset-password/${encodeURIComponent(
              token
            )}`
          ),
          {
            password,
          }
        );

        setStatus("success");
      } catch (error: any) {
        setStatus("error");

        setErrorMsg(
          error?.response?.data
            ?.message ||
            "Le lien est invalide ou a expiré"
        );
      }
    };

  if (
    status === "success"
  ) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Paper
            sx={{
              p: 5,
              width: "100%",
              textAlign: "center",
              borderRadius: 4,
            }}
          >
            <CheckCircleOutline
              sx={{
                fontSize: 80,
                color: "success.main",
                mb: 2,
              }}
            />

            <Typography
              variant="h4"
              gutterBottom
              sx={{
                fontWeight: 700,
              }}
            >
              Mot de passe mis à jour !
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                mb: 4,
              }}
            >
              Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
            </Typography>

            <Button
              fullWidth
              variant="contained"
              onClick={() =>
                navigate("/login")
              }
              sx={{
                py: 1.5,
                borderRadius: 2,
              }}
            >
              Se connecter
            </Button>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Paper
          sx={{
            p: 5,
            width: "100%",
            borderRadius: 4,
          }}
        >
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{
              fontWeight: 700,
              mb: 3,
            }}
          >
            Nouveau mot de passe
          </Typography>

          {!token && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2,
              }}
            >
              Lien invalide : token manquant.
            </Alert>
          )}

          {errorMsg && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2,
              }}
            >
              {errorMsg}
            </Alert>
          )}

          <form
            onSubmit={
              handleSubmit
            }
          >
            <TextField
              fullWidth
              label="Nouveau mot de passe"
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              required
              disabled={
                status ===
                  "loading" ||
                !token
              }
              autoComplete="new-password"
              sx={{
                mb: 3,
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      type="button"
                      aria-label={
                        showPassword
                          ? "Masquer le mot de passe"
                          : "Afficher le mot de passe"
                      }
                      onClick={() =>
                        setShowPassword(
                          (
                            current
                          ) =>
                            !current
                        )
                      }
                      edge="end"
                    >
                      {showPassword ? (
                        <VisibilityOff />
                      ) : (
                        <Visibility />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
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
              disabled={
                status ===
                  "loading" ||
                !token
              }
              autoComplete="new-password"
              sx={{
                mb: 4,
              }}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={
                status ===
                  "loading" ||
                !token
              }
              sx={{
                py: 1.5,
                borderRadius: 2,
                fontWeight: 600,
              }}
            >
              {status ===
              "loading" ? (
                <CircularProgress
                  size={24}
                />
              ) : (
                "Changer le mot de passe"
              )}
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};