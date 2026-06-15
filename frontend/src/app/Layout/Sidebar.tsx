import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
  Typography,
  Tooltip,
  Divider,
} from "@mui/material";

import {
  Dashboard as DashboardIcon,
  Web as SitesIcon,
  Image as MediaIcon,
  Settings as SettingsIcon,
  People as UsersIcon,
  AdminPanelSettings as AdminIcon,
  Extension as PluginIcon,
} from "@mui/icons-material";

import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

import {
  useGetPlatformSettingsQuery,
  type PlatformSettings,
} from "../../redux/services/platform.api";

interface SidebarProps {
  mobileOpen: boolean;
  onDrawerToggle: () => void;
  isCollapsed: boolean;
}

type PluginKey = keyof Pick<
  PlatformSettings,
  "mediaPlugin" | "seoPlugin" | "versionPlugin" | "aiEnabled"
>;

type SidebarItem = {
  text: string;
  icon: React.ReactNode;
  path: string;
  adminOnly: boolean;
  pluginKey?: PluginKey;
};

const Sidebar: React.FC<SidebarProps> = ({
  mobileOpen,
  onDrawerToggle,
  isCollapsed,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const userRole = useSelector(
    (state: RootState) => state.auth.user?.role
  );

  const currentSite = useSelector(
    (state: RootState) => state.site.currentSite
  );

  const { data: platformSettings, isLoading } =
    useGetPlatformSettingsQuery();

  const isAdmin = userRole === "ADMIN";
  const currentSiteId = currentSite?.id;
  const drawerWidth = isCollapsed ? 70 : 260;

  const coreItems: SidebarItem[] = [
    {
      text: "Dashboard",
      icon: <DashboardIcon />,
      path: "/dashboard",
      adminOnly: false,
    },
    {
      text: "Mes Sites",
      icon: <SitesIcon />,
      path: "/sites",
      adminOnly: false,
    },
    {
      text: "Paramètres",
      icon: <SettingsIcon />,
      path: "/settings",
      adminOnly: false,
    },
  ];

  const workspaceItems: SidebarItem[] = [
    {
      text: "Médiathèque",
      icon: <MediaIcon />,
      path: currentSiteId
        ? `/sites/${currentSiteId}/media`
        : "/sites",
      adminOnly: false,
      pluginKey: "mediaPlugin",
    },
  ];

  const adminItems: SidebarItem[] = [
    {
      text: "Super Admin",
      icon: <AdminIcon />,
      path: "/admin",
      adminOnly: true,
    },
    {
      text: "Utilisateurs",
      icon: <UsersIcon />,
      path: "/users",
      adminOnly: true,
    },
    {
      text: "Paramètres admin",
      icon: <SettingsIcon />,
      path: "/admin/settings",
      adminOnly: true,
    },
    
  ];

  

  const canShowItem = (item: SidebarItem): boolean => {
    if (item.adminOnly && !isAdmin) {
      return false;
    }

    if (isLoading && item.pluginKey) {
      return false;
    }

    if (
      item.pluginKey &&
      platformSettings &&
      platformSettings[item.pluginKey] === false
    ) {
      return false;
    }

    return true;
  };

  const isActive = (path: string): boolean => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }

    return location.pathname === path;
  };

  const renderSectionTitle = (title: string) => {
    if (isCollapsed) return null;

    return (
      <Typography
        variant="caption"
        sx={{
          px: 2,
          py: 1.5,
          display: "block",
          fontWeight: 800,
          color: "text.secondary",
          textTransform: "uppercase",
          letterSpacing: 0.8,
        }}
      >
        {title}
      </Typography>
    );
  };

  const renderItems = (items: SidebarItem[]) =>
    items.filter(canShowItem).map((item) => (
      <ListItem
        key={item.text}
        disablePadding
        sx={{ display: "block", mb: 0.5 }}
      >
        <Tooltip
          title={isCollapsed ? item.text : ""}
          placement="right"
        >
          <ListItemButton
            selected={isActive(item.path)}
            onClick={() => navigate(item.path)}
            sx={{
              minHeight: 48,
              justifyContent: isCollapsed ? "center" : "initial",
              px: 2,
              mx: 1,
              borderRadius: 3,
              color: "text.primary",
              "&.Mui-selected": {
                backgroundColor: "rgba(0,196,154,0.14)",
                color: "primary.main",
                fontWeight: 800,
                "& .MuiListItemIcon-root": {
                  color: "primary.main",
                },
              },
              "&:hover": {
                backgroundColor: "rgba(0,196,154,0.08)",
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: isCollapsed ? 0 : 2,
                justifyContent: "center",
                color: "text.secondary",
              }}
            >
              {item.icon}
            </ListItemIcon>

            <ListItemText
              primary={item.text}
              primaryTypographyProps={{
                fontWeight: isActive(item.path) ? 800 : 600,
              }}
              sx={{
                opacity: isCollapsed ? 0 : 1,
                transition: "opacity 0.2s ease",
                whiteSpace: "nowrap",
              }}
            />
          </ListItemButton>
        </Tooltip>
      </ListItem>
    ));

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        overflow: "hidden",
        bgcolor: "background.paper",
      }}
    >
      <Toolbar
        sx={{
          justifyContent: isCollapsed ? "center" : "flex-start",
          px: 2,
        }}
      >
        {isCollapsed ? (
          <Typography
            variant="h6"
            sx={{ fontWeight: 900, color: "primary.main" }}
          >
            RB
          </Typography>
        ) : (
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 900,
                color: "text.primary",
                whiteSpace: "nowrap",
              }}
            >
              ReactBuilder
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={600}
            >
              {isAdmin ? "Super Admin" : "Workspace"}
            </Typography>
          </Box>
        )}
      </Toolbar>

      <Divider />

      <List sx={{ px: 0, pt: 2 }}>
        {renderSectionTitle("Workspace")}
        {renderItems(coreItems)}
        {renderItems(workspaceItems)}

        {isAdmin && (
          <>
            <Divider sx={{ my: 2 }} />
            {renderSectionTitle("Administration")}
            {renderItems(adminItems)}
             <Divider sx={{ my: 2 }} />
  
          </>
        )}
      </List>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{
        width: { sm: drawerWidth },
        flexShrink: { sm: 0 },
        transition: "width 0.3s ease",
      }}
    >
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 260,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: "none", sm: "block" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
            transition: "width 0.3s ease",
            overflowX: "hidden",
            borderRight: "1px solid rgba(0,0,0,0.08)",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;