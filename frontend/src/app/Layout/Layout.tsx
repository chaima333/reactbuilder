import React, { useState, useEffect } from "react";
import { Box, Toolbar } from "@mui/material";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { Outlet, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../redux/store";
import { setCurrentSite } from "../../redux/features/siteSlice";

export const Layout: React.FC = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const { sites, currentSite } = useSelector((state: RootState) => state.site);

  const isEditorPage =
  location.pathname.includes("/pages/new") ||
  /\/pages\/[^/]+\/edit$/.test(location.pathname) ||
  location.pathname.includes("/editor");

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  useEffect(() => {
    if (!currentSite && sites.length > 0) {
      dispatch(setCurrentSite(sites[0]));
    }
  }, [sites, currentSite, dispatch]);

  const drawerWidth = isCollapsed ? 70 : 260;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {!isEditorPage && (
        <>
          <Topbar
            onMenuClick={handleDrawerToggle}
            onToggleCollapse={handleToggleCollapse}
            isCollapsed={isCollapsed}
          />

          <Sidebar
            mobileOpen={mobileOpen}
            onDrawerToggle={handleDrawerToggle}
            isCollapsed={isCollapsed}
          />
        </>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: isEditorPage ? 0 : 3,
          width: isEditorPage
            ? "100%"
            : { sm: `calc(100% - ${drawerWidth}px)` },
          transition: "all 0.3s ease",
          backgroundColor: (theme) => theme.palette.background.default,
          overflow: "hidden",
        }}
      >
        {!isEditorPage && <Toolbar />}

        <Outlet />
      </Box>
    </Box>
  );
};