import React, { useEffect } from "react";
import {
  Box,
  CircularProgress,
  Alert,
  Typography,
  Button,

} from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { useGetDashboardFullQuery } from "../../../redux/services/dashboard.api";
import DashboardRenderer from "./DashboardRenderer";
import { SiteSelector } from "../components/SiteSelector";
import { useNavigate } from "react-router-dom";
import { Dashboard, Home } from "@mui/icons-material";

export const DashboardPage: React.FC = () => {
  const siteId = useSelector((state: RootState) => state.site.currentSite?.id);
  const navigate = useNavigate();
  const { data, isLoading, isError, error, isFetching, status } =
    useGetDashboardFullQuery(Number(siteId) || 0, {
      skip: !siteId,
      refetchOnMountOrArgChange: true,
    });

  if (!siteId) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert
          severity="info"
          icon={<Home />}
          action={
            <Button
              color="inherit"
              size="small"
              variant="outlined"
              onClick={() => navigate("/sites")}
            >
              Create Site
            </Button>
          }
          sx={{
            borderRadius: 3,
            "& .MuiAlert-message": {
              fontSize: "1rem",
              fontWeight: 500,
            },
          }}
        >
          Welcome! Create your first website to start using ReactBuilder.
        </Alert>
      </Box>
    );
  }

  if (isLoading || isFetching || status === "pending" || status === "uninitialized") {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress thickness={4} size={48} sx={{ color: "#00C49A" }} />
        <Typography variant="body2" color="text.secondary">
          Loading dashboard...
        </Typography>
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert
          severity="error"
          sx={{
            borderRadius: 3,
          }}
        >
          {/* @ts-ignore */}
          {error?.data?.message || "Server connection failed."}
        </Alert>
      </Box>
    );
  }

  if (!data && status === "fulfilled") {
    return (
      <Box sx={{ p: 4 }}>
        <Alert
          severity="info"
          sx={{
            borderRadius: 3,
          }}
        >
          No dashboard data found for this site.
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      component="main"
      sx={{
        p: { xs: 2, md: 4 },
        backgroundColor: "#F4F7FE",
        minHeight: "100vh",
      }}
    >
      {/* ===== HEADER ===== */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              color: "#1B2559",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Dashboard sx={{ color: "#00C49A", fontSize: 32 }} />
            Dashboard: {data?.stats?.siteName || "Current Project"}
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Overview of your site performance and activity
          </Typography>
        </Box>
        <SiteSelector />
      </Box>

      {/* ===== DASHBOARD RENDERER ===== */}
      <DashboardRenderer layout={data.layout} context={data} />
    </Box>
  );
};

export default DashboardPage;