import React, { useEffect } from "react";
import { Box, CircularProgress, Alert, Typography, Container } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { useGetDashboardFullQuery } from "../../../redux/services/dashboard.api";
import DashboardRenderer from "./DashboardRenderer";
import { SiteSelector }from "../components/SiteSelector";

export const DashboardPage: React.FC = () => {
  const siteId = useSelector((state: RootState) => state.site.currentSite?.id);

  const { data, isLoading, isError, error, isFetching, status } = useGetDashboardFullQuery(
    Number(siteId) || 0, 
    { 
      skip: !siteId,                
      refetchOnMountOrArgChange: true 
    }
  );

  // 1. If no site is selected
  if (!siteId) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="warning">Please select a site to continue.</Alert>
      </Box>
    );
  }

  // 2. THE FIX: If the request is still pending or uninitialized, keep showing the loader
  // We use 'fulfilled' status to ensure data actually arrived from the server
  if (isLoading || isFetching || status === 'pending' || status === 'uninitialized') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress thickness={4} />
      </Box>
    );
  }

  // 3. API Error
  if (isError) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">
          {/* @ts-ignore */}
          {error?.data?.message || "Server connection failed."}
        </Alert>
      </Box>
    );
  }

  // 4. REAL "No Data" - Only show this if the request is DONE and data is still null
  if (!data && status === 'fulfilled') {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="info">No dashboard data found for this site.</Alert>
      </Box>
    );
  }
 // 5. Success!
return (
  <Box
    component="main"
    sx={{
      p: 4,
      backgroundColor: "#F4F7FE",
      minHeight: "100vh"
    }}
  >
    <Box
      sx={{
        display: "flex",
        justifyContent:
          "space-between",
        alignItems:
          "center",
        mb: 4
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontWeight: 800,
          color: "#1B2559"
        }}
      >
        Dashboard:
        {data.stats?.siteName || "Current Project"}
      </Typography>
      <SiteSelector />
    </Box>
    <DashboardRenderer
      layout={data.layout}
      context={data}
    />
  </Box>
);
};

export default DashboardPage;