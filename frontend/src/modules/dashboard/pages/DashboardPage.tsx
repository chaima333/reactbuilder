import React from "react";
import { Box, CircularProgress, Alert, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { useGetDashboardFullQuery } from "../../../redux/services/dashboard.api";
import DashboardRenderer from "../pages/DashboardRenderer";

export const DashboardPage: React.FC = () => {
  const siteId = useSelector(
    (state: RootState) => state.site.currentSite?.id
  );

  const {
    data,
    isLoading,
    error,
  } = useGetDashboardFullQuery(siteId!, {
    skip: !siteId,
  });

  if (!siteId) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="warning">
          اختر موقع أولاً من Site Selector
        </Alert>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading dashboard...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">
          Dashboard failed to load
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <DashboardRenderer layout={data?.layout} context={data} />
    </Box>
  );
};

export default DashboardPage;