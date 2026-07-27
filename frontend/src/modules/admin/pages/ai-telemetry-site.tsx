import React from "react";
import {
  Alert,
  Box,
  Button,
  Stack,
  Typography
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";

import AiTelemetryAnalyticsPanel from "../components/AiTelemetryAnalyticsPanel";

export default function AdminAiTelemetrySitePage() {
  const navigate =
    useNavigate();

  const params =
    useParams();

  const siteId =
    Number(params.siteId);

  const validSiteId =
    Number.isFinite(siteId) && siteId > 0;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: { xs: 2, md: 3 },
        bgcolor: "background.default",
        color: "text.primary"
      }}
    >
      <Stack spacing={3}>
        <Stack
          direction="row"
          alignItems="center"
          spacing={2}
        >
          <Button
            startIcon={<ArrowBack />}
            variant="outlined"
            onClick={() => navigate("/admin/ai-analytics")}
          >
            Retour
          </Button>

          <Box>
            <Typography variant="h4" fontWeight={900}>
              Site AI Telemetry
            </Typography>

            <Typography color="text.secondary">
              Technical AI observability for site #{siteId}.
            </Typography>
          </Box>
        </Stack>

        {!validSiteId ? (
          <Alert severity="error">
            Invalid site id.
          </Alert>
        ) : (
          <AiTelemetryAnalyticsPanel
            fixedSiteId={siteId}
            showSiteSelector={false}
          />
        )}
      </Stack>
    </Box>
  );
}