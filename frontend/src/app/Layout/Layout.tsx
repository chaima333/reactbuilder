import React, { useState, useEffect } from "react";
import { Box, Toolbar, Alert } from "@mui/material";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../redux/store";
import { setCurrentSite } from "../../redux/features/siteSlice";

export const Layout: React.FC = () => {
  const dispatch = useDispatch();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // 🟢 الحالة الخاصة بتصغير السايدبار
  const [isCollapsed, setIsCollapsed] = useState(false);

  const { sites, currentSite } = useSelector((state: RootState) => state.site);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // auto select site
  useEffect(() => {
    if (!currentSite && sites.length > 0) {
      dispatch(setCurrentSite(sites[0]));
    }
  }, [sites, currentSite, dispatch]);

  // العرض الديناميكي بناءً على الحالة
  const drawerWidth = isCollapsed ? 70 : 260;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* تمرير دوال التحكم للـ Topbar */}
      <Topbar 
        onMenuClick={handleDrawerToggle} 
        onToggleCollapse={handleToggleCollapse}
        isCollapsed={isCollapsed}
      />
      
      {/* تمرير الحالة للـ Sidebar */}
      <Sidebar 
        mobileOpen={mobileOpen} 
        onDrawerToggle={handleDrawerToggle} 
        isCollapsed={isCollapsed}
      />

      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          transition: "all 0.3s ease", // انيميشن للتمدد
          backgroundColor: (theme) => theme.palette.background.default
        }}
      >
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