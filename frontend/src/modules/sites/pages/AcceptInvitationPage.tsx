import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography
} from "@mui/material";

import {
  useNavigate,
  useSearchParams
} from "react-router-dom";

import {
  useSelector
} from "react-redux";

import type {
  RootState
} from "../../../redux/store";

import {
  useAcceptInvitationMutation
} from "../../../redux/services/invitations.api";

const AcceptInvitationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const auth = useSelector(
    (state: RootState) => state.auth as any
  );

  const accessToken = auth?.accessToken;
  const userEmail = auth?.user?.email;

  const [
    acceptInvitation,
    { isLoading }
  ] = useAcceptInvitationMutation();

  const handleAccept = async () => {
    if (!token) {
      return;
    }

    try {
      const result =
        await acceptInvitation({
          token
        }).unwrap();

      const siteId =
        result?.data?.siteId;

      if (siteId) {
        navigate(`/sites/${siteId}/members`);
        return;
      }

      navigate("/sites");

    } catch (error: any) {
      alert(
        error?.data?.message ||
          "Impossible d'accepter l'invitation"
      );
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f8fafc",
        p: 3
      }}
    >
      <Paper
        sx={{
          width: "100%",
          maxWidth: 520,
          p: 4,
          borderRadius: 4
        }}
      >
        <Stack spacing={3}>
          <Box>
            <Typography
              variant="h4"
              fontWeight={800}
            >
              Invitation CraftWeb
            </Typography>

            <Typography
              color="text.secondary"
              sx={{ mt: 1 }}
            >
              Acceptez l'invitation pour rejoindre ce site.
            </Typography>
          </Box>

          {!token && (
            <Alert severity="error">
              Lien d'invitation invalide.
            </Alert>
          )}

          {token && !accessToken && (
            <Alert severity="warning">
              Connectez-vous d'abord avec le même email que
              l'invitation.
            </Alert>
          )}

          {userEmail && (
            <Alert severity="info">
              Connecté avec : {userEmail}
            </Alert>
          )}

          {!accessToken ? (
            <Button
              variant="contained"
              onClick={() => navigate("/login")}
            >
              Se connecter
            </Button>
          ) : (
            <Button
              variant="contained"
              disabled={!token || isLoading}
              onClick={handleAccept}
            >
              {isLoading ? (
                <CircularProgress
                  size={22}
                  color="inherit"
                />
              ) : (
                "Accepter l'invitation"
              )}
            </Button>
          )}

          <Button
            variant="text"
            onClick={() => navigate("/sites")}
          >
            Retour aux sites
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default AcceptInvitationPage;