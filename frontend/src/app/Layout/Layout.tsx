import React, { useState, useEffect } from "react";
import { Box, Toolbar, CircularProgress, Alert } from "@mui/material";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../redux/store";
import { setCurrentSite } from "../../redux/features/siteSlice";

const drawerWidth = 260;

export const Layout: React.FC = () => {
  const dispatch = useDispatch();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { sites, currentSite, isLoading } = useSelector(
    (state: RootState) => state.site
  );

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // auto select site
  useEffect(() => {
    if (!currentSite && sites.length > 0) {
      dispatch(setCurrentSite(sites[0]));
    }
  }, [sites, currentSite, dispatch]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex" }}>
      <Topbar onMenuClick={handleDrawerToggle} />
      <Sidebar mobileOpen={mobileOpen} onDrawerToggle={handleDrawerToggle} />

      <Box component="main" sx={{ flexGrow: 1, p: 3, minHeight: "100vh" }}>
        <Toolbar />

        {sites.length === 0 ? (
          <Alert severity="info">
            لا يوجد مواقع. قم بإنشاء أول موقع.
          </Alert>
        ) : currentSite ? (
          <Outlet />
        ) : (
          <Alert severity="warning">
            جاري اختيار الموقع...
          </Alert>
        )}
      </Box>
    </Box>
  );
};